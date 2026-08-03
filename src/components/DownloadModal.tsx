import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, ExternalLink, AlertCircle, Search, Zap } from 'lucide-react';
import { getDownloadLinks, type DownloadResult } from '@/api/downloadService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdFreeStatus } from '@/hooks/useAdFreeStatus';
import { useFastDownload, extractMessageId } from '@/hooks/useFastDownload';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const isMobile = useIsMobile();
  const { data: isPremium } = useAdFreeStatus();
  const { start: startFastDownload, isPending: isFastPending } = useFastDownload();

  const renderFastDownloadButton = (telegramUrl: string, fileName: string) => {
    if (!isPremium) return null;
    const messageId = extractMessageId(telegramUrl);
    if (!messageId) return null;
    return (
      <Button
        onClick={() => startFastDownload({ messageId, fileName })}
        size="sm"
        variant="secondary"
        className="shrink-0"
        disabled={isFastPending(messageId)}
        title="Fast Download — streams straight to your browser, no Telegram app needed"
      >
        {isFastPending(messageId) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        <span className="hidden sm:inline ml-1">Fast</span>
      </Button>
    );
  };

  useEffect(() => {
    if (open && tmdbId) {
      fetchDownloadData();
      setSearchTerm('');
    }
  }, [open, tmdbId]);

  const fetchDownloadData = async () => {
    setLoading(true);
    try {
      const result = await getDownloadLinks(tmdbId, contentType, title, imdbId);
      setDownloadData(result);
      
      // Set default active tab
      if (result.type === 'movie' && result.categories) {
        const availableQualities = getAvailableQualities(result.categories);
        if (availableQualities.length > 0) {
          setActiveTab(availableQualities[0]);
        }
      }
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

  const getAvailableQualities = (categories: { [key: string]: string[] }) => {
    const preferredOrder = ['480p', '720p', '1080p', '1440p', '2160p'];
    return Object.entries(categories)
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
      })
      .map(([category]) => category);
  };

  const getValidLinks = (links: string[]) => {
    return links.filter(link => 
      link !== 'No links available' && 
      link !== 'No message_id found' && 
      link !== 'API Error - Please try again' &&
      link.startsWith('https://telegram.dog/Phonofilmbot?start=')
    );
  };

  const generateFileInfo = (quality: string, index: number) => {
    const formats = ['WEBRip', 'BluRay', 'WEB-DL', 'HDTV'];
    const codecs = ['x264', 'x265', 'HEVC'];
    const groups = ['RARBG', 'YTS', 'ETRG', 'FGT'];
    const sizes = {
      '480p': ['650 MB', '800 MB', '950 MB'],
      '720p': ['1.2 GB', '1.5 GB', '1.8 GB'],
      '1080p': ['2.1 GB', '2.8 GB', '3.2 GB'],
      '1440p': ['4.5 GB', '5.2 GB', '6.1 GB'],
      '2160p': ['8.2 GB', '12.5 GB', '15.8 GB']
    };
    
    const format = formats[index % formats.length];
    const codec = codecs[index % codecs.length];
    const group = groups[index % groups.length];
    const sizeOptions = sizes[quality as keyof typeof sizes] || sizes['720p'];
    const size = sizeOptions[index % sizeOptions.length];
    
    return {
      name: `${title} ${quality} ${format} ${codec} [${group}]`,
      size,
      format: `${format} ${codec}`
    };
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderMovieDownloads = () => {
    if (!downloadData?.categories) return null;
    
    const availableQualities = getAvailableQualities(downloadData.categories);
    
    if (availableQualities.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No download links available for this content.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {availableQualities.map(quality => {
              const validLinks = getValidLinks(downloadData.categories![quality] || []);
              return (
                <TabsTrigger key={quality} value={quality} className="flex items-center gap-2">
                  {quality}
                  <Badge variant="secondary" className="text-xs">
                    {validLinks.length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files (e.g. BluRay, WEB-DL)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {availableQualities.map(quality => {
            const validLinks = getValidLinks(downloadData.categories![quality] || []);
            
            return (
              <TabsContent key={quality} value={quality} className="space-y-2 mt-0">
                {validLinks.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No download links available for {quality}.</AlertDescription>
                  </Alert>
                ) : (
                  validLinks
                    .map((link, index) => {
                      const fileInfo = generateFileInfo(quality, index);
                      return { ...fileInfo, link, index };
                    })
                    .filter(item => 
                      searchTerm === '' || 
                      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.format.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(({ name, size, format, link, index }) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{name}</p>
                          <p className="text-xs text-muted-foreground">{format}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="text-sm text-muted-foreground font-mono">{size}</span>
                          {renderFastDownloadButton(link, name)}
                          <Button
                            onClick={() => handleLinkClick(link)}
                            size="sm"
                            className="shrink-0"
                          >
                            {isMobile ? (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </>
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
  };

  const renderTVDownloads = () => {
    if (!downloadData?.downloadLinks || downloadData.downloadLinks.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No download links available for this TV series.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            TV SERIES DOWNLOAD LINKS
          </h4>
          <Badge variant="secondary" className="text-xs">
            {downloadData.downloadLinks.length}
          </Badge>
        </div>
        
        {isMobile && (
          <Alert className="mb-4">
            <AlertDescription className="text-sm">
              Click Download to open Telegram and access the series files. You'll need Telegram app to download.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          {downloadData.downloadLinks.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-medium text-sm truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground">Access via Telegram</p>
              </div>
              <div className="flex items-center gap-2">
              {renderFastDownloadButton(item.url, `${title} ${item.label}`)}
              <Button
                onClick={() => handleLinkClick(item.url)}
                size="sm"
                variant="outline"
              >
                {isMobile ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                {contentType === 'tv' ? 'Fetching series information...' : 'Fetching download links...'}
              </span>
            </div>
          ) : downloadData?.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{downloadData.error}</AlertDescription>
            </Alert>
          ) : contentType === 'tv' ? (
            renderTVDownloads()
          ) : (
            renderMovieDownloads()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;