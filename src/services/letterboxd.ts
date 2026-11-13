import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SyncLogEntry {
  id: string;
  userId: string | null;
  userName?: string;
  ranAt: string;
  status: 'success' | 'partial' | 'error';
  message: string;
}

export interface SyncResult {
  success: boolean;
  totalSynced?: number;
  message?: string;
  error?: string;
  summary?: Array<{ user: string; synced: number; error?: string }>;
}

/**
 * Dispara a sincronização manual imediata do Letterboxd
 */
export async function syncLetterboxdNow(): Promise<SyncResult> {
  if (isSupabaseConfigured) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/letterboxd-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Erro ao sincronizar feeds.' };
      }

      return {
        success: true,
        totalSynced: json.total_synced,
        summary: json.summary,
        message: `Sincronização concluída com sucesso! ${json.total_synced || 0} avaliações sincronizadas.`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha na conexão com a Edge Function.' };
    }
  }

  // Simulação para ambiente local de desenvolvimento
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    success: true,
    totalSynced: 3,
    summary: [
      { user: 'Samuel', synced: 1 },
      { user: 'Luara', synced: 1 },
      { user: 'Filipe', synced: 1 },
      { user: 'Tamires', synced: 0 },
    ],
    message: 'Sincronização simulada executada com sucesso! 3 avaliações encontradas.',
  };
}

/**
 * Busca histórico recente de execuções do sync_log
 */
export async function fetchSyncLogs(): Promise<SyncLogEntry[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('sync_log')
        .select(`
          id,
          user_id,
          ran_at,
          status,
          message,
          profiles (
            display_name
          )
        `)
        .order('ran_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar sync_log no Supabase:', error);
        return [];
      }

      return (data || []).map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        userName: log.profiles?.display_name || 'Sistema',
        ranAt: log.ran_at,
        status: log.status,
        message: log.message,
      }));
    } catch (err) {
      console.warn('Erro ao carregar logs:', err);
    }
  }

  // Logs simulados para modo local
  return [
    {
      id: 'log-1',
      userId: 'dev-samuel-id',
      userName: 'Samuel',
      ranAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'success',
      message: 'Sincronização concluída para Samuel (@samuel): 1 avaliação encontrada.',
    },
    {
      id: 'log-2',
      userId: 'dev-luara-id',
      userName: 'Luara',
      ranAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      message: 'Sincronização agendada concluída para Luara (@luara): 1 avaliação encontrada.',
    },
    {
      id: 'log-3',
      userId: 'dev-tamires-id',
      userName: 'Tamires',
      ranAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      message: 'Feed de Tamires verificado. Nenhuma nova avaliação dos filmes do clube.',
    },
  ];
}
