// Toast.js
import React from "react";
import "./Toast.css";

const Toast = ({ message, type, style }) => {
  let displayMessage = message;

  if (typeof message === "function") {
    try {
      displayMessage = message();
    } catch {
      displayMessage = "";
    }
  } else if (
    typeof message === "object" &&
    message !== null &&
    !React.isValidElement(message)
  ) {
    if (typeof message.msg === "string" && message.msg.trim()) {
      displayMessage = message.msg;
    } else if (typeof message.message === "string" && message.message.trim()) {
      displayMessage = message.message;
    } else if (
      typeof message.open === "string" ||
      typeof message.close === "string"
    ) {
      const parts = [];
      if (typeof message.open === "string" && message.open.trim()) {
        parts.push(message.open.trim());
      }
      if (typeof message.close === "string" && message.close.trim()) {
        parts.push(message.close.trim());
      }
      displayMessage = parts.length > 0 ? parts.join(" | ") : "";
    } else if ("open" in message || "close" in message) {
      const parts = [];
      if (message.open && message.open !== "false" && message.open !== "0") {
        parts.push("Open");
      }
      if (message.close && message.close !== "false" && message.close !== "0") {
        parts.push("Close");
      }
      displayMessage = parts.length > 0 ? `${parts.join(" & ")} Betting Active` : "Betting Started";
    } else {
      try {
        displayMessage = JSON.stringify(message);
      } catch {
        displayMessage = String(message);
      }
    }
  }

  return (
    <div className={`toast ${type}`} style={style}>
      <p>{displayMessage}</p>
    </div>
  );
};

export default Toast;
