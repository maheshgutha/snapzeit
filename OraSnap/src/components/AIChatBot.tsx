import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Bot, User, Sparkles, MapPin, Camera, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
  suggestions?: any[];
  timestamp: Date;
}

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hi! I'm OraBot, your AI photography assistant. Ask me to find photographers in a specific location or for a particular style!",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [allPhotographers, setAllPhotographers] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPhotographers();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchPhotographers = async () => {
    const { data } = await supabase.rpc('get_public_photographers');
    if (data) {
      setAllPhotographers(data);
    }
  };

  const processMessage = async (text: string) => {
    const lowerText = text.toLowerCase();
    let response = "";
    let suggestions: any[] = [];

    // Simple keyword matching for AI behavior
    if (lowerText.includes('hi') || lowerText.includes('hello')) {
      response = "Hello! How can I help you find the perfect photographer today?";
    } else if (lowerText.includes('location') || lowerText.includes('in ') || lowerText.includes('at ')) {
      // Try to extract location
      const words = lowerText.split(' ');
      let location = "";
      
      // Look for locations in our database
      const availableLocations = [...new Set(allPhotographers.map(p => p.location.toLowerCase()))];
      const foundLocation = availableLocations.find(loc => lowerText.includes(loc));
      
      if (foundLocation) {
        suggestions = allPhotographers.filter(p => p.location.toLowerCase().includes(foundLocation));
        response = `I found ${suggestions.length} photographers in ${foundLocation}. Here are some recommendations:`;
      } else {
        response = "I couldn't find any photographers in that specific location. Would you like to see our most popular photographers instead?";
        suggestions = allPhotographers.sort((a, b) => b.rating - a.rating).slice(0, 3);
      }
    } else if (lowerText.includes('wedding') || lowerText.includes('portrait') || lowerText.includes('event')) {
      const specialty = ['wedding', 'portrait', 'event', 'fashion', 'commercial'].find(s => lowerText.includes(s));
      suggestions = allPhotographers.filter(p => p.specialty.toLowerCase().includes(specialty || ''));
      response = `Great! I found some amazing ${specialty} photographers for you:`;
    } else if (lowerText.includes('who') || lowerText.includes('photographer') || lowerText.includes('recommend')) {
      suggestions = allPhotographers.sort((a, b) => b.rating - a.rating).slice(0, 3);
      response = "Based on user ratings, here are our top-rated photographers:";
    } else {
      response = "I'm still learning! You can ask me things like 'Find me a wedding photographer in New York' or 'Who are the top rated photographers?'";
    }

    return { response, suggestions: suggestions.slice(0, 3) };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI thinking
    setTimeout(async () => {
      const { response, suggestions } = await processMessage(userMsg.content);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response,
        suggestions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl hover:scale-110 transition-transform flex items-center justify-center p-0"
        >
          {isOpen ? <X className="h-6 w-6 text-white" /> : <Bot className="h-7 w-7 text-white" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </span>
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-gray-900 border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">OraBot Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-blue-100 italic">Fast & Smart</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-4" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-indigo-600" /> : <Bot className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="space-y-2">
                      <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="grid gap-2 mt-2">
                          {msg.suggestions.map((p, idx) => (
                            <div 
                              key={idx} 
                              className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all hover:shadow-md"
                              onClick={() => {
                                setIsOpen(false);
                                navigate(`/photographer/${p.id}`);
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-xs">{p.name}</span>
                                <Badge variant="secondary" className="text-[10px] h-4">{p.specialty}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {p.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {p.rating}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask OraBot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSend} disabled={loading} size="icon" className="gradient-primary rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Sparkles className="h-2 w-2" /> Powered by OraSnap AI Intelligence
            </p>
          </div>
        </div>
      )}
    </>
  );
}
