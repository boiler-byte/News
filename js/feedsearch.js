import { fetchExternalText, normalizeUrl, safeWebUrl } from './feed-reader.js';
import { feedFormat } from './feed-format.js';

const API = 'https://origin.feedsearch.dev/api/v1/search';

function uniqueFeeds(results) {
  const seen = new Set();
  return results.filter(feed => {
    if (!feed.url || seen.has(feed.url)) return false;
    seen.add(feed.url);
    return true;
  });
}

function normalizeResult(result, siteUrl, index) {
  const url = safeWebUrl(result?.url || '', siteUrl);
  if (!url) return null;
  const website = safeWebUrl(result.site_url || '', siteUrl) || siteUrl;
  let domain = 'Feed';
  try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch {}
  return {
    id: `discovered-${index}-${url}`,
    name: (result.title || result.site_name || domain).trim().slice(0, 100),
    category: 'Gefunden',
    description: (result.description || `Feed von ${domain}`).trim().slice(0, 220),
    url, website, tone: 'cyan', icon: 'rss', discovered: true,
    format: feedFormat({ version: result.version, contentType: result.content_type || result.type, url })
  };
}

async function feedsearchApi(siteUrl) {
  const endpoint = `${API}?url=${encodeURIComponent(siteUrl)}&info=true&favicon=false`;
  const body = await fetchExternalText(endpoint, 6500);
  const result = JSON.parse(body);
  if (!Array.isArray(result)) throw new Error('Feedsearch lieferte keine gültige Liste.');
  return result;
}

// Fallback for when the third-party Feedsearch API is unreachable: inspect
// a site's ordinary <link rel="alternate"> and known feed links.
async function discoverFromHtml(siteUrl) {
  const body = await fetchExternalText(siteUrl, 7000);
  const doc = new DOMParser().parseFromString(body, 'text/html');
  const matches = [];
  for (const link of doc.querySelectorAll('link[href], a[href]')) {
    const href = link.getAttribute('href');
    const type = (link.getAttribute('type') || '').toLowerCase();
    const rel = (link.getAttribute('rel') || '').toLowerCase();
    const label = (link.textContent || '').toLowerCase();
    if (/rss|atom|feed\+json|rdf/.test(type) ||
        (/alternate|feed/.test(rel) && /feed|rss|atom|xml|json/.test(href || '')) ||
        (link.tagName.toLowerCase() === 'a' && /\b(rss|atom|feed)\b/.test(label) && /feed|rss|atom|xml/.test(href || ''))) {
      const url = safeWebUrl(href, siteUrl);
      if (url) matches.push({ url, title: link.getAttribute('title') || doc.title || new URL(siteUrl).hostname, site_url: siteUrl, content_type: type });
    }
  }
  return matches;
}

export async function discoverFeeds(input) {
  const siteUrl = normalizeUrl(input);
  let results = [];
  try { results = await feedsearchApi(siteUrl); }
  catch {
    try { results = await discoverFromHtml(siteUrl); }
    catch { throw new Error('Keine Feeds gefunden. Feedsearch und die Website konnten nicht ausgelesen werden.'); }
  }
  return uniqueFeeds(results.map((feed, index) => normalizeResult(feed, siteUrl, index)).filter(Boolean));
}
