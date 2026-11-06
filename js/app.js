import { CATALOG, INITIAL_FAVORITES } from './catalog.js';
import { initializeFavorites, addFavorite, deleteFavorite, readCachedFeed, cacheFeed } from './storage.js';
import { fetchArticles, looksLikeFeedUrl, normalizeUrl } from './feed-reader.js';
import { discoverFeeds } from './feedsearch.js';
import { feedFormat } from './feed-format.js';
import { renderFavorites, renderDiscover, renderFeed, formatDate } from './ui.js';

const view = document.getElementById('view');
const content = document.getElementById('main');
const toast = document.getElementById('toast');
const favoritesButton = document.getElementById('nav-favorites');
const discoverButton = document.getElementById('nav-discover');
const heroSectionTitle = document.getElementById('hero-section-title');
const heroSectionSubtitle = document.getElementById('hero-section-subtitle');
const heroPaperCount = document.getElementById('hero-paper-count');
const heroPaperNumber = document.getElementById('hero-paper-number');
const heroPaperUnit = document.getElementById('hero-paper-unit');
const heroShowcaseDetails = document.getElementById('hero-showcase-details');
const heroShowcaseDescription = document.getElementById('hero-showcase-description');
const heroShowcaseUpdated = document.getElementById('hero-showcase-updated');
const state = {
  view: 'favorites', previousView: 'favorites', selectedFeed: null,
  catalog: [...CATALOG], favorites: [], articles: [], articleStatus: 'idle',
  articleError: '', updatedAt: null, fromCache: false,
  searching: false, searchInput: '', searchError: '', searchResults: [],
  persistent: true, loadVersion: 0
};
let toastTimeout;

function isFavorite(url) { return state.favorites.some(feed => feed.url === url); }
function findFeed(url) {
  return state.catalog.find(feed => feed.url === url) || state.favorites.find(feed => feed.url === url) ||
    (state.selectedFeed?.url === url ? state.selectedFeed : null);
}

function render() {
  const title = state.view === 'feed' ? (state.selectedFeed?.name || 'Feed')
    : state.view === 'discover' ? 'Erkunden' : 'Favoriten';
  heroSectionTitle.textContent = title;
  heroSectionTitle.classList.toggle('is-long', title.length > 15);
  heroSectionTitle.classList.toggle('is-very-long', title.length > 27);

  const onFeed = state.view === 'feed' && state.selectedFeed;
  heroSectionSubtitle.textContent = onFeed ? (state.selectedFeed.category || 'Feed')
    : state.view === 'discover' ? 'Neue Quellen entdecken' : 'Deine Quellen';
  const total = onFeed ? state.articles.length : state.view === 'discover'
    ? state.catalog.filter(feed => !feed.discovered).length : state.favorites.length;
  const countingArticles = Boolean(onFeed);
  heroPaperNumber.textContent = countingArticles && state.articleStatus === 'loading' && !state.articles.length ? '…' : String(total);
  heroPaperUnit.textContent = countingArticles ? 'Artikel' : (total === 1 ? 'Feed' : 'Feeds');
  heroPaperCount.setAttribute('aria-label', `${heroPaperNumber.textContent} ${heroPaperUnit.textContent}`);

  heroShowcaseDetails.hidden = state.view === 'favorites';
  heroShowcaseDetails.classList.toggle('is-feed', Boolean(onFeed));
  heroShowcaseDetails.classList.toggle('is-discover', state.view === 'discover');
  heroShowcaseDescription.textContent = onFeed ? (state.selectedFeed.description || '')
    : state.view === 'discover' ? 'Beliebte Feeds' : '';
  heroShowcaseUpdated.textContent = onFeed && state.updatedAt
    ? `Stand ${formatDate(new Date(state.updatedAt).toISOString())}` : '';
  heroShowcaseUpdated.hidden = !heroShowcaseUpdated.textContent;

  favoritesButton.setAttribute('aria-pressed', String(state.view === 'favorites'));
  discoverButton.setAttribute('aria-pressed', String(state.view === 'discover'));
  favoritesButton.classList.toggle('is-active', state.view === 'favorites');
  discoverButton.classList.toggle('is-active', state.view === 'discover');
  if (state.view === 'favorites') {
    view.innerHTML = renderFavorites(state.favorites);
  } else if (state.view === 'discover') {
    view.innerHTML = renderDiscover(state);
  } else if (state.selectedFeed) {
    view.innerHTML = renderFeed({
      feed: state.selectedFeed, articles: state.articles,
      favorite: isFavorite(state.selectedFeed.url), status: state.articleStatus,
      error: state.articleError, updatedAt: state.updatedAt,
      fromCache: state.fromCache, previousView: state.previousView
    });
  }
}

function notify(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 3400);
}

function scrollToContent() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  content.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
}

function navigate(which, { scroll = true } = {}) {
  if (which !== 'feed') state.loadVersion++;
  state.view = which;
  render();
  if (scroll) scrollToContent();
}

async function toggleFavorite(url) {
  const feed = findFeed(url);
  if (!feed) return;
  const wasFavorite = isFavorite(url);
  if (wasFavorite) {
    state.favorites = state.favorites.filter(item => item.url !== url);
  } else {
    state.favorites = [{ ...feed }, ...state.favorites];
  }
  render();
  try {
    if (state.persistent) {
      if (wasFavorite) await deleteFavorite(url);
      else await addFavorite(feed);
    }
    notify(wasFavorite ? `${feed.name} entfernt` : `${feed.name} gespeichert`);
  } catch {
    // Restore UI state if the IndexedDB operation fails.
    state.favorites = wasFavorite ? [{ ...feed }, ...state.favorites] : state.favorites.filter(item => item.url !== url);
    render();
    notify('Favorit konnte nicht gespeichert werden.');
  }
}

async function openFeed(url) {
  const feed = findFeed(url);
  if (!feed) return;
  state.previousView = state.view === 'feed' ? state.previousView : state.view;
  state.view = 'feed';
  state.selectedFeed = { ...feed };
  state.articles = [];
  state.articleError = '';
  state.articleStatus = 'loading';
  state.fromCache = false;
  state.updatedAt = null;
  const version = ++state.loadVersion;
  render();
  scrollToContent();

  if (state.persistent) {
    try {
      const saved = await readCachedFeed(url);
      if (version === state.loadVersion && saved?.articles?.length) {
        state.articles = saved.articles;
        state.updatedAt = saved.fetchedAt;
        state.fromCache = true;
        render();
      }
    } catch { /* Offline cache is optional. */ }
  }
  await refreshFeed(version);
}

async function refreshFeed(version = ++state.loadVersion) {
  if (!state.selectedFeed) return;
  const url = state.selectedFeed.url;
  state.articleStatus = 'loading';
  state.articleError = '';
  render();
  try {
    const articles = await fetchArticles(url);
    if (version !== state.loadVersion || state.selectedFeed?.url !== url) return;
    state.articles = articles;
    state.articleStatus = 'ready';
    state.updatedAt = Date.now();
    state.fromCache = false;
    render();
    if (state.persistent) cacheFeed(url, articles).catch(() => {});
  } catch (error) {
    if (version !== state.loadVersion || state.selectedFeed?.url !== url) return;
    state.articleStatus = 'error';
    state.articleError = error.message || 'Unbekannter Fehler';
    render();
  }
}

async function searchOrAdd() {
  let url;
  try { url = normalizeUrl(state.searchInput); }
  catch (error) { state.searchError = error.message; render(); return; }

  if (looksLikeFeedUrl(url)) {
    let feed = findFeed(url);
    if (!feed) {
      let domain = 'RSS-Feed';
      try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch {}
      feed = {
        id: `custom-${url}`, name: domain, category: 'Eigener Feed',
        description: 'Persönlich hinzugefügter RSS-/Atom-Feed.',
        url, website: new URL(url).origin, tone: 'cyan', icon: 'rss',
        format: feedFormat({ url }), discovered: true
      };
      state.catalog.push(feed);
    }
    if (!isFavorite(url)) await toggleFavorite(url);
    state.searchInput = '';
    openFeed(url);
    return;
  }

  state.searching = true;
  state.searchError = '';
  render();
  try {
    const results = await discoverFeeds(url);
    for (const result of results) {
      const current = state.catalog.find(feed => feed.url === result.url);
      if (current) {
        if (!current.format && result.format) current.format = result.format;
      } else state.catalog.push(result);
    }
    state.searchResults = results.map(item => item.url);
    if (!results.length) state.searchError = 'Für diese Website wurden keine Feeds gefunden. Du kannst eine direkte Feed-URL eingeben.';
  } catch (error) {
    state.searchResults = [];
    state.searchError = error.message || 'Suche fehlgeschlagen.';
  } finally {
    state.searching = false;
    render();
  }
}

view.addEventListener('input', event => {
  if (event.target.id === 'feed-url') state.searchInput = event.target.value;
});

view.addEventListener('submit', event => {
  if (event.target.id === 'add-form') {
    event.preventDefault();
    if (!state.searching) searchOrAdd();
  }
});

view.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  if (action === 'go-discover') return navigate('discover');
  if (action === 'open-feed') return openFeed(control.dataset.url);
  if (action === 'toggle-favorite') return toggleFavorite(control.dataset.url);
  if (action === 'back') return navigate(state.previousView);
  if (action === 'refresh') return refreshFeed();
  if (action === 'expand-article') {
    const card = control.closest('.article-card');
    const expanded = card.classList.toggle('is-expanded');
    control.setAttribute('aria-expanded', String(expanded));
    control.innerHTML = expanded ? 'Weniger anzeigen <span aria-hidden="true">↑</span>' : 'Mehr anzeigen <span aria-hidden="true">↓</span>';
  }
});

favoritesButton.addEventListener('click', () => navigate('favorites', { scroll: false }));
discoverButton.addEventListener('click', () => navigate('discover', { scroll: false }));
document.getElementById('home-button').addEventListener('click', () => navigate('favorites', { scroll: false }));

async function initialize() {
  try {
    state.favorites = await initializeFavorites(CATALOG, INITIAL_FAVORITES);
    state.favorites.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  } catch {
    state.persistent = false;
    state.favorites = CATALOG.filter(feed => INITIAL_FAVORITES.includes(feed.id));
    notify('IndexedDB nicht verfügbar: Favoriten bleiben nur bis zum Neuladen erhalten.');
  }
  render();
}
initialize();
