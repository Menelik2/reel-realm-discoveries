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
  contentType?: 'movie' | 'tv';
  imdbId?: string;
}

const DownloadModal = ({ open, onClose, tmdbId, title, contentType = 'movie', imdbId }: DownloadModalProps) => {
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
      const result = await getDownloadLinks(tmdbId, contentType, title, imdbId);
      setDownloadData(result);
    } catch (error) {
      console.error('Error fetching download links:', error);
      setDownloadData({
        tmdbId,
        type: contentType,
        categories: contentType === 'movie' ? {} : undefined,
        downloadLinks: contentType === 'tv' ? [] : undefined,
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

    // Handle TV series with direct download links
    if (downloadData.type === 'tv' && downloadData.downloadLinks) {
      if (downloadData.downloadLinks.length === 0) {
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No download links available for this TV series.</AlertDescription>
          </Alert>
        );
      }

      return (
        <div className="space-y-4">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            TV SERIES DOWNLOAD LINKS
          </h4>
          <div className="space-y-2">
            {downloadData.downloadLinks.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleLinkClick(link)}
                className="w-full justify-start"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Telegram Channel
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // Handle movies with quality categories
    if (downloadData.type === 'movie' && downloadData.categories) {
      // Filter available categories and order them: 480p, 720p, 1080p
      const preferredOrder = ['480p', '720p', '1080p'];
      const availableCategories = Object.entries(downloadData.categories)
        .filter(([category, links]) => {
          if (!links || !Array.isArray(links)) return false;
          return links.some(link => 
            link !== 'No links available' && 
            link !== 'No message_id found' && 
            link !== 'API Error - Please try again' &&
            link.startsWith('https://telegram.dog/Phonofilmbot?start=')
          );
        })
        .sort(([a], [b]) => {
          const indexA = preferredOrder.indexOf(a);
          const indexB = preferredOrder.indexOf(b);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

      if (availableCategories.length === 0) {
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No download links available for this content.</AlertDescription>
          </Alert>
        );
      }

      return (
        <div className="space-y-4">
          {availableCategories.map(([category, links]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                {category.toUpperCase()}
              </h4>
              <div className="space-y-2">
                {Array.isArray(links) && links
                  .filter(link => 
                    link !== 'No links available' && 
                    link !== 'No message_id found' && 
                    link !== 'API Error - Please try again' &&
                    link.startsWith('https://telegram.dog/Phonofilmbot?start=')
                  )
                  .map((link, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkClick(link)}
                      className="w-full justify-start"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Option {index + 1}
                    </Button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No download data available.</AlertDescription>
      </Alert>
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
                {contentType === 'tv' ? 'Fetching series information...' : 'Fetching download links...'}
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