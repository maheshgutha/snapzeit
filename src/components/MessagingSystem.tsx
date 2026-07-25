import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/api/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, X, Phone, Video, MoreVertical, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface MessagingSystemProps {
  photographerId: string;
  photographerName: string;
  photographerAvatar?: string;
  onClose: () => void;
}

export function MessagingSystem({ photographerId, photographerName, photographerAvatar, onClose }: MessagingSystemProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    
    // Fetch conversation between user and photographer
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (data) {
      // Filter locally since adapter mock doesn't support complex OR conditions perfectly
      const convo = data.filter((m: any) => 
        (m.sender_id === user.id && m.receiver_id === photographerId) ||
        (m.sender_id === photographerId && m.receiver_id === user.id) ||
        // Also show mock messages if any
        m.sender_id === 'photographer-1' || m.sender_id === 'user-1'
      );
      setMessages(convo);
    }
    setLoading(false);
  }, [user, photographerId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage;
    setNewMessage('');

    // Optimistic update
    const optimisticMessage: Message = {
      id: Date.now().toString(),
      sender_id: user.id,
      receiver_id: photographerId,
      content: messageContent,
      created_at: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, optimisticMessage]);

    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: photographerId,
      subject: 'New message',
      content: messageContent,
      is_read: false
    });
    
    // No need to fetch immediately, interval will catch it, or we could trigger one explicitly
    fetchMessages();
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={photographerAvatar} alt={photographerName} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {photographerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{photographerName}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  // Determine sender side: mock photographer-1 is always "other", user-1 is "user" 
                  // or real comparison against current user id
                  const isOwn = message.sender_id === user?.id || message.sender_id === 'user-1';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple chat button component
interface ChatButtonProps {
  photographerName: string;
  photographerAvatar?: string;
  onClick: () => void;
}

export function ChatButton({ photographerName, photographerAvatar, onClick }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 hover:scale-105 transition-all"
    >
      <Avatar className="h-6 w-6">
        <AvatarImage src={photographerAvatar} alt={photographerName} />
        <AvatarFallback className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          {photographerName.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <span>Chat with {photographerName.split(' ')[0]}</span>
    </Button>
  );
}