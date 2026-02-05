// socketConnection.js
import { io } from "socket.io-client";
import store from "../redux/store";
import { setUser } from "../redux/authSlice";

let socket = null;

export const socketConnect = () => {
  if (!socket) {
    const url = "https://play.liveluckystar.com"; // Replace with your WebSocket server URL
    socket = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      //console.log("✅ Socket connected sokcet:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect(); // Manual reconnect if server disconnected
      }
    });

    socket.on("error", (err) => {
      console.error("❌ Socket error:", err);
    });

    socket.on("res", (data) => {
      //console.log("📩 Socket response received:", data);

      switch (data.en) {
        case "LOGIN":
          if (!data.err) {
            //console.log("✅ Login successful:", data.data);
            if (data.data?.AppLunchDetails) {
              localStorage.setItem("user", JSON.stringify(data.data));
              store.dispatch(setUser(data.data));
            }
          } else {
            console.error("❌ Login failed:", data.msg);
            alert(data.msg);
          }
          break;

        case "SEND_OTP":
          if (!data.err) {
            //console.log("✅ OTP sent successfully:", data);
          } else {
            console.error("❌ OTP sending failed:", data.msg);
            alert(data.msg);
          }
          break;

        case "SIGNUP":
          if (data.err_code === "0006") {
            alert(data.msg);
          } else if (!data.err) {
            //console.log("✅ Signup successful! Redirecting to login...");
            window.location.href = "/login";
          } else {
            console.error("❌ Signup failed:", data.msg);
            alert(data.msg);
          }
          break;

        case "SETTING":
          if (!data.err) {
            if (data.data?.wellcome_note) {
              localStorage.setItem("wellcome_note", JSON.stringify(data?.data?.wellcome_note));
            }
          } else {
            console.error("❌ announcement failed:", data.msg);
            alert(data.msg);
          }
          break;

        case "ONLINE_ROOM":
          if (!data.err) {
            if (data.data?.online_room_counter) {
              localStorage.setItem("room_limit", JSON.stringify(data?.data?.online_room_counter));
            }
          } else {
            console.error("❌ announcement failed:", data.msg);
            alert(data.msg);
          }
          break;

        case "LOGOUT":
          console.warn("🔴 Force logout received from server");

          [
            "user",
            "authToken",
            "min_max_config",
            "total_wallet",
            "wellcome_note",
            "room_limit",
          ].forEach((key) => localStorage.removeItem(key));

          store.dispatch(setUser(null));

          if (socket) {
            socket.disconnect();
            socket = null;
          }

          window.location.href = "/Login";
          break;

        default:
          console.warn("⚠️ Unhandled event:", data.en);
      }
    });
  }

  return socket;
};

export const sendEvent = (en, data) => {
  if (!socket) socketConnect();
  if (socket && socket.connected) {
    socket.emit("req", { en, data });
    //console.log(`📤 Sent event "${en}" with data:`, data);
  } else {
    console.error("⚠️ Socket not connected. Unable to send event.");
    alert("Unable to connect to the server. Please try again later.");
  }
};

export const getSocket = () => {
  return socket;
};
