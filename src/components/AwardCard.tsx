import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import { calcGroupAverage, formatRating } from '../utils/format';

interface AwardCardProps {
  movies: Movie[];
}

export const AwardCard: React.FC<AwardCardProps> = ({ movies }) => {
  // Extract all distinct years from the movies
  const years = Array.from(new Set(movies.map((m) => m.year))).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number>(years[0] ?? 2026);

  // Filter movies with reviews by year and find the top rated
  const moviesInYear = movies.filter((m) => m.year === selectedYear);
  const scoredMovies = moviesInYear
    .map((m) => ({ movie: m, avg: calcGroupAverage(m.reviews) }))
    .filter((item): item is { movie: Movie; avg: number } => item.avg !== null);

  scoredMovies.sort((a, b) => b.avg - a.avg);
  const top = scoredMovies[0];

  if (!top) return null;

  const posterStyle: React.CSSProperties = {
    background: top.movie.posterUrl
      ? `url(${top.movie.posterUrl}) center/cover no-repeat`
      : top.movie.bgGradient,
  };

  return (
    <div className="award">
      <Link
        to={`/filmes/${top.movie.id}`}
        style={{
          display: 'flex',
          gap: 18,
          alignItems: 'center',
          flex: 1,
          textDecoration: 'none',
          color: 'inherit',
          minWidth: 0,
        }}
        aria-label={`Destaque de ${selectedYear}: ${top.movie.title}, com média ${formatRating(top.avg)} de 10`}
      >
        <div className="poster" style={posterStyle} />
        <div style={{ minWidth: 0 }}>
          <span className="tag" style={{ background: 'var(--line)' }}>
            Destaque de {selectedYear}
          </span>
          <br />
          <b style={{ display: 'inline-block', marginTop: 4 }}>{top.movie.title}</b>
          <p>
            Maior nota média do grupo no ano: <strong>{formatRating(top.avg)}</strong> de 10.
          </p>
        </div>
      </Link>

      {years.length > 1 && (
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--mut)' }}>
          Ano:
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              background: 'var(--bg)',
              color: 'var(--tx)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: '4px 8px',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};
