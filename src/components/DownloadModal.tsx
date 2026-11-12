import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, ExternalLink, AlertCircle, Search, Zap } from 'lucide-react';
import { getDownloadLinks, type DownloadResult, type DownloadFile } from '@/api/downloadService';
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
  year?: string;
}

const isTelegramUrl = (link: string) =>
  /^https?:\/\/(?:t\.me|telegram\.dog|telegram\.me)\//i.test(link);

const DownloadModal = ({
  open,
  onClose,
  tmdbId,
  title,
  contentType = 'movie',
  imdbId,
  year,
}: DownloadModalProps) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tmdbId, contentType, imdbId, title, year]);

  const fetchDownloadData = async () => {
    setLoading(true);
    try {
      const result = await getDownloadLinks(tmdbId, contentType, title, imdbId, year);
      setDownloadData(result);

      if (result.type === 'movie') {
        const qualities = getAvailableQualities(result);
        if (qualities.length > 0) setActiveTab(qualities[0]);
      }
    } catch (error) {
      console.error('Error fetching download links:', error);
      setDownloadData({
        tmdbId,
        type: contentType,
        categories: contentType === 'movie' ? {} : undefined,
        downloadLinks: contentType === 'tv' ? [] : undefined,
        error: 'Failed to fetch download links',
      });
    } finally {
      setLoading(false);
    }
  };

  const preferredOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p'];

  const getAvailableQualities = (result: DownloadResult) => {
    if (result.filesByQuality) {
      return Object.entries(result.filesByQuality)
        .filter(([, files]) => files && files.length > 0)
        .sort(([a], [b]) => {
          const ia = preferredOrder.indexOf(a);
          const ib = preferredOrder.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        })
        .map(([q]) => q);
    }

    if (!result.categories) return [];
    return Object.entries(result.categories)
      .filter(([_, links]) => {
        if (!links || !Array.isArray(links)) return false;
        return links.some(
          (link) =>
            link !== 'No links available' &&
            link !== 'No message_id found' &&
            link !== 'API Error - Please try again' &&
            isTelegramUrl(link),
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

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderFileRow = (file: DownloadFile, index: number) => (
    <div
      key={`${file.url}-${index}`}
      className="flex items-center justify-between gap-3 p-3.5 border border-border/50 rounded-2xl bg-card/50 hover:bg-accent/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-1.5">
          <span>{file.format}</span>
          {file.language && file.language !== 'English' && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{file.language}</span>
            </>
          )}
          {file.isHdr && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-amber-500 font-medium">HDR</span>
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {file.size && (
          <span className="text-xs text-muted-foreground font-medium tabular-nums hidden sm:inline">
            {file.size}
          </span>
        )}
        {renderFastDownloadButton(file.url, file.name)}
        <Button
          onClick={() => handleLinkClick(file.url)}
          size="sm"
          className="rounded-full h-9 gap-1.5 shadow-sm shadow-primary/20"
        >
          <Download className="h-4 w-4" />
          {isMobile && <span>Download</span>}
        </Button>
      </div>
    </div>
  );

  const renderMovieDownloads = () => {
    if (!downloadData) return null;

    const availableQualities = getAvailableQualities(downloadData);

    if (availableQualities.length === 0) {
      return (
        <Alert className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {downloadData.error || 'No download links available for this content.'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1 rounded-2xl bg-secondary/50 mb-4">
            {availableQualities.map((quality) => {
              const count =
                downloadData.filesByQuality?.[quality]?.length ??
                (downloadData.categories?.[quality] || []).filter(isTelegramUrl).length;
              return (
                <TabsTrigger
                  key={quality}
                  value={quality}
                  className="rounded-xl flex-1 min-w-[4.5rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  {quality}
                  <Badge
                    variant="secondary"
                    className="ml-1.5 text-[10px] h-5 px-1.5 rounded-full bg-background/60"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files (e.g. BluRay, WEB-DL, Pahe)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-full bg-secondary/40 border-border/50"
            />
          </div>

          {availableQualities.map((quality) => {
            const richFiles = downloadData.filesByQuality?.[quality] || [];
            const term = searchTerm.trim().toLowerCase();

            if (richFiles.length > 0) {
              const filtered = term
                ? richFiles.filter(
                    (f) =>
                      f.name.toLowerCase().includes(term) ||
                      f.format.toLowerCase().includes(term) ||
                      f.language.toLowerCase().includes(term),
                  )
                : richFiles;

              return (
                <TabsContent key={quality} value={quality} className="space-y-2 mt-0">
                  {filtered.length === 0 ? (
                    <Alert className="rounded-2xl">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No files match “{searchTerm}”.</AlertDescription>
                    </Alert>
                  ) : (
                    filtered.map((file, index) => renderFileRow(file, index))
                  )}
                </TabsContent>
              );
            }

            // Legacy URL-only fallback
            const links = (downloadData.categories?.[quality] || []).filter(isTelegramUrl);
            return (
              <TabsContent key={quality} value={quality} className="space-y-2 mt-0">
                {links.length === 0 ? (
                  <Alert className="rounded-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No download links available for {quality}.</AlertDescription>
                  </Alert>
                ) : (
                  links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-3.5 border border-border/50 rounded-2xl bg-card/50 hover:bg-accent/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {title} {quality}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Telegram</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {renderFastDownloadButton(link, `${title} ${quality}`)}
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
          <h4 className="font-semibold text-sm tracking-tight">Series download links</h4>
          <Badge variant="secondary" className="text-[10px] rounded-full">
            {downloadData.downloadLinks.length}
          </Badge>
        </div>

        {isMobile && (
          <Alert className="rounded-2xl border-border/50 bg-secondary/30">
            <AlertDescription className="text-sm text-muted-foreground">
              Tap Download to open Telegram and access the series files. Telegram app is required for
              standard downloads.
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
          ) : downloadData?.error &&
            (!downloadData.downloadLinks || downloadData.downloadLinks.length === 0) &&
            (!downloadData.filesByQuality ||
              Object.values(downloadData.filesByQuality).every((a) => !a?.length)) ? (
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
