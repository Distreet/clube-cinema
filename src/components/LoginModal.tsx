import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithOtp, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSentMessage(null);

    const { error, message } = await signInWithOtp(email);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSentMessage(message || 'Enviamos um link mágico para o seu e-mail!');
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
          Digite seu e-mail cadastrado. Você receberá um link mágico para acessar sem precisar de senha.
        </p>

        {sentMessage ? (
          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: '#2f8f6b22',
              border: '1px solid #2f8f6b',
              color: 'var(--tx)',
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            ✓ {sentMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                aria-label="E-mail"
                required
                style={{ width: '100%' }}
                autoFocus
              />
            </div>

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

            {!isConfigured && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--mut)',
                  marginBottom: 14,
                  lineHeight: 1.4,
                }}
              >
                💡 <em>Modo local:</em> Teste com um dos e-mails permitidos (ex: <code>samuel@example.com</code>, <code>luara@example.com</code>) para simular o login. E-mails desconhecidos serão bloqueados.
              </p>
            )}

            <button
              className="btn"
              type="submit"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Enviando link...' : 'Receber link mágico'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
