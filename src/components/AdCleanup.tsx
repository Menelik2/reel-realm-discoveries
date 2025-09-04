import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { adManager } from '@/utils/adManager';

export const AdCleanup = () => {
  const location = useLocation();

  useEffect(() => {
    // Cleanup ads when route changes
    console.log('Route changed, cleaning up ads...');
    adManager.forceReset();
  }, [location.pathname]);

  return null;
};