import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { supabase } from '@/integrations/api/client';

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
  sendMessage: (recipientId: string, subject: string, content: string) => Promise<{ error: { message: string } | null }>;
  removeMessage: (id: string) => void;
  refreshMessages: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (user) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    } else {
      setMessages([]);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const senderIds = Array.from(new Set((data || []).map((msg: any) => msg.sender_id).filter(Boolean)));
      const nameByUserId: Record<string, string> = {};
      await Promise.all(senderIds.map(async (userId: string) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', userId)
          .single();
        if (profile?.full_name) nameByUserId[userId] = profile.full_name;
      }));

      const formattedMessages = (data as any)?.map((msg: any) => ({
        ...msg,
        subject: msg.subject || '(no subject)',
        content: msg.content || '',
        read: msg.is_read, // Map database column is_read to interface read
        sender_name: nameByUserId[msg.sender_id] || 'Unknown',
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

  // Persist a new message to the server and refresh the inbox.
  const sendMessage = async (recipientId: string, subject: string, content: string) => {
    if (!user) return { error: { message: 'Not signed in' } };

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: recipientId,
      subject,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (!error) await fetchMessages();
    return { error };
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
      sendMessage,
      removeMessage,
      refreshMessages: fetchMessages
    }}>
      {children}
    </MessageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}