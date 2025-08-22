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

// <div className="w-full absolute top-0">
//   <LiveVidioComponent videoRef={videoRef} />
// </div>

// import React, { useState, useEffect, useRef } from "react";
// import io from "socket.io-client";
// import "../socket.io/watch";
// import LiveVidioComponent from "./LiveVidioComponent";

// const WebRTCViewer = () => {
//   const [peerConnection, setPeerConnection] = useState(null);
//   const videoRef = useRef(null);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     // Initialize the socket connection
//     socketRef.current = io.connect("https://llive.europainfotech.com/");

//     // When connected to the server, inform the broadcaster that this is a watcher
//     socketRef.current.on("connect", () => {
//       console.log("connert");
//       socketRef.current.emit("watcher"); // Inform the server that we're a watcher
//     });

//     // Listen for an offer from the broadcaster (server will send it to us)
//     socketRef.current.on("offer", (id, description) => {
//       const peerConnection = new RTCPeerConnection(config);

//       // Set the remote description (the offer from the broadcaster)
//       peerConnection
//         .setRemoteDescription(description)
//         .then(() => peerConnection.createAnswer()) // Create an answer to the offer
//         .then((sdp) => peerConnection.setLocalDescription(sdp)) // Set our local description
//         .then(() => {
//           // Send the answer back to the server to complete the handshake
//           socketRef.current.emit("answer", id, peerConnection.localDescription);
//         });

//       // Handle the video stream from the broadcaster
//       peerConnection.ontrack = (event) => {
//         if (videoRef.current) {
//           videoRef.current.srcObject = event.streams[0]; // Set the stream to the video element
//         }
//       };

//       // Handle ICE candidates
//       peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//           socketRef.current.emit("candidate", id, event.candidate); // Send the ICE candidate back
//         }
//       };

//       setPeerConnection(peerConnection);
//     });

//     // Listen for ICE candidates from the broadcaster
//     socketRef.current.on("candidate", (id, candidate) => {
//       if (peerConnection) {
//         peerConnection
//           .addIceCandidate(new RTCIceCandidate(candidate))
//           .catch((e) => console.error("Error adding ICE candidate:", e));
//       }
//     });

//     // Cleanup the peer connection when the component unmounts
//     return () => {
//       socketRef.current.close();
//       peerConnection?.close();
//     };
//   }, []);

//   const config = {
//     iceServers: [
//       {
//         urls: "stun:stun.l.google.com:19302",
//       },
//       // Add TURN server here if needed for NAT traversal
//       // {
//       //   urls: 'turn:TURN_IP?transport=tcp',
//       //   username: 'TURN_USERNAME',
//       //   credential: 'TURN_CREDENTIALS'
//       // }
//     ],
//   };

//   return (
//     <div className="absolute w-full top-0">
//       <LiveVidioComponent videoRef={videoRef} />
//     </div>
//   );
// };

// export default WebRTCViewer;

// // <div className="w-full absolute top-0">
// //   <LiveVidioComponent videoRef={videoRef} />
// // </div>
