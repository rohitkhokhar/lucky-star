import React, { useEffect, useRef, useState } from "react";
import { setupWatcher, stopWatcher } from "../socket.io/setupWatcher";

const WebRTCViewer = ({ muted }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (videoRef.current) {
      setupWatcher(videoRef.current, setIsLoading);
    }

    return () => {
      console.log("🛑 WebRTCViewer unmounted");
      stopWatcher();
    };
  }, []);

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

export default WebRTCViewer;
