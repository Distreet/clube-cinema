export interface Member {
  id: string;
  name: string;
  letterboxdUsername: string;
  color: string;
}

export interface Review {
  id: string;
  memberName: string;
  rating: number | null; // null if yet to evaluate (0.5 to 5.0)
  reviewText: string | null;
  letterboxdUrl: string | null;
}

export interface WatchProvider {
  id: number;
  name: string;
  logo: string | null;
}

export interface WhereToWatchData {
  link: string | null;
  streaming: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  note?: string;
}

export interface Movie {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle: string;
  year: number;
  director: string;
  genres: string;
  castMain: string;
  sessionMonth: string;
  overview: string;
  runtime?: number | null;
  formattedRuntime?: string;
  bgGradient: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  posterUrl?: string;
  backdropUrl?: string;
  letterboxdSlug: string;
  whereToWatch?: WhereToWatchData;
  trailerUrl?: string | null;
  trailerEmbedUrl?: string | null;
  reviews: Review[];
}

export interface CycleMark {
  memberName: string;
  watched: boolean;
}

export interface ActiveCycle {
  id: string;
  tmdbId: number;
  movie: {
    title: string;
    originalTitle?: string;
    director: string;
    year: number;
    runtime: string;
    genre: string;
    overview: string;
    suggestedBy: string;
    tagText?: string;
    posterUrl?: string;
    backdropUrl?: string;
    whereToWatch?: WhereToWatchData;
  };
  deadlineDay: number;
  deadlineMonth: string;
  discussionNote: string;
  crew: CycleMark[];
}

export interface Suggestion {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle?: string;
  year?: number;
  suggestedBy: string;
  suggestedByUserId?: string;
  status: 'pending' | 'chosen' | 'seen' | 'archived';
  votes: number;
  hasVoted?: boolean;
  posterUrl?: string;
  backdropUrl?: string;
  overview?: string;
  director?: string;
  castMain?: string;
  genres?: string;
  runtime?: number | null;
  formattedRuntime?: string;
  trailerUrl?: string | null;
  trailerEmbedUrl?: string | null;
  whereToWatch?: WhereToWatchData;
  createdAt?: string;
}

export interface TMDBMovieSearchResult {
  id: number;
  title: string;
  original_title: string;
  year: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
}
