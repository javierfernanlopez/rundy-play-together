
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

  const createMatch = async (matchData: {
    title: string;
    description?: string;
    location: string;
    date: Date;
    time: string;
    sport_type: string;
    max_players: number;
    price: number;
  }) => {
    if (!user) return { error: 'Usuario no autenticado' };

    try {
      // Combinar fecha y hora
      const [hours, minutes] = matchData.time.split(':');
      const combinedDateTime = new Date(matchData.date);
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            title: matchData.title,
            description: matchData.description,
            location: matchData.location,
            date: combinedDateTime.toISOString(),
            sport_type: matchData.sport_type.toLowerCase(),
            max_players: matchData.max_players,
            price: matchData.price,
            creator_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Actualizar la lista de partidos inmediatamente
      await fetchMatches();
      return { data, error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error al crear el partido' };
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
      
      // Actualizar la lista de partidos
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
      
      // Actualizar la lista de partidos
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
    createMatch,
    joinMatch,
    leaveMatch
  };
};
