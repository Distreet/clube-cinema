import React, { useState } from 'react';
import type { Suggestion } from '../types';
import { VoteButton } from '../components/VoteButton';
import { getPaletteColor } from '../utils/format';

interface AcervoPageProps {
  suggestions: Suggestion[];
  onAddSuggestion: (title: string, suggestedBy: string) => void;
  onToggleVote: (id: string) => void;
}

export const AcervoPage: React.FC<AcervoPageProps> = ({
  suggestions,
  onAddSuggestion,
  onToggleVote,
}) => {
  const [title, setTitle] = useState('');
  const [who, setWho] = useState('');
  const [filter, setFilter] = useState<'pending' | 'seen'>('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !who.trim()) return;
    onAddSuggestion(title.trim(), who.trim());
    setTitle('');
    setWho('');
  };

  // Sort by votes descending
  const sorted = [...suggestions].sort((a, b) => b.votes - a.votes);

  return (
    <section id="acervo" aria-label="Acervo de sugestões">
      <p className="lead">
        Tudo que a gente quer ver um dia. Vote nos que você toparia ver agora: o mais votado vira candidato à próxima sessão.
      </p>

      {/* Formulário de adicionar sugestão */}
      <form className="add" onSubmit={handleSubmit} aria-label="Indicar novo filme">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do filme"
          aria-label="Título do filme"
          required
        />
        <input
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="Quem indicou"
          aria-label="Quem indicou"
          required
        />
        <button className="btn" type="submit">
          Adicionar ao acervo
        </button>
      </form>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className="chip"
          data-done={filter === 'pending'}
          onClick={() => setFilter('pending')}
          style={{ cursor: 'pointer' }}
        >
          Ainda não vimos
        </button>
        <button
          type="button"
          className="chip"
          data-done={filter === 'seen'}
          onClick={() => setFilter('seen')}
          style={{ cursor: 'pointer' }}
        >
          Já vimos
        </button>
      </div>

      {/* Lista de sugestões */}
      <div className="list">
        {sorted.map((item, index) => {
          const pal = getPaletteColor(index + 2);
          const posterGradient = `linear-gradient(160deg, ${pal[0]}, ${pal[1]})`;

          return (
            <article key={item.id} className="row">
              <div
                className="poster"
                style={{
                  background: posterGradient,
                  padding: 4,
                  fontSize: 8,
                  boxShadow: 'none',
                  aspectRatio: '2/3',
                  width: 48,
                }}
              >
                {item.title}
              </div>

              <div>
                <b>{item.title}</b>
                <div className="mut" style={{ fontSize: 14 }}>
                  indicado por {item.suggestedBy}
                </div>
              </div>

              <VoteButton
                votes={item.votes}
                hasVoted={!!item.hasVoted}
                onToggle={() => onToggleVote(item.id)}
                title={item.title}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
};
