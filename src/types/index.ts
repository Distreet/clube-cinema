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
  bgGradient: string;
  posterGradient?: string;
  posterUrl?: string;
  backdropUrl?: string;
  letterboxdSlug: string;
  reviews: Review[];
}

export interface CycleMark {
  memberName: string;
  watched: boolean;
}

export interface ActiveCycle {
  id: string;
  movie: {
    title: string;
    director: string;
    year: number;
    runtime: string;
    genre: string;
    overview: string;
    suggestedBy: string;
    tagText?: string;
  };
  deadlineDay: number;
  deadlineMonth: string;
  discussionNote: string;
  crew: CycleMark[];
}

export interface Suggestion {
  id: string;
  title: string;
  suggestedBy: string;
  votes: number;
  hasVoted?: boolean;
}
