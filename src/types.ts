export type Language = 'tamil' | 'hindi' | 'malayalam';

export interface Movie {
  id: string;
  title: string;
  lang: Language;
  poster: string;
  year?: string | null;
  uhd?: boolean;
}

export interface MovieDetails extends Movie {
  description?: string;
  hlsUrl?: string;
  mp4Url?: string;
}

export interface HomeData {
  browse: Movie[];
  featured: {
    mostWatched: Movie[];
    staffPicks: Movie[];
    recentlyAdded: Movie[];
    regionalHits: Movie[];
    comingSoon: Movie[];
  };
}

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'tamil', label: 'Tamil' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'malayalam', label: 'Malayalam' },
];

export const LANGUAGE_LABELS: Record<Language, string> = {
  tamil: 'Tamil',
  hindi: 'Hindi',
  malayalam: 'Malayalam',
};
