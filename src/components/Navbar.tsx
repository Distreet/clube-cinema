import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isProximaActive = pathname === '/' || pathname === '/proxima';
  const isJaVimosActive =
    pathname === '/ja-vimos' ||
    pathname === '/historico' ||
    pathname.startsWith('/filmes/');
  const isAcervoActive = pathname === '/acervo';
  const isMembrosActive = pathname === '/membros';

  return (
    <nav role="tablist" aria-label="Seções">
      <NavLink
        to="/"
        className={isProximaActive ? 'active' : ''}
        role="tab"
        aria-selected={isProximaActive}
      >
        Próxima sessão
      </NavLink>
      <NavLink
        to="/ja-vimos"
        className={isJaVimosActive ? 'active' : ''}
        role="tab"
        aria-selected={isJaVimosActive}
      >
        Já vimos
      </NavLink>
      <NavLink
        to="/acervo"
        className={isAcervoActive ? 'active' : ''}
        role="tab"
        aria-selected={isAcervoActive}
      >
        Acervo
      </NavLink>
      <NavLink
        to="/membros"
        className={isMembrosActive ? 'active' : ''}
        role="tab"
        aria-selected={isMembrosActive}
      >
        Membros
      </NavLink>
    </nav>
  );
};
