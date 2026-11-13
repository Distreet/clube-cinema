import React from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Movie } from '../types';
import { MovieBanner } from '../components/MovieBanner';
import { ExpandableReview } from '../components/ExpandableReview';
import { WhereToWatch } from '../components/WhereToWatch';
import { calcGroupAverage, formatRating } from '../utils/format';

interface DetalheFilmePageProps {
  movies: Movie[];
}

export const DetalheFilmePage: React.FC<DetalheFilmePageProps> = ({ movies }) => {
  const { id } = useParams<{ id: string }>();

  const movie = movies.find(
    (m) => m.id === id || String(m.tmdbId) === id
  );

  if (!movie) {
    return (
      <section id="detalhe">
        <Link className="back" to="/ja-vimos">
          ← Voltar para Já vimos
        </Link>
        <h2>Filme não encontrado</h2>
        <p className="lead">O filme solicitado não foi encontrado no histórico do clube.</p>
      </section>
    );
  }

  const groupAverage = calcGroupAverage(movie.reviews);
  const formattedGroupAvg =
    groupAverage !== null ? formatRating(groupAverage) : '-';

  return (
    <section id="detalhe" aria-label={`Detalhes de ${movie.title}`}>
      <Link className="back" to="/ja-vimos">
        ← Voltar para Já vimos
      </Link>

      <div className="det">
        {/* Coluna esquerda */}
        <aside>
          <MovieBanner
            title={movie.title}
            bgGradient={movie.bgGradient}
            backdropUrl={movie.backdropUrl}
          />

          <h2>{movie.title}</h2>
          <div className="mut">
            {movie.originalTitle}, {movie.year}
          </div>

          <dl className="facts">
            <dt>Direção</dt>
            <dd>{movie.director}</dd>
            <dt>Elenco</dt>
            <dd>{movie.castMain}</dd>
            <dt>Gênero</dt>
            <dd>{movie.genres}</dd>
            <dt>Sessão do clube</dt>
            <dd>{movie.sessionMonth}</dd>
          </dl>

          <p>{movie.overview}</p>

          {/* Onde assistir no Brasil (Dados TMDB / JustWatch) */}
          <WhereToWatch data={movie.whereToWatch} />
        </aside>

        {/* Coluna direita */}
        <div>
          <div className="avg">
            <b>{formattedGroupAvg}</b>
            <span className="mut">média do grupo, de 10</span>
          </div>

          <h3>Notas e críticas</h3>

          <div style={{ marginTop: 14 }}>
            {movie.reviews.map((rev) => (
              <ExpandableReview key={rev.id} review={rev} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
