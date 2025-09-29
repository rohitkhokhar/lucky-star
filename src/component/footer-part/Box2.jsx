import React, { useEffect, useState } from "react";
import subtrackTop from "../../assets/Subtract_top.png";
import subtrackBottom from "../../assets/Subtract_bottom.png";
import subtrackSide from "../../assets/Subtract_side.png";
import cardImages from "../../assets/cards";
import { getSocket, sendEvent } from "../../signals/socketConnection";
import Toast from "./Toast";

// Helper function to format numbers
const formatNumber = (num, maxValue = null) => {
  if (num === undefined || num === null || isNaN(num)) return "0";
  let number = Number(num);
  if (maxValue !== null) {
    const max = Number(maxValue);
    if (!isNaN(max) && number > max) number = max;
  }
  return number.toString();
};

function Box2({
  placeCoin,
  coinPositions,
  selectedCoin, // <-- selected coin object { value, image }
  centerCard,
  gameState,
  data,
  total_wallet,
  userBalance,
}) {
  const [totalBetAndarBahar, setTotalBetAndarBahar] = useState(null);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (data?.total_bet_on_cards) {
      setTotalBetAndarBahar(data?.total_bet_on_cards);
    }
  }, [data]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    sendEvent("LIVE_GAME_PLACE_BET_INFO", { data: {} });

    const liveGamePlaceBetInfo = (response) => {
      if (response.err) {
        console.error(`Error from server: ${response.msg}`);
        return;
      }
      const { en, data } = response;
      if (en === "LIVE_GAME_PLACE_BET_INFO") {
        setTotalBetAndarBahar(data?.total_bet_on_cards);
      }
    };

    socket.on("res", liveGamePlaceBetInfo);
    return () => {
      socket.off("res", liveGamePlaceBetInfo);
    };
  }, []);

  const handlePlaceBet = (position) => {
    if (!selectedCoin) {
      setErrorMessage("Please select a coin!");
      setInsufficientBalance(true);
      setTimeout(() => setInsufficientBalance(false), 3000);
      return;
    }

    const currentBalance = total_wallet ?? userBalance ?? 0;
    const totalBetValue = coinPositions.reduce(
      (sum, pos) => sum + (pos.totalValue || 0),
      0
    );
    const totalBetLimit =
      (data?.bet_limit_configs?.andar || 0) +
      (data?.bet_limit_configs?.bahar || 0);

    const andarLimit = data?.bet_limit_configs?.andar || 0;
    const baharLimit = data?.bet_limit_configs?.bahar || 0;

    const andarBet =
      coinPositions.find((p) => p.position === "andar")?.totalValue || 0;
    const baharBet =
      coinPositions.find((p) => p.position === "bahar")?.totalValue || 0;

    const newBetValue = selectedCoin.value;

    // ✅ Check balance
    if (totalBetValue + newBetValue > currentBalance) {
      setErrorMessage("Insufficient Balance!");
      setInsufficientBalance(true);
      setTimeout(() => setInsufficientBalance(false), 3000);
      return;
    }

    // ✅ Check total table limit
    if (totalBetValue + newBetValue > totalBetLimit) {
      setErrorMessage("Table Limit Exceeded!");
      setInsufficientBalance(true);
      setTimeout(() => setInsufficientBalance(false), 3000);
      return;
    }

    // ✅ Check individual side limits
    if (position === "andar" && andarBet + newBetValue > andarLimit) {
      setErrorMessage("Andar Bet Limit Exceeded!");
      setInsufficientBalance(true);
      setTimeout(() => setInsufficientBalance(false), 3000);
      return;
    }

    if (position === "bahar" && baharBet + newBetValue > baharLimit) {
      setErrorMessage("Bahar Bet Limit Exceeded!");
      setInsufficientBalance(true);
      setTimeout(() => setInsufficientBalance(false), 3000);
      return;
    }

    setInsufficientBalance(false);
    placeCoin(position, selectedCoin); // pass coin object to placeCoin
  };

  const isBlurred =
    gameState === "no_more_second_bet" ||
    gameState === "no_more_first_bet" ||
    gameState === "no_more_third_bet";

  return (
    <div className="w-[100%] flex flex-col justify-end items-center px-2 sm:px-0 z-11">
      {insufficientBalance && <Toast message={errorMessage} type={"error"} />}
      <div
        className="w-[80%] h-[70%] flex flex-col items-center "
        style={{
          display: "flex",
          justifyContent: "center", // horizontal center
          alignItems: "flex-end", // bottom align
        }}
      >
        <div className="w-[100%] h-[80%] relative justify-center">
          {/* ANDAR section */}
          <div
            className="w-full h-1/2 relative flex pb-2"
            onClick={() => handlePlaceBet("andar")}
            style={isBlurred ? { filter: "grayscale(100%)" } : {}}
          >
            <img src={subtrackTop} alt="" className="w-full h-full absolute" />
            <div className="z-10 p-2 sm:p-1 text-white font-bold sm:text-[14px] lg:text-[24px]">
              <span>ANDAR</span>
              {data?.total_bet_on_cards?.andar && (
                <div
                  className="z-10 pt-2 transform -translate-y-1/2 flex flex-col"
                  style={{ paddingTop: "30px" }}
                >
                  <span className="text-white font-bold sm:text-[12px] lg:text-[14px]">
                    Live Bets-{formatNumber(totalBetAndarBahar?.andar || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card in the middle */}
          <div className="z-10 w-[17%] h-1/2 pt-0.5 absolute top-1/2 right-0 transform -translate-y-1/2 flex items-center justify-center">
            <img
              src={subtrackSide}
              alt=""
              className="w-full h-[94%] lg:h-[92%]"
            />
            {centerCard && cardImages[centerCard] && (
              <img
                src={cardImages[centerCard]}
                alt={centerCard}
                className="absolute h-[60%] lg:h-[70%] lg:left-1/2 transform translate-x-[10%] lg:-translate-x-[40%]"
              />
            )}
          </div>

          {/* BAHAR section */}
          <div
            className="w-full h-1/2 relative flex py-1"
            onClick={() => handlePlaceBet("bahar")}
            style={isBlurred ? { filter: "grayscale(100%)" } : {}}
          >
            <img
              src={subtrackBottom}
              alt=""
              className="w-full h-full absolute"
            />
            <div className="z-10 p-2 sm:p-1 text-white font-bold sm:text-[14px] lg:text-[24px]">
              <span>BAHAR</span>
              {data?.total_bet_on_cards?.bahar && (
                <div
                  className="z-10 pt-2 transform -translate-y-1/2 flex flex-col"
                  style={{ paddingTop: "30px" }}
                >
                  <span className="text-white font-bold sm:text-[10px] lg:text-[14px]">
                    Live Bets-{formatNumber(totalBetAndarBahar?.bahar || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Coins */}
          {coinPositions.map((pos, index) => (
            <div
              key={index}
              className={`coin-container  ${
                pos.position === "andar"
                  ? "top-[17%] left-[53%]"
                  : "bottom-[10%] left-[53%]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <img
                  src={pos.coin.image}
                  alt={pos.coin.value}
                  className="coin-image"
                />
                <span className="coin-symbol">₹</span>
              </div>
              <p className="coin-value ">
                {formatNumber(pos.totalValue, total_wallet || userBalance)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Box2;
