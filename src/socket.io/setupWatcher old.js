// setupWatcher.js
import { io } from "socket.io-client";
import Peer from "peerjs";

let roomId = null;
let call = null;
let isStream = false;
let peer = null;
let socket = null;
let peerReady = false;

/**
 * Create a silent dummy MediaStream (black video + muted audio)
 */
const createSilentStream = (videoElement) => {
  const width = videoElement?.clientWidth || 640;
  const height = videoElement?.clientHeight || 480;

  // Silent audio
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const dst = oscillator.connect(audioCtx.createMediaStreamDestination());
  oscillator.start();
  const audioTrack = Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });

  // Black video
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  const videoTrack = Object.assign(canvas.captureStream().getVideoTracks()[0], { enabled: false });

  return new MediaStream([audioTrack, videoTrack]);
};

const cleanup = () => {
  if (call) {
    call.close();
    call = null;
  }
  if (peer && !peer.destroyed) {
    peer.destroy();
    peer = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  peerReady = false;
  isStream = false;
  roomId = null;
};

/**
 * Initialize viewer
 */
export const setupWatcher = (videoElement, setIsLoading = () => { }) => {
  if (!videoElement) return;

  cleanup();

  // Setup PeerJS
  peer = new Peer(undefined, {
    host: "llive-stream.liveluckystar.com",
    path: "/peerjs",
    secure: true,
    debug: 1,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    },
  });

  peer.on("open", (id) => {
    //console.log("[webrtc] Viewer peer id:", id);
    peerReady = true;
    // If broadcast already started, join now
    if (roomId && !isStream) {
      ViewStream(videoElement, setIsLoading);
    }
  });

  // Setup socket
  socket = io("https://llive-stream-socket.liveluckystar.com", {
    transports: ["websocket"],
    reconnection: true,
  });

  socket.on("connect", () => {
    //console.log("[webrtc] Socket connected");
    socket.emit("viwer_connected", {});
  });

  socket.on("broadcast_started", (room) => {
    //console.log("[webrtc] Broadcast started:", room, new Date());
    roomId = room;
    if (peerReady && !isStream) {
      ViewStream(videoElement, setIsLoading);
    }
  });

  socket.on("broadcast_disconnect", () => {
    //console.log("[webrtc] Broadcast disconnected");
    videoElement.srcObject = createSilentStream(videoElement);
    if (call) call.close();
    call = null;
    setIsLoading(true);
  });

  socket.on("disconnect", () => {
    //console.log("[webrtc] Socket disconnected");
  });

  window.addEventListener("beforeunload", () => {
    cleanup();
  });
};

/**
 * Start receiving broadcast stream
 */
const ViewStream = (videoElement, setIsLoading) => {
  if (!roomId || !peerReady) {
    console.warn("[webrtc] Waiting for peer/broadcast...");
    return;
  }

  if (call) {
    console.error("[webrtc] Call already exists");
    return;
  }

  const stream = createSilentStream(videoElement);
  call = peer.call(roomId, stream);
  isStream = true;
  setIsLoading(false);

  call.on("stream", (remoteStream) => {
    //console.log("[webrtc] Remote stream received");
    videoElement.srcObject = remoteStream;
    videoElement.muted = true;

    videoElement.play().catch((err) => {
      console.warn("[webrtc] autoplay failed:", err);
    });

    const peerIds = call.connectionId + "|" + call.peer;
    socket.emit("viewer_call_connected", peerIds);
  });

  call.on("close", () => {
    //console.log("[webrtc] Viewer call closed");
    isStream = false;
    setIsLoading(true);
    // 🔁 retry in case broadcaster still active
    setTimeout(() => {
      if (roomId && peerReady) {
        ViewStream(videoElement, setIsLoading);
      }
    }, 3000);
  });

  call.on("error", (err) => {
    console.error("[webrtc] Call error:", err);
    isStream = false;
    setIsLoading(true);
    // 🔁 retry after error
    setTimeout(() => {
      if (roomId && peerReady) {
        ViewStream(videoElement, setIsLoading);
      }
    }, 3000);
  });
};
