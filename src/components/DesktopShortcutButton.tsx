import { useEffect, useState } from 'react';
import { Download, Share, MoreVertical, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type Platform = 'windows' | 'mac' | 'linux' | 'ios' | 'android' | 'other';

const detectPlatform = (): Platform => {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  // iPad on iOS 13+ reports as Mac — disambiguate via touch points
  const isIPadOS =
    /mac/.test(platform) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;

  if (/iphone|ipad|ipod/i.test(ua) || isIPadOS) return 'ios';
  if (/android/i.test(ua)) return 'android';
  if (/win/.test(platform) || /windows/.test(uaLower)) return 'windows';
  if (/mac/.test(platform) || /mac os x/.test(uaLower)) return 'mac';
  if (/linux/.test(platform) || /linux/.test(uaLower)) return 'linux';
  return 'other';
};

const triggerDownload = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const DesktopShortcutButton = () => {
  const [platform, setPlatform] = useState<Platform>('other');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const isMobile = platform === 'ios' || platform === 'android';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const siteName = 'YeniMovie';
  const iconUrl =
    'https://storage.googleapis.com/gpt-engineer-file-uploads/vIuPAmBzPaaU3cZJ99X10uzaJRh2/uploads/1758666660353-photo_2025-04-18_18-49-37.jpg';

  const handleClick = () => {
    if (isMobile) {
      setOpen(true);
      return;
    }
    try {
      if (platform === 'windows') {
        const content = `[InternetShortcut]\r\nURL=${siteUrl}\r\nIconFile=${iconUrl}\r\nIconIndex=0\r\n`;
        triggerDownload(`${siteName}.url`, content, 'application/internet-shortcut');
      } else if (platform === 'mac') {
        const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>URL</key>
\t<string>${siteUrl}</string>
</dict>
</plist>`;
        triggerDownload(`${siteName}.webloc`, content, 'application/xml');
      } else if (platform === 'linux') {
        const content = `[Desktop Entry]
Encoding=UTF-8
Name=${siteName}
Type=Link
URL=${siteUrl}
Icon=${iconUrl}
`;
        triggerDownload(`${siteName}.desktop`, content, 'application/x-desktop');
      } else {
        const content = `[InternetShortcut]\r\nURL=${siteUrl}\r\n`;
        triggerDownload(`${siteName}.url`, content, 'application/internet-shortcut');
      }
      toast.success('Shortcut downloaded', {
        description: 'Drag the file to your Desktop to launch the site in one click.',
      });
    } catch {
      toast.error('Could not create shortcut');
    }
  };

  const label = isMobile ? 'Add to Home' : 'Add to Desktop';
  const Icon = isMobile ? Smartphone : Download;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="inline-flex h-9 gap-2 rounded-full border-primary/30 hover:bg-primary/10 hover:text-primary"
        title={isMobile ? 'Add this site to your home screen' : 'Download a desktop shortcut to this site'}
      >
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={iconUrl} alt="" className="h-6 w-6 rounded" />
              Add {siteName} to your Home Screen
            </DialogTitle>
            <DialogDescription>
              Open the site like a native app — one tap from your home screen.
            </DialogDescription>
          </DialogHeader>

          {platform === 'ios' ? (
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">1</span>
                <span>Open this site in <strong>Safari</strong> (not Chrome or in-app browsers).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">2</span>
                <span className="flex flex-wrap items-center gap-1">
                  Tap the <Share className="inline h-4 w-4" /> <strong>Share</strong> button at the bottom of the screen.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">3</span>
                <span className="flex flex-wrap items-center gap-1">
                  Scroll down and tap <Plus className="inline h-4 w-4" /> <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">4</span>
                <span>Tap <strong>Add</strong> in the top-right corner. Done!</span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">1</span>
                <span>Open this site in <strong>Chrome</strong> (or your default browser).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">2</span>
                <span className="flex flex-wrap items-center gap-1">
                  Tap the <MoreVertical className="inline h-4 w-4" /> <strong>menu</strong> in the top-right corner.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">3</span>
                <span>Tap <strong>Add to Home screen</strong> (or <strong>Install app</strong>).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">4</span>
                <span>Confirm by tapping <strong>Add</strong>. The icon will appear on your home screen.</span>
              </li>
            </ol>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
