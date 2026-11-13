import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Theme = 'auto' | 'dark' | 'light';

export const Header: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme-preference') as Theme | null;
    return saved || 'auto';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
      localStorage.removeItem('theme-preference');
    } else {
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme-preference', theme);
    }
  }, [theme]);

  return (
    <header>
      <div className="brand-group">
        <Link to="/" className="brand">
          Clube do Livro
        </Link>
        <small>nome provisório</small>
      </div>

      <div className="theme-switch" role="group" aria-label="Tema visual">
        <button
          type="button"
          data-active={theme === 'auto'}
          onClick={() => setTheme('auto')}
          title="Seguir tema do sistema operacional"
        >
          Auto
        </button>
        <button
          type="button"
          data-active={theme === 'dark'}
          onClick={() => setTheme('dark')}
          title="Ativar tema escuro"
        >
          Escuro
        </button>
        <button
          type="button"
          data-active={theme === 'light'}
          onClick={() => setTheme('light')}
          title="Ativar tema claro"
        >
          Claro
        </button>
      </div>
    </header>
  );
};
