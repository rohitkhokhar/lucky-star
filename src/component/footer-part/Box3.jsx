import React from "react";
import ProgressBar from "./ProgressBar";

function Box3({ data, isResult }) {
  // Prepare the dots, pad with defaults if less than 30
  const dots = Array.from({ length: 30 }, (_, i) => {
    const reversedCards = [...(data?.last_win_cards || [])].reverse();
    const row = reversedCards[i] || "dummy|default";
    const value = row.split("|")[1];
    return value;
  });

  // Calculate total bet limit
  const totalBetLimit =
    (data?.bet_limit_configs?.andar || 0) +
    (data?.bet_limit_configs?.bahar || 0);
  const userTotalBet = data?.user_total_bet || 0;

  return (
    <div className="w-full flex flex-col justify-end items-center px-2 sm:px-0">
      <div
        className="w-full h-[70%] flex flex-col items-center"
        style={{
          display: "flex",
          justifyContent: "center", // horizontal center
          alignItems: "flex-end", // bottom align
        }}
      >
        <div className="w-full sm:w-[90%] lg:w-[80%] h-[20%] flex justify-end gap-1 sm:gap-1">
          <ProgressBar blackRatio={data?.last_win_cards?.length || 0} />
        </div>

        <div className="w-full h-[40%] pr-3 grid grid-cols-15 gap-1 justify-end items-center">
          {dots.map((value, index) => {
            const isLatest = index === 0; // latest result
            return (
              <div
                key={index}
                className={`flex items-center justify-center font-bold text-white rounded-2xl border-[2px] sm:border-[2px]
                  ${
                    value === "bahar"
                      ? "bg-[#AD1417] border-[#D02B2E]"
                      : "bg-[#313131] border-[#4F4F4F]"
                  }
                  ${isLatest ? "border-green-500" : ""}
                  w-[20px] h-[20px] sm:w-[18px] sm:h-[18px] lg:w-[30px] lg:h-[30px]
                  text-[0.5rem] sm:text-[0.7rem] lg:text-[0.9rem]`}
              >
                {value === "bahar" ? "B" : "A"}
              </div>
            );
          })}
        </div>

        {/* Added bet information display */}
        <div
          className="w-full flex justify-end pr-3 text-white"
          style={{ fontSize: "12px" }}
        >
          <div className="px-2 pt-1 text-xl">
            Bet: {userTotalBet.toLocaleString()}/
            {totalBetLimit.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Box3;
