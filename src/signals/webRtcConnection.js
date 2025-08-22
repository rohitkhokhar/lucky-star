import { io } from "socket.io-client";
import { peerConnection } from "./peerConnection";

let socket;
let room_id;
export const webRtcConnection = async () => {
  console.log("##################################################### webRtcConnection :: IN");

  // const url = "https://llive.europainfotech.com/";
  const url = "https://llive-stream.liveluckystar.com/";
  // socket = io(url);
  socket = io.connect(url, { transports: ["websocket"] });

  socket.on("connect", (res) => {
    console.log("##################################################### connect: : ", res);
    console.log("##################################################### connect: : socket: ", socket);

    // start watcher
    socket.emit("watcher");
    // next(socket.connected);
  });
  socket.on("error", (res) => {
    console.log("##################################################### connect: error: ", res);
  });
  socket.on("res", (data) => {
    console.log("##################################################### loginForm: res :: ", data);
    switch (data.en) {
      case "LOGIN": {
        // here you need to store data in redux and get this data in login page for verifications
        console.log("##################################################### loginForm: res :: ", data);
        break;
      }
    }
  });
  socket.on("broadcast_start_viwer", (room) => {
    console.log("##################################################### broadcast_start_viwer : ", room, new Date());
    // room_id = room;
    // if(is_start_viwer)
    //     startBroadCast(room_id)
  });
  socket.on("offer", (room) => {
    room_id = room;
    peerConnection();
  });
  socket.on("watcher", (watcher_id) => {
    console.log("##################################################### watcher : watcher_id : ", watcher_id);
  });

  return socket;
};

export const sendEventToWebRtc = (en, data) => {
  socket.emit("req", { en, data });
};
