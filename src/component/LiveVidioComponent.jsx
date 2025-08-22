import React from "react";
import BgStatic from "../assets/bgstatic.png";

const LiveVidioComponent = ({ videoRef }) => {
  return (
    <div className="relative w-full">
      {/* Background Image */}
      {/* <img
        src={BgStatic}
        alt="Background"
        className="absolute w-full h-full object-cover"
      /> */}

      {/* WebRTC Video Feed */}
      <video
        ref={videoRef}
        id="video"
        autoPlay
        playsInline
        muted
        className="absolute w-full object-contain"
      />
    </div>
  );
};

export default LiveVidioComponent;
