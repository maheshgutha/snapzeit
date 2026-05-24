import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useMessages } from '@/lib/message-context';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Search, User, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function Messages() {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { messages, markAsRead, unreadCount } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!hasRole('admin')) {
        navigate('/');
        toast({ title: 'Access denied', description: 'Admin privileges required', variant: 'destructive' });
      }
    }
  }, [user, authLoading, hasRole, navigate, toast]);

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    
    // Mock reply functionality - replace with actual implementation
    toast({ title: 'Reply sent', description: 'Your reply has been sent successfully.' });
    setReplyContent('');
  };

  const filteredMessages = useMemo(() => 
    messages.filter(msg =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    ), [messages, searchQuery]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="h-64 bg-secondary animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 gradient-primary rounded-xl">
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Manage platform communications {unreadCount > 0 && `(${unreadCount} unread)`}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Inbox
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-muted' : ''
                      } ${!message.read ? 'border-l-4 border-l-primary' : ''}`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          {message.sender_type === 'photographer' ? (
                            <Camera className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${!message.read ? 'font-semibold' : ''}`}>
                              {message.sender_name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {message.sender_type}
                            </Badge>
                          </div>
                          <p className={`text-sm truncate ${!message.read ? 'font-medium' : 'text-muted-foreground'}`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {message.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(message.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedMessage.sender_type === 'photographer' ? (
                          <Camera className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                        {selectedMessage.subject}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        From: {selectedMessage.sender_name} ({selectedMessage.sender_type})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={selectedMessage.read ? "secondary" : "destructive"}>
                      {selectedMessage.read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Reply</h4>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button onClick={sendReply} disabled={!replyContent.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">Select a message</p>
                    <p className="text-muted-foreground">Choose a message from the inbox to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}