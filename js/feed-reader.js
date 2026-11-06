// Browsers cannot read most external RSS feeds because of CORS. Try the
// source directly first; use an optional public, unauthenticated proxy next.
const CORS_PROXY = 'https://proxy.cors.dev/';

export function normalizeUrl(input) {
  let value = String(input ?? '').trim();
  if (!value) throw new Error('Bitte eine Website- oder Feed-URL eingeben.');
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  let parsed;
  try { parsed = new URL(value); }
  catch { throw new Error('Bitte eine gültige URL eingeben.'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('Erlaubt sind nur öffentliche HTTP- oder HTTPS-URLs ohne Zugangsdaten.');
  }
  return parsed.href;
}

export function safeWebUrl(input, base) {
  try {
    const url = new URL(input, base);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function looksLikeFeedUrl(input) {
  const { pathname, searchParams } = new URL(input);
  return /\.(?:rss|atom|xml|rdf|json)$/i.test(pathname) ||
    /\/(?:feed|rss|atom|rdf)\/?$/i.test(pathname) ||
    /\/(?:rss|atom|feed)\.(?:php|asp|aspx)$/i.test(pathname) ||
    /^(?:rss|atom)[\d.]*$/i.test(searchParams.get('feed') || '');
}

async function requestText(endpoint, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(endpoint, {
      method: 'GET', credentials: 'omit', signal: controller.signal,
      headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, application/json, text/xml, text/html;q=0.8, */*;q=0.5' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally { clearTimeout(timer); }
}

export async function fetchExternalText(url, timeout = 9000) {
  const target = normalizeUrl(url);
  try {
    return await requestText(target, timeout);
  } catch (directError) {
    try {
      return await requestText(`${CORS_PROXY}${target}`, timeout);
    } catch (proxyError) {
      throw new Error('Die Quelle ist aktuell nicht erreichbar (Netzwerk, CORS oder Proxy).');
    }
  }
}

function child(element, localNames) {
  const names = localNames.map(name => name.toLowerCase());
  return Array.from(element.children).find(node => names.includes(node.localName.toLowerCase())) || null;
}

function childText(element, names) {
  return child(element, names)?.textContent?.trim() ?? '';
}

function plainText(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, iframe, noscript, svg, form').forEach(el => el.remove());
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 3500);
}

function safeDate(input) {
  const ms = Date.parse(input || '');
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

function parseXmlFeed(raw, url) {
  const doc = new DOMParser().parseFromString(raw, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Die Quelle liefert kein gültiges XML.');
  const root = doc.documentElement;
  const format = root?.localName?.toLowerCase();
  const isAtom = format === 'feed';
  if (!['rss', 'rdf', 'feed'].includes(format)) throw new Error('Unter dieser Adresse wurde kein RSS- oder Atom-Feed gefunden.');
  const entries = Array.from(doc.getElementsByTagNameNS('*', isAtom ? 'entry' : 'item'));
  // getElementsByTagNameNS matches namespaced and non-namespaced elements.
  const articles = entries.map((item, index) => {
    const title = plainText(childText(item, ['title'])) || 'Ohne Titel';
    let link = '';
    if (isAtom) {
      const links = Array.from(item.children).filter(el => el.localName.toLowerCase() === 'link');
      const preferred = links.find(el => !el.getAttribute('rel') || el.getAttribute('rel') === 'alternate') || links[0];
      link = preferred?.getAttribute('href') || preferred?.textContent?.trim() || '';
    } else {
      const linkNode = child(item, ['link']);
      link = linkNode?.textContent?.trim() || linkNode?.getAttribute('href') || '';
    }
    const summary = childText(item, ['summary', 'description', 'encoded', 'content']);
    const published = safeDate(childText(item, ['pubdate', 'published', 'updated', 'date']));
    return {
      id: childText(item, ['guid', 'id']) || `${url}#${index}`,
      title, link: safeWebUrl(link, url), summary: plainText(summary), published
    };
  });
  return articles.sort((a, b) => (Date.parse(b.published) || 0) - (Date.parse(a.published) || 0)).slice(0, 60);
}

function parseJsonFeed(raw, url) {
  let json;
  try { json = JSON.parse(raw); }
  catch { throw new Error('Der Feed enthält ungültiges JSON.'); }
  if (!json.version?.includes('jsonfeed.org') || !Array.isArray(json.items)) {
    throw new Error('Unter dieser Adresse wurde kein JSON-Feed gefunden.');
  }
  return json.items.map((item, index) => ({
    id: item.id || `${url}#${index}`,
    title: plainText(item.title || item.summary || 'Ohne Titel'),
    link: safeWebUrl(item.url || item.external_url || '', json.home_page_url || url),
    summary: plainText(item.summary || item.content_text || item.content_html || ''),
    published: safeDate(item.date_published || item.date_modified)
  })).sort((a, b) => (Date.parse(b.published) || 0) - (Date.parse(a.published) || 0)).slice(0, 60);
}

export function parseFeed(raw, url) {
  const source = raw.trim();
  if (source.startsWith('{')) return parseJsonFeed(source, url);
  return parseXmlFeed(source, url);
}

export async function fetchArticles(url) {
  const source = await fetchExternalText(url);
  return parseFeed(source, url);
}
