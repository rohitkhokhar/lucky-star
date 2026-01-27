import React, { useEffect, useRef, useState } from "react";
import { setupWatcher } from "../socket.io/setupWatcher";

const WebRTCViewer = ({ muted, roomId }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Setup watcher when roomId changes
  useEffect(() => {
    if (videoRef.current && roomId) {
      setupWatcher(videoRef.current, roomId, setIsLoading);
    }

    return () => {
      // cleanup handled inside setupWatcher
    };
  }, [roomId]);

  return (
    <div className="absolute w-full top-0">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
          <p className="text-white text-lg font-semibold">
            Table is Currently Offline!
          </p>
        </div>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full object-contain"
          style={{ pointerEvents: "none" }}
        />
      </div>
    </div>
  );
};

export default WebRTCViewer;
