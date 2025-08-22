// Toast.js
import React from "react";
import "./Toast.css";

const Toast = ({ message, type, style }) => {
  return (
    <div className={`toast ${type}`} style={style}>
      <p>{message}</p>
    </div>
  );
};

export default Toast;
