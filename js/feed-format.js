// Feedsearch returns a `version` code (rss20, atom10, etc.). Some sites
// also encode their preferred format directly in the feed URL.
export function feedFormat({ version = '', contentType = '', url = '' } = {}) {
  const formatFromCode = value => {
    const code = String(value || '').trim().toLowerCase();
    if (!code) return '';

    const jsonVersion = code.match(/jsonfeed\.org\/version\/(\d+(?:\.\d+)?)/);
    if (jsonVersion) return `JSON Feed ${jsonVersion[1]}`;
    if (code.includes('jsonfeed') || code === 'json') return 'JSON Feed';

    const atomCode = code.match(/^atom(\d)(\d)$/);
    if (atomCode) return `Atom ${atomCode[1]}.${atomCode[2]}`;
    const atom = code.match(/^atom\s*([0-9]+)(?:[.](\d+))?$/);
    if (atom) return `Atom ${atom[1]}.${atom[2] ?? '0'}`;
    if (/\batom\b/.test(code)) return 'Atom';

    const rssCode = code.match(/^rss(\d)(\d{1,2})$/);
    if (rssCode) return `RSS ${rssCode[1]}.${rssCode[2]}`;
    const rss = code.match(/^rss\s*([0-9]+)(?:[.](\d+))?$/);
    if (rss) return `RSS ${rss[1]}.${rss[2] ?? '0'}`;
    if (/\brss\b/.test(code)) return 'RSS';
    if (code === 'rdf' || /rdf\+xml/.test(code)) return 'RSS 1.0';
    return '';
  };

  const fromVersion = formatFromCode(version);
  if (fromVersion) return fromVersion;

  let path = '';
  try {
    const address = new URL(url);
    for (const key of ['feed', 'format', 'type']) {
      const byQuery = formatFromCode(address.searchParams.get(key));
      if (byQuery) return byQuery;
    }
    path = address.pathname.toLowerCase();
  } catch { /* URL is optional. */ }

  const mediaType = String(contentType || '').toLowerCase();
  if (/atom\+xml/.test(mediaType)) return 'Atom';
  if (/rss\+xml/.test(mediaType)) return 'RSS';
  if (/rdf\+xml/.test(mediaType)) return 'RSS 1.0';
  if (/feed\+json|application\/json/.test(mediaType)) return 'JSON Feed';

  if (/\.atom$|\/atom\/?$|atom[^/]*\.xml$/.test(path)) return 'Atom';
  if (/\.rdf$|\/rdf\/?$/.test(path)) return 'RSS 1.0';
  if (/rss2[^/]*\.xml$/.test(path)) return 'RSS 2.0';
  if (/\.rss$|\/rss\/?$|\/feed\/?$|rss/.test(path)) return 'RSS';
  if (/\.json$/.test(path)) return 'JSON Feed';
  return '';
}
