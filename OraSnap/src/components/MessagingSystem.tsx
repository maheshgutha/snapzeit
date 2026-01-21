import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, X, Phone, Video, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'photographer';
  content: string;
  timestamp: Date;
  read: boolean;
}

interface MessagingSystemProps {
  photographerName: string;
  photographerAvatar?: string;
  onClose: () => void;
}

export function MessagingSystem({ photographerName, photographerAvatar, onClose }: MessagingSystemProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'photographer',
      content: `Hi! Thanks for your interest in my photography services. I'd love to help capture your special moments!`,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: true
    },
    {
      id: '2',
      sender: 'user',
      content: 'Hello! I\'m looking for a wedding photographer for next month. Do you have availability?',
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      read: true
    },
    {
      id: '3',
      sender: 'photographer',
      content: 'Yes, I do have availability next month! What date are you thinking? I\'d also love to hear more about your vision for the day.',
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      read: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate photographer response after 2 seconds
    setTimeout(() => {
      const responses = [
        "That sounds wonderful! I'd be happy to discuss the details with you.",
        "Great! Let me check my calendar and get back to you with some options.",
        "I love working on projects like this. When would be a good time to chat?",
        "Perfect! I'll send you my portfolio and pricing information shortly."
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'photographer',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
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