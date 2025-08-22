import React, { useState } from "react";
import { VideoSourceSelector } from "./VideoSourceSelector";
import VideoEmbed from "./VideoEmbed";

interface WatchNowModalProps {
  open: boolean;
  onClose: () => void;
  id: string; // TMDB/IMDB ID (e.g., "tt1234567" or "12345")
  type: "movie" | "tv";
  title?: string;
  season?: number;
  episode?: number;
}

const WatchNowModal: React.FC<WatchNowModalProps> = ({ 
  open, 
  onClose, 
  id, 
  type, 
  title = "Watch Now",
  season,
  episode
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [sourceName, setSourceName] = useState<string>('');
  
  if (!open) return null;

  const handleSourceSelect = (url: string, source: string) => {
    setSelectedSource(url);
    setSourceName(source);
  };

  // Convert string ID to number if it's a TMDB ID, keep as string if IMDB
  const isImdbId = id.startsWith('tt');
  const tmdbId = isImdbId ? undefined : parseInt(id);
  const imdbId = isImdbId ? id : undefined;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1200px",
          height: "90vh",
          background: "hsl(var(--background))",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "1rem",
          borderBottom: "1px solid hsl(var(--border))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "hsl(var(--background))",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
              {title}
            </h2>
            {sourceName && (
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", opacity: 0.7 }}>
                Playing from {sourceName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Video Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedSource ? (
            <div style={{ flex: 1, padding: "1rem" }}>
              <VideoEmbed
                tmdbId={tmdbId}
                imdbId={imdbId}
                type={type}
                title={title}
                season={season}
                episode={episode}
              />
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              padding: "2rem"
            }}>
              <div style={{ width: "100%", maxWidth: "600px" }}>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>Select a video source to watch</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with source switcher */}
        {selectedSource && (
          <div style={{
            padding: "1rem",
            borderTop: "1px solid hsl(var(--border))",
            background: "hsl(var(--muted))",
          }}>
            <button
              onClick={() => setSelectedSource('')}
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Change Source
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchNowModal;
