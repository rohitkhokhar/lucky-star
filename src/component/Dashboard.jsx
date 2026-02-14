import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  sendEvent,
  getSocket,
  socketConnect,
} from "../signals/socketConnection";

import {
  faWallet,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

import DesktopImage from "../assets/Desktop-2.png";
import WalletDeposit from "./wallet-deposite";
import LuckyStarLogo from "../assets/luckystarLogo.png";
import LuckyStarimage1 from "../assets/LuckyStarimage1.jpeg";
import LuckyStarimage2 from "../assets/LuckyStarimage2.jpeg";
import LuckyStarimage3 from "../assets/LuckyStarimage3.jpeg";
import LuckyStarimage4 from "../assets/LuckyStarimage4.jpeg";

const Dashboard = () => {
  const dispatch = useDispatch();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [wellcomeNote, setWellcomeNote] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wellcome_note")) || "";
    } catch {
      return "";
    }
  });

  const [roomCounters, setRoomCounters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("room_counters")) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const savedCounters =
      JSON.parse(localStorage.getItem("room_counters")) || {};
    setRoomCounters(savedCounters);
  }, []);

  const [showWalletModal, setShowWalletModal] = useState(false);

  // 🔥 Ensure socket connected
  useEffect(() => {
    socketConnect();
  }, []);

  // 🔥 Socket Listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleSocketEvents = (data) => {
      // 🔴 FORCE LOGOUT
      if (data.en === "LOGOUT") {
        [
          "user",
          "authToken",
          "min_max_config",
          "total_wallet",
          "wellcome_note",
        ].forEach((key) => localStorage.removeItem(key));

        dispatch(logout());
        window.location.href = "/Login";
        return;
      }

      // 🟢 ONLINE ROOM COUNTER
      if (data.en === "ONLINE_ROOM_COUNTER" && !data.err) {
        const rooms = data?.data?.OnlineCounterInfo || [];

        const formattedCounters = {};

        rooms.forEach((room) => {
          formattedCounters[room.roomId] = {
            online_room_counter:
              room.online_room_counter && room.online_room_counter > 0
                ? room.online_room_counter
                : 0,
            start_time: room.start_time ?? "--",
            close_time: room.close_time ?? "--",
            game_state: room.game_state ?? "",
            is_online: room.is_online ?? false,
          };
        });

        console.log("Updated Room Counters:", formattedCounters);

        setRoomCounters(formattedCounters);
        localStorage.setItem(
          "room_counters",
          JSON.stringify(formattedCounters),
        );
      }

      useEffect(() => {
        console.log("RoomCounters State Updated:", roomCounters);
      }, [roomCounters]);

      // 🟢 UPDATED WALLET
      if (data.en === "UPDATED_WALLET") {
        const totalWallet = data.data?.total_wallet;

        if (totalWallet !== undefined) {
          localStorage.setItem("total_wallet", JSON.stringify(totalWallet));

          setUser((prevUser) => {
            if (!prevUser) return prevUser;

            const updatedUser = {
              ...prevUser,
              chips: totalWallet,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
          });
        }
      }
    };

    socket.on("res", handleSocketEvents);

    return () => {
      socket.off("res", handleSocketEvents);
    };
  }, [dispatch]);

  const handleLogout = () => {
    sendEvent("LOGOUT", {});
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-black text-white bg-cover bg-center sm:p-4"
      style={{ backgroundImage: `url(${DesktopImage})` }}
    >
      <section className="w-full min-w-full sm:max-w-md p-4 rounded-lg shadow-lg text-center relative">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-sm sm:text-base"
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src={LuckyStarLogo}
            alt="Lucky Star Logo"
            className="h-30 sm:h-20"
            loading="lazy"
          />
        </div>

        {/* Welcome */}
        {user && (
          <h2 className="md:text-3xl sm:text-xl font-bold mb-4">
            Welcome, {user.user_name}!
          </h2>
        )}

        {/* Game Tables */}
        <div className="grid grid-cols-4 gap-4 mt-4 mb-6">
          {/* Table 1 */}
          <Link to="/live/table1" className="flex flex-col items-center group">
            <div className="w-28 h-16 bg-white border-4 rounded-lg overflow-hidden group-hover:scale-105 transition">
              <img
                src={LuckyStarimage1}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>
            <p
              className={`mt-2 font-semibold ${
                roomCounters["table1"]?.is_online
                  ? "text-green-500"
                  : "text-red-600"
              }`}
            >
              {roomCounters["table1"]?.is_online ? "🟢 Online" : "🔴 Offline"}
            </p>

            <p className="text-xs">
              Users: {roomCounters["table1"]?.online_room_counter ?? 0}
            </p>
            <p className="text-xs">
              Opening: {roomCounters["table1"]?.start_time ?? "--"}
            </p>
            <p className="text-xs">
              Closing: {roomCounters["table1"]?.close_time ?? "--"}
            </p>
          </Link>

          {/* Table 2 */}
          <Link to="/live/table2" className="flex flex-col items-center group">
            <div className="w-28 h-16 bg-white border-4 rounded-lg overflow-hidden group-hover:scale-105 transition">
              <img
                src={LuckyStarimage2}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>
            <p
              className={`mt-2 font-semibold ${
                roomCounters["table2"]?.is_online
                  ? "text-green-500"
                  : "text-red-600"
              }`}
            >
              {roomCounters["table2"]?.is_online ? "🟢 Online" : "🔴 Offline"}
            </p>

            <p className="text-xs">
              Users: {roomCounters["table2"]?.online_room_counter ?? 0}
            </p>
            <p className="text-xs">
              Opening: {roomCounters["table2"]?.start_time ?? "--"}
            </p>
            <p className="text-xs">
              Closing: {roomCounters["table2"]?.close_time ?? "--"}
            </p>
          </Link>

          {/* Offline Tables */}
          {[LuckyStarimage3, LuckyStarimage4].map((image, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-28 h-16 bg-white border-4 rounded-lg overflow-hidden">
                <img
                  src={image}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <p className="mt-2 text-red-600 font-semibold">🔴 Offline</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <button
              className="w-16 h-16 flex items-center justify-center border-4 border-white rounded-full hover:bg-gray-800"
              onClick={() => setShowWalletModal(true)}
            >
              <FontAwesomeIcon icon={faWallet} className="text-2xl" />
            </button>
            <p className="mt-2 font-semibold">Deposit & Withdrawal</p>
            {user && <p className="text-sm">💲 Balance: ₹{user.chips || 0}</p>}
          </div>

          <Link to="/Profile" className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center border-4 border-white rounded-full hover:bg-gray-800">
              <FontAwesomeIcon icon={faUser} className="text-2xl" />
            </div>
            <p className="mt-2 font-semibold">Profile</p>
          </Link>
        </div>

        {/* Welcome Note */}
        {wellcomeNote && (
          <marquee className="mt-6 font-semibold" scrollamount="5">
            {wellcomeNote}
          </marquee>
        )}
      </section>

      {showWalletModal && (
        <WalletDeposit onClose={() => setShowWalletModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
