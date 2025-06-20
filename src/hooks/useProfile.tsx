
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  favorite_sports?: string[];
  skill_level?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found, this is expected for new users
          setProfile(null);
        } else {
          throw profileError;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Usuario no autenticado' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Actualizar el estado local
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el perfil';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const getFavoriteSportsDisplayNames = () => {
    if (!profile?.favorite_sports) return [];
    
    const sportNames: { [key: string]: string } = {
      'football': 'Fútbol',
      'tennis': 'Tenis',
      'padel': 'Pádel',
      'volleyball': 'Voleibol',
      'basketball': 'Baloncesto',
      'badminton': 'Bádminton'
    };

    return profile.favorite_sports.map(sport => sportNames[sport] || sport);
  };

  const getSkillLevelDisplayName = () => {
    if (!profile?.skill_level) return 'Principiante';
    
    const skillLevels: { [key: string]: string } = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado',
      'expert': 'Experto'
    };

    return skillLevels[profile.skill_level] || profile.skill_level;
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    getFavoriteSportsDisplayNames,
    getSkillLevelDisplayName
  };
};
