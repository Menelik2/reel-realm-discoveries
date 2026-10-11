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
        className="shrink-0 rounded-full h-9 gap-1"
        disabled={isFastPending(messageId)}
        title="Fast Download — streams straight to your browser, no Telegram app needed"
      >
        {isFastPending(messageId) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Fast</span>
      </Button>
    );
  };

  useEffect(() => {
    if (open && tmdbId) {
      fetchDownloadData();
      setSearchTerm('');
    }
  }, [open, tmdbId, contentType, imdbId, title]);

  const fetchDownloadData = async () => {
    setLoading(true);
    try {
      const result = await getDownloadLinks(tmdbId, contentType, title, imdbId);
      setDownloadData(result);

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
      .filter(([_, links]) => {
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
    const sizes: Record<string, string[]> = {
      '480p': ['650 MB', '800 MB', '950 MB'],
      '720p': ['1.2 GB', '1.5 GB', '1.8 GB'],
      '1080p': ['2.1 GB', '2.8 GB', '3.2 GB'],
      '1440p': ['4.5 GB', '5.2 GB', '6.1 GB'],
      '2160p': ['8.2 GB', '12.5 GB', '15.8 GB']
    };

    const format = formats[index % formats.length];
    const codec = codecs[index % codecs.length];
    const group = groups[index % groups.length];
    const sizeOptions = sizes[quality] || sizes['720p'];
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
        <Alert className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No download links available for this content.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1 rounded-2xl bg-secondary/50 mb-4">
            {availableQualities.map(quality => {
              const validLinks = getValidLinks(downloadData.categories![quality] || []);
              return (
                <TabsTrigger
                  key={quality}
                  value={quality}
                  className="rounded-xl flex-1 min-w-[4.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  {quality}
                  <Badge variant="secondary" className="ml-1.5 text-[10px] h-5 px-1.5 rounded-full bg-background/60">
                    {validLinks.length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files (e.g. BluRay, WEB-DL)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-full bg-secondary/40 border-border/50"
            />
          </div>

          {availableQualities.map(quality => {
            const validLinks = getValidLinks(downloadData.categories![quality] || []);

            return (
              <TabsContent key={quality} value={quality} className="space-y-2 mt-0">
                {validLinks.length === 0 ? (
                  <Alert className="rounded-2xl">
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
                        className="flex items-center justify-between gap-3 p-3.5 border border-border/50 rounded-2xl bg-card/50 hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{format}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground font-medium tabular-nums hidden sm:inline">{size}</span>
                          {renderFastDownloadButton(link, name)}
                          <Button
                            onClick={() => handleLinkClick(link)}
                            size="sm"
                            className="rounded-full h-9 gap-1.5 shadow-sm shadow-primary/20"
                          >
                            <Download className="h-4 w-4" />
                            {isMobile && <span>Download</span>}
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
        <Alert className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {downloadData?.error || 'No download links available for this TV series.'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm tracking-tight">
            Series download links
          </h4>
          <Badge variant="secondary" className="text-[10px] rounded-full">
            {downloadData.downloadLinks.length}
          </Badge>
        </div>

        {isMobile && (
          <Alert className="rounded-2xl border-border/50 bg-secondary/30">
            <AlertDescription className="text-sm text-muted-foreground">
              Tap Download to open Telegram and access the series files. Telegram app is required for standard downloads.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {downloadData.downloadLinks.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 p-3.5 border border-border/50 rounded-2xl bg-card/50 hover:bg-accent/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Access via Telegram</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {renderFastDownloadButton(item.url, `${title} ${item.label}`)}
                <Button
                  onClick={() => handleLinkClick(item.url)}
                  size="sm"
                  variant="outline"
                  className="rounded-full h-9 gap-1.5 border-border/50"
                >
                  {isMobile ? (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl border-border/50 p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Download className="h-4.5 w-4.5 text-primary" style={{ width: 18, height: 18 }} />
            </div>
            <span className="truncate">Download {title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {contentType === 'tv' ? 'Fetching series information…' : 'Fetching download links…'}
              </span>
            </div>
          ) : downloadData?.error && (!downloadData.downloadLinks || downloadData.downloadLinks.length === 0) ? (
            <Alert variant="destructive" className="rounded-2xl">
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
