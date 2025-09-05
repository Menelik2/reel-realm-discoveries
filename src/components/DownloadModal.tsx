import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { getDownloadLinks, type DownloadResult } from '@/api/downloadService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  tmdbId: string;
  title: string;
}

const DownloadModal = ({ open, onClose, tmdbId, title }: DownloadModalProps) => {
  const [downloadData, setDownloadData] = useState<DownloadResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tmdbId) {
      fetchDownloadData();
    }
  }, [open, tmdbId]);

  const fetchDownloadData = async () => {
    setLoading(true);
    try {
      const result = await getDownloadLinks(tmdbId);
      setDownloadData(result);
    } catch (error) {
      console.error('Error fetching download links:', error);
      setDownloadData({
        tmdbId,
        type: 'movie',
        categories: {},
        error: 'Failed to fetch download links'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderDownloadLinks = () => {
    if (!downloadData) return null;

    if (downloadData.error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{downloadData.error}</AlertDescription>
        </Alert>
      );
    }

    // Handle categories with message IDs
    const categories = Object.entries(downloadData.categories);
    if (categories.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No download links available for this content.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {categories.map(([category, links]) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              {category === 'top' ? 'Best Quality' : category.toUpperCase()}
            </h4>
            <div className="space-y-2">
              {Array.isArray(links) ? (
                links.map((link, index) => (
                  <div key={index}>
                    {link === 'No message_id found' ? (
                      <p className="text-sm text-muted-foreground">No links available</p>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkClick(link)}
                        className="w-full justify-start"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Option {index + 1}
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkClick(links)}
                  className="w-full justify-start"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Fetching download links...
              </span>
            </div>
          ) : (
            renderDownloadLinks()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;