const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const BASE = 'https://einthusan.tv';
const VALID_LANGS = new Set(['tamil', 'hindi', 'malayalam']);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** @type {Map<string, { data: object, expires: number }>} */
const movieCache = new Map();
/** @type {Map<string, Promise<object>>} */
const movieInflight = new Map();

const MOVIE_CACHE_TTL_MS = 15 * 60 * 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string} html */
function isRateLimitedHtml(html) {
  return (
    html.includes('Rate Limited') ||
    html.includes('PGRateLimited') ||
    !html.includes('data-ejpingables')
  );
}

/** @param {string} html */
function decodeHtmlEntities(html) {
  return html
    .replace(/&#43;/g, '+')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** @param {string} html @param {string} lang */
function parseBrowseMovies(html, lang) {
  /** @type {Map<string, object>} */
  const movies = new Map();

  const titleRe =
    /<a class="title" href="\/movie\/watch\/([^/]+)\/\?lang=([^"]+)"><h2>([^<]+)<\/h2><\/a>/g;
  let m;
  while ((m = titleRe.exec(html)) !== null) {
    const [, id, movieLang, title] = m;
    if (movies.has(id)) continue;

    const posterRe = new RegExp(
      `id="movie_cover_link"[^>]*href="/movie/watch/${escapeRegExp(id)}/\\?lang=${escapeRegExp(movieLang)}"[^>]*><img src="([^"]+)"`,
    );
    const posterMatch = html.match(posterRe);
    let poster = posterMatch?.[1] ?? '';
    if (poster && !poster.startsWith('http')) poster = `https:${poster}`;

    const yearRe = new RegExp(
      `watch/${escapeRegExp(id)}/\\?lang=${escapeRegExp(movieLang)}".*?<div class="info"><p>(\\d{4})`,
      's',
    );
    const yearMatch = html.match(yearRe);
    const uhdRe = new RegExp(
      `watch/${escapeRegExp(id)}/.*?data-uhd="true"`,
      's',
    );

    movies.set(id, {
      id,
      title: title.trim(),
      lang: movieLang,
      poster,
      year: yearMatch?.[1] ?? null,
      uhd: uhdRe.test(html),
    });
  }

  return [...movies.values()].filter((mv) => mv.lang === lang);
}

/** @param {string} html @param {string} lang */
function parseCarouselMovies(html, lang) {
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

  return [...movies.values()];
}

/** @param {string} html @param {string} lang */
function parseFeaturedSections(html, lang) {
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
    featured[labels[i - 1]] = parseCarouselMovies(parts[i], lang);
  }

  return featured;
}

/** @param {string} str */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** @param {string} html @param {string} lang */
function parseSearchResults(html, lang) {
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

const CDN_HOSTS = ['cdn1.einthusan.io', 'cdn2.einthusan.io', 'cdn3.einthusan.io'];

/** @param {string} url */
function sanitizeStreamUrl(url) {
  return decodeHtmlEntities(url).trim();
}

/** @param {string} url */
function isAllowedStreamUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith('/etv/')) return false;
    if (CDN_HOSTS.includes(parsed.hostname) || parsed.hostname.endsWith('.einthusan.io')) {
      return true;
    }
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname);
  } catch {
    return false;
  }
}

/** @param {string} encrypted */
function decryptEJLinks(encrypted) {
  const reordered = encrypted.slice(0, 10) + encrypted.slice(-1) + encrypted.slice(12, -1);
  const decoded = atob(reordered);
  return JSON.parse(decoded);
}

/** @param {string} url */
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Upstream error ${res.status}`);
  const html = await res.text();
  const cookies =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ')
      : res.headers.get('Set-Cookie')?.split(';')[0] ?? '';
  return { html, cookies };
}

/** @param {string} watchUrl */
async function fetchWatchPageWithRetry(watchUrl) {
  const maxAttempts = 5;
  let lastError = 'Could not load movie page';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { html, cookies } = await fetchPage(watchUrl);
    if (!isRateLimitedHtml(html)) {
      return { html, cookies };
    }
    lastError = 'Einthusan rate limited. Retrying…';
    if (attempt < maxAttempts - 1) {
      await sleep(600 + attempt * 700);
    }
  }

  throw new Error(lastError);
}

/** @param {string} url */
async function fetchHtml(url) {
  const { html } = await fetchPage(url);
  return html;
}

/** @param {string} html @param {string} id @param {string} lang @param {string} watchUrl @param {string} cookies */
async function resolveStreamFromPage(html, id, lang, watchUrl, cookies = '') {
  const pageIdMatch = html.match(/data-pageid="([^"]+)"/);
  const ejMatch =
    html.match(/id="UIVideoPlayer"[^>]*data-ejpingables="([^"]+)"/) ??
    html.match(/data-ejpingables="([^"]+)"/);
  if (!pageIdMatch || !ejMatch) {
    throw new Error('Could not resolve stream for this movie');
  }

  const pageId = decodeHtmlEntities(pageIdMatch[1]);
  const body = new URLSearchParams({
    xEvent: 'UIVideoPlayer.PingOutcome',
    xJson: JSON.stringify({ EJOutcomes: ejMatch[1], NativeHLS: false }),
    arcVersion: '3',
    appVersion: '59',
    'gorilla.csrf.Token': pageId,
  });

  /** @type {Record<string, string>} */
  const ajaxHeaders = {
    'User-Agent': USER_AGENT,
    'Content-Type': 'application/x-www-form-urlencoded',
    Referer: watchUrl,
    Origin: BASE,
  };
  if (cookies) ajaxHeaders.Cookie = cookies;

  const ajaxRes = await fetch(`${BASE}/ajax/movie/watch/${id}/`, {
    method: 'POST',
    headers: ajaxHeaders,
    body,
  });

  if (!ajaxRes.ok) throw new Error(`Stream API error ${ajaxRes.status}`);
  const json = await ajaxRes.json();
  const encrypted = json?.Data?.EJLinks;
  if (!encrypted) throw new Error('Stream link unavailable');
  const links = decryptEJLinks(encrypted);
  const hlsUrl = sanitizeStreamUrl(links.HLSLink || links.MP4Link);

  if (!hlsUrl.includes('.einthusan.io/')) {
    throw new Error('CDN stream link unavailable');
  }

  return hlsUrl;
}

/** @param {string} id @param {string} lang */
async function getMovieStream(id, lang) {
  const watchUrl = `${BASE}/movie/watch/${id}/?lang=${lang}`;
  const { html, cookies } = await fetchWatchPageWithRetry(watchUrl);
  return resolveStreamFromPage(decodeHtmlEntities(html), id, lang, watchUrl, cookies);
}

/** @param {string} id @param {string} lang */
async function getMovieDetailsImpl(id, lang) {
  const watchUrl = `${BASE}/movie/watch/${id}/?lang=${lang}`;
  const { html: rawHtml, cookies } = await fetchWatchPageWithRetry(watchUrl);
  const html = decodeHtmlEntities(rawHtml);

  const titleMatch = html.match(/<h3>([^<]+)<\/h3>/);
  const descMatch = html.match(/class="synopsis"[^>]*>([^<]+)</);
  const posterMatch = html.match(/moviecovers\/[^"]+\.jpg/);
  const uhd = /data-uhd="true"/.test(html);

  let title = titleMatch?.[1]?.trim() ?? 'Unknown';
  if (title === 'SELECT QUALITY') {
    const h2 = html.match(/<h2>([^<]+)<\/h2>/);
    title = h2?.[1]?.trim() ?? title;
  }

  const contentTitle = html.match(/data-content-title="([^"]+)"/);
  if (contentTitle) title = contentTitle[1];

  const hlsUrl = await resolveStreamFromPage(html, id, lang, watchUrl, cookies);

  return {
    id,
    title,
    lang,
    poster: posterMatch ? `https://cdn2.einthusan.io/etv/s3/${posterMatch[0]}` : '',
    description: descMatch?.[1]?.trim() ?? '',
    uhd,
    hlsUrl,
  };
}

/** @param {string} id @param {string} lang */
async function getMovieDetails(id, lang) {
  const cacheKey = `${id}:${lang}`;
  const cached = movieCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  if (movieInflight.has(cacheKey)) {
    return movieInflight.get(cacheKey);
  }

  const promise = getMovieDetailsImpl(id, lang)
    .then((data) => {
      movieCache.set(cacheKey, { data, expires: Date.now() + MOVIE_CACHE_TTL_MS });
      movieInflight.delete(cacheKey);
      return data;
    })
    .catch((err) => {
      movieInflight.delete(cacheKey);
      throw err;
    });

  movieInflight.set(cacheKey, promise);
  return promise;
}

/** @param {string} lang */
async function getHomeData(lang) {
  const html = await fetchHtml(`${BASE}/movie/browse/?lang=${lang}`);

  return {
    browse: parseBrowseMovies(html, lang),
    featured: parseFeaturedSections(html, lang),
  };
}

/** @param {Request} request */
async function proxyStream(request) {
  const url = new URL(request.url);
  const target = url.searchParams.get('url');
  if (!target) {
    return new Response('Missing url parameter', { status: 400, headers: corsHeaders });
  }

  const streamUrl = sanitizeStreamUrl(target);

  if (!isAllowedStreamUrl(streamUrl)) {
    return new Response('Host not allowed', { status: 403, headers: corsHeaders });
  }

  const upstream = await fetch(streamUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      Referer: `${BASE}/`,
      Origin: BASE,
    },
    signal: AbortSignal.timeout(25000),
  });

  const headers = new Headers(upstream.headers);
  headers.set('Access-Control-Allow-Origin', '*');

  const contentType = upstream.headers.get('content-type') ?? '';
  const isManifest =
    streamUrl.includes('.m3u8') ||
    contentType.includes('mpegurl') ||
    contentType.includes('m3u8');

  if (isManifest) {
    const text = await upstream.text();
    if (!text.trim().startsWith('#EXTM3U')) {
      return new Response('Stream unavailable or expired. Go back and try again.', {
        status: 502,
        headers: corsHeaders,
      });
    }

    const base = streamUrl.substring(0, streamUrl.lastIndexOf('/') + 1);
    const workerOrigin = new URL(request.url).origin;
    const rewritten = text
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;
        const absolute = sanitizeStreamUrl(
          trimmed.startsWith('http') ? trimmed : new URL(trimmed, base).toString(),
        );
        if (!isAllowedStreamUrl(absolute)) return line;
        return `${workerOrigin}/api/stream?url=${encodeURIComponent(absolute)}`;
      })
      .join('\n');

    headers.set('Content-Type', 'application/vnd.apple.mpegurl');
    return new Response(rewritten, { status: upstream.status, headers });
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}

export default {
  /** @param {Request} request @param {object} _env @param {ExecutionContext} ctx */
  async fetch(request, _env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    try {
      if (path === '/api/home' || path === '/home') {
        const lang = url.searchParams.get('lang') ?? 'tamil';
        if (!VALID_LANGS.has(lang)) {
          return Response.json({ error: 'Invalid language' }, { status: 400, headers: corsHeaders });
        }
        const data = await getHomeData(lang);
        return Response.json(data, { headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=300' } });
      }

      if (path === '/api/search' || path === '/search') {
        const lang = url.searchParams.get('lang') ?? 'tamil';
        const q = url.searchParams.get('q')?.trim();
        if (!q) return Response.json([], { headers: corsHeaders });
        if (!VALID_LANGS.has(lang)) {
          return Response.json({ error: 'Invalid language' }, { status: 400, headers: corsHeaders });
        }
        const searchUrl = `${BASE}/movie/results/?lang=${lang}&query=${encodeURIComponent(q)}`;
        const html = await fetchHtml(searchUrl);
        const results = parseSearchResults(html, lang);
        return Response.json(results, { headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=120' } });
      }

      const movieMatch = path.match(/^\/(?:api\/)?movie\/([^/]+)$/);
      if (movieMatch) {
        const id = movieMatch[1];
        const lang = url.searchParams.get('lang') ?? 'tamil';
        if (!VALID_LANGS.has(lang)) {
          return Response.json({ error: 'Invalid language' }, { status: 400, headers: corsHeaders });
        }
        const details = await getMovieDetails(id, lang);
        return Response.json(details, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } });
      }

      if (path === '/api/stream' || path === '/stream') {
        try {
          return await proxyStream(request);
        } catch (err) {
          const message =
            err instanceof Error && err.name === 'TimeoutError'
              ? 'Stream timed out. Try playing again.'
              : err instanceof Error
                ? err.message
                : 'Stream proxy failed';
          return Response.json({ error: message }, { status: 502, headers: corsHeaders });
        }
      }

      if (path === '/' || path === '/api') {
        return Response.json({
          name: 'Einthusan TV API',
          endpoints: ['/api/home?lang=tamil', '/api/search?q=&lang=tamil', '/api/movie/:id?lang=tamil', '/api/stream?url='],
        }, { headers: corsHeaders });
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      return Response.json({ error: message }, { status: 500, headers: corsHeaders });
    }
  },
};
