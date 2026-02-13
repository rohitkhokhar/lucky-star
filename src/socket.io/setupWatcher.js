// setupWatcher.js
import { io } from "socket.io-client";
import Peer from "peerjs";

/* =======================
   Utils
======================= */
const log = (...a) => console.log("[webrtc]", ...a);
const warn = (...a) => console.warn("[webrtc]", ...a);
const err = (...a) => console.error("[webrtc]", ...a);

/* =======================
   Config
======================= */
const CONFIG = {
  SIGNALING_URL: "https://llive-stream-socket.liveluckystar.com",
  PEER: {
    host: "llive-stream.liveluckystar.com",
    path: "/peerjs",
    secure: true,
    query: { token: "VIEWER_SECRET_456" },
    config: {
      iceServers: [{
        urls: [
          "turn:52.66.68.225:3478?transport=udp",
          "turn:52.66.68.225:3478?transport=tcp",
          "turns:52.66.68.225:5349?transport=tcp"
        ],
        username: "lltest",
        credential: "lltest123"
      }]
    }
  }
};

/* =======================
   Globals
======================= */
let socket = null;
let peer = null;
let call = null;
let broadcasterId = null;
let peerReady = false;

/* =======================
   Dummy Stream
======================= */
const createDummyStream = (videoEl) => {
  const width = videoEl?.clientWidth || 640;
  const height = videoEl?.clientHeight || 480;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  const videoTrack = canvas.captureStream(1).getVideoTracks()[0];

  const audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const dst = osc.connect(audioCtx.createMediaStreamDestination());
  osc.start();

  return new MediaStream([
    videoTrack,
    dst.stream.getAudioTracks()[0]
  ]);
};

/* =======================
   STOP WATCHER (🔥 IMPORTANT)
======================= */
export const stopWatcher = () => {
  log("🛑 Stopping WebRTC watcher");

  if (call) {
    call.close();
    call = null;
  }

  if (peer && !peer.destroyed) {
    peer.destroy();
    peer = null;
  }

  if (socket) {
    socket.emit("viewer-leave");
    socket.disconnect();
    socket = null;
  }

  broadcasterId = null;
  peerReady = false;
};

/* =======================
   Start View
======================= */
const startView = (videoEl, setIsLoading) => {
  if (!broadcasterId || !peerReady || call) return;

  log("Calling broadcaster:", broadcasterId);
  setIsLoading(true);

  call = peer.call(broadcasterId, createDummyStream(videoEl));

  call.on("stream", (stream) => {
    log("Remote stream received");
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.play().catch(() => {});
    socket.emit("viewer-join");
    setIsLoading(false);
  });

  call.on("close", () => {
    warn("Call closed");
    stopWatcher();
    setIsLoading(true);
  });

  call.on("error", (e) => {
    err("Call error", e);
    stopWatcher();
    setIsLoading(true);
  });
};

/* =======================
   Setup Watcher
======================= */
export const setupWatcher = (videoEl, setIsLoading = () => {}) => {
  if (!videoEl) return;

  stopWatcher(); // cleanup old connection

  /* ---- Peer ---- */
  peer = new Peer(undefined, CONFIG.PEER);

  peer.on("open", (id) => {
    log("Viewer PeerID:", id);
    peerReady = true;
    if (broadcasterId) startView(videoEl, setIsLoading);
  });

  /* ---- Socket ---- */
  socket = io(CONFIG.SIGNALING_URL, {
    auth: { token: "VIEWER_SECRET_456" },
    transports: ["websocket"],
    reconnection: true
  });

  socket.on("connect", () => {
    log("Socket connected");
    socket.emit("viwer_connected", {});
  });

  socket.on("broadcast-started", (id) => {
    log("Broadcast started:", id);
    broadcasterId = id;
    if (peerReady) startView(videoEl, setIsLoading);
  });

  socket.on("broadcast-stopped", () => {
    warn("Broadcast stopped");
    stopWatcher();
    setIsLoading(true);
  });

  socket.on("disconnect", () => {
    warn("Socket disconnected");
  });

  window.addEventListener("beforeunload", stopWatcher);
};
