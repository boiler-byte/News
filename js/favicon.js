import { fetchExternalText, safeWebUrl } from './feed-reader.js';

// Only store verified raster images. Persisting a data URL in the favorite
// record makes the icon available after a restart, including when offline.
const PROXY = 'https://proxy.cors.dev/';
const MAX_ICON_BYTES = 192 * 1024;

function safeSvg(bytes) {
  const xml = new TextDecoder().decode(bytes);
  if (/<!doctype|<!entity|<\?xml-stylesheet/i.test(xml)) return null;
  const doc = new DOMParser().parseFromString(xml, 'image/svg+xml');
  if (doc.querySelector('parsererror') || doc.documentElement?.localName !== 'svg') return null;
  const shapes = new Set([
    'svg', 'g', 'defs', 'path', 'rect', 'circle', 'ellipse', 'line',
    'polyline', 'polygon', 'lineargradient', 'radialgradient', 'stop',
    'clippath', 'mask', 'title', 'desc'
  ]);
  for (const element of Array.from(doc.querySelectorAll('*'))) {
    if (!shapes.has(element.localName.toLowerCase())) {
      element.remove();
      continue;
    }
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith('on') || name.endsWith('href') ||
          /@import|expression\s*\(/i.test(value) ||
          (/url\s*\(/i.test(value) && !/^url\(#[\w-]+\)$/i.test(value.trim()))) {
        element.removeAttributeNode(attr);
      }
    }
  }
  return new Blob([new XMLSerializer().serializeToString(doc.documentElement)], { type: 'image/svg+xml' });
}

function imageType(bytes) {
  const starts = (...values) => values.every((value, index) => bytes[index] === value);
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (starts(0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (starts(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (starts(0x00, 0x00, 0x01, 0x00)) return 'image/x-icon';
  if (starts(0x52, 0x49, 0x46, 0x46) &&
      bytes.length > 11 && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  if (bytes.length > 11 && String.fromCharCode(...bytes.slice(4, 12)).includes('ftypavif')) return 'image/avif';
  return '';
}

async function fetchIcon(url, timeout = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { credentials: 'omit', signal: controller.signal });
    if (!response.ok || Number(response.headers.get('content-length')) > MAX_ICON_BYTES) return '';
    const blob = await response.blob();
    if (!blob.size || blob.size > MAX_ICON_BYTES) return '';
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let type = imageType(bytes);
    let safeBlob = blob;
    if (!type && (url.toLowerCase().includes('.svg') || /svg\+xml/i.test(blob.type))) {
      safeBlob = safeSvg(bytes);
      if (!safeBlob) return '';
      type = 'image/svg+xml';
    }
    if (!type) return '';
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(type === 'image/svg+xml' ? safeBlob : new Blob([blob], { type }));
    });
  } finally {
    clearTimeout(timer);
  }
}

async function downloadIcon(url) {
  try {
    const direct = await fetchIcon(url);
    if (direct) return direct;
  } catch { /* Cross-origin icon requests often require the fallback proxy. */ }
  try { return await fetchIcon(`${PROXY}${url}`); }
  catch { return ''; }
}

function iconCandidates(html, siteUrl) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('link[rel][href]'))
    .filter(link => /^(?:shortcut\s+)?icon$|\bapple-touch-icon\b/i.test(link.rel.trim()))
    .map(link => safeWebUrl(link.getAttribute('href'), siteUrl))
    .filter(Boolean);
}

export async function findSiteFavicon(website, feedUrl = '') {
  const site = safeWebUrl(website) || safeWebUrl(feedUrl);
  if (!site) return '';
  const candidates = [];
  try {
    const html = await fetchExternalText(site, 4500);
    candidates.push(...iconCandidates(html, site));
  } catch { /* Fall back to the conventional favicon location. */ }
  candidates.push(safeWebUrl('/favicon.ico', site));
  const originOfFeed = safeWebUrl(feedUrl);
  if (originOfFeed && new URL(originOfFeed).origin !== new URL(site).origin) {
    candidates.push(safeWebUrl('/favicon.ico', originOfFeed));
  }
  for (const candidate of [...new Set(candidates.filter(Boolean))].slice(0, 8)) {
    const dataUrl = await downloadIcon(candidate);
    if (dataUrl) return dataUrl;
  }
  return '';
}
