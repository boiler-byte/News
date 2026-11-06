import { icon } from './icons.js';
import { feedFormat } from './feed-format.js';

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

const tones = new Set(['rose', 'orange', 'purple', 'blue', 'forest', 'plum', 'red', 'gold', 'cyan']);
function tone(feed) { return tones.has(feed.tone) ? feed.tone : 'cyan'; }

export function feedCard(feed, favorite) {
  const favTitle = favorite ? `${feed.name} aus Favoriten entfernen` : `${feed.name} zu Favoriten hinzufügen`;
  const format = feed.format || feedFormat({ url: feed.url });
  const address = feed.discovered ? (() => {
    try { const u = new URL(feed.url); return `${u.host}${u.pathname}${u.search}`; }
    catch { return feed.url; }
  })() : '';
  return `<article class="feed-card tone-${tone(feed)}">
    <button class="feed-card__open" type="button" data-action="open-feed" data-url="${esc(feed.url)}" aria-label="${esc(feed.name)} – Nachrichten anzeigen">
      <span class="feed-card__icon">${icon(feed.icon, 23)}</span>
      <span class="feed-card__body">
        <span class="feed-card__label-row"><span class="feed-card__category">${esc(feed.category)}</span>${format ? `<span class="feed-card__format">${esc(format)}</span>` : ''}</span>
        <strong class="feed-card__name">${esc(feed.name)}</strong>
        <span class="feed-card__description">${esc(feed.description)}</span>
        ${address ? `<span class="feed-card__url" title="${esc(feed.url)}">${esc(address)}</span>` : ''}
      </span>
      <span class="feed-card__bottom"><span>Nachrichten ansehen</span>${icon('arrow', 17)}</span>
    </button>
    <button class="favorite-button ${favorite ? 'is-favorite' : ''}" type="button" data-action="toggle-favorite" data-url="${esc(feed.url)}" aria-label="${esc(favTitle)}" aria-pressed="${favorite}">${icon('heart', 19)}</button>
  </article>`;
}

export function emptyState(title, detail, actionLabel = '', action = '') {
  return `<div class="empty-state">
    <span class="empty-symbol">${icon('rss', 28)}</span>
    <h2>${esc(title)}</h2><p>${esc(detail)}</p>
    ${actionLabel ? `<button class="button button-primary" data-action="${esc(action)}" type="button">${esc(actionLabel)}${icon('arrow', 16)}</button>` : ''}
  </div>`;
}

export function renderFavorites(favorites) {
  return `${favorites.length ? `<div class="feed-grid">${favorites.map(feed => feedCard(feed, true)).join('')}</div>`
      : emptyState('Noch keine Favoriten', 'Wähle im Katalog deine bevorzugten Nachrichtenquellen aus.', 'Feeds erkunden', 'go-discover')}`;
}

export function renderDiscover({ catalog, favorites, searchInput, searching, searchError, searchResults }) {
  const favoritesUrls = new Set(favorites.map(feed => feed.url));
  const found = searchResults.map(url => catalog.find(feed => feed.url === url)).filter(Boolean);
  const popular = catalog.filter(feed => !feed.discovered);
  return `<div class="add-panel">
      <div class="add-panel__heading"><span class="add-icon">${icon('plus', 21)}</span><div><h2>Website oder Feed hinzufügen</h2><p>Website durchsuchen oder RSS-/Atom-URL direkt abonnieren.</p></div></div>
      <form id="add-form" class="add-form">
        <label class="sr-only" for="feed-url">Website oder Feed URL</label>
        <input id="feed-url" name="url" type="text" inputmode="url" autocomplete="url" spellcheck="false" placeholder="https://website.de oder https://website.de/feed.xml" value="${esc(searchInput)}" required ${searching ? 'disabled' : ''}>
        <button type="submit" class="button button-primary" ${searching ? 'disabled' : ''}>${searching ? '<span class="small-spinner" aria-hidden="true"></span> Suche …' : `${icon('search', 17)} Suchen`}</button>
      </form>
      ${searchError ? `<p class="form-error" role="alert">${icon('alert', 15)} ${esc(searchError)}</p>` : ''}
      <a class="attribution" href="https://feedsearch.dev/" target="_blank" rel="noopener noreferrer">powered by Feedsearch</a>
    </div>
    ${found.length ? `<div class="subsection-heading"><h2>Gefundene Feeds</h2><span class="count-pill">${found.length}</span></div><div class="feed-grid">${found.map(feed => feedCard(feed, favoritesUrls.has(feed.url))).join('')}</div>` : ''}
    <div class="feed-grid" aria-label="Beliebte Feeds">${popular.map(feed => feedCard(feed, favoritesUrls.has(feed.url))).join('')}</div>`;
}

export function formatDate(dateString) {
  if (!dateString) return 'Ohne Datum';
  try { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString)); }
  catch { return 'Ohne Datum'; }
}

export function articleCard(article, index) {
  const more = article.summary.length > 250;
  const hasLink = Boolean(article.link);
  return `<article class="article-card">
    <div class="article-card__meta"><span class="article-index">${String(index + 1).padStart(2, '0')}</span><time ${article.published ? `datetime="${esc(article.published)}"` : ''}>${esc(formatDate(article.published))}</time></div>
    <h2 class="article-card__title">${hasLink ? `<a href="${esc(article.link)}" target="_blank" rel="noopener noreferrer">${esc(article.title)}${icon('external', 17)}</a>` : esc(article.title)}</h2>
    ${article.summary ? `<p class="article-card__summary ${more ? 'is-clamped' : ''}">${esc(article.summary)}</p>` : ''}
    ${more ? `<div class="article-card__actions"><button type="button" class="expand-button" aria-expanded="false" data-action="expand-article">Mehr anzeigen ${icon('down', 15)}</button></div>` : ''}
  </article>`;
}

export function renderFeed({ feed, articles, favorite, status, error, updatedAt, fromCache, previousView }) {
  return `<div class="feed-toolbar">
    <div class="feed-toolbar__actions">
      <button class="icon-button ${favorite ? 'is-favorite' : ''}" type="button" data-action="toggle-favorite" data-url="${esc(feed.url)}" aria-label="${favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}" aria-pressed="${favorite}">${icon('heart', 19)}</button>
      <button class="icon-button" type="button" data-action="refresh" title="Feed neu laden" aria-label="Feed neu laden" ${status === 'loading' ? 'disabled' : ''}>${icon('refresh', 19)}</button>
    </div>
  </div>
  ${status === 'loading' && articles.length ? '<p class="info-strip"><span class="small-spinner" aria-hidden="true"></span> Aktualisiere Artikel …</p>' : ''}
  ${fromCache && status === 'error' ? `<p class="info-strip is-warning">Gespeicherte Artikel. Aktualisierung fehlgeschlagen: ${esc(error)}</p>` : ''}
  ${status === 'error' && !articles.length ? `<div class="error-state">${icon('alert', 23)}<h2>Feed konnte nicht geladen werden</h2><p>${esc(error)}</p><button class="button button-primary" data-action="refresh" type="button">Erneut versuchen ${icon('refresh', 16)}</button></div>` : ''}
  ${status === 'loading' && !articles.length ? `<div class="article-list" aria-label="Lade Artikel"><div class="article-skeleton"></div><div class="article-skeleton"></div><div class="article-skeleton"></div></div>` : ''}
  ${status === 'ready' && !articles.length ? emptyState('Keine Artikel gefunden', 'Dieser Feed enthält derzeit keine Nachrichten.', 'Aktualisieren', 'refresh') : ''}
  ${articles.length ? `<div class="article-list">${articles.map(articleCard).join('')}</div>` : ''}`;
}
