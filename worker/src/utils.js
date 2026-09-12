export const BASE = 'https://einthusan.tv';
export const CDN_HOSTS = ['cdn1.einthusan.io', 'cdn2.einthusan.io', 'cdn3.einthusan.io'];

/** @param {string} html */
export function decodeHtmlEntities(html) {
  return html
    .replace(/&#43;/g, '+')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** @param {string} html */
export function isRateLimitedHtml(html) {
  return (
    html.includes('Rate Limited') ||
    html.includes('PGRateLimited') ||
    !html.includes('data-ejpingables')
  );
}

/** @param {string} host */
export function isPrivateIp(host) {
  const privateRe = /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|fc|fd)/i;
  return privateRe.test(host);
}

/** @param {string} url */
export function isAllowedStreamUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith('/etv/')) return false;
    if (isPrivateIp(parsed.hostname)) return false;
    if (CDN_HOSTS.includes(parsed.hostname) || parsed.hostname.endsWith('.einthusan.io')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** @param {string} url */
export function sanitizeStreamUrl(url) {
  return decodeHtmlEntities(url).trim();
}

/** @param {string} encrypted */
export function decryptEJLinks(encrypted) {
  try {
    const reordered = encrypted.slice(0, 10) + encrypted.slice(-1) + encrypted.slice(12, -1);
    const decoded = atob(reordered);
    return JSON.parse(decoded);
  } catch {
    throw new Error('Could not decrypt stream links');
  }
}

/** @param {string} html @param {string} lang */
export function parseBrowseMovies(html, lang) {
  /** @type {Map<string, object>} */
  const movies = new Map();

  // Extract all poster src values in one pass: map "id:lang" -> poster url
  /** @type {Map<string, string>} */
  const posterMap = new Map();
  const posterRe =
    /id="movie_cover_link"[^>]*href="\/movie\/watch\/([^/]+)\/\?lang=([^"]+)"[^>]*><img src="([^"]+)"/g;
  let pm;
  while ((pm = posterRe.exec(html)) !== null) {
    const key = `${pm[1]}:${pm[2]}`;
    if (!posterMap.has(key)) posterMap.set(key, pm[3]);
  }

  // Extract all year values in one pass: map "id:lang" -> year
  /** @type {Map<string, string>} */
  const yearMap = new Map();
  const yearRe =
    /watch\/([^/]+)\/\?lang=([^"]+)"[^>]*>[^<]*<div class="info"><p>(\d{4})/g;
  let ym;
  while ((ym = yearRe.exec(html)) !== null) {
    const key = `${ym[1]}:${ym[2]}`;
    if (!yearMap.has(key)) yearMap.set(key, ym[3]);
  }

  // Extract all UHD flags in one pass: set of "id:lang"
  const uhdSet = new Set();
  const uhdRe = /watch\/([^/]+)\/\?lang=([^"]+)"[^>]*data-uhd="true"/g;
  let um;
  while ((um = uhdRe.exec(html)) !== null) {
    uhdSet.add(`${um[1]}:${um[2]}`);
  }

  const titleRe =
    /<a class="title" href="\/movie\/watch\/([^/]+)\/\?lang=([^"]+)"><h2>([^<]+)<\/h2><\/a>/g;
  let m;
  while ((m = titleRe.exec(html)) !== null) {
    const [, id, movieLang, title] = m;
    if (movies.has(id)) continue;

    const key = `${id}:${movieLang}`;
    let poster = posterMap.get(key) ?? '';
    if (poster && !poster.startsWith('http')) poster = `https:${poster}`;

    movies.set(id, {
      id,
      title: title.trim(),
      lang: movieLang,
      poster,
      year: yearMap.get(key) ?? null,
      uhd: uhdSet.has(key),
    });
  }

  return [...movies.values()].filter((mv) => mv.lang === lang);
}

/** @param {string} html @param {string} lang @param {boolean} includeUnlinked */
export function parseCarouselMovies(html, lang, includeUnlinked = false) {
  /** @type {Map<string, object>} */
  const movies = new Map();

  const linkedRe =
    /<a href="\/movie\/watch\/([^/]+)\/\?lang=([^"]+)"><img src="([^"]+)">\s*<\/a><a href="\/movie\/watch\/\1\/\?lang=\2" class="title">([^<]+)<\/a>/g;

  let m;
  while ((m = linkedRe.exec(html)) !== null) {
    const [, id, movieLang, img, title] = m;
    if (movieLang !== lang || movies.has(id)) continue;
    let poster = img;
    if (poster && !poster.startsWith('http')) poster = `https:${poster}`;
    movies.set(id, {
      id,
      title: title.trim(),
      lang: movieLang,
      poster,
      year: null,
      uhd: /ultrahd/.test(m[0]),
    });
  }

  // Cards with no /movie/watch/ link at all aren't confirmed to be in this
  // language's catalog -- on tabs like "regional hits" these are cross-language
  // promo cards for other languages entirely (with only a poster filename to
  // use as a fake id), so only trust this fallback where that's actually the
  // expected shape (e.g. "coming soon" unreleased titles), not by default.
  if (includeUnlinked) {
    const unlinkedRe =
      /<img src="([^"]+moviecovers\/([^/"?]+)[^"]*)">\s*<\/a><a href="" class="title">([^<]+)<\/a>/g;

    while ((m = unlinkedRe.exec(html)) !== null) {
      const [, img, id, title] = m;
      if (movies.has(id)) continue;
      let poster = img;
      if (poster && !poster.startsWith('http')) poster = `https:${poster}`;
      movies.set(id, {
        id,
        title: title.trim(),
        lang,
        poster,
        year: null,
        uhd: /ultrahd/.test(m[0]),
        comingSoon: true,
      });
    }
  }

  return [...movies.values()];
}

/** @param {string} html @param {string} lang */
export function parseFeaturedSections(html, lang) {
  const labels = [
    'mostWatched',
    'staffPicks',
    'recentlyAdded',
    'regionalHits',
    'comingSoon',
  ];
  const parts = html.split(/<input type="radio" id="_showcase_\d+" name="showcase_tab">/);
  /** @type {Record<string, object[]>} */
  const featured = {
    mostWatched: [],
    staffPicks: [],
    recentlyAdded: [],
    regionalHits: [],
    comingSoon: [],
  };

  for (let i = 1; i < parts.length && i <= labels.length; i++) {
    const label = labels[i - 1];
    featured[label] = parseCarouselMovies(parts[i], lang, label === 'comingSoon');
  }

  return featured;
}

/** @param {string} html @param {string} lang */
export function parseSearchResults(html, lang) {
  /** @type {Map<string, object>} */
  const movies = new Map();

  const blockRe =
    /<div class="block1">[\s\S]*?href="[^"]*watch\/([^/]+)\/\?lang=([^"]+)"[\s\S]*?src="([^"]+)"[\s\S]*?<\/div><div class="block2"><a class="title" href="\/movie\/watch\/\1\/\?lang=\2"><h[23]>([^<]+)<\/h[23]>/g;

  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const [, id, movieLang, img, title] = m;
    if (movieLang !== lang || movies.has(id)) continue;
    let poster = img;
    if (poster && !poster.startsWith('http')) poster = `https:${poster}`;
    movies.set(id, {
      id,
      title: title.trim(),
      lang: movieLang,
      poster,
      year: null,
      uhd: /ultrahd|data-uhd="true"/.test(m[0]),
    });
  }

  if (movies.size === 0) {
    return parseBrowseMovies(html, lang);
  }

  return [...movies.values()];
}

/** @param {string} html */
export function parseMovieExtras(html) {
  /** @type {{ name: string, role: string }[]} */
  const profs = [];
  const profRe = /<div class="prof"><p>([^<]+)<\/p><label>([^<]+)<\/label><\/div>/g;
  let m;
  while ((m = profRe.exec(html)) !== null) {
    profs.push({ name: m[1].trim(), role: m[2].trim() });
  }

  const cast = profs
    .filter((p) => p.role === 'Lead' || p.role === 'Supporting')
    .map((p) => p.name)
    .join(', ');

  const director = profs.find((p) => p.role === 'Director')?.name ?? null;
  const musicDirector = profs.find((p) => p.role === 'Music Director')?.name ?? null;

  const genreRaw = html.match(/data-genre="([^"]+)"/)?.[1];
  const genre = genreRaw
    ? genreRaw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const ratingMatch = html.match(/title="overall rating"[^>]*>[^<]*<\/i>\s*([\d.]+)/);
  const userRating = ratingMatch?.[1] ?? null;

  return { cast: cast || null, director, musicDirector, genre, userRating };
}
