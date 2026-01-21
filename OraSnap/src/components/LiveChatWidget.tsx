import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full gradient-primary shadow-lg hover:scale-110 transition-transform"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Live Support</h3>
            <p className="text-sm text-muted-foreground">We're here to help!</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-secondary p-3 rounded-lg max-w-xs">
                <p className="text-sm">Hi! How can I help you today?</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" className="gradient-primary">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}