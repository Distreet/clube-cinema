import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const pathname = location.pathname;

  const isProximaActive = pathname === '/' || pathname === '/proxima';
  const isJaVimosActive =
    pathname === '/ja-vimos' ||
    pathname === '/historico' ||
    pathname.startsWith('/filmes/');
  const isAcervoActive = pathname === '/acervo';
  const isMembrosActive = pathname === '/membros';
  const isAdminActive = pathname.startsWith('/admin');

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
      {isAdmin && (
        <NavLink
          to="/admin"
          className={isAdminActive ? 'active' : ''}
          role="tab"
          aria-selected={isAdminActive}
        >
          Admin
        </NavLink>
      )}
    </nav>
  );
};
