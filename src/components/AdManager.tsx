import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PopupAd } from './PopupAd';
import { InterstitialAd } from './InterstitialAd';
import { useAdFreeStatus } from '@/hooks/useAdFreeStatus';

export const AdManager = () => {
  const location = useLocation();
  const { data: isAdFree } = useAdFreeStatus();
  const [showPopup, setShowPopup] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pageViews, setPageViews] = useState(0);

  // Track page views for interstitial ads
  useEffect(() => {
    if (!isAdFree) {
      const currentViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
      setPageViews(currentViews);
      localStorage.setItem('pageViews', currentViews.toString());

      // Show interstitial every 3 page views
      if (currentViews % 3 === 0) {
        setShowInterstitial(true);
      }
    }
  }, [location.pathname, isAdFree]);

  const handleInterstitialContinue = () => {
    setShowInterstitial(false);
  };

  const handleInterstitialClose = () => {
    setShowInterstitial(false);
  };

  if (isAdFree) return null;

  return (
    <>
      {/* Popup ad with delay */}
      <PopupAd delay={15} onClose={() => setShowPopup(false)} />
      
      {/* Interstitial ad */}
      {showInterstitial && (
        <InterstitialAd
          onContinue={handleInterstitialContinue}
          onClose={handleInterstitialClose}
        />
      )}
    </>
  );
};