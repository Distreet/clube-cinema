import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { ProfileModal } from './ProfileModal';

type Theme = 'auto' | 'dark' | 'light';

export const Header: React.FC = () => {
  const { profile, isAdmin, signOut, isConfigured, setDevUser } = useAuth();
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
            Clube do Livro
          </Link>
          <small>nome provisório</small>
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
                  }}
                >
                  {profile.displayName.charAt(0)}
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

          {/* Simulador de Papéis (modo desenvolvimento/teste) */}
          {!isConfigured && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--mut)',
                background: 'var(--bg2)',
                border: '1px dashed var(--line)',
                padding: '3px 8px',
                borderRadius: 99,
              }}
              title="Alternador de papéis para simulação local sem Supabase"
            >
              <span>Testar papel:</span>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  color: profile?.role === 'admin' ? 'var(--amber)' : 'inherit',
                  fontWeight: profile?.role === 'admin' ? 700 : 400,
                  fontSize: 11,
                  padding: 2,
                }}
                onClick={() => setDevUser('admin')}
              >
                Admin
              </button>
              <span>|</span>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  color: profile?.role === 'member' ? 'var(--amber)' : 'inherit',
                  fontWeight: profile?.role === 'member' ? 700 : 400,
                  fontSize: 11,
                  padding: 2,
                }}
                onClick={() => setDevUser('member')}
              >
                Membro
              </button>
              <span>|</span>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  color: !profile ? 'var(--amber)' : 'inherit',
                  fontWeight: !profile ? 700 : 400,
                  fontSize: 11,
                  padding: 2,
                }}
                onClick={() => setDevUser('guest')}
              >
                Visitante
              </button>
            </div>
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
