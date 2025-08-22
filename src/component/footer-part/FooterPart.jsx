import React, { useState, useEffect } from "react";

import "./footer.css";
import LuckyStarLogo from "../../assets/luckystarLogo.png";
import border1 from "../../assets/border1.png";
import border2 from "../../assets/border2.png";
import border3 from "../../assets/border3.png";
import border4 from "../../assets/border4.png";
import border5 from "../../assets/border5.png";
import { useDispatch, useSelector } from "react-redux";
import Box1 from "./Box1";
import Box2 from "./Box2";
import Box3 from "./Box3";
import {
  sendEvent,
  socketConnect,
  getSocket,
} from "../../signals/socketConnection";
import Toast from "./Toast";

let localCoinPositions = [];
function FooterPart() {
  // const user = useSelector((state) => state.auth.user);
  const user = JSON.parse(localStorage.getItem("user")) ?? null;
  const total_wallet = JSON.parse(localStorage.getItem("total_wallet")) ?? 0;
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [coinPositions, setCoinPositions] = useState([]);
  const [gameState, setGameState] = useState("betting");
  const [centerCard, setCenterCard] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [data, setData] = useState({
    user_total_bet: 0
  });  
  const [toastKey, setToastKey] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [betAmounts, setBetAmounts] = useState({
    first: 0,
    second: 0,
    third: 0,
  });
  const [roundBets, setRoundBets] = useState({
    first: { andar: 0, bahar: 0 },
    second: { andar: 0, bahar: 0 },
    third: { andar: 0, bahar: 0 },
  });

  const coins =
    data?.bet_slots?.map((value, index) => ({
      value,
      image: [border1, border2, border3, border4, border5][index],
    })) || [];

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    setUserBalance(user.chips);

    const handleAppLaunchDetails = (response) => {
      if (response.err) {
        console.error(`Error from server: ${response.msg}`);
        return;
      }

      const { en, data } = response;

      if (en === "AppLunchDetails") {
        localStorage.setItem("user", JSON.stringify(data));
      }
    };

    socket.on("res", handleAppLaunchDetails);

    return () => {
      socket.off("res", handleAppLaunchDetails);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdatedWallet = (response) => {
      if (response.err) {
        console.error(`Error from server: ${response.msg}`);
        return;
      }

      const { en, data } = response;

      if (en === "UPDATED_WALLET") {
        console.log("UPDATED_WALLET#####", data.total_wallet);
        localStorage.setItem("total_wallet", JSON.stringify(data.total_wallet));
        setUserBalance(data.total_wallet);
        if (user) {
          user.chips = data.total_wallet;
          localStorage.setItem("user", JSON.stringify(user));
        }
      }
    };

    socket.on("res", handleUpdatedWallet);

    return () => {
      socket.off("res", handleUpdatedWallet);
    };
  }, []);
  
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNoMoreBet = (response) => {
      if (response.err) {
        console.error(`Error from server: ${response.msg}`);
        return;
      }

      const { en, data } = response;

      if (en === "LIVE_GAME_NO_MORE_BET") {
        // Determine current round from server data
        const roundKey = data.bet_no.includes("first")
          ? "first"
          : data.bet_no.includes("second")
          ? "second"
          : "third";

        // Only auto-bet if in betting state and user hasn't manually placed bet
        if (
          (gameState === "start_round_first_bet" ||
            gameState === "start_round_second_bet" ||
            gameState === "start_round_third_bet") &&
          !hasPlacedBet
        ) {
          // Use the same logic as placeBet function
          const andarBet = roundBets[roundKey]?.andar || 0;
          const baharBet = roundBets[roundKey]?.bahar || 0;
          const totalBet = andarBet + baharBet;

          // Same validation as placeBet
          if (totalBet > userBalance) {
            setToastMessage("Insufficient balance!");
            setToastType("error");
            setToastKey((prev) => prev + 1);
            return;
          }

          if (andarBet > 0 || baharBet > 0) {
            // Same payload structure as placeBet
            const payload = {
              card_details: {
                ...(andarBet > 0 && { andar: andarBet }),
                ...(baharBet > 0 && { bahar: baharBet }),
              },
            };

            sendEvent("LIVE_GAME_PLACE_BET", payload);

            // Same balance update as placeBet
            if (user) {
              const newBalance = user.chips - totalBet;
              user.chips = newBalance;
              setUserBalance(newBalance);
              localStorage.setItem("user", JSON.stringify(user));
              localStorage.setItem("total_wallet", JSON.stringify(newBalance));
            }

            // Same bet tracking as placeBet
            setBetAmounts((prev) => ({
              ...prev,
              [roundKey]: totalBet,
            }));

            setToastMessage(
              `Auto-placed: ${andarBet > 0 ? `Andar ₹${andarBet} ` : ""}${
                baharBet > 0 ? `Bahar ₹${baharBet}` : ""
              }`
            );
            setToastType("success");
            setHasPlacedBet(true);
            setBtnDisabled(true);
          }
        }

        setToastMessage(
          `${data.bet_no.replace(/_/g, " ").toUpperCase()} round closed`
        );
        setToastType("info");
        setGameState(data.game_state);
        setToastKey((prev) => prev + 1);
      }
    };

    socket.on("res", handleNoMoreBet);

    return () => {
      socket.off("res", handleNoMoreBet);
    };
  }, [roundBets, userBalance, user, gameState, hasPlacedBet]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    sendEvent("LIVE_GAME_INFO", { en: "LIVE_GAME_INFO", data: {} });

    const handleEventResponse = (response) => {
      if (response.err) {
        console.error(`Error from server: ${response.msg}`);
        return;
      }

      const { en, data } = response;

      switch (en) {
        case "LIVE_GAME_INFO":
          setData(data);
          setGameState(data.game_state);
          setCenterCard(data.center_card);
          if (data.total_wallet)
            localStorage.setItem(
              "total_wallet",
              JSON.stringify(data.total_wallet)
            );
          if (data.min_max_config) {
            localStorage.setItem(
              "min_max_config",
              JSON.stringify(data.min_max_config)
            );
          } else {
            localStorage.removeItem("min_max_config");
          }

          if (data.announcement_text) {
            setAnnouncement(data.announcement_text);
            setShowAnnouncement(true);
          }

          let message = "";
          let type = "info";

          switch (data.game_state) {
            case "set_joker":
              message = "Joker has been set for this round.";
              break;
            case "start_round_first_bet":
              message = "First round betting is live!";
              break;
            case "start_round_second_bet":
              message = "Second round betting is live!";
              break;
            case "start_round_third_bet":
              message = "Third round betting is live!";
              break;
            case "no_more_first_bet":
              message = "First round betting is closed.";
              type = "error";
              break;
            case "no_more_second_bet":
              message = "Second round betting is closed.";
              type = "error";
              break;
            case "no_more_third_bet":
              message = "Third round betting is closed.";
              type = "error";
              break;
            case "winner":
              message = `Winner declared!`;
              type = "success";
              break;
            case "round_end":
              message = "Round ended. Waiting for next round.";
              break;
            default:
              message = "Waiting for game state to update...";
          }

          setToastMessage(message);
          setToastType(type);
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_START_ROUND":
          setGameState("round_start");
          setCenterCard(data.center_card);
          setToastMessage("Round Started. Please Deal the Joker.");
          setToastType("info");
          setCoinPositions([]);
          localCoinPositions = [];
          setHasPlacedBet(false);
          setRoundBets({
            first: { andar: 0, bahar: 0 },
            second: { andar: 0, bahar: 0 },
            third: { andar: 0, bahar: 0 },
          });
          setBetAmounts({ first: 0, second: 0, third: 0 }); // Reset all bet amounts
          // Reset user_total_bet to 0 when round starts
          setData(prev => ({ ...prev, user_total_bet: 0 }));
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_PLACE_BET_INFO":
          const { andar, bahar } = data.total_bet_on_cards;
          // Update user_total_bet with sum of andar and bahar
          setData(prev => ({
            ...prev,
            user_total_bet: andar + bahar
          }));
          break;

        case "LIVE_GAME_SET_JOKER":
          setGameState("set_joker");
          setCenterCard(data.center_card);
          setToastMessage("Joker has been set for this round.");
          setToastType("info");
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_BET_START":
          setGameState(data.game_state);
          // setCoinPositions([]);
          // localCoinPositions = [];
          setBtnDisabled(false);
          setToastMessage(
            `${data.bet_no
              .replace("_", " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())} Round Started!`
          );
          setToastType("info");
          setToastKey((prev) => prev + 1);
          setHasPlacedBet(false);
          break;

        case "LIVE_GAME_NO_MORE_BET":
          if (localCoinPositions.length > 0 || coinPositions.length > 0) {
            setBtnDisabled(false);
            // setCoinPositions([]);
          } else {
            setBtnDisabled(false);
            // setCoinPositions([]);
            setToastMessage(
              `${data.bet_no
                .replace("_", " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())} round closed.`
            );
            setToastType("error");
          }
          setGameState(data.game_state);
          setToastMessage(
            `${data.bet_no
              .replace("_", " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())} round closed.`
          );
          setToastType("error");
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_WINNER":
          setGameState(data.game_state);
          setToastMessage(
            `Winner declared! Winning side: ${data.win_side.toUpperCase()}.`
          );
          setToastType("success");
          setCoinPositions([]);
          localCoinPositions = [];
          setRoundBets({
            first: { andar: 0, bahar: 0 },
            second: { andar: 0, bahar: 0 },
            third: { andar: 0, bahar: 0 },
          });
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_END_ROUND":
          setGameState(data.game_state);
          setToastMessage("Round has ended. Preparing for the next round.");
          setToastType("info");
          setCoinPositions([]);
          localCoinPositions = [];
          setRoundBets({
            first: { andar: 0, bahar: 0 },
            second: { andar: 0, bahar: 0 },
            third: { andar: 0, bahar: 0 },
          });
          setBetAmounts({ first: 0, second: 0, third: 0 });
          setHasPlacedBet(false); // Reset for new round
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_ROUND_WIN":
          if (data.user_id === user?._id) {
            setToastMessage(`🎉 You won ₹${data.win_amount}!`);
            setToastType("success");
          } else {
            setToastMessage("🎉 Winners have been declared!");
            setToastType("info");
          }
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_ROUND_LOSE":
          if (data.user_id === user?._id) {
            setToastMessage("😞 You lost this round. Better luck next time!");
            setToastType("error");
            setToastKey((prev) => prev + 1);
          }
          break;

        default:
          console.warn("Unhandled event:", en);
      }
    };

    socket.on("res", handleEventResponse);

    return () => {
      socket.off("res", handleEventResponse);
    };
  }, []);

  const handleCoinSelect = (coin) => {
    if (
      gameState === "start_round_first_bet" ||
      gameState === "start_round_second_bet" ||
      gameState === "start_round_third_bet"
    ) {
      setSelectedCoin(coin);
      setToastMessage(`Coin selected: ₹${coin.value}`);
      setToastType("info");
    } else {
      setToastMessage("Coin selection is not allowed at this stage.");
      setToastType("error");
    }
    setToastKey((prev) => prev + 1);
  };

  const placeCoin = (position) => {
    if (
      selectedCoin &&
      (gameState === "start_round_first_bet" ||
        gameState === "start_round_second_bet" ||
        gameState === "start_round_third_bet")
    ) {
      setCoinPositions((prev) => {
        const existing = prev.find((pos) => pos.position === position);
        if (existing) {
          return prev.map((pos) =>
            pos.position === position
              ? { ...pos, totalValue: pos.totalValue + selectedCoin.value }
              : pos
          );
        } else {
          return [
            ...prev,
            { coin: selectedCoin, position, totalValue: selectedCoin.value },
          ];
        }
      });

      // Update local cache
      localCoinPositions = localCoinPositions.map((pos) =>
        pos.position === position
          ? { ...pos, totalValue: pos.totalValue + selectedCoin.value }
          : pos
      );

      if (!localCoinPositions.find((pos) => pos.position === position)) {
        localCoinPositions.push({
          coin: selectedCoin,
          position,
          totalValue: selectedCoin.value,
        });
      }

      // Update roundBets
      const roundKey =
        gameState === "start_round_first_bet"
          ? "first"
          : gameState === "start_round_second_bet"
          ? "second"
          : "third";

      setRoundBets((prev) => ({
        ...prev,
        [roundKey]: {
          ...prev[roundKey],
          [position]: (prev[roundKey][position] || 0) + selectedCoin.value,
        },
      }));
    } else {
      setToastMessage("Betting is not allowed at this stage.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
    }
  };

  const handleUndo = () => {
    if (
      gameState === "start_round_first_bet" ||
      gameState === "start_round_second_bet" ||
      gameState === "start_round_third_bet"
    ) {
      setCoinPositions([]);
      localCoinPositions = [];
      setToastMessage("All bets have been undone.");
      setToastType("success");
    } else {
      setToastMessage("Cannot undo bets at this stage.");
      setToastType("error");
    }
    setToastKey((prev) => prev + 1);
  };

  const calculateTotalBet = (type) => {
    return coinPositions
      .filter((pos) => pos.position === type)
      .reduce((sum, pos) => sum + pos.totalValue, 0);
  };

  const placeBet = () => {
    if (
      gameState !== "start_round_first_bet" &&
      gameState !== "start_round_second_bet" &&
      gameState !== "start_round_third_bet"
    ) {
      setToastMessage("Betting is not allowed at this stage.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    // Determine current round
    const roundKey =
      gameState === "start_round_first_bet"
        ? "first"
        : gameState === "start_round_second_bet"
        ? "second"
        : "third";

    const andarBet = roundBets[roundKey]?.andar || 0;
    const baharBet = roundBets[roundKey]?.bahar || 0;
    const totalBet = andarBet + baharBet;

    if (totalBet > userBalance) {
      setToastMessage("Insufficient balance!");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    if (andarBet > 0 || baharBet > 0) {
      // Prepare the payload with card_details
      const payload = {
        card_details: {
          ...(andarBet > 0 && { andar: andarBet }),
          ...(baharBet > 0 && { bahar: baharBet }),
        },
      };

      sendEvent("LIVE_GAME_PLACE_BET", payload);

      // Update the specific bet amount based on current round
      setBetAmounts((prev) => ({
        ...prev,
        [roundKey]: totalBet,
      }));

      // Update user balance immediately
      const newBalance = userBalance - totalBet;
      setUserBalance(newBalance);

      // Update local storage if user exists
      if (user) {
        const updatedUser = { ...user, chips: newBalance };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("total_wallet", JSON.stringify(newBalance));
      }

      setBtnDisabled(true);

      let message = "Bet Placed: ";
      if (andarBet > 0) message += `Andar ₹${andarBet} `;
      if (baharBet > 0) message += `Bahar ₹${baharBet}`;

      setToastMessage(message.trim());
      setToastType("success");
      setSelectedCoin(null);
      setHasPlacedBet(true);
    } else {
      setToastMessage("No bets placed! Please select coins.");
      setToastType("error");
    }
    setToastKey((prev) => prev + 1);
  };

  const totalBet = coinPositions.reduce((sum, pos) => sum + pos.totalValue, 0);

  const AnnouncementPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          📢 Announcement
        </h2>
        <p className="text-sm text-gray-700 mb-4">{announcement}</p>
        <button
          className="bg-blue-600 text-white font-medium py-2 px-6 rounded-full hover:bg-blue-700 transition-all"
          onClick={() => setShowAnnouncement(false)}
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      {showAnnouncement && <AnnouncementPopup />}
      <div
        className="absolute bottom-0 w-full flex footerContainer gap-2 h-[40%] lg:h-[30%] z-11"
        style={{ userSelect: "none" }}
      >
        {toastMessage && (
          <Toast key={toastKey} message={toastMessage} type={toastType} />
        )}
        <Box1
          coins={coins}
          handleCoinSelect={handleCoinSelect}
          handleUndo={handleUndo}
          userBalance={userBalance}
          totalBet={totalBet}
          placeBet={placeBet}
          gameState={gameState}
          total_wallet={total_wallet}
          btnDisabled={btnDisabled}
          betAmounts={betAmounts}
        />
        <Box2
          placeCoin={placeCoin}
          coinPositions={coinPositions}
          centerCard={centerCard}
          gameState={gameState}
          data={data}
          total_wallet={total_wallet}
          userBalance={userBalance}
        />
        <Box3 data={data} />
      </div>
    </>
  );
}

export default FooterPart;
