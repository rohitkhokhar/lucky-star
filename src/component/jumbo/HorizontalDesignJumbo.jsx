import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";
import HeaderPart from "./header-part/HeaderPart";
import FooterPart from "./footer-part/FooterPart";
import WebRTCViewerJumbo from "./WebRTCViewerJumbo";
import { useDispatch } from "react-redux";
import { socketConnect, getSocket } from "../../signals/socketConnection";

function HorizontalDesignJumbo() {
  const { tableId } = useParams(); // 🔥 table1 / table2
  // console.log("tableId",tableId)
  const [muted, setMuted] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) ?? null;
  const dispatch = useDispatch();

  useEffect(() => {
    let socket = getSocket();

    if (!socket || socket.disconnected) {
      socket = socketConnect();

      socket.on("connect", () => {
        console.log("🟢 Socket ready for table:", tableId);
        setIsSocketReady(true);
      });

      socket.on("disconnect", () => {
        console.warn("🔴 Socket disconnected");
      });
    } else {
      setIsSocketReady(true);
    }

    return () => {
      const s = getSocket();
      s?.off("connect");
      s?.off("disconnect");
    };
  }, [tableId]);

  useEffect(() => {
    if (isSocketReady && !user) {
      getSocket()?.disconnect();
    }
  }, [isSocketReady, user]);

  return (
    <>
      <WebRTCViewerJumbo muted={muted} roomId={tableId} />
      <div className="ui-overlay">
        <HeaderPart muted={muted} setMuted={setMuted} roomId={tableId} />
        <div
          style={{
            flex: "1",
          }}
        ></div>
        <FooterPart roomId={tableId} />
      </div>
    </>
  );
}

export default HorizontalDesignJumbo;
