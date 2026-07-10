import { useState } from 'react';
import { supabase } from '@/integrations/api/client';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  photographerId: string;
}

export function ReviewModal({ isOpen, onClose, bookingId, photographerId }: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    setIsSubmitting(true);
    
    // get user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const userName = profile?.full_name || user.email?.split('@')[0] || 'Anonymous User';

    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      photographer_id: photographerId,
      user_id: user.id,
      user_name: userName,
      rating,
      comment,
      created_at: new Date().toISOString()
    });

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to submit review');
    } else {
      toast.success('Thank you for your review!');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center gap-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Tell others about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full min-h-[120px] resize-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !comment.trim()} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
