import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    variant?: "default" | "outline" | "ghost" | "secondary";
    className?: string;
}

export function ShareButton({ title, text, url = window.location.href, variant = "outline", className }: ShareButtonProps) {

    const handleShare = async () => {
        const shareData = {
            title,
            text,
            url,
        };

        // Try native share
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success("Shared successfully!");
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error(err);
                }
            }
        } else {
            // Fallback to copying to clipboard or WhatsApp
            // For "Reach every person", WhatsApp is king.
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${text}\n${url}`)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <Button variant={variant} size="sm" onClick={handleShare} className={`gap-2 ${className}`}>
            <Share2 className="h-4 w-4" />
            Share
        </Button>
    );
}
