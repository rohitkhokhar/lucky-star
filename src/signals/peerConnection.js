// import { io } from "socket.io-client";
import { Peer } from "peerjs";

let socket;
export const peerConnection = async (room_id) => {
  //console.log("peerConnection :: IN");

  // const url = "https://llive.europainfotech.com/";
  // const url = "https://llive-socket.europainfotech.com/";
  // socket = io(url);

  socket = new Peer({
    host: "llive-stream.liveluckystar.com",
    path: "/peerjs",
    secure: true, // Set to `true` if your server is using HTTPS
    // port: 443, // Change if needed (default for HTTPS)
  });
  // socket = io.connect(url, { transports: ["websocket"] });

  socket.on("connect", (res) => {
    //console.log("connect: : ", res);
    //console.log("connect: peer : socket: ", socket);

    // start watcher
    // socket.emit("watcher");
    // next(socket.connected);
  });
  socket.on("error", (res) => {
    //console.log("connect: error: ", res);
  });
  socket.on('open', id => {
    //console.log("open: id :", id)
    // document.getElementById('peer-id').value = id;
    // this.joinRoom(room_id)
    // is_start_viwer = true
  });
};

// export const sendEventToWebRtc = (en, data) => {
//   socket.emit("req", { en, data });
// };
