import React, { useMemo, useState, useEffect } from "react";
import Toast from "./Toast";
import "./footer.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addBet as addReduxBet,
  removeBet as removeReduxBet,
  addCycleBets as addReduxCycleBets,
  setMarketType as setReduxMarketType,
} from "../../../redux/betSlice";
import { getSocket } from "../../../signals/socketConnection";

// Helper function to format seconds into mm:ss
const formatTime = (totalSeconds) => {
  if (
    totalSeconds === null ||
    totalSeconds === undefined ||
    isNaN(totalSeconds)
  ) {
    return "00:00";
  }
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function Box2({
  placeCoin,
  coinPositions,
  selectedCoin: propSelectedCoin,
  centerCard,
  gameState,
  btnDisabled,
  data,
  opencard,
  winumber,
  closecard,
  total_wallet,
  userBalance,
  pendingBets,
  marketType: propMarketType,
  setMarketType: propSetMarketType,
  bets: propBets,
  setBets: propSetBets,
  roundTimers,
}) {
  const dispatch = useDispatch();
  const reduxBetState = useSelector((state) => state.bet) || {};

  const openWinCard = opencard || null;
  const winNumber = winumber || null;
  const closeWinCard = closecard || null;

  const isGameDisabled =
    gameState === "round_start" ||
    gameState === "round_end" ||
    gameState === "winner" ||
    gameState === "set_joker" ||
    gameState === "bet_locked" ||
    gameState === "bet_lock" ||
    gameState === "no_more_bet" ||
    gameState === "no_more_first_bet" ||
    gameState === "no_more_second_bet" ||
    gameState === "no_more_third_bet" ||
    Boolean(btnDisabled);

  const currentMarketType = (
    propMarketType ||
    reduxBetState.marketType ||
    "open"
  ).toLowerCase();
  const selectedCoin = propSelectedCoin || reduxBetState.selectedCoin;

  const [activeTab, setActiveTab] = useState("single");
  const [singleFilter, setSingleFilter] = useState("all");
  const [jodiFilter, setJodiFilter] = useState("all");
  const [pattiFilter, setPattiFilter] = useState("all");

  const reduxBets = reduxBetState.bets || propBets || {};
  const [gridBets, setGridBets] = useState({});

  const parseWinCard = (winCard) => {
    if (!winCard || typeof winCard !== "string") {
      return {
        openCard: null,
        number: null,
        closeCard: null,
      };
    }

    const parts = winCard.split("-");

    return {
      openCard: parts[0] && parts[0] !== "***" ? parts[0] : null,
      number:
        parts[1] && parts[1] !== "**" && parts[1] !== "*" && parts[1] !== "***"
          ? parts[1]
          : null,
      closeCard: parts[2] && parts[2] !== "***" ? parts[2] : null,
    };
  };

  // console.log(first)

  useEffect(() => {
    if (
      Object.keys(reduxBets).length === 0 &&
      Object.keys(gridBets).length > 0
    ) {
      setGridBets({});
    } else {
      const gridKeys = Object.keys(gridBets);
      const staleKeys = gridKeys.filter((k) => !reduxBets[k]);
      if (staleKeys.length > 0) {
        setGridBets((prev) => {
          const updated = { ...prev };
          staleKeys.forEach((k) => delete updated[k]);
          return updated;
        });
      }
    }
  }, [reduxBets, gridBets]);

  const [cycleOpen, setCycleOpen] = useState([]);
  const [cycleClose, setCycleClose] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  /* ==========================================
GAME TYPES
========================================== */

  const gameTypes = {
    single: {
      custom: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      limitKey: "single",
    },

    jodi: {
      count: 100,
      limitKey: "jodi",
    },

    "single-patti": {
      custom: [
        120, 123, 124, 125, 126, 127, 128, 129, 130, 134, 135, 136, 137, 138,
        139, 140, 145, 146, 147, 148, 149, 150, 156, 157, 158, 159, 160, 167,
        168, 169, 170, 178, 179, 180, 189, 190, 230, 234, 235, 236, 237, 238,
        239, 240, 245, 246, 247, 248, 249, 250, 256, 257, 258, 259, 260, 267,
        268, 269, 270, 278, 279, 280, 289, 290, 340, 345, 346, 347, 348, 349,
        350, 356, 357, 358, 359, 360, 367, 368, 369, 370, 378, 379, 380, 389,
        390, 450, 456, 457, 458, 459, 460, 467, 468, 469, 470, 478, 479, 480,
        489, 490, 560, 567, 568, 569, 570, 578, 579, 580, 589, 590, 670, 678,
        679, 680, 689, 690, 780, 789, 790, 890,
      ],
      limitKey: "single_patti",
    },

    "double-patti": {
      custom: [
        110, 112, 113, 114, 115, 116, 117, 118, 119, 122, 133, 144, 155, 166,
        177, 188, 199, 220, 223, 224, 225, 226, 227, 228, 229, 233, 244, 255,
        266, 277, 288, 299, 330, 334, 335, 336, 337, 338, 339, 344, 355, 366,
        377, 388, 399, 440, 445, 446, 447, 448, 449, 455, 466, 477, 488, 499,
        550, 556, 557, 558, 559, 566, 577, 588, 599, 660, 667, 668, 669, 677,
        688, 699, 770, 778, 779, 788, 799, 880, 889, 899, 990,
      ],
      limitKey: "double_patti",
    },

    "triple-patti": {
      custom: [111, 222, 333, 444, 555, 666, 777, 888, 999, "000"],
      limitKey: "triple_patti",
    },
  };

  /* ==========================================
TABS
========================================== */

  const tabs = [
    {
      key: "single",
      label: "Single",
    },
    {
      key: "jodi",
      label: "Jodi",
    },
    {
      key: "single-patti",
      label: "Single Patti",
    },
    {
      key: "double-patti",
      label: "Double Patti",
    },
    {
      key: "triple-patti",
      label: "Triple Patti",
    },
    {
      key: "cycle",
      label: "Cycle",
    },
  ];

  /* ==========================================
BALANCE
========================================== */

  const currentBalance = Number(total_wallet ?? userBalance ?? 0);

  /* ==========================================
SELECTED COIN VALUE
========================================== */

  const currentStake = Number(selectedCoin?.value || 0);

  /* ==========================================
TOTAL BET
========================================== */

  const totalBetAmount = useMemo(() => {
    return Object.values(reduxBets).reduce(
      (sum, bet) => sum + Number(bet.amount || 0),
      0,
    );
  }, [reduxBets]);

  /* ==========================================
TOAST
========================================== */

  const showToast = (message) => {
    setErrorMessage(message);
    setShowError(true);

    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  /* ==========================================
GET BET KEY
========================================== */

  const getBetKey = (gameType, market, number) => {
    return `${gameType}-${market}-${number}`;
  };

  /* ==========================================
GET ALL NUMBERS
========================================== */

  const numbers = useMemo(() => {
    if (activeTab === "cycle") {
      return [];
    }

    const game = gameTypes[activeTab];

    if (!game) {
      return [];
    }

    if (game.custom) {
      return game.custom;
    }

    return Array.from({ length: game.count }, (_, i) =>
      i.toString().padStart(2, "0"),
    );
  }, [activeTab]);

  /* ==========================================
APPLY FILTER
========================================== */

  const filteredNumbers = useMemo(() => {
    let result = [...numbers];

    /*
     * SINGLE
     */
    if (activeTab === "single") {
      if (singleFilter === "even") {
        result = result.filter((number) => Number(number) % 2 === 0);
      }

      if (singleFilter === "odd") {
        result = result.filter((number) => Number(number) % 2 !== 0);
      }
    }

    /*
     * JODI
     */
    if (activeTab === "jodi") {
      if (jodiFilter === "farak-10") {
        result = result.filter((number) => number[0] === number[1]);
      }

      if (jodiFilter === "farak-5") {
        result = result.filter(
          (number) => Math.abs(Number(number[0]) - Number(number[1])) === 5,
        );
      }

      if (jodiFilter.startsWith("num-")) {
        const filterNumber = Number(jodiFilter.split("-")[1]);

        result = result.filter((number) => {
          const sum = Number(number[0]) + Number(number[1]);

          return sum % 10 === filterNumber;
        });
      }
    }

    /*
     * PATTI
     */
    if (
      activeTab === "single-patti" ||
      activeTab === "double-patti" ||
      activeTab === "triple-patti"
    ) {
      if (pattiFilter.startsWith("num-")) {
        const filterNumber = Number(pattiFilter.split("-")[1]);

        result = result.filter((number) => {
          const digitSum = String(number)
            .split("")
            .reduce((sum, digit) => sum + Number(digit), 0);

          return digitSum % 10 === filterNumber;
        });
      }
    }

    return result;
  }, [numbers, activeTab, singleFilter, jodiFilter, pattiFilter]);

  /* ==========================================
NUMBER BET AMOUNT
========================================== */

  const getNumberBetAmount = (number) => {
    const key = getBetKey(activeTab, currentMarketType, String(number));
    const reduxAmount = Number(reduxBets[key]?.amount || 0);
    if (reduxAmount <= 0) return 0;
    const gridAmount = Number(gridBets[key] || 0);
    return Math.min(gridAmount, reduxAmount);
  };

  /* ==========================================
PLACE NUMBER BET
========================================== */

  const handleNumberClick = (number) => {
    if (isGameDisabled) {
      showToast("Betting is not allowed at this stage.");
      return;
    }

    if (!selectedCoin || !selectedCoin.value) {
      showToast("Please select a coin first!");
      return;
    }

    if (!currentStake || currentStake <= 0) {
      showToast("Invalid coin!");
      return;
    }

    if (totalBetAmount + currentStake > currentBalance && currentBalance > 0) {
      showToast("Insufficient Balance!");
      return;
    }

    const currentGame = gameTypes[activeTab];
    const key = getBetKey(activeTab, currentMarketType, String(number));
    const existingAmount = Number(reduxBets[key]?.amount || 0);

    const maxBet = Number(data?.bet_limit_configs?.[currentGame.limitKey] || 0);
    if (maxBet > 0 && existingAmount + currentStake > maxBet) {
      showToast("Bet limit exceeded!");
      return;
    }

    dispatch(
      addReduxBet({
        gameType: activeTab,
        market: currentMarketType,
        number: String(number),
        amount: currentStake,
        odds: currentGame.multiplier,
      }),
    );

    setGridBets((prev) => ({
      ...prev,
      [key]:
        Number(prev[key] !== undefined ? prev[key] : existingAmount) +
        currentStake,
    }));
  };

  /* ==========================================
REMOVE BET
========================================== */

  const removeBet = (gameType, market, number) => {
    const key = getBetKey(gameType, market, number);

    dispatch(removeReduxBet(key));

    setGridBets((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  /* ==========================================
CYCLE OPEN
========================================== */

  const toggleCycleOpen = (number) => {
    if (isGameDisabled) return;
    setCycleOpen((prev) => {
      if (prev.includes(number)) {
        return prev.filter((item) => item !== number);
      }

      return [...prev, number];
    });
  };

  /* ==========================================
CYCLE CLOSE
========================================== */

  const toggleCycleClose = (number) => {
    if (isGameDisabled) return;
    setCycleClose((prev) => {
      if (prev.includes(number)) {
        return prev.filter((item) => item !== number);
      }

      return [...prev, number];
    });
  };

  /* ==========================================
GENERATE CYCLE
========================================== */

  const generateCycleBets = () => {
    if (isGameDisabled) {
      showToast("Betting is not allowed at this stage.");
      return;
    }

    if (!selectedCoin || !selectedCoin.value) {
      showToast("Please select a coin first!");
      return;
    }

    if (cycleOpen.length === 0 || cycleClose.length === 0) {
      showToast("Please select at least one Open and one Close number.");
      return;
    }

    const combinations = [];

    cycleOpen.forEach((openNumber) => {
      cycleClose.forEach((closeNumber) => {
        combinations.push(`${openNumber}${closeNumber}`);
      });
    });

    const requiredAmount = combinations.length * currentStake;

    if (
      totalBetAmount + requiredAmount > currentBalance &&
      currentBalance > 0
    ) {
      showToast("Insufficient balance!");
      return;
    }

    dispatch(
      addReduxCycleBets({
        combinations,
        currentStake,
        marketType: currentMarketType,
        odds: gameTypes.jodi.multiplier,
      }),
    );

    setGridBets((prev) => {
      const updated = { ...prev };
      combinations.forEach((number) => {
        const key = getBetKey("jodi", currentMarketType, number);
        updated[key] = Number(updated[key] || 0) + currentStake;
      });
      return updated;
    });

    setCycleOpen([]);
    setCycleClose([]);

    showToast(`${combinations.length} bets generated!`);
  };

  /* ==========================================
  ROUND TIMERS (OPEN & CLOSE)
  ========================================== */

  const [internalTimers, setInternalTimers] = useState({
    open: null,
    close: null,
    receivedAt: null,
  });

  // Sync from props when received
  useEffect(() => {
    if (
      roundTimers &&
      (roundTimers.open !== null || roundTimers.close !== null)
    ) {
      setInternalTimers(roundTimers);
    }
  }, [roundTimers]);

  // Fallback socket listener for LIVE_MATKA_GAME_BET_START / LIVE_GAME_BET_START
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleBetStart = (response) => {
      if (!response || response.err) return;
      const { en, data } = response;
      if (en === "LIVE_MATKA_GAME_BET_START" || en === "LIVE_GAME_BET_START") {
        const rawOpen =
          data?.msg?.open?.time ??
          (typeof data?.msg?.open === "number" ? data.msg.open : null);
        const rawClose =
          data?.msg?.close?.time ??
          (typeof data?.msg?.close === "number" ? data.msg.close : null);

        if (rawOpen !== null || rawClose !== null) {
          setInternalTimers({
            open: rawOpen !== null ? Number(rawOpen) : null,
            close: rawClose !== null ? Number(rawClose) : null,
            receivedAt: Date.now(),
          });
        }
      } else if (
        en === "LIVE_MATKA_GAME_START_ROUND" ||
        en === "LIVE_GAME_START_ROUND" ||
        en === "LIVE_MATKA_GAME_END_ROUND" ||
        en === "LIVE_GAME_END_ROUND"
      ) {
        setInternalTimers({ open: null, close: null, receivedAt: null });
      }
    };

    socket.on("res", handleBetStart);
    return () => {
      socket.off("res", handleBetStart);
    };
  }, []);

  const [openSeconds, setOpenSeconds] = useState(null);
  const [closeSeconds, setCloseSeconds] = useState(null);
  const isOpenRunning = openSeconds !== null && openSeconds > 0;
  const isCloseRunning = closeSeconds !== null && closeSeconds > 0;

  useEffect(() => {
    const targetOpen = internalTimers.open;
    const targetClose = internalTimers.close;
    const startTime = internalTimers.receivedAt || Date.now();

    if (targetOpen === null && targetClose === null) {
      setOpenSeconds(null);
      setCloseSeconds(null);
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (targetOpen !== null) {
        setOpenSeconds(Math.max(0, targetOpen - elapsed));
      } else {
        setOpenSeconds(null);
      }
      if (targetClose !== null) {
        setCloseSeconds(Math.max(0, targetClose - elapsed));
      } else {
        setCloseSeconds(null);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [internalTimers]);

  const handleSelectMarket = (type) => {
    if (isGameDisabled) return;
    dispatch(setReduxMarketType(type));
    if (propSetMarketType) {
      propSetMarketType(type);
    }
  };

  // useEffect(() => {
  //   const socket = getSocket();

  //   if (!socket) return;

  //   const handleWinner = (response) => {
  //     if (!response || response.err) return;

  //     if (response.en !== "LIVE_MATKA_GAME_WINNER" || !response.data) {
  //       return;
  //     }

  //     const { win_type, win_card } = response.data;

  //     const parsed = parseWinCard(win_card);

  //     if (win_type === "open") {
  //       // Open: 111-3*-***
  //       setOpenWinCard(parsed.openCard);
  //       setWinNumber(parsed.number); // 3*
  //       setCloseWinCard(null);
  //     }

  //     if (win_type === "close") {
  //       // Close: 111-36-349
  //       setOpenWinCard(parsed.openCard);
  //       setWinNumber(parsed.number);
  //       setCloseWinCard(parsed.closeCard);
  //     }
  //   };

  //   socket.on("res", handleWinner);

  //   return () => {
  //     socket.off("res", handleWinner);
  //   };
  // }, []);

  /* ==========================================
  DEALER CARDS
  ========================================== */

  const dealerCards = [1, 2, 3];

  /* ==========================================
  TAB CHANGE - RESET SELECT BOX VALUES ONLY
  ========================================== */

  const handleTabChange = (newTabKey) => {
    if (isGameDisabled) {
      showToast("Selection is not allowed at this stage.");
      return;
    }

    if (newTabKey === activeTab) return;

    // Reset select box values on grid, but do NOT clear My Bet
    setGridBets({});

    setCycleOpen([]);
    setCycleClose([]);
    setSingleFilter("all");
    setJodiFilter("all");
    setPattiFilter("all");

    setActiveTab(newTabKey);
  };

  /* ==========================================
RENDER
========================================== */
  // console.log("open ",openWinCard, "close ", closeWinCard, "number ", winNumber);

  return (
    <div className="bottom-center">
      {showError && <Toast message={errorMessage} type="error" />}

      {/* ======================================
      DEALER CARDS & TIMERS (OPEN & CLOSE)
  ====================================== */}

      <div className="dealer-cards-wrapper">
        {/* OPEN TIMER (Before dealer-cards div) */}
        <div
          className={`matka-timer open-timer ${currentMarketType === "open" ? "active-market" : ""} ${isOpenRunning ? "timer-running" : "timer-stopped"}`}
          id="matka-open-timer"
          onClick={() => handleSelectMarket("open")}
          title="Open Market Timer - Click to switch to Open"
        >
          <div className="timer-badge">
            <span
              className={`timer-pulse-dot ${isOpenRunning ? "running-dot" : "stopped-dot"}`}
            />
            OPEN
          </div>
          <div className="timer-clock">
            <span className="timer-digits">{formatTime(openSeconds)}</span>
          </div>
        </div>

        {/* DEALER CARDS DIV */}
        <div className="dealer-cards" id="dealer-cards">
          {dealerCards.map((card) => (
            <div className="flip-card" key={card}>
              <div className="flip-card-inner">
                <div className="flip-card-front" />

                <div className="flip-card-back">?</div>
              </div>
            </div>
          ))}
        </div>

        <div className="game-result">
          {/* OPEN */}
          <div className="result-side left">
            {openWinCard ? (
              String(openWinCard)
                .split("")
                .map((digit, index) => <span key={index}>{digit}</span>)
            ) : (
              <>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </>
            )}
          </div>

          {/* JODI / NUMBER */}
          <div className="result-main">
            <span className="result-number-box2">{winNumber || "--"}</span>
          </div>

          {/* CLOSE */}
          <div className="result-side right">
            {closeWinCard ? (
              String(closeWinCard)
                .split("")
                .map((digit, index) => <span key={index}>{digit}</span>)
            ) : (
              <>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </>
            )}
          </div>
        </div>
        <div className="dealer-cards" id="dealer-cards">
          {dealerCards.map((card) => (
            <div className="flip-card" key={card}>
              <div className="flip-card-inner">
                <div className="flip-card-front" />

                <div className="flip-card-back">?</div>
              </div>
            </div>
          ))}
        </div>

        {/* CLOSE TIMER (After dealer-cards div) */}
        <div
          className={`matka-timer close-timer ${currentMarketType === "close" ? "active-market" : ""} ${isCloseRunning ? "timer-running" : "timer-stopped"}`}
          id="matka-close-timer"
          onClick={() => handleSelectMarket("close")}
          title="Close Market Timer - Click to switch to Close"
        >
          <div className="timer-badge">
            <span
              className={`timer-pulse-dot ${isCloseRunning ? "running-dot" : "stopped-dot"}`}
            />
            CLOSE
          </div>
          <div className="timer-clock">
            <span className="timer-digits">{formatTime(closeSeconds)}</span>
          </div>
        </div>
      </div>

      {/* ======================================
      BETTING PANEL
  ====================================== */}

      <div
        className={`betting-panel mt-2 ${isGameDisabled ? "game-disabled" : ""}`}
        style={
          isGameDisabled
            ? {
                opacity: 0.5,
                pointerEvents: "none",
                filter: "grayscale(70%)",
                userSelect: "none",
                cursor: "not-allowed",
              }
            : {}
        }
      >
        {/* ==================================
        TABS
    ================================== */}

        <div className="betting-tabs" id="betting-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================================
        SINGLE FILTER
    ================================== */}

        {activeTab === "single" && (
          <div
            className="betting-filters filter-group"
            id="single-filters"
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "5px",
              marginBottom: "5px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              className={`filter-btn ${singleFilter === "all" ? "active" : ""}`}
              onClick={() => setSingleFilter("all")}
            >
              All
            </button>

            <button
              type="button"
              className={`filter-btn ${
                singleFilter === "even" ? "active" : ""
              }`}
              onClick={() => setSingleFilter("even")}
            >
              Even
            </button>

            <button
              type="button"
              className={`filter-btn ${singleFilter === "odd" ? "active" : ""}`}
              onClick={() => setSingleFilter("odd")}
            >
              Odd
            </button>
          </div>
        )}

        {/* ==================================
        JODI FILTER
    ================================== */}

        {activeTab === "jodi" && (
          <div
            className="betting-filters filter-group"
            id="jodi-filters"
            style={{
              display: "flex",
              gap: "5px",
              marginTop: "5px",
              marginBottom: "5px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className={`filter-btn ${jodiFilter === "all" ? "active" : ""}`}
              onClick={() => setJodiFilter("all")}
            >
              Clear Filter
            </button>

            <button
              type="button"
              className={`filter-btn ${
                jodiFilter === "farak-10" ? "active" : ""
              }`}
              onClick={() => setJodiFilter("farak-10")}
            >
              10 Farak
            </button>

            <button
              type="button"
              className={`filter-btn ${
                jodiFilter === "farak-5" ? "active" : ""
              }`}
              onClick={() => setJodiFilter("farak-5")}
            >
              5 Farak
            </button>

            <div
              style={{
                width: "100%",
                height: "2px",
              }}
            />

            {/* {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <button
                key={number}
                type="button"
                className={`filter-btn ${
                  jodiFilter === `num-${number}` ? "active" : ""
                }`}
                onClick={() => setJodiFilter(`num-${number}`)}
              >
                {number}
              </button>
            ))} */}
          </div>
        )}

        {/* ==================================
        PATTI FILTER
    ================================== */}

        {activeTab.includes("patti") && (
          <div
            className="betting-filters filter-group"
            id="patti-filters"
            style={{
              display: "flex",
              gap: "5px",
              marginTop: "5px",
              marginBottom: "5px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                height: "2px",
              }}
            />

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <button
                key={number}
                type="button"
                className={`filter-btn ${
                  pattiFilter === `num-${number}` ? "active" : ""
                }`}
                onClick={() => setPattiFilter(`num-${number}`)}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              className={`filter-btn ${pattiFilter === "all" ? "active" : ""}`}
              onClick={() => setPattiFilter("all")}
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* ==================================
        CYCLE
    ================================== */}

        {activeTab === "cycle" && (
          <div className="cycle-container" id="cycle-container">
            {/* OPEN NUMBERS */}

            <div
              style={{
                marginBottom: "5px",
              }}
            >
              <h6
                style={{
                  marginBottom: "5px",
                  color: "var(--accent)",
                }}
              >
                Open Numbers
              </h6>

              <div
                className="cycle-row"
                id="cycle-open"
                style={{
                  display: "flex",
                  gap: "3px",
                }}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(
                  (number) => (
                    <button
                      key={number}
                      type="button"
                      className={`cycle-num-btn ${
                        cycleOpen.includes(number) ? "active" : ""
                      }`}
                      onClick={() => toggleCycleOpen(number)}
                    >
                      {number}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* CLOSE NUMBERS */}

            <div>
              <h6
                style={{
                  marginBottom: "5px",
                  color: "var(--accent)",
                }}
              >
                Close Numbers
              </h6>

              <div
                className="cycle-row"
                id="cycle-close"
                style={{
                  display: "flex",
                  gap: "3px",
                }}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(
                  (number) => (
                    <button
                      key={number}
                      type="button"
                      className={`cycle-num-btn ${
                        cycleClose.includes(number) ? "active" : ""
                      }`}
                      onClick={() => toggleCycleClose(number)}
                    >
                      {number}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "15px",
                textAlign: "center",
              }}
            >
              <button
                type="button"
                className="btn-action btn-place"
                id="btn-generate-cycle"
                style={{
                  padding: "8px 20px",
                }}
                onClick={generateCycleBets}
              >
                Generate Bets
              </button>
            </div>
          </div>
        )}

        {/* ==================================
        BETTING GRID
    ================================== */}

        {activeTab !== "cycle" && (
          <div className="grid-scroll-container">
            <div className="grid-container" id="betting-grid">
              {filteredNumbers.map((number) => {
                const selectedAmount = getNumberBetAmount(number);

                const game = gameTypes[activeTab];

                return (
                  <button
                    key={`${activeTab}-${number}`}
                    type="button"
                    className={`bet-btn flex ${
                      selectedAmount > 0 ? "selected" : ""
                    }`}
                    data-number={number}
                    data-odds={game.multiplier}
                    onClick={() => handleNumberClick(number)}
                  >
                    <span className="number">{number}</span>

                    {/* <span className="odds">{game.multiplier}x</span> */}

                    {/* SAME DESIGN AS
                      HTML placed-chip */}

                    {selectedAmount > 0 && (
                      <span
                        className="placed-chip"
                        style={{ pointerEvents: "none" }}
                      >
                        {selectedAmount >= 1000
                          ? `${(selectedAmount / 1000) % 1 === 0 ? selectedAmount / 1000 : (selectedAmount / 1000).toFixed(1)}k`
                          : selectedAmount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Box2;
