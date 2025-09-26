import io from "socket.io-client";

export function setupWatcher(videoElement) {
  let peerConnection;
  let uid = null;

  const config = {
    iceServers: [
      {
        urls: "turn:3.111.53.22:3478?transport=tcp",
        username: "test",
        credential: "test123",
      },
      // You can add more TURN servers here if needed
    ],
  };

  const socket = io(window.location.origin, {
    transports: ["websocket"],
    path: "/socket.io",
  });

  socket.on("connect", () => {
    console.log("✅ Socket Connected:", socket.id);
    socket.emit("watcher");
  });

  socket.on("offer", (id, description) => {
    uid = id;
    peerConnection = new RTCPeerConnection(config);

    console.log("📡 Received Offer:", description);

    peerConnection
      .setRemoteDescription(description)
      .then(() => peerConnection.createAnswer())
      .then((sdp) => peerConnection.setLocalDescription(sdp))
      .then(() => socket.emit("answer", id, peerConnection.localDescription));

    peerConnection.ontrack = (event) => {
      console.log("🎥 Stream received:", event.streams[0]);
      if (videoElement) videoElement.srcObject = event.streams[0];
    };

    // Optional: Data channel setup
    const dataChannel = peerConnection.createDataChannel("message");
    peerConnection.ondatachannel = (event) => {
      console.log("💬 DataChannel received:", event.channel);
      event.channel.onmessage = (msgEvent) => {
        console.log("📨 Message from broadcaster:", msgEvent.data);
      };
      dataChannel.send("Hello from watcher 👋");
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  });

  socket.on("candidate", (id, candidate) => {
    if (peerConnection) {
      peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((e) => console.error("❌ ICE Error:", e));
    }
  });

  socket.on("broadcaster", () => {
    socket.emit("watcher");
  });

  function enableAudio() {
    if (videoElement) {
      console.log("🔊 Enabling audio");
      videoElement.muted = false;
    }
  }

  // Return cleanup + audio enable handler
  return {
    cleanup: () => {
      if (peerConnection) peerConnection.close();
      socket.disconnect();
    },
    enableAudio,
  };
}