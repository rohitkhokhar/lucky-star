import React from "react";
import LuckyStarLogo from "../../../assets/luckystarLogo.png";
import { useDispatch, useSelector } from "react-redux";
import {
  setMarketType as setReduxMarketType,
  setSelectedCoin as setReduxSelectedCoin,
  undoLastBet,
} from "../../../redux/betSlice";

// Helper function to format numbers
const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) {
    return "0";
  }
  const number = Number(num);
  if (number >= 1000) {
    const formatted = number / 1000;
    return number % 1000 === 0 ? `${formatted}k` : `${formatted.toFixed(1)}k`;
  }
  return number.toString();
};

const defaultCoins = [
  { value: 10 },
  { value: 50 },
  { value: 100 },
  { value: 500 },
  { value: 1000 },
];

function Box1({
  coins: propCoins,
  handleCoinSelect,
  handleUndo: propHandleUndo,
  userBalance,
  totalBet: propTotalBet,
  placeBet,
  isPlacingBet,
  gameState,
  total_wallet,
  btnDisabled,
  betAmounts,
  selectedCoin: propSelectedCoin,
  marketType: propMarketType,
  setMarketType: propSetMarketType,
}) {
  const dispatch = useDispatch();
  const reduxBetState = useSelector((state) => state.bet) || {};

  const currentMarket =
    (propMarketType || reduxBetState.marketType || "open").toLowerCase();
  const currentSelectedCoin = propSelectedCoin || reduxBetState.selectedCoin;

  const currentBalance = total_wallet ?? userBalance ?? 0;

  const calculatedTotalBet =
    propTotalBet !== undefined
      ? propTotalBet
      : Object.values(reduxBetState.bets || {}).reduce(
          (sum, b) => sum + Number(b.amount || 0),
          0
        );

  const displayCoins =
    propCoins && propCoins.length > 0 ? propCoins : defaultCoins;

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

  const handleMarketChange = (newType) => {
    if (isGameDisabled) return;
    if (propSetMarketType) {
      propSetMarketType(newType);
    }
    dispatch(setReduxMarketType(newType));
  };

  const handleSelect = (coin) => {
    if (isGameDisabled) return;
    dispatch(setReduxSelectedCoin(coin));
    if (handleCoinSelect) {
      handleCoinSelect(coin);
    }
  };

  const handleUndo = () => {
    if (isGameDisabled) return;
    dispatch(undoLastBet());
    if (propHandleUndo) {
      propHandleUndo();
    }
  };

  return (
    <>
      <div className={`bottom-left ${isGameDisabled ? "game-disabled" : ""}`}>
        <div
          className="casino-logo"
          style={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            marginBottom: "10px",
          }}
        >
          <img
            src={LuckyStarLogo}
            alt="Lucky Star"
            style={{ width: "100px", height: "auto" }}
          />
        </div>

        <div className="balance-container">
          <div className="balance-box" style={{ flex: "1" }}>
            BALANCE: ₹
            <span id="current-balance">
              {Number(currentBalance || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div
          className="open-close-toggle"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "5px",
            ...(isGameDisabled ? { opacity: 0.5, pointerEvents: "none" } : {}),
          }}
        >
          <label
            className="toggle-label text-white"
            style={{
              cursor: isGameDisabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <input
              type="radio"
              name="market-type"
              value="open"
              disabled={isGameDisabled}
              checked={currentMarket === "open"}
              onChange={() => handleMarketChange("open")}
              style={{ accentColor: "#FFC107" }}
            />{" "}
            Open
          </label>
          <label
            className="toggle-label text-white"
            style={{
              cursor: isGameDisabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <input
              type="radio"
              name="market-type"
              value="close"
              disabled={isGameDisabled}
              checked={currentMarket === "close"}
              onChange={() => handleMarketChange("close")}
              style={{ accentColor: "#FFC107" }}
            />{" "}
            Close
          </label>
        </div>

        <div
          className="chips-container"
          style={{
            justifyContent: "center",
            ...(isGameDisabled ? { opacity: 0.5, pointerEvents: "none" } : {}),
          }}
        >
          {displayCoins.map((coin, index) => {
            const isSelected =
              !isGameDisabled && currentSelectedCoin?.value === coin.value;
            const chipClass = coin.value === 1000 ? "1k" : coin.value;
            return (
              <button
                key={index}
                type="button"
                disabled={isGameDisabled}
                style={{
                  flexShrink: 0,
                  cursor: isGameDisabled ? "not-allowed" : "pointer",
                  ...(isGameDisabled ? { opacity: 0.5, filter: "grayscale(60%)" } : {}),
                }}
                className={`chip chip-${chipClass} ${isSelected ? "active" : ""}`}
                data-val={coin.value}
                onClick={() => !isGameDisabled && handleSelect(coin)}
              >
                {coin.value >= 1000 ? `${coin.value / 1000}k` : coin.value}
              </button>
            );
          })}
        </div>

        <div className="action-buttons">
          <button
            type="button"
            className="btn-action btn-undo"
            id="btn-undo"
            disabled={isGameDisabled}
            style={
              isGameDisabled
                ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }
                : {}
            }
            onClick={!isGameDisabled ? handleUndo : undefined}
          >
            UNDO
          </button>
          <button
            type="button"
            className="btn-action btn-place"
            id="btn-place"
            disabled={isGameDisabled || isPlacingBet}
            style={
              isGameDisabled || isPlacingBet
                ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }
                : {}
            }
            onClick={!isGameDisabled && !isPlacingBet ? placeBet : undefined}
          >
            {isPlacingBet ? "PLACING..." : "PLACE BET"} <br />
            <small>
              TOTAL: ₹
              <span id="total-bet">
                {Number(calculatedTotalBet || 0).toLocaleString()}
              </span>
            </small>
          </button>
        </div>
      </div>
    </>
  );
}

export default Box1;
