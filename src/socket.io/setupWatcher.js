// setupWatcher.js
import { io } from "socket.io-client";
import Peer from "peerjs";

/* =======================
   Utils
======================= */
const log = (...a) => //console.log("[webrtc]", ...a);
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
    config: {
      iceServers: [
        {
          urls: [
            "turn:15.207.116.222:3478?transport=udp",
            "turn:15.207.116.222:3478?transport=tcp",
            "turns:15.207.116.222:5349?transport=tcp",
          ],
          username: "lltest",
          credential: "lltest123",
        },
      ],
    },
  },
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

  return new MediaStream([videoTrack, dst.stream.getAudioTracks()[0]]);
};

/* =======================
   Cleanup
======================= */
const cleanup = () => {
  log("cleanup");
  if (call) call.close();
  if (peer && !peer.destroyed) peer.destroy();
  if (socket) socket.disconnect();

  call = null;
  peer = null;
  socket = null;
  broadcasterId = null;
  peerReady = false;
};

/* =======================
   View Stream
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
    setIsLoading(false);
    socket.emit("viewer-join");
  });

  call.on("close", () => {
    warn("Call closed");
    call = null;
    setIsLoading(true);
    autoReconnect(videoEl, setIsLoading);
  });

  call.on("error", (e) => {
    err("Call error", e);
    call = null;
    setIsLoading(true);
    autoReconnect(videoEl, setIsLoading);
  });
};

const autoReconnect = (videoEl, setIsLoading) => {
  if (!call && broadcasterId) {
    setTimeout(() => startView(videoEl, setIsLoading), 2000);
  }
};

/* =======================
   Init Viewer
======================= */
export const setupWatcher = (videoEl, setIsLoading = () => {}) => {
  if (!videoEl) return;
  cleanup();

  /* ---- Peer ---- */
  peer = new Peer(undefined, {
    ...CONFIG.PEER,
    query: { token: "VIEWER_SECRET_456" },
  });

  peer.on("open", (id) => {
    log("Viewer PeerID:", id);
    peerReady = true;
    if (broadcasterId) startView(videoEl, setIsLoading);
  });

  /* ---- Socket ---- */
  socket = io(CONFIG.SIGNALING_URL, {
    auth: { token: "VIEWER_SECRET_456" },
    transports: ["websocket"],
    reconnection: true,
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
    broadcasterId = null;
    if (call) call.close();
    call = null;
    setIsLoading(true);
  });

  socket.on("disconnect", () => {
    warn("Socket disconnected");
  });

  window.addEventListener("beforeunload", cleanup);
};
