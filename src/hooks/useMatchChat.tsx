import { useState, useEffect, useCallback, useMemo } from 'react';
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

interface Participant {
  user_id: string;
  full_name: string | null;
}

export const useMatchChat = (matchId: string | undefined, participants: Participant[] = []) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const participantsMap = useMemo(() => 
    new Map(participants.map(p => [p.user_id, p.full_name])),
    [participants]
  );

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
          user_id
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const enrichedMessages = (data || []).map(msg => ({
        ...msg,
        profiles: {
          full_name: participantsMap.get(msg.user_id) || 'Usuario'
        }
      }));
      
      setMessages(enrichedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  }, [matchId, user, participantsMap]);

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
        const fullName = participantsMap.get(payload.new.user_id);
        
        const newMessage: Message = {
            ...payload.new,
            profiles: { full_name: fullName || 'Usuario' }
        };

        setMessages(currentMessages => {
            if (currentMessages.some(m => m.id === newMessage.id)) {
                return currentMessages;
            }
            return [...currentMessages, newMessage];
        });
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

  }, [matchId, fetchMessages, participantsMap]);

  return { messages, loading, error, sendMessage };
};
