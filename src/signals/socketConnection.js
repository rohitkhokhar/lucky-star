// socketConnection.js
import { io } from "socket.io-client";
import store from "../redux/store";
import { setUser } from "../redux/authSlice";

let socket = null;

/**
 * 🔴 Common force logout handler
 * OSR / LOGOUT / session-expired sab yahin se handle honge
 */
const forceLogout = () => {
  console.warn("🔴 Force logout triggered");

  // Clear local storage
  [
    "user",
    "authToken",
    "min_max_config",
    "total_wallet",
    'room_counters',
    "wellcome_note",
    "room_limit",
  ].forEach((key) => localStorage.removeItem(key));

  // Clear redux user
  store.dispatch(setUser(null));

  // Disconnect socket safely
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  // Redirect to login
  window.location.href = "/login";
};

export const socketConnect = () => {
  if (!socket) {
    const url = "https://play.liveluckystar.com";

    socket = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      // console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);

      // server ne force disconnect kiya ho
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("error", (err) => {
      console.error("❌ Socket error:", err);
    });

    /**
     * 📩 Main response listener
     */
    socket.on("res", (data) => {
      // console.log("📩 Socket response:", data);

      switch (data.en) {
        case "LOGIN":
          if (!data.err) {
            if (data.data?.AppLunchDetails) {
              localStorage.setItem("user", JSON.stringify(data.data));
              store.dispatch(setUser(data.data));
            }
          } else {
            alert(data.msg);
          }
          break;

        case "SEND_OTP":
          if (data.err) {
            alert(data.msg);
          }
          break;

        case "SIGNUP":
          if (data.err_code === "0006") {
            alert(data.msg);
          } else if (!data.err) {
            window.location.href = "/login";
          } else {
            alert(data.msg);
          }
          break;

        case "SETTING":
          if (!data.err && data.data?.wellcome_note) {
            localStorage.setItem(
              "wellcome_note",
              JSON.stringify(data.data.wellcome_note)
            );
          }
          break;

        case "ONLINE_ROOM_COUNTER": {
          const rooms = data?.data?.OnlineCounterInfo || [];

          const roomCounters = {};

          rooms.forEach((room) => {
            roomCounters[room.roomId] = {
              online_room_counter: room.online_room_counter && room.online_room_counter > 0
                ? room.online_room_counter
                : 0,
              start_time: room.start_time ?? "--",
              close_time: room.close_time ?? "--",
              game_state: room.game_state ?? "",
              is_online: room.is_online ?? false,
            };
          });

          console.log("🔥 ONLINE_ROOM_COUNTER received:", roomCounters);

          localStorage.setItem(
            "room_counters",
            JSON.stringify(roomCounters)
          );

          break;
        }


        /**
         * 🔥 OSR → force logout
         */
        case "OSR":
          if (data.data?.is_disconnect) {
            console.warn("🚫 OSR received → logging out");
            forceLogout();
          }
          break;

        /**
         * 🔴 Normal logout (server side)
         */
        case "LOGOUT":
          forceLogout();
          break;

        default:
          console.warn("⚠️ Unhandled event:", data.en);
      }
    });
  }

  return socket;
};

/**
 * 📤 Send socket event
 */
export const sendEvent = (en, data) => {
  if (!socket) socketConnect();

  if (socket && socket.connected) {
    socket.emit("req", { en, data });
  } else {
    alert("Unable to connect to the server. Please try again later.");
  }
};

/**
 * 🔌 Get current socket instance
 */
export const getSocket = () => {
  return socket;
};
