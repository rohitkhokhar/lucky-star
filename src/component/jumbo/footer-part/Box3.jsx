import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getSocket, sendEvent } from "../../../signals/socketConnection";

// Helper to detect if a value is a time/timestamp string (e.g. "03:20:03 PM", "15:20:03", "03:20:03", "2026-09-12T...")
const isTimeFormat = (val) => {
  if (!val || typeof val !== "string") return false;
  const s = val.trim();
  if (/:/.test(s)) return true;
  if (/\b(?:am|pm)\b/i.test(s)) return true;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return true;
  return false;
};

// Flexible string parser for results formatted like "123-67-890", "123-67-890 - 03:20:03 PM", etc.
// Specification: 123-67-890 -> first three (123) is open patti, last three (890) is close patti.
// Under NO circumstances should time/timestamp be shown as a patti.
const parseResultString = (str) => {
  if (!str || str === "dummy|default") {
    return {
      openPatti: "---",
      closePatti: "---",
      jodi: "",
      fullResult: "",
      time: "",
    };
  }

  let s = String(str).trim();
  let extractedTime = "";

  // 1. Separate Matka result and time if pipe is used: e.g. "244-03-706|11:44:19 PM - 11:45:19 PM"
  if (s.includes("|")) {
    const pipeParts = s.split("|").map((p) => p.trim());
    if (pipeParts.length >= 2) {
      if (isTimeFormat(pipeParts[1]) || pipeParts[1].includes(":")) {
        s = pipeParts[0];
        extractedTime = pipeParts.slice(1).join(" | ");
      } else if (pipeParts.length >= 3) {
        // e.g. "244|03|706"
        const openPatti = pipeParts[0].slice(0, 3);
        const jodi = pipeParts[1];
        const closePatti = pipeParts[2].slice(-3);
        return {
          openPatti,
          closePatti,
          jodi,
          fullResult: `${openPatti} - ${jodi} - ${closePatti}`,
          time: "",
        };
      }
    }
  }

  // 2. Extract any remaining embedded time (e.g. "03:20:03 PM" or "11:44:19 PM - 11:45:19 PM")
  const timeRegex =
    /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?(?:\s*-\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)?|\d{4}-\d{2}-\d{2}T[^\s]+)/i;
  const timeMatch = s.match(timeRegex);
  if (timeMatch) {
    if (!extractedTime) extractedTime = timeMatch[0].trim();
    // Strip the time part from the result string
    s = s
      .replace(timeRegex, "")
      .replace(/[-|\s]+$/, "")
      .trim();
  }

  // 3. Direct Matka regex: 3 digits (open patti) - 1/2 digits or asterisks (jodi) - 3 digits (close patti)
  // Matches "244-03-706", "247-36-709", "236-14-789", "345-21-678"
  const matkaFullMatch = s.match(
    /^(\d{3})\s*[-|]\s*(\d{1,2}|\*{1,2})\s*[-|]\s*(\d{3})$/,
  );
  if (matkaFullMatch) {
    const openPatti = matkaFullMatch[1];
    const jodi = matkaFullMatch[2].replace(/\*/g, "");
    const closePatti = matkaFullMatch[3];
    return {
      openPatti,
      closePatti,
      jodi,
      fullResult: `${openPatti} - ${jodi || matkaFullMatch[2]} - ${closePatti}`,
      time: extractedTime,
    };
  }

  // 4. Matka match anywhere in the string:
  const matkaAnyMatch = s.match(
    /(\d{3})\s*[-|]\s*(\d{1,2}|\*{1,2})\s*[-|]\s*(\d{3})/,
  );
  if (matkaAnyMatch) {
    const openPatti = matkaAnyMatch[1];
    const jodi = matkaAnyMatch[2].replace(/\*/g, "");
    const closePatti = matkaAnyMatch[3];
    return {
      openPatti,
      closePatti,
      jodi,
      fullResult: `${openPatti} - ${jodi || matkaAnyMatch[2]} - ${closePatti}`,
      time: extractedTime,
    };
  }

  // 4. Split by '-' or '|', filtering out any time parts
  const sep = s.includes("-") ? "-" : s.includes("|") ? "|" : null;
  if (sep) {
    const parts = s
      .split(sep)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !isTimeFormat(p));

    if (parts.length >= 3) {
      const openPatti = parts[0].slice(0, 3);
      const jodi = parts[1].replace(/\*/g, "");
      // Close patti is the last 3 digits of the last valid non-time part
      const lastPart = parts[parts.length - 1];
      const closeDigits = lastPart.replace(/\D/g, "");
      const closePatti =
        closeDigits.length >= 3 ? closeDigits.slice(-3) : lastPart;
      return {
        openPatti,
        closePatti,
        jodi,
        fullResult: `${openPatti} - ${parts[1]} - ${closePatti}`,
        time: extractedTime,
      };
    } else if (parts.length === 2) {
      const openPatti = parts[0].replace(/\D/g, "").slice(0, 3) || parts[0];
      const secondDigits = parts[1].replace(/\D/g, "");
      if (secondDigits.length >= 3) {
        // Open patti - Close patti format (e.g. "123 - 890")
        const closePatti = secondDigits.slice(-3);
        return {
          openPatti,
          closePatti,
          jodi: "",
          fullResult: `${openPatti} - ${closePatti}`,
          time: extractedTime,
        };
      } else {
        // Open patti - Jodi format (e.g. "123 - 67"), Close patti not yet drawn
        return {
          openPatti,
          closePatti: "---",
          jodi: parts[1],
          fullResult: `${openPatti} - ${parts[1]}`,
          time: extractedTime,
        };
      }
    } else if (parts.length === 1) {
      const d = parts[0].replace(/\D/g, "");
      return {
        openPatti: d.slice(0, 3) || parts[0],
        closePatti: d.length >= 6 ? d.slice(-3) : "---",
        jodi: "",
        fullResult: parts[0],
        time: extractedTime,
      };
    }
  }

  // 5. Digits-only parsing
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 8) {
    const openPatti = digits.slice(0, 3);
    const jodi = digits.slice(3, 5);
    const closePatti = digits.slice(-3);
    return {
      openPatti,
      closePatti,
      jodi,
      fullResult: `${openPatti} - ${jodi} - ${closePatti}`,
      time: extractedTime,
    };
  } else if (digits.length >= 6) {
    const openPatti = digits.slice(0, 3);
    const closePatti = digits.slice(-3);
    return {
      openPatti,
      closePatti,
      jodi: "",
      fullResult: `${openPatti} - ${closePatti}`,
      time: extractedTime,
    };
  } else if (digits.length === 3) {
    return {
      openPatti: digits,
      closePatti: "---",
      jodi: "",
      fullResult: digits,
      time: extractedTime,
    };
  }

  return {
    openPatti: s.length >= 3 ? s.slice(0, 3) : s,
    closePatti: "---",
    jodi: "",
    fullResult: s,
    time: extractedTime,
  };
};

const parseDrawCard = (card, index) => {
  if (!card) return null;

  if (typeof card === "object") {
    // 1. Check if card has a result string (e.g. "123-67-890" or "123-67-890 - 03:20:03 PM")
    const rawResult =
      card.result ||
      card.win_card ||
      card.draw_result ||
      card.win_cards ||
      card.result_card;

    let stringParsed = null;
    if (typeof rawResult === "string" && rawResult.length >= 3) {
      stringParsed = parseResultString(rawResult);
    }

    // Open Patti: explicit fields -> stringParsed -> fallback
    let openPatti =
      card.open_patti ||
      card.openPatti ||
      card.open_pana ||
      card.open_panna ||
      card.openCard ||
      card.open_card;

    if (!openPatti) {
      if (typeof card.open === "string" || typeof card.open === "number") {
        const strVal = String(card.open);
        if (!isTimeFormat(strVal)) openPatti = strVal;
      } else if (card.open?.patti || card.open?.pana || card.open?.card) {
        openPatti = card.open?.patti || card.open?.pana || card.open?.card;
      }
    }

    if (!openPatti && stringParsed) {
      openPatti = stringParsed.openPatti;
    }

    // Close Patti: explicit fields -> stringParsed -> fallback
    // CRITICAL: Must NEVER be a time/timestamp string!
    let closePatti =
      card.close_patti ||
      card.closePatti ||
      card.close_pana ||
      card.close_panna ||
      card.closeCard ||
      card.close_card;

    if (!closePatti) {
      if (typeof card.close === "string" || typeof card.close === "number") {
        const strVal = String(card.close);
        // Only use if it's NOT a time format
        if (!isTimeFormat(strVal)) {
          closePatti = strVal;
        }
      } else if (card.close?.patti || card.close?.pana || card.close?.card) {
        closePatti = card.close?.patti || card.close?.pana || card.close?.card;
      }
    }

    if ((!closePatti || isTimeFormat(String(closePatti))) && stringParsed) {
      closePatti = stringParsed.closePatti;
    }

    // If openPatti is passed as "123-67-890", parse first 3 for open and last 3 for close
    if (
      typeof openPatti === "string" &&
      (openPatti.includes("-") || openPatti.includes("|"))
    ) {
      const parsed = parseResultString(openPatti);
      openPatti = parsed.openPatti;
      if (!closePatti || closePatti === "---") closePatti = parsed.closePatti;
    }

    // If closePatti is passed with delimiters or is a time format, parse or sanitize
    if (
      typeof closePatti === "string" &&
      (closePatti.includes("-") ||
        closePatti.includes("|") ||
        isTimeFormat(closePatti))
    ) {
      const parsed = parseResultString(closePatti);
      closePatti =
        parsed.closePatti !== "---" ? parsed.closePatti : parsed.openPatti;
    }

    // Clean to 3-digit Patti (first 3 digits for open, last 3 digits for close)
    if (typeof openPatti === "string") {
      const d = openPatti.replace(/\D/g, "");
      if (d.length >= 3) openPatti = d.slice(0, 3);
    }
    if (typeof closePatti === "string") {
      if (isTimeFormat(closePatti)) {
        closePatti = "---";
      } else {
        const d = closePatti.replace(/\D/g, "");
        if (d.length >= 3) closePatti = d.slice(-3);
      }
    }

    const jodi = card.jodi || (stringParsed ? stringParsed.jodi : "");
    const fullResult =
      stringParsed?.fullResult ||
      (openPatti && closePatti && closePatti !== "---"
        ? jodi
          ? `${openPatti} - ${jodi} - ${closePatti}`
          : `${openPatti} - ${closePatti}`
        : openPatti || "");

    // Extract time strictly for header badge/time display, never for Patti boxes
    const rawTime =
      card.draw_time ||
      card.drawTime ||
      card.createdAt ||
      (isTimeFormat(String(card.close)) ? String(card.close) : null) ||
      (isTimeFormat(String(card.time)) ? String(card.time) : null) ||
      card.sendTime ||
      stringParsed?.time;

    let formattedTime = "";
    if (rawTime) {
      if (
        typeof rawTime === "string" &&
        (/:/.test(rawTime) || /\b(?:am|pm)\b/i.test(rawTime))
      ) {
        formattedTime = rawTime;
      } else {
        try {
          const d = new Date(rawTime);
          if (!isNaN(d.getTime())) {
            formattedTime = `${d.toLocaleDateString("en-GB")} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
          }
        } catch (e) {}
      }
    }

    return {
      openPatti: String(openPatti || "---"),
      closePatti: String(closePatti || "---"),
      fullResult,
      formattedTime,
      roundId:
        card.round_id ||
        card.game_id ||
        card.ticket_id ||
        `Round #${index + 1}`,
      badge: String(openPatti || "R"),
    };
  }

  if (typeof card === "string" || typeof card === "number") {
    const parsed = parseResultString(String(card));
    return {
      openPatti: String(parsed.openPatti || "---"),
      closePatti: String(parsed.closePatti || "---"),
      fullResult: parsed.fullResult,
      formattedTime: parsed.time || "",
      roundId: `Round #${index + 1}`,
      badge: String(parsed.openPatti || "R"),
    };
  }

  return null;
};

// Fallback initial history records matching the user's last_win_cards pattern
const DEFAULT_HISTORY = [
  "345-21-678|05:42:27 PM - 05:43:27 PM",
  "236-14-789|04:20:33 PM - 04:21:33 PM",
  "247-36-709|03:58:54 PM - 03:59:54 PM",
  "244-03-706|11:44:19 PM - 11:45:19 PM",
];

function Box3({
  data,
  isResult,
  selectedCoin: propSelectedCoin,
  winX,
  resultHistory,
  totalBet: propTotalBet,
}) {
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const [showResultHistory, setShowResultHistory] = useState(false);
  const [resultHistoryData, setResultHistoryData] = useState([]);
  const [resultHistoryLoading, setResultHistoryLoading] = useState(false);
  const [showBetLimit, setShowBetLimit] = useState(false);

  const socket = getSocket();

  const formatHistoryDate = (date) => {
    if (!date) return "---";

    const value = String(date).trim();

    // API format: 04/10/2026
    const parts = value.split("/");

    if (parts.length === 3) {
      const [day, month, year] = parts;

      // Display: 04 Oct 2026
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }

    return value;
  };

  const handleResultHistoryClick = () => {
    console.log("RESULT HISTORY BUTTON CLICKED");

    setShowResultHistory(true);
    setResultHistoryLoading(true);
    setResultHistoryData([]);

    console.log("CALLING LIVE_MATKA_GAME_RESULT_HISTORY");

    sendEvent("LIVE_MATKA_GAME_RESULT_HISTORY", {
      en: "LIVE_MATKA_GAME_RESULT_HISTORY",
      data: {
        filter: false,
      },
    });
  };

  useEffect(() => {
    if (!socket) {
      console.log("RESULT HISTORY: socket not available");
      return;
    }

    const handleResultHistory = (response) => {
      console.log("RESULT HISTORY RAW RESPONSE:", response);

      // Response can be:
      // ["res", {...}]
      // OR
      // {...}
      let payload = response;

      if (Array.isArray(response)) {
        payload = response[1];
      }

      if (!payload) {
        console.log("RESULT HISTORY: payload empty");
        return;
      }

      console.log("RESULT HISTORY PAYLOAD:", payload);

      if (payload.en !== "LIVE_MATKA_GAME_RESULT_HISTORY") {
        return;
      }

      const timeResult = payload?.data?.time_result;

      console.log("RESULT HISTORY time_result:", timeResult);

      if (!Array.isArray(timeResult)) {
        setResultHistoryData([]);
        setResultHistoryLoading(false);
        return;
      }

      const cleanedHistory = timeResult
        // STEP 1: First sort DATE wise - latest date first
        .sort((a, b) => {
          const parseDate = (dateString) => {
            const [day, month, year] = String(dateString || "")
              .split("/")
              .map(Number);

            return new Date(year, month - 1, day).getTime();
          };

          return parseDate(b?._id) - parseDate(a?._id);
        })

        // STEP 2: After sorting, filter complete results
        .map((dateData) => {
          const results = Array.isArray(dateData?.result)
            ? dateData.result
            : [];

          const completeResults = results.filter((item) => {
            const result = String(item?.result || "").trim();

            // Only:
            // 222-66-222
            // 123-69-333
            // 444-24-455
            //
            // Remove:
            // ***-**-***
            // 233-8*-***
            return /^\d{3}-\d{1,2}-\d{3}$/.test(result);
          });

          return {
            ...dateData,
            result: completeResults,
          };
        })

        // STEP 3: Optional - remove dates which have no complete result
        .filter((dateData) => dateData.result.length > 0);

      console.log("SORTED + FILTERED RESULT HISTORY:", cleanedHistory);

      setResultHistoryData(cleanedHistory);
      setResultHistoryLoading(false);
    };

    socket.on("res", handleResultHistory);

    return () => {
      socket.off("res", handleResultHistory);
    };
  }, [socket]);

  // Synchronize last_win_cards to sessionStorage for HeaderPart and other components
  useEffect(() => {
    if (Array.isArray(data?.last_win_cards) && data.last_win_cards.length > 0) {
      try {
        sessionStorage.setItem(
          "last_win_cards",
          JSON.stringify(data.last_win_cards),
        );
      } catch (e) {}
    }
  }, [data?.last_win_cards]);

  const reduxBet = useSelector((state) => state.bet) || {};
  const currentCoin = propSelectedCoin || reduxBet.selectedCoin;
  const currentStake = currentCoin?.value || 0;

  const reduxTotalBet = Object.values(reduxBet.bets || {}).reduce(
    (sum, b) => sum + Number(b.amount || 0),
    0,
  );
  const totalBet = propTotalBet !== undefined ? propTotalBet : reduxTotalBet;

  // Use real last_win_cards if non-empty, otherwise use DEFAULT_HISTORY
  const rawCards =
    Array.isArray(data?.last_win_cards) && data.last_win_cards.length > 0
      ? [...data.last_win_cards].reverse()
      : DEFAULT_HISTORY;

  // Take up to 10 latest records for the history dots grid
  const displayCards = rawCards
    .slice(0, 10)
    .map((card, idx) => parseDrawCard(card, idx));
  const emptyCount = Math.max(0, 10 - displayCards.length);

  // Calculate total bet limit
  const totalBetLimit =
    (data?.bet_limit_configs?.single || 0) +
      (data?.bet_limit_configs?.jodi || 0) || 100000;

  const displayWinX = winX ||
    data?.win_x || {
      single: 90,
      single_pana: 1500,
      double_pana: 2500,
      triple_pana: 7500,
      jodi: 900,
    };

  return (
    <div className="bottom-right">
      <div
        style={{
          display: "flex",
          gap: "8px",
          width: "100%",
        }}
      >
        <button
          type="button"
          className="filter-btn active"
          style={{ flex: 1 }}
          onClick={() => setShowBetLimit(true)}
        >
          Bet Limit
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          width: "100%",
        }}
      >
        <button
          type="button"
          className="filter-btn active"
          style={{ flex: 1 }}
          onClick={() => setShowHowToPlay(true)}
        >
          Bhav
        </button>

        <button
          type="button"
          className="filter-btn active"
          style={{ flex: 1 }}
          onClick={handleResultHistoryClick}
        >
          Result History
        </button>
      </div>
      <div className="timer-container mt-2">
        <div className="progress-bar-bg">
          <div className="progress-bar" id="bet-timer-bar"></div>
        </div>
      </div>

      <div className="history-grid mt-2" id="history-grid">
        {displayCards.map((card, index) => (
          <div
            key={`draw-dot-${index}`}
            className="history-dot green"
            data-result={card.openPatti}
            onClick={() => setSelectedDraw(card)}
            title={`Draw: ${card.fullResult || card.openPatti} (Click to view Open & Close Patti)`}
          >
            {index + 1}
          </div>
        ))}
        {Array.from({ length: emptyCount }).map((_, index) => (
          <div key={`empty-dot-${index}`} className="history-dot empty"></div>
        ))}
      </div>

      <div className="bet-limits text-right text-white text-sm mt-1">
        Stake: <span id="current-stake-display">{currentStake}</span> | Bet: ₹
        {totalBet.toLocaleString()}/{totalBetLimit.toLocaleString()}
      </div>

      {showBetLimit && (
  <div
    className="history-popup show"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowBetLimit(false);
      }
    }}
  >
    <div className="history-popup-content how-to-play-modal">
      <span
        className="close-popup"
        onClick={() => setShowBetLimit(false)}
        title="Close"
      >
        &times;
      </span>

      <h5 className="draw-modal-title">BET LIMIT</h5>

      <div className="win-x-table">
        {[
          { key: "single", label: "SINGLE" },
          { key: "jodi", label: "JODI" },
          { key: "single_pana", label: "SINGLE PANA" },
          { key: "double_pana", label: "DOUBLE PANA" },
          { key: "triple_pana", label: "TRIPLE PANA" },
        ].map((item) => (
          <div className="win-x-row" key={item.key}>
            <span>{item.label}</span>

            <strong>
              ₹{Number(
                data?.min_max_config?.min ?? 10
              ).toLocaleString("en-IN")}
              {" - "}
              ₹{Number(
                data?.bet_limit_configs?.[item.key] ?? 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

      {showResultHistory && (
        <div
          className="history-popup show"
          id="result-history-popup"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowResultHistory(false);
            }
          }}
        >
          <div className="history-popup-content result-history-modal">
            <span
              className="close-popup"
              onClick={() => setShowResultHistory(false)}
              title="Close"
            >
              &times;
            </span>

            <div className="draw-modal-header">
              <h5 className="draw-modal-title">RESULT HISTORY</h5>
            </div>

            {resultHistoryLoading ? (
              <div className="result-history-loading">
                Loading Result History...
              </div>
            ) : resultHistoryData.length === 0 ? (
              <div className="result-history-empty">
                No Result History Found
              </div>
            ) : (
              <div className="result-history-scroll">
                <table className="result-history-table">
                  <thead>
                    <tr>
                      {resultHistoryData.map((dateData, index) => (
                        <th key={`${dateData._id}-${index}`}>
                          {formatHistoryDate(dateData._id)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      {resultHistoryData.map((dateData, index) => (
                        <td
                          key={`${dateData._id}-data-${index}`}
                          className="result-history-day-cell"
                        >
                          {Array.isArray(dateData.result) &&
                          dateData.result.length > 0 ? (
                            <div className="result-history-list">
                              {dateData.result.map((item, resultIndex) => {
                                const result = String(
                                  item?.result || "",
                                ).trim();

                                // Expected format:
                                // 123-45-678
                                const resultMatch = result.match(
                                  /^(\d{3})-(\d{1,2})-(\d{3})$/,
                                );

                                const openWinCard = resultMatch
                                  ? resultMatch[1]
                                  : "";
                                const winNumber = resultMatch
                                  ? resultMatch[2]
                                  : "";
                                const closeWinCard = resultMatch
                                  ? resultMatch[3]
                                  : "";

                                return (
                                  <div
                                    className="result-history-tile"
                                    key={`${dateData._id}-${item.round_no}-${resultIndex}`}
                                  >
                                    {/* ROUND */}
                                    <div
                                      className="result-history-round"
                                      style={{
                                        fontSize: "14px",
                                        color: "black",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      ROUND #{item.round_no ?? "---"}
                                    </div>

                                    {/* SLOT TIME */}
                                    <div className="result-history-slot">
                                      {item.slot_time || "---"}
                                    </div>

                                    {/* GAME RESULT */}
                                    <div
                                      className="game-result"
                                      style={{
                                        display: "flex",
                                        gap: "4px",
                                        width: "100%",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      {/* OPEN */}
                                      <div className="result-side left">
                                        {openWinCard ? (
                                          String(openWinCard)
                                            .split("")
                                            .map((digit, index) => (
                                              <span key={index}>{digit}</span>
                                            ))
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
                                        <span className="result-number-box2">
                                          {winNumber || "--"}
                                        </span>
                                      </div>

                                      {/* CLOSE */}
                                      <div className="result-side right">
                                        {closeWinCard ? (
                                          String(closeWinCard)
                                            .split("")
                                            .map((digit, index) => (
                                              <span key={index}>{digit}</span>
                                            ))
                                        ) : (
                                          <>
                                            <span>-</span>
                                            <span>-</span>
                                            <span>-</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="result-history-no-data">---</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showHowToPlay && (
        <div
          className="history-popup show"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHowToPlay(false);
            }
          }}
        >
          <div className="history-popup-content how-to-play-modal">
            <span
              className="close-popup"
              onClick={() => setShowHowToPlay(false)}
            >
              &times;
            </span>

            <h5 className="draw-modal-title">Bhav</h5>

            <div className="win-x-table">
              <div className="win-x-row">
                <span>SINGLE</span>
                <strong>₹{displayWinX.single / 10}</strong>
              </div>

              <div className="win-x-row">
                <span>JODI</span>
                <strong>₹{displayWinX.jodi / 10}</strong>
              </div>

              <div className="win-x-row">
                <span>SINGLE PANA</span>
                <strong>₹{displayWinX.single_pana / 10}</strong>
              </div>

              <div className="win-x-row">
                <span>DOUBLE PANA</span>
                <strong>₹{displayWinX.double_pana / 10}</strong>
              </div>

              <div className="win-x-row">
                <span>TRIPLE PANA</span>
                <strong>₹{displayWinX.triple_pana / 10}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Draw Result Modal (Shows ONLY Patti for Open & Close Draw) */}
      {selectedDraw && (
        <div
          className="history-popup show"
          id="draw-result-popup"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDraw(null);
          }}
        >
          <div className="history-popup-content draw-result-modal">
            <span
              className="close-popup"
              onClick={() => setSelectedDraw(null)}
              title="Close"
            >
              &times;
            </span>

            <div className="draw-modal-header">
              <h5 className="draw-modal-title">DRAW RESULT</h5>
              <div className="draw-modal-sub">
                <span className="draw-round-badge">{selectedDraw.roundId}</span>
                {selectedDraw.formattedTime && (
                  <span className="draw-time-text">
                    {selectedDraw.formattedTime}
                  </span>
                )}
              </div>
            </div>

            {/* Side-by-side Open and Close Patti Display */}
            <div className="draw-sections-grid">
              {/* OPEN DRAW PATTI */}
              <div className="draw-box open-box">
                <div className="draw-badge open-badge">OPEN DRAW</div>
                <div className="draw-patti-label">PATTI</div>
                <div className="draw-patti-display open-patti-color">
                  {selectedDraw.openPatti}
                </div>
              </div>

              {/* CLOSE DRAW PATTI */}
              <div className="draw-box close-box">
                <div className="draw-badge close-badge">CLOSE DRAW</div>
                <div className="draw-patti-label">PATTI</div>
                <div className="draw-patti-display close-patti-color">
                  {selectedDraw.closePatti}
                </div>
              </div>
            </div>

            {/* Full Result string below (e.g. 123 - 67 - 890) */}
            {selectedDraw.fullResult && (
              <div className="draw-jodi-box">
                <div className="draw-jodi-title">FULL RESULT</div>
                <div className="draw-jodi-display">
                  {selectedDraw.fullResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Box3;
