/** @type {Map<string, { data: object, expires: number }>} */
const imdbCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** @param {string} title @param {string | null | undefined} year */
function cleanTitle(title, year) {
  let t = title.trim();
  t = t.replace(/\s*\(\d{4}\)\s*$/, '');
  if (year && t.endsWith(year)) {
    t = t.slice(0, -year.length).trim();
  }
  return t;
}

/** @param {object} env @param {string} title @param {string | null | undefined} year */
export async function lookupImdb(env, title, year) {
  const apiKey = env.OMDB_API_KEY;
  if (!apiKey) return null;

  const query = cleanTitle(title, year);
  const cacheKey = `${query}:${year ?? ''}`;
  const cached = imdbCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const params = new URLSearchParams({ apikey: apiKey, t: query, plot: 'short' });
  if (year) params.set('y', year);

  try {
    const res = await fetch(`https://www.omdbapi.com/?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.Response === 'False') return null;

    const result = {
      imdbId: data.imdbID,
      imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
      metascore: data.Metascore !== 'N/A' ? data.Metascore : null,
      runtime: data.Runtime !== 'N/A' ? data.Runtime : null,
      genre: data.Genre !== 'N/A' ? data.Genre : null,
      director: data.Director !== 'N/A' ? data.Director : null,
      cast: data.Actors !== 'N/A' ? data.Actors : null,
      rated: data.Rated !== 'N/A' ? data.Rated : null,
      imdbUrl: data.imdbID ? `https://www.imdb.com/title/${data.imdbID}/` : null,
      plot: data.Plot !== 'N/A' ? data.Plot : null,
    };

    imdbCache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL_MS });
    return result;
  } catch {
    return null;
  }
}
