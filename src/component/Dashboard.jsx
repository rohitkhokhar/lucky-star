import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { sendEvent } from "../signals/socketConnection";

import {
  faPlay,
  faWallet,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import DesktopImage from "../assets/Desktop-2.png";
import WalletDeposit from "./wallet-deposite";
import LuckyStarLogo from "../assets/luckystarLogo.png";
import LuckyStarimage1 from "../assets/LuckyStarimage1.jpeg";
import LuckyStarimage2 from "../assets/LuckyStarimage2.jpeg";
import LuckyStarimage3 from "../assets/LuckyStarimage3.jpeg";
import LuckyStarimage4 from "../assets/LuckyStarimage4.jpeg";
import { getSocket } from "../signals/socketConnection";

const Dashboard = () => {
  // Safe localStorage parsing with fallbacks
  const getLocalStorageItem = (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error(`Error parsing ${key} from localStorage:`, error);
      return fallback;
    }
  };

  const [user, setUser] = useState(() => getLocalStorageItem("user"));
  const initialWelcomeNote = getLocalStorageItem("wellcome_note", "");
  const initialRoomLimit = Number(getLocalStorageItem("room_limit")) || 0;

  const [wellcomeNote, setWellcomeNote] = useState(initialWelcomeNote);
  const [roomLimit, setRoomLimit] = useState(initialRoomLimit);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    sendEvent("LOGOUT", {});
    // Clear all relevant localStorage items
    [
      "user",
      "authToken",
      "min_max_config",
      "total_wallet",
      "wellcome_note",
      "room_limit",
    ].forEach((key) => localStorage.removeItem(key));
    window.location.href = "/Login";
  };

  useEffect(() => {
    const updateFromLocalStorage = () => {
      try {
        const note = JSON.parse(localStorage.getItem("wellcome_note") || '""');
        const limit = Number(localStorage.getItem("room_limit") || 0);
        setWellcomeNote(note);
        setRoomLimit(limit);
      } catch (error) {
        console.error("Error updating from localStorage:", error);
      }
    };

    // Run on mount
    updateFromLocalStorage();

    // Listen for storage changes across tabs
    const handleStorageChange = (e) => {
      if (["wellcome_note", "room_limit"].includes(e.key))
        updateFromLocalStorage();
    };
    window.addEventListener("storage", handleStorageChange);

    // Detect same-tab changes
    const interval = setInterval(updateFromLocalStorage, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleSettings = (data) => {
      // 🔴 FORCE LOGOUT EVENT
      if (data.en === "LOGOUT") {
        console.log("Socket LOGOUT received");

        // Clear localStorage
        [
          "user",
          "authToken",
          "min_max_config",
          "total_wallet",
          "wellcome_note",
          "room_limit",
        ].forEach((key) => localStorage.removeItem(key));

        // Redux logout (optional but best practice)
        dispatch(logout());

        // Redirect to login
        window.location.href = "/Login";
        return;
      }

      // 🟢 ONLINE ROOM EVENT
      if (data.en === "ONLINE_ROOM" && !data.err) {
        const value = data?.data?.online_room_counter || 0;
        setRoomLimit(value);
        localStorage.setItem("room_limit", value.toString());
      }

      // 🟢 UPDATED WALLET EVENT
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

    socket.on("res", handleSettings);

    return () => {
      socket.off("res", handleSettings);
    };
  }, [dispatch]);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-black text-white bg-cover bg-center sm:p-4"
      style={{ backgroundImage: `url(${DesktopImage})` }}
    >
      <section className="w-full min-w-full sm:max-w-md p-4 rounded-lg shadow-lg text-center relative">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-sm sm:text-base"
          aria-label="Logout"
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

        {user && (
          <h2 className="md:text-3xl sm:text-xl font-bold mb-4">
            Welcome, {user.user_name}!
          </h2>
        )}

        {/* Game Tables Section */}
        <div className="grid grid-cols-4 gap-4 mt-4 mb-6">
          {/* Online Table */}
          <Link to="/live/table1" className="flex flex-col items-center group">
            <div className="w-28 h-16 sm:w-28 sm:h-20 bg-white border-4 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
              <img
                src={LuckyStarimage1}
                alt="Online Game Table"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-sm sm:text-base text-green-500 font-semibold">
              🟢 Online
            </p>
            <p className="text-xs sm:text-sm">Users: {roomLimit}</p>
          </Link>

          <Link to="/live/table2" className="flex flex-col items-center group">
            <div className="w-28 h-16 sm:w-28 sm:h-20 bg-white border-4 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
              <img
                src={LuckyStarimage2}
                alt="Online Game Table"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-sm sm:text-base text-green-500 font-semibold">
              🟢 Online
            </p>
            <p className="text-xs sm:text-sm">Users: {roomLimit}</p>
          </Link>

          {/* Offline Tables */}
          {[LuckyStarimage3, LuckyStarimage4].map((image, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-28 h-16 sm:w-28 sm:h-20 bg-white border-4 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Game Table ${index + 2}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-sm sm:text-base text-red-600 font-semibold">
                🔴 Offline
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 sm:gap-10">
          <div className="flex flex-col items-center">
            <button
              className="md:w-20 w-16 md:h-20 h-16 flex items-center justify-center border-4 border-white rounded-full cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => setShowWalletModal(true)}
              aria-label="Wallet"
            >
              <FontAwesomeIcon
                icon={faWallet}
                className="text-2xl sm:text-3xl"
              />
            </button>
            <p className="mt-2 text-sm sm:text-lg font-semibold">
              Deposit & Withdrawal
            </p>
            {user && (
              <p className="mt-1 text-xs sm:text-sm">
                💲 Balance: ₹{user.chips || 0}
              </p>
            )}
          </div>

          <Link to="/Profile" className="flex flex-col items-center">
            <div className="md:w-20 w-16 md:h-20 h-16 flex items-center justify-center border-4 border-white rounded-full hover:bg-gray-800 transition-colors">
              <FontAwesomeIcon icon={faUser} className="text-2xl sm:text-3xl" />
            </div>
            <p className="mt-2 text-sm sm:text-lg font-semibold">Profile</p>
          </Link>
        </div>

        {/* Marquee Section - Kept as requested */}
        {wellcomeNote && (
          <marquee
            className="mt-6 text-sm sm:text-base font-semibold"
            behavior="scroll"
            direction="left"
            scrollamount="5"
          >
            {wellcomeNote}
          </marquee>
        )}

        {/* Contact Us Button */}
        <a
          href="https://wa.me/919999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full text-sm sm:text-base transition-colors"
        >
          Contact Us
        </a>
      </section>

      {/* Wallet Modal */}
      {showWalletModal && (
        <WalletDeposit onClose={() => setShowWalletModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
