import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { ProfileModal } from './ProfileModal';

type Theme = 'auto' | 'dark' | 'light';

interface HeaderProps {
  clubName?: string;
}

export const Header: React.FC<HeaderProps> = ({ clubName = 'Clube do Livro' }) => {
  const { profile, isAdmin, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
    <>
      <header>
        <div className="brand-group">
          <Link to="/" className="brand">
            {clubName}
          </Link>
          <small>clube de cinema</small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Sessão do Usuário */}
          {profile ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: 99,
                padding: '4px 10px 4px 6px',
                fontSize: 13,
              }}
            >
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                title="Editar meu perfil"
                style={{
                  background: 'none',
                  border: 0,
                  color: 'inherit',
                  font: 'inherit',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--amber)',
                    color: 'var(--amber-ink)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 12,
                    overflow: 'hidden',
                  }}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    profile.displayName.charAt(0)
                  )}
                </span>
                <span>{profile.displayName}</span>
              </button>

              {isAdmin && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'var(--line)',
                    padding: '2px 6px',
                    borderRadius: 99,
                    color: 'var(--amber)',
                  }}
                >
                  Admin
                </span>
              )}

              <button
                type="button"
                onClick={signOut}
                title="Sair da conta"
                style={{
                  background: 'none',
                  border: 0,
                  color: 'var(--mut)',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: '2px 4px',
                  marginLeft: 4,
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() => setIsLoginOpen(true)}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              Entrar
            </button>
          )}

          {/* Tema visual */}
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
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ProfileModal
        isOpen={isProfileOpen || Boolean(profile?.isFirstAccess)}
        isFirstAccess={Boolean(profile?.isFirstAccess)}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
