import React, { useEffect } from 'react';
import type { Suggestion } from '../types';
import { MovieBanner } from './MovieBanner';
import { WhereToWatch } from './WhereToWatch';
import { VoteButton } from './VoteButton';

interface SuggestionDetailModalProps {
  suggestion: Suggestion | null;
  onClose: () => void;
  onToggleVote: (id: string) => void;
}

export const SuggestionDetailModal: React.FC<SuggestionDetailModalProps> = ({
  suggestion,
  onClose,
  onToggleVote,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!suggestion) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggestion-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: '24px 24px 32px',
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 48px #000000cc',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'grid',
            placeItems: 'center',
            color: 'var(--mut)',
            fontSize: 16,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Banner 16:9 */}
        <MovieBanner
          title={suggestion.title}
          bgGradient="linear-gradient(160deg, #2a0f17, #3a1722)"
          backdropUrl={suggestion.backdropUrl}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <div>
            <h2 id="suggestion-modal-title" style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}>
              {suggestion.title}
            </h2>
            <div className="mut" style={{ fontSize: 14, marginTop: 4 }}>
              {suggestion.originalTitle && suggestion.originalTitle !== suggestion.title
                ? `${suggestion.originalTitle}, `
                : ''}
              {suggestion.year} • Indicado por <strong>{suggestion.suggestedBy}</strong>
            </div>
          </div>

          <VoteButton
            votes={suggestion.votes}
            hasVoted={!!suggestion.hasVoted}
            onToggle={() => onToggleVote(suggestion.id)}
            title={suggestion.title}
          />
        </div>

        {/* Ficha técnica */}
        <dl className="facts" style={{ margin: '16px 0' }}>
          {suggestion.director && (
            <>
              <dt>Direção</dt>
              <dd>{suggestion.director}</dd>
            </>
          )}
          {suggestion.castMain && (
            <>
              <dt>Elenco</dt>
              <dd>{suggestion.castMain}</dd>
            </>
          )}
          {suggestion.genres && (
            <>
              <dt>Gênero</dt>
              <dd>{suggestion.genres}</dd>
            </>
          )}
          {suggestion.formattedRuntime && (
            <>
              <dt>Duração</dt>
              <dd>{suggestion.formattedRuntime}</dd>
            </>
          )}
        </dl>

        {/* Sinopse */}
        {suggestion.overview && (
          <div style={{ margin: '14px 0' }}>
            <h4 style={{ fontSize: 15, marginBottom: 6 }}>Sinopse</h4>
            <p style={{ margin: 0, color: 'var(--tx)', lineHeight: 1.6 }}>{suggestion.overview}</p>
          </div>
        )}

        {/* Trailer */}
        {suggestion.trailerEmbedUrl ? (
          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 15, marginBottom: 8 }}>Trailer oficial</h4>
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                borderRadius: 8,
                overflow: 'hidden',
                background: '#000',
              }}
            >
              <iframe
                src={suggestion.trailerEmbedUrl}
                title={`Trailer de ${suggestion.title}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : suggestion.trailerUrl ? (
          <div style={{ marginTop: 14 }}>
            <a
              href={suggestion.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                padding: '8px 14px',
                textDecoration: 'none',
              }}
            >
              ▶ Assistir trailer no YouTube
            </a>
          </div>
        ) : null}

        {/* Onde assistir no Brasil */}
        <WhereToWatch data={suggestion.whereToWatch} />
      </div>
    </div>
  );
};
