import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { apiClient } from '@/integrations/api/client';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_name: string;
  sender_type: 'user' | 'photographer' | 'admin';
}

interface MessageContextType {
  messages: Message[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addMessage: (message: Omit<Message, 'id' | 'created_at' | 'read'>) => void;
  removeMessage: (id: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (user) {
      fetchMessages();

      // Subscribe to real-time messages
      const channel = supabase
        .channel('messages')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name),
          recipient:profiles!messages_recipient_id_fkey(full_name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const formattedMessages = (data as any)?.map((msg: any) => ({
        ...msg,
        read: msg.is_read, // Map database column is_read to interface read
        sender_name: msg.sender?.full_name || 'Unknown',
        sender_type: 'user' as const
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true } as any) // Correct column name
        .eq('id', id);

      if (!error) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === id ? { ...msg, read: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAllAsRead = () => {
    setMessages(prev =>
      prev.map(msg => ({ ...msg, read: true }))
    );
  };

  const addMessage = (message: Omit<Message, 'id' | 'created_at' | 'read'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [newMessage, ...prev]);
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <MessageContext.Provider value={{
      messages,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addMessage,
      removeMessage
    }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}