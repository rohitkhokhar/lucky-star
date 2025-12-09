import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";
import RefreshIcon from "../../assets/refresh_icon.png";
import SettingIcon from "../../assets/setting_icon.png";
import LuckyStarLogo from "../../assets/luckystarLogo.png";
import UnmuteIcon from "../../assets/unmute_icon.png";
import muteIcon from "../../assets/mute.png";
import HelpIcon from "../../assets/help_icon.png";
import fullscreenIcon from "../../assets/fullscreen.png";
import fullscreenOutIcon from "../../assets/fullscreen_out.png";
import { getSocket, sendEvent } from "../../signals/socketConnection";
import { filter } from "framer-motion/client";
import cardImages from "../../assets/cards";

function HeaderPart({ muted, setMuted }) {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gameList, setGameList] = useState([]);
  const min_max_config = JSON.parse(localStorage.getItem("min_max_config"));

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  // Function to toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Auto fullscreen on page load
  useEffect(() => {
    const enterFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        });
      }
    };

    setTimeout(() => {
      enterFullscreen();
    }, 1000);
  }, []);

  // Setup socket listener for history
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleGameHistory = (response) => {
      if (response?.data?.game_lists) {
        setGameList(response.data.game_lists);
        setShowModal(true);
      }
    };

    socket.on("res", handleGameHistory);

    return () => {
      socket.off("res", handleGameHistory);
    };
  }, []);

  // Trigger history request
  const handleRefreshClick = () => {
    const socket = getSocket();
    if (!socket) return;
    sendEvent("LIVE_GAME_GAME_HISTORY", {
      en: "LIVE_GAME_GAME_HISTORY",
      data: { filter: false },
    });
  };

  return (
    <>
      <div className="w-full flex px-4 py-2 items-center z-10">
        <div className="z-10">
          <p className="headerText">
            <button
              onClick={handleBack}
              className="text-gray-700 px-4 py-2 text-white"
            >
              ←
            </button>
            TABLE 1 : MIN BET {min_max_config?.min}
          </p>
        </div>
        <div className="flex gap-1 justify-end flex-[1] z-10">
          <div
            onClick={handleRefreshClick}
            className="w-[40px] h-[40px] sm:w-[30px] sm:h-[30px] rounded-4xl bg-black flex items-center justify-center cursor-pointer"
          >
            <img src={RefreshIcon} alt="refreshIcon" />
          </div>
          <div
            className="w-[40px] h-[40px] sm:w-[30px] sm:h-[30px] rounded-4xl bg-black flex items-center justify-center cursor-pointer"
            onClick={toggleMute}
          >
            <img
              src={muted ? UnmuteIcon : muteIcon} // Replace with actual MuteIcon
              alt="muteToggle"
              className="w-[25px] h-[25px]"
            />
          </div>
          <div
            className="w-[40px] h-[40px] sm:w-[30px] sm:h-[30px] rounded-4xl bg-black flex items-center justify-center cursor-pointer"
            onClick={toggleFullscreen}
          >
            <img
              src={isFullscreen ? fullscreenOutIcon : fullscreenIcon}
              className="w-[30px] h-[30px]"
              alt="fullscreenIcon"
            />
          </div>
        </div>
      </div>

      {/* Game History Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg w-[95%] max-w-5xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Game History</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-500 font-semibold"
              >
                Close
              </button>
            </div>
            <div className="overflow-x-auto text-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Ticket ID
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Joker Card
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Result Card
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">
                      Draw Time
                    </th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-600">
                      Bet Amount
                    </th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-600">
                      Win Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white text-black divide-y divide-gray-100">
                  {gameList.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 border-b">
                      <td className="px-4 py-2">{item.ticket_id}</td>
                      {/* <td className="px-3 py-2">{item.total_bet_amount}</td>
                    <td className="px-3 py-2">{item.total_win_amount}</td> */}
                      <td className="px-3 py-2">
                        {item.center_card && (
                          <>
                            <img
                              src={
                                cardImages[
                                  item.center_card.split(" ")[0].toUpperCase()
                                ]
                              }
                              style={{ width: "30px", height: "auto" }}
                            />
                          </>
                        )}
                      </td>
                      <td className="px-3 py-2 flex items-center gap-2">
                        {item.result_card && (
                          <>
                            <span>{item.result_card.split(" ")[0]}</span>{" "}
                            <img
                              src={
                                cardImages[
                                  item.result_card.split(" ")[1].toUpperCase()
                                ]
                              }
                              style={{ width: "30px", height: "auto" }}
                            />
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2 items-end">
                        {new Date(item.draw_time).toLocaleDateString("en-GB")}{" "}
                        {new Date(item.draw_time).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td
                        className={`px-4 py-2 ${
                          item.total_win_amount - item.total_bet_amount < 0
                            ? "text-gray-500"
                            : "text-yellow-600"
                        } text-center `}
                      >
                        {item.total_bet_amount || 0}
                      </td>
                      <td className="px-4 py-2 text-center">{item.total_win_amount}</td>
                    </tr>
                  ))}
                  {gameList.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-4 text-gray-500 border-b"
                      >
                        No game history available.
                      </td>
                    </tr>
                  )}
                  {/* Additional mock rows can be added here */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HeaderPart;
