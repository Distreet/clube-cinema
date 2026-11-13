import React from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import { calcGroupAverage, formatRating } from '../utils/format';

interface PosterCardProps {
  movie: Movie;
}

export const PosterCard: React.FC<PosterCardProps> = ({ movie }) => {
  const avg = calcGroupAverage(movie.reviews);
  const formattedAvg = avg !== null ? formatRating(avg) : '-';

  const style: React.CSSProperties = {
    background: movie.posterUrl
      ? `url(${movie.posterUrl}) center/cover no-repeat`
      : movie.bgGradient,
  };

  return (
    <Link className="card" to={`/filmes/${movie.id}`} aria-label={`${movie.title}, nota ${formattedAvg}`}>
      <div className="poster" style={style}>
        {movie.title}
      </div>
      <div className="info">
        <b>{movie.title}</b>
        <span className="mut">{movie.sessionMonth}</span>{' '}
        <span className="nota">{formattedAvg}</span>
      </div>
    </Link>
  );
};
