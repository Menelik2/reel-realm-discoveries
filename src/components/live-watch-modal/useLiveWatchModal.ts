import { useEffect } from 'react';
import { Season } from './types';

interface UseLiveWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasSeasons: boolean;
  seasons: Season[];
  setCurrentSeason: (season: Season | null) => void;
  setSelectedSeasonNumber: (num: number | undefined) => void;
  setSelectedEpisodeNumber: (num: number | undefined) => void;
  setSelectedSource: (source: string) => void;
}

export const useLiveWatchModal = ({
  isOpen,
  onClose,
  hasSeasons,
  seasons,
  setCurrentSeason,
  setSelectedSeasonNumber,
  setSelectedEpisodeNumber,
  setSelectedSource,
}: UseLiveWatchModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('dark');
      document.body.style.overflow = 'hidden';
      if (hasSeasons) {
        const validSeasons = seasons.filter(s => s.season_number > 0);
        const initialSeason = validSeasons[0];
        if (initialSeason) {
          setCurrentSeason(initialSeason);
          setSelectedSeasonNumber(initialSeason.season_number);
          setSelectedEpisodeNumber(1);
        }
      }
      setSelectedSource('https://vidsrc.cc/v2/embed/');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.overflow = 'unset';
      setSelectedSeasonNumber(undefined);
      setSelectedEpisodeNumber(undefined);
      setCurrentSeason(null);
    }
    return () => { 
      document.documentElement.classList.remove('dark');
      document.body.style.overflow = 'unset'; 
    };
  }, [isOpen, hasSeasons, seasons, setCurrentSeason, setSelectedSeasonNumber, setSelectedEpisodeNumber, setSelectedSource]);
};
