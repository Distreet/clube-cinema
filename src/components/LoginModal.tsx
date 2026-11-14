import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSamuelEmail =
    email.trim().toLowerCase() === 'samuelnasc2805@gmail.com' ||
    email.trim().toLowerCase() === 'samuel@example.com' ||
    email.trim().toLowerCase() === 'samuel';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    const { error, needsPassword } = await signInWithOtp(email, password);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (needsPassword) {
      setErrorMessage('Por favor, informe a senha de administrador (12345).');
    } else {
      // Login bem-sucedido: fecha o modal
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000b0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
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
          padding: '28px 24px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 40px #000a',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 0,
            color: 'var(--mut)',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <h3 id="login-title" style={{ fontSize: 24, marginBottom: 8 }}>
          Entrar no clube
        </h3>
        <p className="lead" style={{ fontSize: 14, marginBottom: 20 }}>
          Digite seu e-mail cadastrado para acessar o clube.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="login-email-input"
              style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}
            >
              E-mail do integrante
            </label>
            <input
              id="login-email-input"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="seu.email@exemplo.com"
              aria-label="E-mail"
              required
              style={{ width: '100%' }}
              autoFocus
            />
          </div>

          {isSamuelEmail && (
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="login-admin-password"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--amber)',
                  marginBottom: 6,
                }}
              >
                Senha de Administrador
              </label>
              <input
                id="login-admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de administrador"
                aria-label="Senha de Administrador"
                required
                style={{ width: '100%', borderColor: 'var(--amber)' }}
                autoFocus
              />
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                background: '#c0392b22',
                border: '1px solid #c0392b',
                color: 'var(--rose)',
                marginBottom: 14,
                fontSize: 13,
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            className="btn"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginBottom: 6 }}
          >
            {loading ? 'Entrando...' : isSamuelEmail ? 'Entrar como Administrador' : 'Entrar no Clube'}
          </button>
        </form>
      </div>
    </div>
  );
};
