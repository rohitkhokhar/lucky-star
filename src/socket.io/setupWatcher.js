import { io } from "socket.io-client";
import Peer from "peerjs";

/* =========================
   Base CONFIG (same format)
========================= */
const log = (...a) => console.log("[webrtc]", ...a);
const warn = (...a) => console.warn("[webrtc]", ...a);
const err = (...a) => console.error("[webrtc]", ...a);

const BASE_CONFIG = {
  SIGNALING_URL: "https://llive-stream-socket.liveluckystar.com",
  PEER: {
    host: "llive-stream.liveluckystar.com",
    path: "/peerjs",
    secure: true,
    query: { token: "VIEWER_SECRET_456" },
    config: {
      iceServers: [
        {
          urls: [
            "turn:52.66.68.225:3478?transport=udp",
            "turn:52.66.68.225:3478?transport=tcp",
            "turns:52.66.68.225:5349?transport=tcp"
          ],
          username: "lltest",
          credential: "lltest123"
        }
      ]
    }
  }
};

/* =========================
   Table Config Override
========================= */

const TABLE_CONFIG = {
  table1: {
    SIGNALING_URL: "https://llive-stream-socket.liveluckystar.com",
    PEER_HOST: "llive-stream.liveluckystar.com"
  },
  table2: {
    SIGNALING_URL: "https://llive-stream-table2-socket.liveluckystar.com",
    PEER_HOST: "llive-stream-table2.liveluckystar.com"
  }
};

/* =========================
   Globals
========================= */
let socket = null;
let peer = null;
let call = null;
let broadcasterId = null;
let peerReady = false;
let is_call = false;

/* =========================
   Dummy Stream
========================= */

const createDummyStream = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 640, 480);

  const stream = canvas.captureStream(1);
  return stream;
};

/* =========================
   Cleanup
========================= */

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

  broadcasterId = null;
  peerReady = false;
};

/* =========================
   Stop Watcher
========================= */

export const stopWatcher = () => {
  if (socket) {
    socket.emit("viewer-leave");
  }

  cleanup();
};

/* =========================
   Start View
========================= */

const startView = (videoEl, setIsLoading) => {
  if (!broadcasterId || !peerReady || call) return;

  log("Calling broadcaster:", broadcasterId);
  setIsLoading(true);

  call = peer.call(broadcasterId, createDummyStream());

  call.on("stream", (stream) => {
    log("Remote stream received");
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.play().catch(() => {});
    socket.emit("viewer-join");
    is_call = true;
    setIsLoading(false);
  });

  call.on("close", () => {
    socket.emit("viewer-leave");
    call = null;
    setIsLoading(true);
    autoReconnect(videoEl, setIsLoading);
  });

  call.on("error", (e) => {
    err("Call error", e);
    socket.emit("viewer-leave");
    call = null;
    autoReconnect(videoEl, setIsLoading);
  });
};

/* =======================
   Auto Reconnect (OLD LOGIC)
======================= */
const autoReconnect = (videoEl, setIsLoading) => {
  log("autoReconnect check:", { is_call, call, broadcasterId });

  if (is_call && !call && broadcasterId) {
    setIsLoading(true);
    setTimeout(() => startView(videoEl, setIsLoading), 2000);
  }
};

/* =========================
   Setup Watcher
========================= */

export const setupWatcher = (videoEl, setIsLoading, roomId = "table1") => {

  cleanup();

  const table = TABLE_CONFIG[roomId] || TABLE_CONFIG["table1"];

  const CONFIG = {
    ...BASE_CONFIG,
    SIGNALING_URL: table.SIGNALING_URL,
    PEER: {
      ...BASE_CONFIG.PEER,
      host: table.PEER_HOST
    }
  };

  /* ---------- Peer ---------- */

  peer = new Peer(undefined, CONFIG.PEER);

  peer.on("open", () => {
    peerReady = true;

    if (broadcasterId) {
      startView(videoEl, setIsLoading);
    }
  });

  peer.on("error", (e) => {
    console.error("Peer error:", e);
  });

  /* ---------- Socket ---------- */

  socket = io(CONFIG.SIGNALING_URL, {
    auth: { token: "VIEWER_SECRET_456" },
    transports: ["websocket"],
    reconnection: true
  });

  socket.on("connect", () => {
    socket.emit("viwer_connected", {});
  });

  socket.on("broadcast-started", (id) => {
    broadcasterId = id;

    if (peerReady) {
      startView(videoEl, setIsLoading);
    }
  });

  socket.on("broadcast-stopped", () => {
    broadcasterId = null;

    if (call) {
      call.close();
      call = null;
    }

    setIsLoading(true);
  });

  socket.on("disconnect", () => {
    console.warn("Socket disconnected");
  });

  window.addEventListener("beforeunload", cleanup);
};