import React, { useState } from 'react';
import type { Review } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatStars, formatRating } from '../utils/format';

interface ReviewFormProps {
  initialReview?: Review | null;
  onSaveReview: (rating: number, reviewText: string) => void;
  onCancel?: () => void;
  onRequestLogin?: () => void;
}

const RATING_OPTIONS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

export const ReviewForm: React.FC<ReviewFormProps> = ({
  initialReview,
  onSaveReview,
  onCancel,
  onRequestLogin,
}) => {
  const { profile } = useAuth();
  const [rating, setRating] = useState<number>(initialReview?.rating || 4.0);
  const [reviewText, setReviewText] = useState<string>(initialReview?.reviewText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!profile) {
    return (
      <div
        style={{
          marginTop: 18,
          padding: 16,
          background: 'var(--bg2)',
          border: '1px dashed var(--line)',
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <p className="mut" style={{ fontSize: 14, margin: '0 0 10px' }}>
          Faça login para registrar ou editar sua avaliação deste filme.
        </p>
        <button
          type="button"
          className="btn"
          onClick={onRequestLogin}
          style={{ padding: '6px 16px', fontSize: 13 }}
        >
          Entrar para avaliar
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 0.5 || rating > 5.0) {
      setErrorMessage('Escolha uma nota válida de 0,5 a 5,0 estrelas.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    onSaveReview(rating, reviewText.trim());
    setIsSubmitting(false);
  };

  const groupEquivalent = rating * 2;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: 18,
        padding: '16px 18px',
        background: 'var(--bg2)',
        border: '1px solid var(--line)',
        borderRadius: 12,
      }}
      aria-label="Avaliar filme"
    >
      <h4 style={{ fontSize: 16, marginBottom: 12 }}>
        {initialReview?.rating !== null && initialReview?.rating !== undefined
          ? 'Editar sua avaliação'
          : 'Sua avaliação do filme'}
      </h4>

      {/* Seletor de Estrelas */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 24, color: 'var(--amber)', letterSpacing: 2 }}>
            {formatStars(rating)}
          </span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            {formatRating(rating)} de 5 estrelas
          </span>
          <span className="mut" style={{ fontSize: 13 }}>
            (equivale a <strong>{formatRating(groupEquivalent)}</strong> de 10 na média)
          </span>
        </div>

        {/* Pílulas de escolha rápida de meia em meia estrela */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {RATING_OPTIONS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setRating(val)}
              className="chip"
              data-done={rating === val}
              style={{
                cursor: 'pointer',
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 6,
              }}
              aria-label={`${val} estrelas`}
            >
              {val.toFixed(1).replace('.', ',')}
            </button>
          ))}
        </div>
      </div>

      {/* Campo de texto da crítica (opcional) */}
      <div style={{ marginBottom: 14 }}>
        <label
          htmlFor="reviewTextInput"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--mut)',
            marginBottom: 6,
          }}
        >
          Sua crítica ou comentário (opcional)
        </label>
        <textarea
          id="reviewTextInput"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="O que você achou? (avise se tiver spoilers)..."
          maxLength={5000}
          rows={3}
          style={{
            width: '100%',
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            color: 'var(--tx)',
            padding: 10,
            font: 'inherit',
            fontSize: 14,
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 11, color: 'var(--mut)', marginTop: 2 }}>
          {reviewText.length}/5000 caracteres
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            marginBottom: 12,
            padding: 8,
            borderRadius: 6,
            background: '#c0392b22',
            border: '1px solid #c0392b',
            color: 'var(--rose)',
            fontSize: 13,
          }}
        >
          {errorMessage}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar avaliação'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: '1px solid var(--line)',
              color: 'var(--mut)',
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
