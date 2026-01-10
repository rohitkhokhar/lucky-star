import { signal } from "@preact/signals-react";
import io from "socket.io-client";

// Socket ka signal
export const socketData = signal(null);

// Socket client setup
const SOCKET_URL = "https://play.liveluckystar.com"; // Apne backend ka URL set karein
export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  pingInterval: 24 * 60 * 60 * 1000,
  pingTimeout: 3 * 24 * 60 * 60 * 1000,
})``

// Event Listeners
socket.on("connect", () => {
  //console.log("connect: Socket connected:", socket.id);
});

// socket.on("message", (data) => {
//   //console.log("Message received:", data);
//   socketData.value = data; // Signal ko update karein
// });

// Error Handling
socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

// Socket export karein taaki kahin bhi use ho sake
export default socket;
