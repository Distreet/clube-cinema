import React, { useState, useEffect, useRef } from 'react';
import { searchMovies, getTMDBImageUrl } from '../services/tmdb';
import type { TMDBMovieSearchResult } from '../types';

interface MovieSearchAutocompleteProps {
  onSelectMovie: (movie: TMDBMovieSearchResult) => void;
  existingSuggestionsTmdbIds: number[];
  seenMoviesTmdbIds: number[];
  disabled?: boolean;
}

export const MovieSearchAutocomplete: React.FC<MovieSearchAutocompleteProps> = ({
  onSelectMovie,
  existingSuggestionsTmdbIds,
  seenMoviesTmdbIds,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovieSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce de busca (350ms)
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const timer = setTimeout(async () => {
      try {
        const data = await searchMovies(query);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (err: any) {
        setErrorMessage('Erro ao buscar filmes no TMDB.');
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (movie: TMDBMovieSearchResult) => {
    // Validação de duplicatas
    if (existingSuggestionsTmdbIds.includes(movie.id)) {
      setErrorMessage(`"${movie.title}" já foi indicado e está no acervo!`);
      return;
    }
    if (seenMoviesTmdbIds.includes(movie.id)) {
      setErrorMessage(`"${movie.title}" já foi assistido pelo clube!`);
      return;
    }

    onSelectMovie(movie);
    setQuery('');
    setIsOpen(false);
    setResults([]);
    setErrorMessage(null);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setErrorMessage(null);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Buscar filme no TMDB para indicar..."
          aria-label="Buscar filme no TMDB para indicar"
          disabled={disabled}
          style={{ width: '100%', paddingRight: 36 }}
        />
        {isLoading && (
          <span
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--mut)',
              fontSize: 12,
            }}
          >
            ...
          </span>
        )}
      </div>

      {errorMessage && (
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'var(--rose)',
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Dropdown de sugestões do TMDB */}
      {isOpen && results.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 50,
            margin: 0,
            padding: 4,
            listStyle: 'none',
            boxShadow: '0 12px 28px #00000088',
          }}
        >
          {results.map((m) => {
            const isAlreadySuggested = existingSuggestionsTmdbIds.includes(m.id);
            const isAlreadySeen = seenMoviesTmdbIds.includes(m.id);
            const isDuplicate = isAlreadySuggested || isAlreadySeen;
            const poster = getTMDBImageUrl(m.poster_path, 'w92');

            return (
              <li
                key={m.id}
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 10px',
                  borderRadius: 6,
                  cursor: isDuplicate ? 'not-allowed' : 'pointer',
                  opacity: isDuplicate ? 0.6 : 1,
                  background: 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isDuplicate) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--line)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {poster ? (
                  <img
                    src={poster}
                    alt=""
                    style={{
                      width: 32,
                      height: 48,
                      borderRadius: 4,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 48,
                      borderRadius: 4,
                      background: 'var(--line)',
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 10,
                      color: 'var(--mut)',
                    }}
                  >
                    2:3
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {m.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mut)' }}>
                    {m.original_title !== m.title ? `${m.original_title} • ` : ''}
                    {m.year || 'Ano n/d'}
                  </div>
                </div>

                {isDuplicate && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--rose)',
                      background: 'var(--bg)',
                      padding: '2px 8px',
                      borderRadius: 99,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isAlreadySeen ? 'Já vimos' : 'Já no acervo'}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
