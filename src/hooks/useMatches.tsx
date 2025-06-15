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
  is_creator?: boolean;
  is_participant?: boolean;
  creator_profile?: {
    full_name?: string;
    email?: string;
  };
  participants?: any[];
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
      
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: true });

      if (matchesError) throw matchesError;

      const { data: participantsData, error: participantsError } = await supabase
        .from('match_participants')
        .select('match_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      const userParticipatingMatches = new Set(
        participantsData?.map(p => p.match_id) || []
      );

      const matchIds = matchesData?.map(match => match.id) || [];
      let participantsByMatch: { [key: string]: any[] } = {};

      if (matchIds.length > 0) {
        const { data: allParticipants, error: allParticipantsError } = await supabase
          .from('match_participants')
          .select('match_id, user_id, full_name')
          .in('match_id', matchIds);
        
        if (allParticipantsError) throw allParticipantsError;

        if (allParticipants) {
          participantsByMatch = allParticipants.reduce((acc: { [key:string]: any[] }, p) => {
            if (!acc[p.match_id]) {
              acc[p.match_id] = [];
            }
            acc[p.match_id].push(p);
            return acc;
          }, {});
        }
      }

      const creatorIds = [...new Set(matchesData?.map(match => match.creator_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', creatorIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      const enrichedMatches = matchesData?.map(match => ({
        ...match,
        is_creator: match.creator_id === user.id,
        is_participant: userParticipatingMatches.has(match.id),
        creator_profile: profilesMap.get(match.creator_id) || null,
        participants: participantsByMatch[match.id] || []
      })) || [];

      setMatches(enrichedMatches);
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
            creator_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Agregar al creador como participante automáticamente
      // Esto disparará el trigger que incrementa current_players
      const { error: participantError } = await supabase
        .from('match_participants')
        .insert([
          { match_id: data.id, user_id: user.id, full_name: user.user_metadata.full_name || user.email }
        ]);

      if (participantError) throw participantError;

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
          { match_id: matchId, user_id: user.id, full_name: user.user_metadata.full_name || user.email }
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

  const deleteMatch = async (matchId: string) => {
    if (!user) return { error: 'Usuario no autenticado' };

    try {
      // Primero eliminar todos los participantes del partido
      const { error: participantsError } = await supabase
        .from('match_participants')
        .delete()
        .eq('match_id', matchId);

      if (participantsError) throw participantsError;

      // Luego eliminar el partido
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
        .eq('creator_id', user.id); // Solo el creador puede eliminar

      if (error) throw error;
      
      // Actualizar la lista de partidos
      await fetchMatches();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error al eliminar el partido' };
    }
  };

  const getMatchById = async (matchId: string) => {
    if (!user) return { data: null, error: 'Usuario no autenticado' };

    try {
      console.log('Obteniendo detalles del partido:', matchId);
      
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) {
        console.error('Error al obtener partido:', error);
        throw error;
      }

      console.log('Datos del partido obtenidos:', data);

      // Obtener el perfil del creador
      const { data: creatorProfile, error: creatorProfileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', data.creator_id)
        .single();

      if (creatorProfileError) {
        console.warn('No se pudo obtener el perfil del creador:', creatorProfileError);
      }

      // Verificar si el usuario es participante
      const { data: participantData } = await supabase
        .from('match_participants')
        .select('match_id')
        .eq('match_id', matchId)
        .eq('user_id', user.id)
        .single();

      console.log('¿Es participante?', !!participantData);

      // Obtener información de todos los participantes
      const { data: participantsData, error: participantsError } = await supabase
        .from('match_participants')
        .select('user_id, joined_at, full_name')
        .eq('match_id', matchId);

      if (participantsError) {
        console.error('Error al obtener participantes:', participantsError);
        throw participantsError;
      }

      console.log('Participantes obtenidos:', participantsData);

      const enrichedMatch = {
        ...data,
        is_creator: data.creator_id === user.id,
        is_participant: !!participantData,
        creator_profile: creatorProfile || null,
        participants: participantsData || []
      };

      console.log('Match enriquecido:', enrichedMatch);

      return { data: enrichedMatch, error: null };
    } catch (err) {
      console.error('Error completo en getMatchById:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error al obtener el partido' };
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
    leaveMatch,
    deleteMatch,
    getMatchById
  };
};
