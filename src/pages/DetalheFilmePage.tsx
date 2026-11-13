import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Movie, Member } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MovieBanner } from '../components/MovieBanner';
import { ExpandableReview } from '../components/ExpandableReview';
import { WhereToWatch } from '../components/WhereToWatch';
import { ReviewForm } from '../components/ReviewForm';
import { LoginModal } from '../components/LoginModal';
import { calcGroupAverage, formatRating } from '../utils/format';

interface DetalheFilmePageProps {
  movies: Movie[];
  members: Member[];
  onSaveReview: (movieId: string, rating: number, reviewText: string) => void;
}

export const DetalheFilmePage: React.FC<DetalheFilmePageProps> = ({
  movies,
  members,
  onSaveReview,
}) => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  // Identifica avaliação do usuário atual se houver
  const currentUserReview = profile
    ? movie.reviews.find((r) => r.memberName.toLowerCase() === profile.displayName.toLowerCase())
    : null;

  // Monta a lista completa com todos os membros do clube
  // Membros que não avaliaram aparecem como "ainda não avaliou"
  const memberReviewsList = members.map((mem) => {
    const existing = movie.reviews.find(
      (r) => r.memberName.toLowerCase() === mem.name.toLowerCase()
    );
    if (existing) return existing;
    return {
      id: `pending-${mem.id}`,
      memberName: mem.name,
      rating: null,
      reviewText: null,
      letterboxdUrl: null,
    };
  });

  const handleSave = (rating: number, reviewText: string) => {
    onSaveReview(movie.id, rating, reviewText);
    setIsFormOpen(false);
  };

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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Notas e críticas</h3>
            {!isFormOpen && (
              <button
                type="button"
                className="btn"
                style={{ padding: '6px 14px', fontSize: 13 }}
                onClick={() => {
                  if (!profile) {
                    setIsLoginModalOpen(true);
                  } else {
                    setIsFormOpen(true);
                  }
                }}
              >
                {currentUserReview ? 'Editar minha avaliação' : 'Avaliar este filme'}
              </button>
            )}
          </div>

          {/* Formulário de avaliação do usuário logado */}
          {isFormOpen && (
            <div style={{ marginBottom: 18 }}>
              <ReviewForm
                initialReview={currentUserReview}
                onSaveReview={handleSave}
                onCancel={() => setIsFormOpen(false)}
                onRequestLogin={() => setIsLoginModalOpen(true)}
              />
            </div>
          )}

          {/* Lista com todos os membros */}
          <div>
            {memberReviewsList.map((rev) => (
              <ExpandableReview key={rev.id} review={rev} />
            ))}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </section>
  );
};
