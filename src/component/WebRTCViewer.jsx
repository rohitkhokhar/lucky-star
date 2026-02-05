import React, { useEffect, useRef, useState } from "react";
import { setupWatcher } from "../socket.io/setupWatcher";

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
      // Pass video element to setupWatcher
      setupWatcher(videoRef.current, setIsLoading);
    }
  }, []);


  // Optional: Update video/canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (videoRef.current) {
        // Force re-setup watcher to update canvas size
        setupWatcher(videoRef.current, setIsLoading);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute w-full top-0">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <p className="text-white text-lg">Table is Currently Offline!</p>
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