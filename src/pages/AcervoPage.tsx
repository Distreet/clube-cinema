import React, { useState } from 'react';
import type { Suggestion, TMDBMovieSearchResult } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MovieSearchAutocomplete } from '../components/MovieSearchAutocomplete';
import { VoteButton } from '../components/VoteButton';
import { SuggestionDetailModal } from '../components/SuggestionDetailModal';
import { getTMDBImageUrl, getMovieDetails, formatRuntime } from '../services/tmdb';

interface AcervoPageProps {
  suggestions: Suggestion[];
  seenTmdbIds?: number[];
  onAddSuggestion: (suggestion: Suggestion) => void;
  onToggleVote: (id: string) => void;
}

export const AcervoPage: React.FC<AcervoPageProps> = ({
  suggestions,
  seenTmdbIds = [1038263, 787699, 38, 1422, 238],
  onAddSuggestion,
  onToggleVote,
}) => {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'pending' | 'seen'>('pending');
  const [selectedMoviePreview, setSelectedMoviePreview] = useState<TMDBMovieSearchResult | null>(null);
  const [selectedSuggestionForDetail, setSelectedSuggestionForDetail] = useState<Suggestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const existingSuggestionsTmdbIds = suggestions.map((s) => s.tmdbId);

  const handleSelectFromTMDB = (movie: TMDBMovieSearchResult) => {
    setSelectedMoviePreview(movie);
    setStatusMessage(null);
  };

  const handleConfirmSuggestion = async () => {
    if (!selectedMoviePreview) return;
    if (!profile) {
      setStatusMessage('Você precisa estar logado para indicar um filme ao acervo.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // Busca detalhes ricos do filme no TMDB (direção, elenco, trailer, onde assistir)
      const details = await getMovieDetails(selectedMoviePreview.id);

      const newSug: Suggestion = {
        id: `sug-${Date.now()}`,
        tmdbId: selectedMoviePreview.id,
        title: selectedMoviePreview.title,
        originalTitle: selectedMoviePreview.original_title,
        year: selectedMoviePreview.year || new Date().getFullYear(),
        suggestedBy: profile.displayName,
        suggestedByUserId: profile.id,
        status: 'pending',
        votes: 1, // Quem indica já começa votando no seu próprio filme
        hasVoted: true,
        posterUrl: getTMDBImageUrl(selectedMoviePreview.poster_path, 'w500'),
        backdropUrl: getTMDBImageUrl(selectedMoviePreview.backdrop_path, 'w1280'),
        overview: details?.movie?.overview || selectedMoviePreview.overview || 'Sem sinopse informada.',
        director: details?.movie?.director || 'Não informado',
        castMain: Array.isArray(details?.movie?.cast_main)
          ? details.movie.cast_main.join(', ')
          : details?.movie?.cast_main || '',
        genres: Array.isArray(details?.movie?.genres)
          ? details.movie.genres.join(', ')
          : details?.movie?.genres || '',
        runtime: details?.movie?.runtime || null,
        formattedRuntime: formatRuntime(details?.movie?.runtime),
        trailerUrl: details?.trailerUrl,
        trailerEmbedUrl: details?.trailerEmbedUrl,
        whereToWatch: details?.whereToWatch,
        createdAt: new Date().toISOString(),
      };

      onAddSuggestion(newSug);
      setSelectedMoviePreview(null);
      setStatusMessage(`"${newSug.title}" foi adicionado com sucesso ao acervo!`);
    } catch (err: any) {
      setStatusMessage('Erro ao carregar detalhes completos do filme.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtra por status e ordena por votos decrescentes
  const filteredList = suggestions
    .filter((item) => (filter === 'pending' ? item.status !== 'seen' : item.status === 'seen'))
    .sort((a, b) => b.votes - a.votes);

  return (
    <section id="acervo" aria-label="Acervo de sugestões">
      <p className="lead">
        Tudo que a gente quer ver um dia. Vote nos que você toparia ver agora: o mais votado vira candidato à próxima sessão.
      </p>

      {/* Formulário de Busca e Indicação */}
      <div style={{ marginBottom: 28, background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 18 }}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Indicar novo filme</h3>
        <p className="mut" style={{ fontSize: 14, margin: '0 0 14px' }}>
          Procure o filme pelo título no TMDB para importar capa, sinopse, elenco e onde assistir.
        </p>

        <MovieSearchAutocomplete
          onSelectMovie={handleSelectFromTMDB}
          existingSuggestionsTmdbIds={existingSuggestionsTmdbIds}
          seenMoviesTmdbIds={seenTmdbIds}
        />

        {/* Pré-visualização do filme selecionado antes de confirmar */}
        {selectedMoviePreview && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              background: 'var(--bg)',
              border: '1px solid var(--amber)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            {selectedMoviePreview.poster_path ? (
              <img
                src={getTMDBImageUrl(selectedMoviePreview.poster_path, 'w92')}
                alt=""
                style={{ width: 44, height: 66, borderRadius: 4, objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 44,
                  height: 66,
                  borderRadius: 4,
                  background: 'var(--line)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 10,
                  color: 'var(--mut)',
                }}
              >
                2:3
              </div>
            )}

            <div style={{ flex: 1, minWidth: 200 }}>
              <strong style={{ fontSize: 16 }}>{selectedMoviePreview.title}</strong>
              <div className="mut" style={{ fontSize: 13 }}>
                {selectedMoviePreview.year} • {selectedMoviePreview.original_title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 2 }}>
                Será indicado por: {profile?.displayName || 'Você (faça login para confirmar)'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn"
                onClick={handleConfirmSuggestion}
                disabled={isSubmitting}
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                {isSubmitting ? 'Importando do TMDB...' : 'Confirmar indicação'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMoviePreview(null)}
                style={{
                  background: 'none',
                  border: '1px solid var(--line)',
                  color: 'var(--mut)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {statusMessage && (
          <div
            style={{
              marginTop: 10,
              fontSize: 14,
              fontWeight: 600,
              color: statusMessage.includes('Erro') ? 'var(--rose)' : 'var(--amber)',
            }}
          >
            {statusMessage}
          </div>
        )}
      </div>

      {/* Filtros: Ainda não vimos / Já vimos */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className="chip"
          data-done={filter === 'pending'}
          onClick={() => setFilter('pending')}
          style={{ cursor: 'pointer' }}
          aria-pressed={filter === 'pending'}
        >
          Ainda não vimos ({suggestions.filter((s) => s.status !== 'seen').length})
        </button>
        <button
          type="button"
          className="chip"
          data-done={filter === 'seen'}
          onClick={() => setFilter('seen')}
          style={{ cursor: 'pointer' }}
          aria-pressed={filter === 'seen'}
        >
          Já vimos ({suggestions.filter((s) => s.status === 'seen').length})
        </button>
      </div>

      {/* Lista de sugestões */}
      <div className="list">
        {filteredList.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--mut)', background: 'var(--bg2)', borderRadius: 12 }}>
            Nenhum filme nesta categoria no momento.
          </div>
        ) : (
          filteredList.map((item) => (
            <article
              key={item.id}
              className="row"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedSuggestionForDetail(item)}
            >
              {/* Pôster miniatura */}
              {item.posterUrl ? (
                <img
                  src={item.posterUrl}
                  alt=""
                  style={{
                    width: 48,
                    aspectRatio: '2/3',
                    borderRadius: 4,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  className="poster"
                  style={{
                    background: 'var(--line)',
                    padding: 4,
                    fontSize: 8,
                    boxShadow: 'none',
                    aspectRatio: '2/3',
                    width: 48,
                  }}
                >
                  {item.title}
                </div>
              )}

              {/* Informações */}
              <div style={{ minWidth: 0 }}>
                <b style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.title}
                </b>
                <div className="mut" style={{ fontSize: 14 }}>
                  {item.year ? `${item.year} • ` : ''}indicado por {item.suggestedBy}
                </div>
              </div>

              {/* Botão de voto (stop propagation para não abrir o modal se clicar no botão) */}
              <div onClick={(e) => e.stopPropagation()}>
                <VoteButton
                  votes={item.votes}
                  hasVoted={!!item.hasVoted}
                  onToggle={() => onToggleVote(item.id)}
                  title={item.title}
                />
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal de Detalhes da Sugestão (Banner, Sinopse, Elenco, Trailer, Onde Assistir) */}
      <SuggestionDetailModal
        suggestion={selectedSuggestionForDetail}
        onClose={() => setSelectedSuggestionForDetail(null)}
        onToggleVote={onToggleVote}
      />
    </section>
  );
};
