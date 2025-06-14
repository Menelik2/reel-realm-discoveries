import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  movieId: number;
  contentType: 'movie' | 'tv';
  title: string;
}

export const ShareButton = ({ movieId, contentType, title }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/${contentType}/${movieId}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this ${contentType === 'movie' ? 'movie' : 'TV series'}: ${title}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!", {
        description: "Share link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleShare}
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
      
      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none"
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Copied
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  );
};
