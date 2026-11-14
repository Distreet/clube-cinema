import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
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
  signInWithOtp: (
    email: string,
    password?: string
  ) => Promise<{ error: Error | null; message?: string; needsPassword?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: {
    displayName: string;
    letterboxdUsername?: string;
    avatarUrl?: string | null;
  }) => Promise<{ error: Error | null }>;
  // Modo de teste para desenvolvimento local sem variáveis live:
  setDevUser: (role: 'guest' | 'member' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    // Inicia como visitante (null) por padrão, ou recupera sessão anterior do usuário
    const saved = localStorage.getItem('clube_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('clube_user_profile');
      }
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
        const saved = localStorage.getItem('clube_user_profile');
        if (saved) {
          try {
            setProfile(JSON.parse(saved));
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { error: new Error('Por favor, informe seu e-mail.') };
    }

    // 1. Samuel (Administrador - requer senha)
    const isSamuel =
      cleanEmail === 'samuelnasc2805@gmail.com' ||
      cleanEmail === 'samuel@example.com' ||
      cleanEmail === 'samuel';

    if (isSamuel) {
      if (!password) {
        return {
          error: null,
          needsPassword: true,
          message: 'E-mail de administrador identificado. Digite a senha para continuar.',
        };
      }
      if (password.trim() !== '12345') {
        return { error: new Error('Senha de administrador incorreta.') };
      }
      const adminProfile: UserProfile = {
        id: 'dev-samuel-id',
        displayName: 'Samuel',
        avatarUrl: '/avatars/samuel.jpg',
        letterboxdUsername: 'Distreett',
        role: 'admin',
      };
      localStorage.setItem('clube_user_profile', JSON.stringify(adminProfile));
      setProfile(adminProfile);
      return { error: null, message: 'Autenticado com sucesso como Administrador!' };
    }

    // 2. Luara
    if (cleanEmail.includes('luara')) {
      const memberProfile: UserProfile = {
        id: 'dev-luara-id',
        displayName: 'Luara',
        avatarUrl: '/avatars/luara.jpg',
        letterboxdUsername: 'luarasousa',
        role: 'member',
      };
      localStorage.setItem('clube_user_profile', JSON.stringify(memberProfile));
      setProfile(memberProfile);
      return { error: null, message: 'Bem-vinda, Luara!' };
    }

    // 3. Filipe
    if (cleanEmail.includes('filipe') || cleanEmail.includes('philip')) {
      const memberProfile: UserProfile = {
        id: 'dev-filipe-id',
        displayName: 'Filipe',
        avatarUrl: '/avatars/filipe.jpg',
        letterboxdUsername: 'philipassoz',
        role: 'member',
      };
      localStorage.setItem('clube_user_profile', JSON.stringify(memberProfile));
      setProfile(memberProfile);
      return { error: null, message: 'Bem-vindo, Filipe!' };
    }

    // 4. Tamires
    if (cleanEmail.includes('tamires') || cleanEmail.includes('tamintf')) {
      const memberProfile: UserProfile = {
        id: 'dev-tamires-id',
        displayName: 'Tamires',
        avatarUrl: '/avatars/tamires.jpg',
        letterboxdUsername: 'tamintf',
        role: 'member',
      };
      localStorage.setItem('clube_user_profile', JSON.stringify(memberProfile));
      setProfile(memberProfile);
      return { error: null, message: 'Bem-vinda, Tamires!' };
    }

    // 5. Se houver Supabase configurado, tenta buscar perfil existente por e-mail ou display_name
    if (isSupabaseConfigured) {
      try {
        const { data: dbUser } = await supabase
          .from('profiles')
          .select('id, display_name, letterboxd_username, role, avatar_url')
          .or(`email.ilike.%${cleanEmail}%,display_name.ilike.%${cleanEmail}%`)
          .maybeSingle();

        if (dbUser) {
          const dbProfile: UserProfile = {
            id: dbUser.id,
            displayName: dbUser.display_name,
            avatarUrl: dbUser.avatar_url,
            letterboxdUsername: dbUser.letterboxd_username,
            role: dbUser.role as 'admin' | 'member',
          };
          localStorage.setItem('clube_user_profile', JSON.stringify(dbProfile));
          setProfile(dbProfile);
          return { error: null, message: `Bem-vindo(a), ${dbUser.display_name}!` };
        }
      } catch (err) {
        // segue para mensagem de erro
      }
    }

    return {
      error: new Error('E-mail não encontrado no clube. Verifique a digitação ou solicite acesso ao administrador.'),
    };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('clube_user_profile');
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: {
    displayName: string;
    letterboxdUsername?: string;
    avatarUrl?: string | null;
  }) => {
    if (!profile) return { error: new Error('Nenhum usuário logado.') };

    const cleanDisplay = data.displayName.trim();
    const cleanLetterboxd = data.letterboxdUsername?.trim() || null;
    const cleanAvatar = data.avatarUrl !== undefined ? data.avatarUrl : profile.avatarUrl;

    if (cleanDisplay.length < 2) {
      return { error: new Error('O nome de exibição deve ter pelo menos 2 caracteres.') };
    }

    const updated: UserProfile = {
      ...profile,
      displayName: cleanDisplay,
      letterboxdUsername: cleanLetterboxd,
      avatarUrl: cleanAvatar,
      isFirstAccess: false,
    };

    localStorage.setItem('clube_user_profile', JSON.stringify(updated));
    setProfile(updated);

    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: cleanDisplay,
          letterboxd_username: cleanLetterboxd,
          avatar_url: cleanAvatar,
        })
        .eq('id', profile.id);

      if (error) return { error };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Helper para simular papéis em desenvolvimento
  const setDevUser = (role: 'guest' | 'member' | 'admin') => {
    if (role === 'guest') {
      localStorage.removeItem('clube_user_profile');
      setUser(null);
      setProfile(null);
    } else if (role === 'member') {
      const p: UserProfile = {
        id: 'dev-luara-id',
        displayName: 'Luara',
        letterboxdUsername: 'luarasousa',
        role: 'member',
      };
      localStorage.setItem('clube_user_profile', JSON.stringify(p));
      setProfile(p);
    } else {
      const p: UserProfile = {
        id: 'dev-samuel-id',
        displayName: 'Samuel',
        letterboxdUsername: 'Distreett',
        role: 'admin',
      };
      localStorage.setItem('clube_user_profile', JSON.stringify(p));
      setProfile(p);
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
