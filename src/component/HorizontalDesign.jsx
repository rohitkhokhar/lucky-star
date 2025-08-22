import React, { useEffect, useState } from "react";
import "./index.css";
import HeaderPart from "./header-part/HeaderPart";
import FooterPart from "./footer-part/FooterPart";
import WebRTCViewer from "./WebRTCViewer";
import { useDispatch } from "react-redux";
import { socketConnect, getSocket } from "../signals/socketConnection";
// import { logoutUser } from "../redux/authSlice";

function HorizontalDesign() {
  const [muted, setMuted] = useState(false);
  const dispatch = useDispatch();
  const [isSocketReady, setIsSocketReady] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) ?? null;

  useEffect(() => {
    let socket = getSocket();

    if (!socket || socket.disconnected) {
      console.log("Socket not connected. Connecting...");
      socket = socketConnect();

      // Set socket ready after connection
      socket.on("connect", () => {
        console.log("Socket connected in component.");
        setIsSocketReady(true);
      });

      socket.on("disconnect", () => {
        console.warn("Socket disconnected in component.");
      });
    } else {
      // Already connected
      setIsSocketReady(true);

      socket.on("disconnect", () => {
        console.warn("Socket disconnected.");
      });
    }

    return () => {
      const currentSocket = getSocket();
      currentSocket?.off("disconnect");
      currentSocket?.off("connect");
    };
  }, []);

  useEffect(() => {
    if (isSocketReady && !user) {
      console.log("No user. Disconnecting socket and logging out.");
      // dispatch(logoutUser());
      const socket = getSocket();
      socket?.disconnect();
    }
  }, [isSocketReady, user, dispatch]);

  return (
    <>
      <HeaderPart muted={muted} setMuted={setMuted} />
      <FooterPart />
      <WebRTCViewer muted={muted} setMuted={setMuted} />
    </>
  );
}

export default HorizontalDesign;
