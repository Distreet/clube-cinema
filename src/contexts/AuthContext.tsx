import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  displayName: string;
  letterboxdUsername: string | null;
  role: 'member' | 'admin';
  createdAt?: string;
  isFirstAccess?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithOtp: (email: string) => Promise<{ error: Error | null; message?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { displayName: string; letterboxdUsername?: string }) => Promise<{ error: Error | null }>;
  // Modo de teste para desenvolvimento local sem variáveis live:
  setDevUser: (role: 'guest' | 'member' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    // Por padrão no dev local sem Supabase, inicia como Samuel (admin)
    if (!isSupabaseConfigured) {
      return {
        id: 'dev-samuel-id',
        displayName: 'Samuel',
        letterboxdUsername: 'samuel',
        role: 'admin',
      };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return null;
      }

      if (data) {
        const userProf: UserProfile = {
          id: data.id,
          displayName: data.display_name,
          letterboxdUsername: data.letterboxd_username,
          role: data.role as 'member' | 'admin',
          createdAt: data.created_at,
          // Se o nome de exibição ainda for o fallback inicial, marcar como primeiro acesso
          isFirstAccess: !data.letterboxd_username && (!data.display_name || data.display_name === 'Membro'),
        };
        setProfile(userProf);
        return userProf;
      }
    } catch (err) {
      console.error('Falha na consulta do perfil:', err);
    }
    return null;
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Carrega sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      // Simulação local quando variáveis não estão conectadas
      if (['samuel@example.com', 'luara@example.com', 'filipe@example.com', 'tamires@example.com'].includes(cleanEmail)) {
        const name = cleanEmail.split('@')[0];
        const capName = name.charAt(0).toUpperCase() + name.slice(1);
        setProfile({
          id: `dev-${name}-id`,
          displayName: capName,
          letterboxdUsername: name,
          role: cleanEmail === 'samuel@example.com' ? 'admin' : 'member',
        });
        return { error: null, message: 'Link mágico simulado enviado com sucesso!' };
      } else {
        return {
          error: new Error('Este e-mail não tem permissão para entrar no Clube do Livro (allowed_emails).'),
        };
      }
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        return { error };
      }
      return { error: null, message: 'Link mágico enviado para seu e-mail!' };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: { displayName: string; letterboxdUsername?: string }) => {
    if (!profile) return { error: new Error('Nenhum usuário logado.') };

    const cleanDisplay = data.displayName.trim();
    const cleanLetterboxd = data.letterboxdUsername?.trim() || null;

    if (cleanDisplay.length < 2) {
      return { error: new Error('O nome de exibição deve ter pelo menos 2 caracteres.') };
    }

    if (!isSupabaseConfigured) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: cleanDisplay,
              letterboxdUsername: cleanLetterboxd,
              isFirstAccess: false,
            }
          : null
      );
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: cleanDisplay,
          letterboxd_username: cleanLetterboxd,
        })
        .eq('id', profile.id);

      if (error) return { error };

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: cleanDisplay,
              letterboxdUsername: cleanLetterboxd,
              isFirstAccess: false,
            }
          : null
      );
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Helper para simular papéis em desenvolvimento
  const setDevUser = (role: 'guest' | 'member' | 'admin') => {
    if (role === 'guest') {
      setUser(null);
      setProfile(null);
    } else if (role === 'member') {
      setProfile({
        id: 'dev-luara-id',
        displayName: 'Luara',
        letterboxdUsername: 'luara',
        role: 'member',
      });
    } else {
      setProfile({
        id: 'dev-samuel-id',
        displayName: 'Samuel',
        letterboxdUsername: 'samuel',
        role: 'admin',
      });
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInWithOtp,
        signOut,
        updateProfile,
        setDevUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
