import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getMovieDetails } from './tmdb';

export interface AllowedEmailEntry {
  email: string;
  createdAt: string;
  hasProfile?: boolean;
  profileName?: string;
  role?: 'member' | 'admin';
  userId?: string;
}

/**
 * Busca a lista de e-mails permitidos e seus respectivos perfis
 */
export async function fetchAllowedEmailsList(): Promise<AllowedEmailEntry[]> {
  if (isSupabaseConfigured) {
    try {
      const { data: emails, error: emailError } = await supabase
        .from('allowed_emails')
        .select('*')
        .order('created_at', { ascending: true });

      if (emailError) throw emailError;

      return (emails || []).map((e) => {
        return {
          email: e.email,
          createdAt: e.created_at,
          role: 'member',
        };
      });
    } catch (err) {
      console.warn('Erro ao carregar allowed_emails do banco:', err);
    }
  }

  // Dados mock para modo local
  return [
    { email: 'samuel@example.com', createdAt: '2026-11-01', hasProfile: true, profileName: 'Samuel', role: 'admin' },
    { email: 'luara@example.com', createdAt: '2026-11-01', hasProfile: true, profileName: 'Luara', role: 'member' },
    { email: 'filipe@example.com', createdAt: '2026-11-01', hasProfile: true, profileName: 'Filipe', role: 'member' },
    { email: 'tamires@example.com', createdAt: '2026-11-01', hasProfile: true, profileName: 'Tamires', role: 'member' },
  ];
}

/**
 * Adiciona um novo e-mail na lista de permitidos
 */
export async function addAllowedEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
    return { success: false, error: 'E-mail inválido.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('allowed_emails').insert({ email: cleanEmail });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Remove um e-mail da lista de permitidos
 */
export async function removeAllowedEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('allowed_emails').delete().eq('email', email.toLowerCase());
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Atualiza o nome oficial do clube na tabela settings
 */
export async function saveClubNameSetting(name: string): Promise<{ success: boolean; error?: string }> {
  const cleanName = name.trim();
  if (cleanName.length < 2) {
    return { success: false, error: 'O nome do clube deve ter pelo menos 2 caracteres.' };
  }

  try {
    localStorage.setItem('clube_name', cleanName);
  } catch (e) {
    // ignore
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'club_name', value: JSON.stringify(cleanName), updated_at: new Date().toISOString() });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Inicia um novo ciclo ativo no Supabase
 */
export async function startNewCycleInDatabase(params: {
  tmdbId: number;
  startDate: string;
  watchDeadline: string;
  discussionDate?: string | null;
  notes?: string | null;
}): Promise<{ success: boolean; error?: string; cycleId?: string }> {
  if (isSupabaseConfigured) {
    try {
      // 1. Encerra qualquer ciclo ativo anterior
      await supabase.from('cycles').update({ status: 'done' }).eq('status', 'active');

      // 2. Garante que o filme esteja em cache na tabela movies
      const details = await getMovieDetails(params.tmdbId);
      if (details?.movie) {
        await supabase.from('movies').upsert(details.movie);
      }

      // 3. Cria novo ciclo
      const { data, error } = await supabase
        .from('cycles')
        .insert({
          tmdb_id: params.tmdbId,
          start_date: params.startDate,
          watch_deadline: params.watchDeadline,
          discussion_date: params.discussionDate || null,
          status: 'active',
          notes: params.notes || null,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      // 4. Marca status da sugestão correspondente como 'chosen' se existir
      await supabase
        .from('suggestions')
        .update({ status: 'chosen' })
        .eq('tmdb_id', params.tmdbId);

      return { success: true, cycleId: data.id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true, cycleId: `cycle-${Date.now()}` };
}

/**
 * Encerra o ciclo ativo atual
 */
export async function finishActiveCycleInDatabase(cycleId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('cycles')
        .update({ status: 'done' })
        .eq('id', cycleId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Adiciona um filme do passado diretamente ao histórico (Já Vimos)
 */
export async function addPastMovieToHistory(params: {
  tmdbId: number;
  sessionMonth: string;
  watchedDate?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      // 1. Garante que o filme esteja em cache na tabela movies
      const details = await getMovieDetails(params.tmdbId);
      if (details?.movie) {
        await supabase.from('movies').upsert(details.movie);
      }

      // 2. Cria um ciclo já concluído (status: 'done') para vincular a data ao histórico
      const watched = params.watchedDate || new Date().toISOString().substring(0, 10);
      const { error } = await supabase.from('cycles').insert({
        tmdb_id: params.tmdbId,
        start_date: watched,
        watch_deadline: watched,
        status: 'done',
        notes: `Sessão realizada em ${params.sessionMonth}`,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}
