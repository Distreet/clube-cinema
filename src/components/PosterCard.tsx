import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import { calcGroupAverage, formatRating } from '../utils/format';

interface PosterCardProps {
  movie: Movie;
}

export const PosterCard: React.FC<PosterCardProps> = ({ movie }) => {
  const avg = calcGroupAverage(movie.reviews);
  const formattedAvg = avg !== null ? formatRating(avg) : '-';
  const [imgFailed, setImgFailed] = useState(false);

  const hasImage = Boolean(movie.posterUrl && !imgFailed);

  const posterStyle: React.CSSProperties = {
    background: hasImage
      ? `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%), url(${movie.posterUrl}) center/cover no-repeat`
      : movie.bgGradient,
  };

  return (
    <Link
      className="card"
      to={`/filmes/${movie.id}`}
      aria-label={`${movie.title}, nota ${formattedAvg}`}
    >
      <div className="poster" style={posterStyle}>
        {/* Imagem invisível para detectar falha de carregamento da URL */}
        {movie.posterUrl && !imgFailed && (
          <img
            src={movie.posterUrl}
            alt=""
            style={{ display: 'none' }}
            onError={() => setImgFailed(true)}
          />
        )}
        <span>{movie.title}</span>
      </div>
      <div className="info">
        <b>{movie.title}</b>
        <span className="mut">{movie.sessionMonth}</span>{' '}
        <span className="nota">{formattedAvg}</span>
      </div>
    </Link>
  );
};
