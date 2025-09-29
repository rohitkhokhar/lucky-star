import React from "react";
import LuckyStarLogo from "../../assets/luckystarLogo.png";

// Helper function to format numbers
const formatNumber = (num) => {
  // Handle undefined/null/NaN cases
  if (num === undefined || num === null || isNaN(num)) {
    return "0"; // or whatever default value you prefer
  }

  // Convert to number in case it's a string
  const number = Number(num);

  if (number >= 1000) {
    const formatted = number / 1000;
    // Check if it's a whole number (like 1000, 2000) or needs decimal (like 1200)
    return number % 1000 === 0 ? `${formatted}k` : `${formatted.toFixed(1)}k`;
  }
  return number.toString();
};

function Box1({
  coins,
  handleCoinSelect,
  handleUndo,
  userBalance,
  totalBet,
  placeBet,
  gameState,
  total_wallet,
  btnDisabled,
  betAmounts,
}) {
  const checkState =
    gameState === "start_round_first_bet" ||
    gameState === "start_round_second_bet" ||
    gameState === "start_round_third_bet";

  const isBlurred =
    gameState === "no_more_second_bet" ||
    gameState === "no_more_first_bet" ||
    gameState === "no_more_third_bet";

  const canPlace = checkState && (total_wallet ?? userBalance) && !btnDisabled;

  return (
    <div
      className="w-full flex flex-col justify-center items-center z-11"
      style={isBlurred ? { filter: "grayscale(100%)" } : {}}
    >
      <img
        src={LuckyStarLogo}
        alt="Lucky Star"
        className="w-[40%] lg:w-[55%] pb-3"
      />

      <div className="w-full h-[25%] flex justify-center items-center ">
        {coins.map((coin, index) => {
          const isDisabled = !canPlace || coin.value > userBalance - totalBet;
          return (
            <div
              key={index}
              style={{
                flexShrink: 0,
                pointerEvents: isDisabled ? "none" : "auto",
                opacity: isDisabled ? 0.4 : 1,
              }}
              className="w-1/7 relative flex justify-center items-center h-full cursor-pointer"
              onClick={() => !isDisabled && handleCoinSelect(coin)}
            >
              <img
                src={coin.image}
                alt={coin.value}
                className="absolute lg:h-full w-[50px]"
              />
              <p className="text-[14px] lg:text-[12px] sm:font-extrabold z-[10]">
                {formatNumber(coin.value || 0)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="w-full h-[35%] flex justify-center items-center gap-1.5  mt-2">
        {/* Buttons */}
        <button
          style={{
            pointerEvents: canPlace ? "auto" : "none",
            cursor: canPlace ? "pointer" : "no-drop",
            opacity: canPlace ? 1 : 0.5,
          }}
          className="flex-1 rounded-2xl border border-[#644E53] bg-red-700 text-white font-bold h-[30px] lg:h-[43px] text-[15px] lg:text-[18px] flex justify-center items-center"
          onClick={handleUndo}
        >
          UNDO
        </button>
        <button
          style={{
            pointerEvents: canPlace ? "auto" : "none",
            cursor: canPlace ? "pointer" : "no-drop",
            opacity: canPlace ? 1 : 0.5,
          }}
          className="flex-1 rounded-2xl border border-[#644E53] bg-green-600 text-white font-bold h-[30px] lg:h-[43px] text-[15px] lg:text-[18px] flex justify-center items-center"
          onClick={placeBet}
        >
          PLACE BET
        </button>
      </div>

      <div className="w-full h-[35%] flex justify-center items-center gap-1.5">
        {/* Info Boxes */}
        <div className="flex-1 rounded-2xl border border-[#644E53] bg-[#313131] text-white font-bold h-[40px] lg:h-[43px] text-[12px] lg:text-[18px] flex justify-center items-center">
          BALANCE: ₹{total_wallet ?? userBalance}
        </div>
        <div className="flex-1 rounded-2xl border border-[#644E53] bg-[#313131] text-white font-bold h-[40px] lg:h-[43px] text-[12px] lg:text-[16px] flex flex-col justify-center items-center">
          FIRST BET: ₹{betAmounts?.first ?? 0} <br />
          SECOND BET: ₹{betAmounts?.second ?? 0}
        </div>
      </div>
    </div>
  );
}

export default Box1;
