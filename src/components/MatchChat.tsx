
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/hooks/useMatchChat';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface MatchChatProps {
  matchId: string;
  participants: any[];
  messages: Message[];
  sendMessage: (message: string) => Promise<{ error: string | null }>;
  chatLoading: boolean;
  chatError: string | null;
  isModal?: boolean;
  onClose?: () => void;
}

const MatchChat = ({ 
  matchId, 
  participants, 
  messages,
  sendMessage,
  chatLoading: loading,
  isModal = false,
}: MatchChatProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    setIsSending(true);
    const { error } = await sendMessage(newMessage);
    setIsSending(false);

    if (error) {
      toast({
        title: 'Error al enviar mensaje',
        description: error,
        variant: 'destructive',
      });
    } else {
      setNewMessage('');
    }
  };

  const containerHeight = isModal ? 'h-full' : 'h-96';

  return (
    <div className={`flex flex-col ${containerHeight}`}>
      <ScrollArea className="flex-grow p-4 border rounded-lg mb-4 bg-gray-50" ref={scrollAreaRef}>
        {loading && <div className="text-center text-gray-500">Cargando mensajes...</div>}
        {!loading && messages.length === 0 && (
          <div className="text-center text-gray-500">Aún no hay mensajes. ¡Sé el primero!</div>
        )}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className={msg.user_id === user?.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}>
                    {getInitials(msg.profiles?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className={`p-3 rounded-lg max-w-xs ${msg.user_id === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="text-sm font-medium mb-1">{msg.profiles?.full_name || 'Usuario'}</p>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-right mt-1 opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={isSending}
        />
        <Button type="submit" disabled={isSending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default MatchChat;
