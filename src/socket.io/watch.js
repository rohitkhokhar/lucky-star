import io from "socket.io-client"; import Peer from "peerjs";// 👈 Importing v4 correctly

export function setupWatcher(videoElement) {
  let peerConnection;
  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const socket = io("https://llive.europainfotech.com", {
    transports: ["websocket"],
    path: "/socket.io",
    query: { EIO: 3 },  // 👈 Forces Engine.IO v3
  });

  socket.on("connect", () => {
    console.log("✅ Socket Connected:", socket.id);
    socket.emit("watcher");
  });

  socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection(config);
    peerConnection
      .setRemoteDescription(description)
      .then(() => peerConnection.createAnswer())
      .then((sdp) => peerConnection.setLocalDescription(sdp))
      .then(() => socket.emit("answer", id, peerConnection.localDescription));

    peerConnection.ontrack = (event) => {
      if (videoElement) videoElement.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) socket.emit("candidate", id, event.candidate);
    };
  });

  socket.on("candidate", (id, candidate) => {
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) => console.error("❌ ICE Error:", e));
    }
  });

  socket.on("broadcaster", () => {
    socket.emit("watcher");
  });

  return () => {
    if (peerConnection) peerConnection.close();
    socket.disconnect();
  };
}
