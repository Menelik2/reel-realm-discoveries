import React from "react";

interface WatchNowModalProps {
  open: boolean;
  onClose: () => void;
  id: string; // TMDB/IMDB ID (e.g., "tt1234567" or "12345")
  type: "movie" | "tv";
}

const WatchNowModal: React.FC<WatchNowModalProps> = ({ open, onClose, id, type }) => {
  if (!open) return null;

  const embedUrl = `https://vidsrc.cc/v2/embed/${type}/${id}`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "90vw",
          maxWidth: 900,
          height: "60vh",
          background: "#000",
          borderRadius: 8,
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            fontSize: 20,
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          ×
        </button>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="autoplay; fullscreen"
          allowFullScreen
          frameBorder={0}
          title="Watch Now"
        />
      </div>
    </div>
  );
};

export default WatchNowModal;
