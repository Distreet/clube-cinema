import React from 'react';
import type { Movie } from '../types';
import { AwardCard } from '../components/AwardCard';
import { PosterCard } from '../components/PosterCard';

interface JaVimosPageProps {
  movies: Movie[];
}

export const JaVimosPage: React.FC<JaVimosPageProps> = ({ movies }) => {
  return (
    <section id="historico" aria-label="Histórico de filmes já assistidos">
      <AwardCard movies={movies} />

      <div className="grid">
        {movies.map((movie) => (
          <PosterCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};
