import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type OS = 'windows' | 'mac' | 'linux' | 'other';

const detectOS = (): OS => {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();
  if (/win/.test(platform) || /windows/.test(ua)) return 'windows';
  if (/mac/.test(platform) || /mac os x/.test(ua)) return 'mac';
  if (/linux/.test(platform) || /linux/.test(ua)) return 'linux';
  return 'other';
};

const isDesktopUA = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return !isMobile;
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
  const [show, setShow] = useState(false);
  const [os, setOs] = useState<OS>('other');

  useEffect(() => {
    const desktop = isDesktopUA() && window.matchMedia('(min-width: 768px)').matches;
    setShow(desktop);
    setOs(detectOS());
  }, []);

  if (!show) return null;

  const siteUrl = window.location.origin;
  const siteName = 'YeniMovie';
  const iconUrl =
    'https://storage.googleapis.com/gpt-engineer-file-uploads/vIuPAmBzPaaU3cZJ99X10uzaJRh2/uploads/1758666660353-photo_2025-04-18_18-49-37.jpg';

  const handleDownload = () => {
    try {
      if (os === 'windows') {
        const content = `[InternetShortcut]\r\nURL=${siteUrl}\r\nIconFile=${iconUrl}\r\nIconIndex=0\r\n`;
        triggerDownload(`${siteName}.url`, content, 'application/internet-shortcut');
      } else if (os === 'mac') {
        const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>URL</key>
\t<string>${siteUrl}</string>
</dict>
</plist>`;
        triggerDownload(`${siteName}.webloc`, content, 'application/xml');
      } else if (os === 'linux') {
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
    } catch (err) {
      toast.error('Could not create shortcut');
    }
  };

  const label =
    os === 'mac' ? 'Add to Desktop' : os === 'linux' ? 'Add to Desktop' : 'Add to Desktop';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className="hidden md:inline-flex h-9 gap-2 rounded-full border-primary/30 hover:bg-primary/10 hover:text-primary"
      title="Download a desktop shortcut to this site"
    >
      <Download className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
};
