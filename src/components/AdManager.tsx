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
  const [popupTriggered, setPopupTriggered] = useState(false);

  // Track page views for ads
  useEffect(() => {
    if (!isAdFree) {
      const currentViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
      setPageViews(currentViews);
      localStorage.setItem('pageViews', currentViews.toString());

      // Show interstitial every 3 page views
      if (currentViews % 3 === 0) {
        setShowInterstitial(true);
      }

      // Trigger popup on first page view or after certain intervals
      if (!popupTriggered && (currentViews === 1 || currentViews % 5 === 0)) {
        setPopupTriggered(true);
        setShowPopup(true);
      }
    }
  }, [location.pathname, isAdFree, popupTriggered]);

  const handlePopupClose = () => {
    setShowPopup(false);
    // Reset trigger after some time
    setTimeout(() => setPopupTriggered(false), 30000); // Reset after 30 seconds
  };

  const handleInterstitialContinue = () => {
    setShowInterstitial(false);
  };

  const handleInterstitialClose = () => {
    setShowInterstitial(false);
  };

  if (isAdFree) return null;

  return (
    <>
      {/* Popup ad - only show when triggered */}
      {showPopup && (
        <PopupAd delay={5} onClose={handlePopupClose} />
      )}
      
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