
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [unreadCount, setUnreadCount] = useState(0);
  const lastReadTimestampRef = useRef<string | null>(null);
  const channelRef = useRef<any>(null);

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
      
      // Calcular mensajes no leídos solo si no es la primera carga
      if (enrichedMessages.length > 0 && lastReadTimestampRef.current) {
        const unread = enrichedMessages.filter(msg => 
          msg.user_id !== user.id && 
          new Date(msg.created_at) > new Date(lastReadTimestampRef.current!)
        ).length;
        setUnreadCount(unread);
      } else if (enrichedMessages.length > 0 && !lastReadTimestampRef.current) {
        // Primera carga - contar todos los mensajes de otros usuarios
        const unread = enrichedMessages.filter(msg => msg.user_id !== user.id).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  }, [matchId, user, participantsMap]);

  const sendMessage = async (message: string) => {
    if (!matchId || !user || !message.trim()) return { error: 'Mensaje inválido' };

    try {
      const { data, error } = await supabase
        .from('match_chat_messages')
        .insert([{ match_id: matchId, user_id: user.id, message: message.trim() }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Agregar el mensaje inmediatamente a la lista local
      if (data) {
        const newMessage: Message = {
          ...data,
          profiles: {
            full_name: participantsMap.get(user.id) || 'Usuario'
          }
        };
        
        setMessages(currentMessages => {
          // Evitar duplicados
          if (currentMessages.some(m => m.id === newMessage.id)) {
            return currentMessages;
          }
          return [...currentMessages, newMessage];
        });
      }
      
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error al enviar el mensaje' };
    }
  };

  const markAsRead = useCallback(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      lastReadTimestampRef.current = latestMessage.created_at;
      setUnreadCount(0);
    }
  }, [messages]);

  useEffect(() => {
    if (!matchId || !user) return;

    // Cleanup previous channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    fetchMessages();

    // Create a new channel with a unique name to avoid conflicts
    const channelName = `match-chat-${matchId}-${user.id}-${Date.now()}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    const handleNewMessage = (payload: any) => {
        const fullName = participantsMap.get(payload.new.user_id);
        
        const newMessage: Message = {
            ...payload.new,
            profiles: { full_name: fullName || 'Usuario' }
        };

        setMessages(currentMessages => {
            // Evitar duplicados
            if (currentMessages.some(m => m.id === newMessage.id)) {
                return currentMessages;
            }
            return [...currentMessages, newMessage];
        });

        // Incrementar contador de no leídos solo si el mensaje no es del usuario actual
        if (payload.new.user_id !== user.id) {
          setUnreadCount(prev => prev + 1);
        }
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
      .subscribe((status) => {
        console.log('Channel subscription status:', status);
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

  }, [matchId, user, participantsMap]);

  return { messages, loading, error, sendMessage, unreadCount, markAsRead };
};
