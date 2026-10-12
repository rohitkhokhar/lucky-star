import React, { useEffect, useRef, useState } from "react";
import { setupWatcherjombo, stopWatcherjombo } from "../../socket.io/setupWatcherjombo";

const WebRTCViewerJumbo = ({ muted, roomId = "table1" }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (videoRef.current) {
      setupWatcherjombo(videoRef.current, setIsLoading, roomId);
    }

    return () => {
      stopWatcherjombo();
    };
  }, [roomId]);

  return (
    <div className="absolute w-full top-0">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <p className="text-white text-lg">Table is Currently Offline!</p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full object-contain"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
};

export default WebRTCViewerJumbo;  
