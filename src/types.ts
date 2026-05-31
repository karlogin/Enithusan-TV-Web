export type Language = 'tamil' | 'hindi' | 'malayalam';

export interface Movie {
  id: string;
  title: string;
  lang: Language;
  poster: string;
  year?: string | null;
  uhd?: boolean;
  comingSoon?: boolean;
}

export interface MovieExtras {
  userRating?: string | null;
  genre?: string | null;
  director?: string | null;
  musicDirector?: string | null;
  cast?: string | null;
  imdbSearchUrl?: string;
}

export interface MovieDetails extends Movie, MovieExtras {
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

export interface ContinueWatchingItem extends Movie {
  progress: number;
  duration: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserLibrary {
  myList: Movie[];
  continueWatching: ContinueWatchingItem[];
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

export const HOME_SECTIONS: { key: keyof HomeData['featured'] | 'browse'; title: string; subtitle?: string }[] = [
  { key: 'mostWatched', title: 'Popular on Einthusan', subtitle: 'What everyone is watching right now' },
  { key: 'recentlyAdded', title: 'New Releases', subtitle: 'Fresh titles added this week' },
  { key: 'staffPicks', title: 'Critics\' Choice', subtitle: 'Hand-picked by our team' },
  { key: 'regionalHits', title: 'Top in Your Region', subtitle: 'Trending near you' },
  { key: 'browse', title: 'Explore All', subtitle: 'Browse the full catalog' },
  { key: 'comingSoon', title: 'Coming Soon', subtitle: 'Upcoming premieres' },
];
