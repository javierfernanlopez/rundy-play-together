
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Match {
  id: string;
  title: string;
  description?: string;
  location: string;
  date: string;
  max_players: number;
  current_players: number;
  creator_id: string;
  sport_type: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMatches = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar partidos');
    } finally {
      setLoading(false);
    }
  };

  const joinMatch = async (matchId: string) => {
    if (!user) return { error: 'Usuario no autenticado' };

    try {
      const { error } = await supabase
        .from('match_participants')
        .insert([
          { match_id: matchId, user_id: user.id }
        ]);

      if (error) throw error;
      
      // Refetch matches to update current_players count
      await fetchMatches();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error al unirse al partido' };
    }
  };

  const leaveMatch = async (matchId: string) => {
    if (!user) return { error: 'Usuario no autenticado' };

    try {
      const { error } = await supabase
        .from('match_participants')
        .delete()
        .eq('match_id', matchId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refetch matches to update current_players count
      await fetchMatches();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error al salir del partido' };
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
    joinMatch,
    leaveMatch
  };
};
