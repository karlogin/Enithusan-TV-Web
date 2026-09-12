import { describe, it, expect } from 'vitest';
import {
  decodeHtmlEntities,
  isRateLimitedHtml,
  isPrivateIp,
  isAllowedStreamUrl,
  sanitizeStreamUrl,
  decryptEJLinks,
  parseBrowseMovies,
  parseCarouselMovies,
  parseFeaturedSections,
} from './utils.js';

describe('decodeHtmlEntities', () => {
  it('decodes &#43; to +', () => {
    expect(decodeHtmlEntities('a&#43;b')).toBe('a+b');
  });

  it('decodes &amp; to &', () => {
    expect(decodeHtmlEntities('a&amp;b')).toBe('a&b');
  });

  it('decodes &quot; to "', () => {
    expect(decodeHtmlEntities('say &quot;hello&quot;')).toBe('say "hello"');
  });

  it("decodes &#39; to '", () => {
    expect(decodeHtmlEntities("it&#39;s")).toBe("it's");
  });

  it('decodes multiple entities in one string', () => {
    expect(decodeHtmlEntities('a&#43;b&amp;c')).toBe('a+b&c');
  });

  it('returns unchanged string with no entities', () => {
    expect(decodeHtmlEntities('hello world')).toBe('hello world');
  });
});

describe('isRateLimitedHtml', () => {
  it('detects "Rate Limited" text', () => {
    expect(isRateLimitedHtml('<html>Rate Limited</html>')).toBe(true);
  });

  it('detects "PGRateLimited" text', () => {
    expect(isRateLimitedHtml('<html>PGRateLimited</html>')).toBe(true);
  });

  it('returns true when data-ejpingables is missing', () => {
    expect(isRateLimitedHtml('<html>Normal page without that attr</html>')).toBe(true);
  });

  it('returns false for valid page with data-ejpingables', () => {
    const validHtml = '<html><div data-ejpingables="abc123">content</div></html>';
    expect(isRateLimitedHtml(validHtml)).toBe(false);
  });
});

describe('isPrivateIp', () => {
  it('returns true for 10.x.x.x', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('10.255.255.255')).toBe(true);
  });

  it('returns true for 127.x.x.x', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
  });

  it('returns true for 192.168.x.x', () => {
    expect(isPrivateIp('192.168.1.1')).toBe(true);
  });

  it('returns false for public IP 8.8.8.8', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false);
  });

  it('returns false for CDN hostname', () => {
    expect(isPrivateIp('cdn1.einthusan.io')).toBe(false);
  });
});

describe('isAllowedStreamUrl', () => {
  it('returns true for valid CDN URL with /etv/ path', () => {
    expect(isAllowedStreamUrl('https://cdn1.einthusan.io/etv/stream.m3u8')).toBe(true);
  });

  it('returns true for any einthusan.io subdomain with /etv/ path', () => {
    expect(isAllowedStreamUrl('https://cdn99.einthusan.io/etv/foo.mp4')).toBe(true);
  });

  it('returns false for URL without /etv/ path', () => {
    expect(isAllowedStreamUrl('https://cdn1.einthusan.io/other/stream.m3u8')).toBe(false);
  });

  it('returns false for private IP URL', () => {
    expect(isAllowedStreamUrl('https://192.168.1.1/etv/stream.m3u8')).toBe(false);
    expect(isAllowedStreamUrl('https://10.0.0.1/etv/stream.m3u8')).toBe(false);
  });

  it('returns false for unknown domain', () => {
    expect(isAllowedStreamUrl('https://evil.com/etv/stream.m3u8')).toBe(false);
  });

  it('returns false for invalid URL', () => {
    expect(isAllowedStreamUrl('not-a-url')).toBe(false);
  });
});

describe('sanitizeStreamUrl', () => {
  it('decodes HTML entities', () => {
    expect(sanitizeStreamUrl('https://cdn1.einthusan.io/etv/foo&#43;bar')).toBe(
      'https://cdn1.einthusan.io/etv/foo+bar',
    );
    expect(sanitizeStreamUrl('a&amp;b')).toBe('a&b');
  });

  it('strips leading/trailing whitespace', () => {
    expect(sanitizeStreamUrl('  https://cdn1.einthusan.io/etv/foo  ')).toBe(
      'https://cdn1.einthusan.io/etv/foo',
    );
  });
});

describe('decryptEJLinks', () => {
  it('throws on invalid/empty input', () => {
    expect(() => decryptEJLinks('')).toThrow('Could not decrypt stream links');
  });

  it('throws on random garbage', () => {
    expect(() => decryptEJLinks('notvalidbase64!!!')).toThrow('Could not decrypt stream links');
  });

  it('throws on base64 that is not valid JSON after decoding', () => {
    // Valid base64 but not JSON
    const b64 = btoa('hello world');
    // Construct a fake "encrypted" string matching the slice pattern
    // encrypted.slice(0,10) + encrypted.slice(-1) + encrypted.slice(12,-1)
    // We just verify it still throws for garbage
    expect(() => decryptEJLinks('AAAAAAAAAA' + 'Z' + 'AAAAAAAAAA')).toThrow(
      'Could not decrypt stream links',
    );
  });
});

describe('parseBrowseMovies', () => {
  const lang = 'tamil';
  const minimalHtml = `
    <a id="movie_cover_link" href="/movie/watch/abc123/?lang=tamil"><img src="//cdn.example.com/poster.jpg"></a>
    <div class="info"><p>2023</p></div>
    <a class="title" href="/movie/watch/abc123/?lang=tamil"><h2>Test Movie</h2></a>
  `;

  it('parses movie id, title, lang from minimal HTML', () => {
    const results = parseBrowseMovies(minimalHtml, lang);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('abc123');
    expect(results[0].title).toBe('Test Movie');
    expect(results[0].lang).toBe('tamil');
  });

  it('sets poster with https: prefix when missing scheme', () => {
    const results = parseBrowseMovies(minimalHtml, lang);
    expect(results[0].poster).toMatch(/^https:/);
  });

  it('filters out movies with different lang', () => {
    const results = parseBrowseMovies(minimalHtml, 'hindi');
    expect(results).toHaveLength(0);
  });

  it('deduplicates movies with same id', () => {
    const doubled = minimalHtml + minimalHtml;
    const results = parseBrowseMovies(doubled, lang);
    expect(results).toHaveLength(1);
  });
});

describe('parseCarouselMovies', () => {
  const lang = 'tamil';
  const linkedHtml = `
    <a href="/movie/watch/m1/?lang=tamil"><img src="//cdn.example.com/m1.jpg"> </a><a href="/movie/watch/m1/?lang=tamil" class="title">Linked Movie</a>
  `;

  it('parses linked carousel movie', () => {
    const results = parseCarouselMovies(linkedHtml, lang);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('m1');
    expect(results[0].title).toBe('Linked Movie');
  });

  it('skips movie with different lang', () => {
    const results = parseCarouselMovies(linkedHtml, 'hindi');
    expect(results).toHaveLength(0);
  });

  it('skips unlinked cards by default (includeUnlinked=false)', () => {
    const unlinkedHtml = `
      <img src="//cdn.example.com/moviecovers/unlinked-poster.jpg"> </a><a href="" class="title">Unlinked Movie</a>
    `;
    const results = parseCarouselMovies(unlinkedHtml, lang, false);
    expect(results).toHaveLength(0);
  });

  it('includes unlinked cards when includeUnlinked=true', () => {
    const unlinkedHtml = `
      <img src="//cdn.example.com/moviecovers/unlinked-poster.jpg"> </a><a href="" class="title">Unlinked Movie</a>
    `;
    const results = parseCarouselMovies(unlinkedHtml, lang, true);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Unlinked Movie');
    expect(results[0].comingSoon).toBe(true);
  });
});

describe('parseFeaturedSections', () => {
  it('returns all 5 section keys with empty arrays for empty HTML', () => {
    const result = parseFeaturedSections('', 'tamil');
    expect(Object.keys(result)).toEqual([
      'mostWatched',
      'staffPicks',
      'recentlyAdded',
      'regionalHits',
      'comingSoon',
    ]);
    for (const key of Object.keys(result)) {
      expect(Array.isArray(result[key])).toBe(true);
    }
  });

  it('parses sections from HTML with radio inputs as separators', () => {
    const sectionMovie = (id, lang) =>
      `<a href="/movie/watch/${id}/?lang=${lang}"><img src="//cdn.example.com/${id}.jpg"> </a><a href="/movie/watch/${id}/?lang=${lang}" class="title">Movie ${id}</a>`;

    const html = [
      // mostWatched section
      `<input type="radio" id="_showcase_1" name="showcase_tab">${sectionMovie('mw1', 'tamil')}`,
      // staffPicks section
      `<input type="radio" id="_showcase_2" name="showcase_tab">${sectionMovie('sp1', 'tamil')}`,
      // recentlyAdded section
      `<input type="radio" id="_showcase_3" name="showcase_tab">${sectionMovie('ra1', 'tamil')}`,
      // regionalHits section
      `<input type="radio" id="_showcase_4" name="showcase_tab">${sectionMovie('rh1', 'tamil')}`,
      // comingSoon section
      `<input type="radio" id="_showcase_5" name="showcase_tab">${sectionMovie('cs1', 'tamil')}`,
    ].join('');

    const result = parseFeaturedSections(html, 'tamil');
    expect(result.mostWatched).toHaveLength(1);
    expect(result.mostWatched[0].id).toBe('mw1');
    expect(result.staffPicks[0].id).toBe('sp1');
    expect(result.recentlyAdded[0].id).toBe('ra1');
    expect(result.regionalHits[0].id).toBe('rh1');
  });
});
