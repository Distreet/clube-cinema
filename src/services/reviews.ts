import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Review } from '../types';

export async function fetchMovieReviews(tmdbId: number): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          letterboxd_url,
          source,
          profiles (
            display_name
          )
        `)
        .eq('tmdb_id', tmdbId);

      if (error) {
        console.error('Erro ao buscar reviews no Supabase:', error);
        return [];
      }

      return (data || []).map((r: any) => ({
        id: r.id,
        memberName: r.profiles?.display_name || 'Membro',
        rating: r.rating !== null ? Number(r.rating) : null,
        reviewText: r.review_text,
        letterboxdUrl: r.letterboxd_url,
      }));
    } catch (err) {
      console.warn('Erro ao carregar reviews do banco:', err);
    }
  }

  return [];
}

export async function saveManualReview(params: {
  tmdbId: number;
  userId: string;
  rating: number;
  reviewText?: string | null;
  letterboxdUrl?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  // Validações no cliente antes do envio
  if (params.rating < 0.5 || params.rating > 5.0) {
    return { success: false, error: 'A nota deve estar entre 0,5 e 5,0 estrelas.' };
  }
  if ((params.rating * 10) % 5 !== 0) {
    return { success: false, error: 'A nota deve ser em intervalos de meia estrela (0,5).' };
  }
  if (params.reviewText && params.reviewText.length > 5000) {
    return { success: false, error: 'O texto da crítica não pode ultrapassar 5.000 caracteres.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('reviews').upsert(
        {
          tmdb_id: params.tmdbId,
          user_id: params.userId,
          rating: params.rating,
          review_text: params.reviewText ? params.reviewText.trim() : null,
          letterboxd_url: params.letterboxdUrl ? params.letterboxdUrl.trim() : null,
          source: 'manual',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,tmdb_id' }
      );

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao salvar avaliação.' };
    }
  }

  return { success: true };
}
