import { io } from "socket.io-client";
import Peer from "peerjs";

var room_id;
var is_start_viwer = false;
var peer = null;
var socket;

const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

const createEmptyVideoTrack = (videoElement) => {
  // Agar videoElement diya hai toh uska size lo, warna window ka size lo
  let width = window.innerWidth;
  let height = Math.floor((width * 9) / 16);

  if (videoElement) {
    width = videoElement.clientWidth || videoElement.offsetWidth || width;
    height = videoElement.clientHeight || videoElement.offsetHeight || height;
  }

  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

export const setupWatcher = (videoElement) => {
  console.log("peer: Initializing watcher...");

  // Connect to the WebSocket server
  socket = io("https://llive-stream-socket.liveluckystar.com", {
    transports: ["websocket", "polling", "flashsocket"],
  });

  socket.on("connect", () => {
    console.log("peer: Connected to socket server.");
    socket.emit("watcher"); // Notify server this is a viewer
  });

  socket.on("broadcast_start_viwer", (room) => {
    console.log("peer: Broadcast started, joining room:", room);
    room_id = room;
    if (is_start_viwer) {
      startBroadCast(videoElement);
    }
  });

  socket.on("offer", (room) => {
    console.log("peer: Received WebRTC offer for room:", room);
    room_id = room;
    startBroadCast(videoElement);
  });
};

const startBroadCast = (videoElement) => {
  console.log("peer: Creating Room:", room_id);
  if (!room_id) {
    // alert("peer: Socket not connected");
    return;
  }

  peer = new Peer({
    host: "llive-stream.liveluckystar.com",
    path: "/peerjs",
    secure: true,
  });

  peer.on("open", (id) => {
    console.log("peer: Connected to PeerJS server with ID:", id, videoElement);
    is_start_viwer = true;
    // setTimeout(() => joinRoom(room_id, videoElement), 500); // Ensure peer is ready
    setTimeout(() => joinRoomNew(room_id, videoElement), 500); // Ensure peer is ready
  });

  peer.on("error", (err) => {
    console.error("peer: Peer connection error:", err);
  });
};

const joinRoom = (room, videoElement) => {
  const audioTrack = createEmptyAudioTrack();
  const videoTrack = createEmptyVideoTrack();
  const mediaStream = new MediaStream([audioTrack, videoTrack]);
  console.log("peer: Joining Room:", room);
  room_id = room;

  // Debugging logs
  console.log("peer: 👀 Watcher waiting for calls in room:", room_id);

  // let call = peer.call(room_id, mediaStream);
  peer.on("stream", (stream) => {
    console.log("peer: call : stream", stream);

    // if (videoElement) {
    //   videoElement.srcObject = stream;
    //   videoElement.play();
    // }
  });
  peer.on("call", (call) => {
    console.log("peer: 📞 Incoming call detected!", call);

    setTimeout(() => {
      console.log("peer: 📞 Answering call...");
      call.answer(); // Watchers don't send a stream

      call.on("stream", (remoteStream) => {
        console.log("peer: 🎥 Remote stream received:", remoteStream);
        if (videoElement) {
          videoElement.srcObject = remoteStream;
          videoElement.muted = true; // Optional: mute to allow autoplay
          videoElement.play().catch((e) => {
            console.log("Autoplay failed, waiting for user gesture...");
            // Optionally show a play button to user
          });
        }
      });

      call.on("error", (err) => {
        console.error("peer: ❌ Call error:", err);
      });
    }, 500); // Delay to ensure PeerJS processes the call
  });
};

const joinRoomNew = (room, videoElement, loaderElement) => {
  const audioTrack = createEmptyAudioTrack();
  const videoTrack = createEmptyVideoTrack(videoElement); // Pass videoElement here
  const mediaStream = new MediaStream([audioTrack, videoTrack]);

  if (loaderElement) loaderElement.style.display = "block"; // Show loader

  peer = new Peer();

  peer.on("open", (id) => {
    console.log("peer: joinRoomNew: open :  id: ", id, room);
    let call = peer.call(room_id, mediaStream);

    call.on("stream", (stream) => {
      console.log("peer: joinRoomNew: call : stream", stream);
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.muted = true; // Optional: mute to allow autoplay
        videoElement.play().catch((e) => {
          console.log("Autoplay failed, waiting for user gesture...");
          // Optionally show a play button to user
        });
      }
      if (loaderElement) loaderElement.style.display = "none"; // Hide loader when video starts
    });

    call.on("close", () => {
      console.log("peer: call closed, showing loader...");
      if (loaderElement) loaderElement.style.display = "block"; // Show loader again
      reconnect(room, videoElement, loaderElement); // Try to reconnect
    });

    peer.on("call", (call) => {
      console.log("peer: joinRoomNew: call ...!");
      call.on("stream", (stream) => {
        console.log("peer: joinRoomNew: 11: call : stream", stream);
        if (videoElement) {
          videoElement.srcObject = stream;

          videoElement.muted = true; // Optional: mute to allow autoplay
          videoElement.play().catch((e) => {
            console.log("Autoplay failed, waiting for user gesture...");
            // Optionally show a play button to user
          });
        }
        if (loaderElement) loaderElement.style.display = "none"; // Hide loader when video starts
      });
    });
  });

  peer.on("error", (err) => {
    console.log("peer: joinRoomNew: error ...!", err);
    if (loaderElement) loaderElement.style.display = "block"; // Show loader
    reconnect(room, videoElement, loaderElement);
  });
};

const reconnect = (room, videoElement, loaderElement) => {
  setTimeout(() => {
    console.log("peer: Reconnecting to room:", room);
    joinRoomNew(room, videoElement, loaderElement);
  }, 3000); // Retry after 3 seconds
};