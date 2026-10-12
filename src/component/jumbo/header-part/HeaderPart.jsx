import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";
import RefreshIcon from "../../../assets/refresh_icon.png";
import SettingIcon from "../../../assets/setting_icon.png";
import LuckyStarLogo from "../../../assets/luckystarLogo.png";
import UnmuteIcon from "../../../assets/unmute_icon.png";
import muteIcon from "../../../assets/mute.png";
import HelpIcon from "../../../assets/help_icon.png";
import fullscreenIcon from "../../../assets/fullscreen.png";
import fullscreenOutIcon from "../../../assets/fullscreen_out.png";
import { getSocket, sendEvent } from "../../../signals/socketConnection";
import { filter } from "framer-motion/client";
import cardImages from "../../../assets/cards";
import { stopWatcher } from "../../../socket.io/setupWatcher";
import { useDispatch, useSelector } from "react-redux";
import { removeBet, clearBets } from "../../../redux/betSlice";

// Parse Matka record (e.g. "244-03-706|11:44:19 PM - 11:45:19 PM" or "976-58-617")
const parseMatkaHistoryItem = (item) => {
  if (!item) return null;
  const s =
    typeof item === "string"
      ? item
      : item.win_card || item.result || item.draw_result || "";
  if (!s) return null;

  const [resPart] = s.split("|");
  const cleaned = resPart.trim();

  // Pattern: 3 digits - 1-2 digits - 3 digits (e.g. "244-03-706", "976-58-617")
  const match = cleaned.match(
    /^(\d{3})\s*[-|]\s*(\d{1,2}|\*{1,2})\s*[-|]\s*(\d{3})/,
  );
  if (match) {
    const openPatti = match[1];
    const jodi = match[2].replace(/\*/g, "");
    const closePatti = match[3];
    const openDigit =
      jodi && jodi.length > 0
        ? jodi[0]
        : String(openPatti.split("").reduce((a, b) => a + Number(b), 0) % 10);
    const closeDigit =
      jodi && jodi.length > 1
        ? jodi[1]
        : String(closePatti.split("").reduce((a, b) => a + Number(b), 0) % 10);
    return {
      openPatti,
      openDigit,
      closeDigit,
      closePatti,
    };
  }

  // Fallback: 3 digits open - 3 digits close
  const match2 = cleaned.match(/(\d{3})\s*[-|]\s*(\d{3})/);
  if (match2) {
    const openPatti = match2[1];
    const closePatti = match2[2];
    const openDigit = String(
      openPatti.split("").reduce((a, b) => a + Number(b), 0) % 10,
    );
    const closeDigit = String(
      closePatti.split("").reduce((a, b) => a + Number(b), 0) % 10,
    );
    return {
      openPatti,
      openDigit,
      closeDigit,
      closePatti,
    };
  }

  const digits = cleaned.replace(/\D/g, "");
  if (digits.length >= 8) {
    return {
      openPatti: digits.slice(0, 3),
      openDigit: digits[3],
      closeDigit: digits[4] || digits[3],
      closePatti: digits.slice(-3),
    };
  }

  return null;
};

const DEFAULT_RESULT_FALLBACK = [
  "976-58-617",
  "922-36-200",
  "196-64-259",
  "110-37-466",
  "838-19-939",
  "622-52-106",
  "565-86-505",
];

const getLast7DaysResultHistory = (cardsList) => {
  const source =
    Array.isArray(cardsList) && cardsList.length > 0
      ? cardsList
      : DEFAULT_RESULT_FALLBACK;
  const items = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    const raw =
      source[i] || DEFAULT_RESULT_FALLBACK[i % DEFAULT_RESULT_FALLBACK.length];
    const parsed =
      parseMatkaHistoryItem(raw) ||
      parseMatkaHistoryItem(
        DEFAULT_RESULT_FALLBACK[i % DEFAULT_RESULT_FALLBACK.length],
      );

    items.push({
      date: dateStr,
      openText: `${parsed.openPatti} - ${parsed.openDigit}`,
      closeText: `${parsed.closeDigit} - ${parsed.closePatti}`,
    });
  }

  return items;
};

const DEFAULT_GAME_HISTORY = [
  { bets: 7, stake: 3200 },
  { bets: 4, stake: 1900 },
  { bets: 8, stake: 4600 },
  { bets: 9, stake: 3000 },
  { bets: 2, stake: 3500 },
  { bets: 6, stake: 2400 },
  { bets: 1, stake: 600 },
];

const getMyGameHistory = (gameList) => {
  if (!Array.isArray(gameList) || gameList.length === 0) {
    return [];
  }

  return gameList
    .filter((item) => item?.draw_time)
    .sort((a, b) => {
      return new Date(b.draw_time) - new Date(a.draw_time);
    })
    .slice(0, 50)
    .map((item) => {
      const d = new Date(item.draw_time);

      const date = `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1,
      ).padStart(2, "0")}/${d.getFullYear()}`;

      const time = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      return {
        date,
        time,
        ticketId: item.ticket_id || "-",
        gameId: item.game_id || "-",
        betAmount: Number(item.total_bet_amount || 0),
        winAmount: Number(item.total_win_amount || 0),
        resultCard: item.result_card || "-",
        status: item.status,
        cardDetails: item.card_details || {},
      };
    });
};

function HeaderPart({
  muted,
  setMuted,
  roomId,
  bets: propBets,
  onRemoveBet,
  onClearBets,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxBets = useSelector((state) => state.bet?.bets) || {};
  const bets = propBets || reduxBets;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTab, setActiveTab] = useState("game"); // "result" | "game"
  const [gameList, setGameList] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [highlightAnnouncement, setHighlightAnnouncement] = useState(false);

  // Synchronize last_win_cards across components and socket
  const [lastWinCards, setLastWinCards] = useState(() => {
    try {
      const saved = sessionStorage.getItem("last_win_cards");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      "244-03-706|11:44:19 PM - 11:45:19 PM",
      "247-36-709|03:58:54 PM - 03:59:54 PM",
      "236-14-789|04:20:33 PM - 04:21:33 PM",
      "345-21-678|05:42:27 PM - 05:43:27 PM",
    ];
  });

  const min_max_config = JSON.parse(localStorage.getItem("min_max_config"));

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleAnnouncement = (response) => {
      if (response?.err) return;
      const { en, data } = response;
      const text = data?.announcement_text?.trim();

      if (!text) {
        setAnnouncement("");
        setShowAnnouncement(false);
        setHighlightAnnouncement(false);
        return;
      }

      if (en === "LIVE_GAME_INFO" || en === "LIVE_MATKA_GAME_INFO") {
        setAnnouncement(text);
        setShowAnnouncement(true);
      }

      if (en === "GAME_ANNOUNCEMENT") {
        setAnnouncement(text);
        setShowAnnouncement(true);
        setHighlightAnnouncement(true);
        setTimeout(() => {
          setHighlightAnnouncement(false);
        }, 5000);
      }
    };

    socket.on("res", handleAnnouncement);

    return () => {
      socket.off("res", handleAnnouncement);
    };
  }, []);

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
    const socket = getSocket();
    if (!socket) return;
    stopWatcher(); // Stop WebRTC
    sendEvent("LIVE_GAME_CLOSE_GAME", {});
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

  // Setup socket listener for history & last_win_cards
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleGameHistory = (response) => {
      const { en, data } = response || {};

      if (
        data?.last_win_cards &&
        Array.isArray(data.last_win_cards) &&
        data.last_win_cards.length > 0
      ) {
        setLastWinCards(data.last_win_cards);

        try {
          sessionStorage.setItem(
            "last_win_cards",
            JSON.stringify(data.last_win_cards),
          );
        } catch (e) {}
      }

      if (data?.game_lists && Array.isArray(data.game_lists)) {
        setGameList(data.game_lists);
      }
    };

    socket.on("res", handleGameHistory);

    return () => {
      socket.off("res", handleGameHistory);
    };
  }, []);

  const getResultHistoryFromGameList = (gameList) => {
    if (!Array.isArray(gameList) || gameList.length === 0) {
      return [];
    }

    const grouped = {};

    gameList.forEach((item) => {
      if (!item?.result_card || !item?.draw_time) return;

      const date = new Date(item.draw_time);

      if (isNaN(date.getTime())) return;

      const dateStr = `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}/${date.getFullYear()}`;

      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: dateStr,
          openText: "",
          closeText: "",
          openTime: null,
          closeTime: null,
        };
      }

      const result = item.result_card.trim();

      // (Open) 333-9
      const openMatch = result.match(/^\(Open\)\s*(\d{3})-(\d)$/i);

      // (Close) 9-333
      const closeMatch = result.match(/^\(Close\)\s*(\d)-(\d{3})$/i);

      if (openMatch) {
        grouped[dateStr].openText = `${openMatch[1]} - ${openMatch[2]}`;
        grouped[dateStr].openTime = date.getTime();
      }

      if (closeMatch) {
        grouped[dateStr].closeText = `${closeMatch[1]} - ${closeMatch[2]}`;
        grouped[dateStr].closeTime = date.getTime();
      }
    });

    return Object.values(grouped)
      .sort((a, b) => {
        const aTime = Math.max(a.openTime || 0, a.closeTime || 0);
        const bTime = Math.max(b.openTime || 0, b.closeTime || 0);

        return bTime - aTime;
      })
      .slice(0, 7);
  };

  // Trigger history request and open modal
  const handleRefreshClick = () => {
    const socket = getSocket();
    if (socket) {
      sendEvent("LIVE_MATKA_GAME_GAME_HISTORY", {
        en: "LIVE_MATKA_GAME_GAME_HISTORY",
        data: { filter: false },
      });
    }
    // Sync with sessionStorage
    try {
      const saved = sessionStorage.getItem("last_win_cards");
      if (saved) setLastWinCards(JSON.parse(saved));
    } catch (e) {}
    setShowModal(true);
  };

  const last7DaysResults = getResultHistoryFromGameList(gameList);
  const myGameHistory = getMyGameHistory(gameList);

  return (
    <>
      <div className="top-bar">
        <div className="top-left">
          <button className="icon-btn" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="table-info">
            <span className="table-name">TABLE 1 : MIN BET 10</span>
          </div>
        </div>

        <div className="top-right">
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "end",
              marginBottom: "5px",
            }}
          >
            <button
              className="icon-btn"
              id="history-btn"
              onClick={handleRefreshClick}
            >
              <img
                src={RefreshIcon}
                alt="refreshIcon"
                className="w-[1rem] h-[1rem]"
              />
            </button>
            <button className="icon-btn" id="volume-btn" onClick={toggleMute}>
              <img
                src={muted ? UnmuteIcon : muteIcon}
                alt="muteToggle"
                className="w-[1rem] h-[1rem]"
              />
            </button>
            <button
              className="icon-btn"
              id="fullscreen-btn"
              onClick={toggleFullscreen}
            >
              <img
                src={isFullscreen ? fullscreenOutIcon : fullscreenIcon}
                className="w-[1rem] h-[1rem]"
                alt="fullscreenIcon"
              />
            </button>
          </div>
          <div className="current-bets-panel" id="current-bets-panel">
            <div className="bets-header">
              <span>My Bet</span>
              <button
                type="button"
                className="clear-bet-btn"
                id="clear-bet-btn"
                onClick={() => {
                  if (onClearBets) {
                    onClearBets();
                  } else {
                    dispatch(clearBets());
                  }
                }}
                disabled={Object.keys(bets).length === 0}
                title="Clear all bets"
              >
                Clear Bet
              </button>
            </div>
            <div className="bets-list" id="bets-list">
              {Object.keys(bets).length === 0 ? (
                <div className="empty-bets">No bets placed</div>
              ) : (
                Object.entries(bets).map(([key, bet]) => {
                  const getChipClass = (val) => {
                    if (val >= 1000) return "1k";
                    if (val >= 500) return "500";
                    if (val >= 100) return "100";
                    if (val >= 50) return "50";
                    return "10";
                  };
                  const chipClass = getChipClass(bet.amount);
                  const displayAmount =
                    bet.amount >= 1000 ? `${bet.amount / 1000}k` : bet.amount;

                  const formatGameType = (type) => {
                    if (!type) return "";
                    return type
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ");
                  };

                  return (
                    <div className="bet-item" key={key}>
                      <div className="bet-info">
                        <div className={`bet-chip chip-${chipClass}`}>
                          {displayAmount}
                        </div>
                        <span style={{ fontSize: "0.65rem" }}>
                          <strong>{bet.number}</strong> (
                          {formatGameType(bet.gameType)} -{" "}
                          {bet.market?.toUpperCase()})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => {
                          if (onRemoveBet) {
                            onRemoveBet(key);
                          } else {
                            dispatch(removeBet(key));
                          }
                        }}
                        title="Remove bet"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day History Modal (Result History & My Game History) */}
      {showModal && (
        <div
          className="history-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="history-modal-card">
            <button
              type="button"
              className="history-modal-close"
              onClick={() => setShowModal(false)}
              title="Close"
            >
              &times;
            </button>

            <h3 className="history-modal-title">History (Last 7 Days)</h3>

            {/* Toggle Tabs */}
            <div className="history-tabs-container">
              {/* <button
                type="button"
                className={`history-tab-btn ${activeTab === "result" ? "active" : ""}`}
                onClick={() => setActiveTab("result")}
              >
                Result History
              </button> */}
              {/* <button
                type="button"
                className={`history-tab-btn ${activeTab === "game" ? "active" : ""}`}
                onClick={() => setActiveTab("game")}
              >
                My Game History
              </button> */}
            </div>

            {/* Tab Contents */}
            <div className="history-list-content">
              {activeTab === "result" ? (
                last7DaysResults.map((item, idx) => (
                  <div className="history-item-card" key={`res-hist-${idx}`}>
                    <div className="history-item-date">{item.date}</div>
                    <div className="history-result-row">
                      <div>
                        <span className="history-label">Open: </span>
                        <span className="history-val">{item.openText}</span>
                      </div>
                      <div>
                        <span className="history-label">Close: </span>
                        <span className="history-val">{item.closeText}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : myGameHistory.length === 0 ? (
                <div className="history-item-card">
                  <div className="history-game-text">No game history found</div>
                </div>
              ) : (
                myGameHistory.map((item, idx) => (
                  <div
                    className="history-item-card"
                    key={`game-hist-${item.ticketId}-${idx}`}
                  >
                    <div className="history-item-date flex justify-between">
                      <div>
                        {item.date} &nbsp; {item.time}
                      </div>
                      <div>
                        <strong>Bet:</strong>{" "}
                        <span>₹{item.betAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="history-game-text">
                      <div className="flex justify-between">
                        <div>
                          <strong>Ticket:</strong> {item.ticketId}
                        </div>
                        <div>
                          <strong>Win:</strong>{" "}
                          <span>₹{item.winAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <div>
                          <strong>Game:</strong> {item.gameId}
                        </div>
                        <div>
                          <strong>Result:</strong>{" "}
                          <span>{item.resultCard}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="history-view-btn"
                          onClick={() => {
                            setSelectedGame(item);
                            setShowCardDetails(true);
                          }}
                        >
                          View
                        </button>
                      </div>

                      <div></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showCardDetails && selectedGame && (
        <div
          className="history-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCardDetails(false);
              setSelectedGame(null);
            }
          }}
        >
          <div className="history-modal-card card-details-card">
            <button
              type="button"
              className="history-modal-close"
              onClick={() => {
                setShowCardDetails(false);
                setSelectedGame(null);
              }}
              title="Close"
            >
              &times;
            </button>

            <h3 className="history-modal-title">Bet Details</h3>

            <div className="card-details-info">
              <div className="card-details-info-row">
                <strong>Ticket</strong>
                <strong>{selectedGame.ticketId}</strong>
              </div>

              <div className="card-details-info-row">
                <strong>Game</strong>
                <strong>{selectedGame.gameId}</strong>
              </div>

              <div className="card-details-info-row">
                <strong>Result</strong>
                <strong>{selectedGame.resultCard}</strong>
              </div>

              <div className="card-details-info-row">
                <strong>Total Bet</strong>
                <strong>₹{selectedGame.betAmount.toLocaleString()}</strong>
              </div>

              <div className="card-details-info-row">
                <strong>Total Win</strong>
                <strong>₹{selectedGame.winAmount.toLocaleString()}</strong>
              </div>
            </div>

            <div className="card-details-list">
              {Object.entries(selectedGame.cardDetails || {}).map(
                ([gameType, numbers]) => (
                  <div className="card-details-section" key={gameType}>
                    <div className="card-details-game-type">
                      {gameType
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </div>

                    <div className="card-details-numbers">
                      {Object.entries(numbers || {}).map(([number, amount]) => (
                        <div
                          className="card-detail-row"
                          key={`${gameType}-${number}`}
                        >
                          <span className="card-detail-number">{number}</span>

                          <span className="card-detail-amount">
                            ₹{Number(amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HeaderPart;
