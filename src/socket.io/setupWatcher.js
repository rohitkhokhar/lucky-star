import { io } from "socket.io-client";
import Peer from "peerjs";

let socket = null;
let peer = null;
let call = null;
let broadcasterId = null;
let peerReady = false;
let is_call = false;

function log(...args) { console.log("[webrtc]", ...args); }
function warn(...args) { console.warn("[webrtc]", ...args); }
function err(...args) { console.error("[webrtc]", ...args); }

// Cleanup function
const cleanup = () => {
  if (call) call.close();
  if (peer && !peer.destroyed) peer.destroy();
  if (socket) socket.disconnect();

  call = null;
  peer = null;
  socket = null;
  broadcasterId = null;
  peerReady = false;
  is_call = false;
  log("Cleanup done");
};

// Dummy stream for PeerJS call (needed to initiate WebRTC)
const dummyStream = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  ctx.fillRect(0, 0, 640, 480);

  const videoTrack = canvas.captureStream(1).getVideoTracks()[0];

  const audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const dst = osc.connect(audioCtx.createMediaStreamDestination());
  osc.start();

  return new MediaStream([videoTrack, dst.stream.getAudioTracks()[0]]);
};

// Main setup function
export const setupWatcher = (videoEl, roomId, setIsLoading) => {
  log('Setting up watcher for room:', roomId);
  cleanup();
  setIsLoading(true);

  const CONFIG = {
    SIGNALING_URL: "https://llive-stream-socket.liveluckystar.com",
    PEER_CONFIG: {
      host: "llive-stream.liveluckystar.com",
      port: 443,
      path: "/peerjs",
      secure: true,
      query: { token: "VIEWER_SECRET_456" },
      config: {
        iceServers: [
          {
            urls: [
              "turn:15.207.116.222:3478?transport=udp",
              "turn:15.207.116.222:3478?transport=tcp",
              "turns:15.207.116.222:5349?transport=tcp"
            ],
            username: "lltest",
            credential: "lltest123"
          }
        ]
      }
    }
  };

  // Initialize PeerJS
  peer = new Peer(undefined, CONFIG.PEER_CONFIG);

  peer.on("open", () => {
    peerReady = true;
    log("Peer ready:", peer.id);
    // If broadcast already started, start viewing
    if (broadcasterId && !call) {
      view();
    }
  });

  peer.on("error", (e) => err("Peer error:", e));
  peer.on("disconnected", () => warn("Peer disconnected"));
  peer.on("close", () => warn("Peer closed"));

  // Initialize Socket.IO
  socket = io(CONFIG.SIGNALING_URL, {
    auth: { token: "VIEWER_SECRET_456" },
    transports: ["websocket"],
    reconnection: true
  });

  socket.on("connect", () => {
    log("Socket connected");
    socket.emit("viwer_connected", { roomId });
  });

  socket.on("disconnect", () => {
    log("Socket disconnected ->", roomId);
  });

  // Broadcast started
  socket.on("broadcast-started", (peerId) => {
    log("broadcast-started", peerId);
    broadcasterId = peerId;
    autoReconnect();
  });

  // Broadcast stopped
  socket.on("broadcast-stopped", () => {
    log("broadcast-stopped", new Date());
    broadcasterId = null;
    if (call) {
      call.close();
      call = null;
    }
    setIsLoading(true);
  });

  // Viewer count
  socket.on("viewer-count", (n) => {
    log("Viewer count:", n);
  });

  // Function to start viewing
  const view = () => {
    if (!broadcasterId || !peerReady) {
      warn("Broadcast not started or peer not ready");
      return;
    }

    log("Connecting to broadcaster:", broadcasterId);

    call = peer.call(broadcasterId, dummyStream());

    call.on("stream", (stream) => {
      videoEl.srcObject = stream;
      const playPromise = videoEl.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            log("[webrtc] Video playback started");
            setIsLoading(false);
            is_call = true;
          })
          .catch((err) => {
            warn("[webrtc] Autoplay prevented, muting video to play", err);
            videoEl.muted = true; // mute to allow autoplay
            videoEl.play().catch(() => { });
            setIsLoading(false);
            is_call = true;
          });
      } else {
        setIsLoading(false);
        is_call = true;
      }

      socket.emit("viewer-join");
    });

    call.on("close", () => {
      log("Call closed");
      socket.emit("viewer-leave");
      call = null;
      autoReconnect();
    });

    call.on("error", (e) => {
      err("Call error:", e);
      call = null;
      autoReconnect();
    });
  };

  // Auto-reconnect logic
  const autoReconnect = () => {
    log("autoReconnect ...!", call, broadcasterId, (!call && broadcasterId))
    if (is_call && !call && broadcasterId) {
      log("Auto-reconnecting...");
      setTimeout(view, 2000);
    }
  };

  // Cleanup before unload
  window.addEventListener("beforeunload", cleanup);
};
