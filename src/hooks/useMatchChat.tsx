
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  created_at: string;
  message: string;
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export const useMatchChat = (matchId: string | undefined) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!matchId || !user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('match_chat_messages')
        .select(`
          id,
          created_at,
          message,
          user_id,
          profiles (
            full_name
          )
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  }, [matchId, user]);

  const sendMessage = async (message: string) => {
    if (!matchId || !user || !message.trim()) return { error: 'Mensaje inválido' };

    try {
      const { error } = await supabase
        .from('match_chat_messages')
        .insert([{ match_id: matchId, user_id: user.id, message: message.trim() }]);
      
      if (error) throw error;
      
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error al enviar el mensaje' };
    }
  };

  useEffect(() => {
    if (!matchId) return;

    fetchMessages();

    const channel = supabase.channel(`match-chat-${matchId}`);

    const handleNewMessage = (payload: any) => {
        const fetchNewMessageWithProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', payload.new.user_id)
                .single();
            
            const newMessage: Message = {
                ...payload.new,
                profiles: error ? { full_name: 'Usuario' } : data
            };
            setMessages(currentMessages => [...currentMessages, newMessage]);
        };

        fetchNewMessageWithProfile();
    };

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_chat_messages',
          filter: `match_id=eq.${matchId}`,
        },
        handleNewMessage
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [matchId, fetchMessages]);

  return { messages, loading, error, sendMessage };
};
