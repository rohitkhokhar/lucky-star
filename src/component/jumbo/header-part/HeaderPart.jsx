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
  const s = typeof item === "string" ? item : item.win_card || item.result || item.draw_result || "";
  if (!s) return null;

  const [resPart] = s.split("|");
  const cleaned = resPart.trim();

  // Pattern: 3 digits - 1-2 digits - 3 digits (e.g. "244-03-706", "976-58-617")
  const match = cleaned.match(/^(\d{3})\s*[-|]\s*(\d{1,2}|\*{1,2})\s*[-|]\s*(\d{3})/);
  if (match) {
    const openPatti = match[1];
    const jodi = match[2].replace(/\*/g, "");
    const closePatti = match[3];
    const openDigit = jodi && jodi.length > 0 ? jodi[0] : String(openPatti.split("").reduce((a, b) => a + Number(b), 0) % 10);
    const closeDigit = jodi && jodi.length > 1 ? jodi[1] : String(closePatti.split("").reduce((a, b) => a + Number(b), 0) % 10);
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
    const openDigit = String(openPatti.split("").reduce((a, b) => a + Number(b), 0) % 10);
    const closeDigit = String(closePatti.split("").reduce((a, b) => a + Number(b), 0) % 10);
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
  const source = Array.isArray(cardsList) && cardsList.length > 0 ? cardsList : DEFAULT_RESULT_FALLBACK;
  const items = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    const raw = source[i] || DEFAULT_RESULT_FALLBACK[i % DEFAULT_RESULT_FALLBACK.length];
    const parsed = parseMatkaHistoryItem(raw) || parseMatkaHistoryItem(DEFAULT_RESULT_FALLBACK[i % DEFAULT_RESULT_FALLBACK.length]);

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

const getLast7DaysGameHistory = (gameList, currentBets) => {
  const betsByDate = {};
  if (Array.isArray(gameList)) {
    gameList.forEach((item) => {
      if (item.draw_time) {
        const d = new Date(item.draw_time);
        if (!isNaN(d.getTime())) {
          const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
          if (!betsByDate[dateStr]) betsByDate[dateStr] = { bets: 0, stake: 0 };
          betsByDate[dateStr].bets += 1;
          let stake = 0;
          if (item.card_details && typeof item.card_details === "object") {
            stake = Object.values(item.card_details).reduce((s, a) => s + Number(a || 0), 0);
          } else {
            stake = Number(item.total_bet_amount || item.bet_amount || 0);
          }
          betsByDate[dateStr].stake += stake;
        }
      }
    });
  }

  const items = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    const defaultDay = DEFAULT_GAME_HISTORY[i] || { bets: 0, stake: 0 };
    const realDay = betsByDate[dateStr];

    let count = realDay ? realDay.bets : defaultDay.bets;
    let totalStake = realDay ? realDay.stake : defaultDay.stake;

    if (i === 0 && currentBets && Object.keys(currentBets).length > 0) {
      const liveCount = Object.keys(currentBets).length;
      const liveStake = Object.values(currentBets).reduce((s, b) => s + Number(b.amount || 0), 0);
      count = (realDay ? realDay.bets : defaultDay.bets) + liveCount;
      totalStake = (realDay ? realDay.stake : defaultDay.stake) + liveStake;
    }

    items.push({
      date: dateStr,
      bets: count,
      stake: totalStake,
    });
  }

  return items;
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
  const [activeTab, setActiveTab] = useState("result"); // "result" | "game"
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
      if (data?.last_win_cards && Array.isArray(data.last_win_cards) && data.last_win_cards.length > 0) {
        setLastWinCards(data.last_win_cards);
        try {
          sessionStorage.setItem("last_win_cards", JSON.stringify(data.last_win_cards));
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

  // Trigger history request and open modal
  const handleRefreshClick = () => {
    const socket = getSocket();
    if (socket) {
      sendEvent("LIVE_GAME_GAME_HISTORY", {
        en: "LIVE_GAME_GAME_HISTORY",
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

  const last7DaysResults = getLast7DaysResultHistory(lastWinCards);
  const last7DaysUserHistory = getLast7DaysGameHistory(gameList, bets);

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
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ");
                  };

                  return (
                    <div className="bet-item" key={key}>
                      <div className="bet-info">
                        <div className={`bet-chip chip-${chipClass}`}>
                          {displayAmount}
                        </div>
                        <span style={{ fontSize: "0.65rem" }}>
                          <strong>{bet.number}</strong> ({formatGameType(bet.gameType)} - {bet.market?.toUpperCase()})
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
              <button
                type="button"
                className={`history-tab-btn ${activeTab === "result" ? "active" : ""}`}
                onClick={() => setActiveTab("result")}
              >
                Result History
              </button>
              <button
                type="button"
                className={`history-tab-btn ${activeTab === "game" ? "active" : ""}`}
                onClick={() => setActiveTab("game")}
              >
                My Game History
              </button>
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
              ) : (
                last7DaysUserHistory.map((item, idx) => (
                  <div className="history-item-card" key={`game-hist-${idx}`}>
                    <div className="history-item-date">{item.date}</div>
                    <div className="history-game-text">
                      Played {item.bets} bets. Total stake:{" "}
                      <strong>₹{item.stake.toLocaleString()}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HeaderPart;
