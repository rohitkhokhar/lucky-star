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
    user_total_bet: 0,
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
  const [pendingBets, setPendingBets] = useState({
    first: { andar: 0, bahar: 0 },
    second: { andar: 0, bahar: 0 },
    third: { andar: 0, bahar: 0 },
  });
  const [coinHistory, setCoinHistory] = useState([]);

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

          const bets = data.bet_lists || [];
          const firstBetTotal = bets
            .filter((b) => b.bet_no === "first_bet")
            .reduce(
              (sum, b) =>
                sum + (b.card_details.andar || 0) + (b.card_details.bahar || 0),
              0
            );

          const secondBetTotal = bets
            .filter((b) => b.bet_no === "second_bet")
            .reduce(
              (sum, b) =>
                sum + (b.card_details.andar || 0) + (b.card_details.bahar || 0),
              0
            );

          setBetAmounts({
            first: firstBetTotal,
            second: secondBetTotal,
          });

          let andarTotal = 0;
          let baharTotal = 0;

          bets.forEach((b) => {
            if (b.card_details?.andar) {
              andarTotal += b.card_details.andar;
            }
            if (b.card_details?.bahar) {
              baharTotal += b.card_details.bahar;
            }
          });

          setCoinPositions((prev) => {
            let updated = [...prev];

            // andar
            if (andarTotal > 0) {
              const existing = updated.find((pos) => pos.position === "andar");
              if (existing) {
                // ✅ सिर्फ value update होगा, image वही रहेगा
                existing.totalValue = andarTotal;
              } else {
                updated.push({
                  coin: prev[0]?.coin || {
                    image: border1,
                    value: 0,
                  }, // fallback
                  position: "andar",
                  totalValue: andarTotal,
                });
              }
            } else {
              updated = updated.filter((pos) => pos.position !== "andar");
            }

            // bahar
            if (baharTotal > 0) {
              const existing = updated.find((pos) => pos.position === "bahar");
              if (existing) {
                existing.totalValue = baharTotal;
              } else {
                updated.push({
                  coin: prev[0]?.coin || {
                    image: border1,
                    value: 0,
                  }, // fallback
                  position: "bahar",
                  totalValue: baharTotal,
                });
              }
            } else {
              updated = updated.filter((pos) => pos.position !== "bahar");
            }

            return updated;
          });

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

          const andar1 = data.total_bet_on_cards?.andar || 0;
          const bahar1 = data.total_bet_on_cards?.bahar || 0;
          console.log({ andar1, bahar1 });
          setData((prev) => ({
            ...prev,
            total_bet_on_cards: data.total_bet_on_cards,
            user_total_bet: andar1 + bahar1,
          }));

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
          setPendingBets({
            first: { andar: 0, bahar: 0 },
            second: { andar: 0, bahar: 0 },
            third: { andar: 0, bahar: 0 },
          });
          localCoinPositions = [];
          setHasPlacedBet(false);
          setBetAmounts({ first: 0, second: 0, third: 0 });
          setData((prev) => ({
            ...prev,
            user_total_bet: 0,
            total_bet_on_cards: {},
          }));
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_PLACE_BET":
          if (data.err == true) {
            setErrorMessage(data.msg);
            setToastMessage(true);
            setTimeout(() => setToastMessage(false), 3000);
            return;
          }

        case "LIVE_GAME_PLACE_BET_INFO":
          const { andar = 0, bahar = 0 } = data.total_bet_on_cards || {};
          setData((prev) => ({
            ...prev,
            total_bet_on_cards: data.total_bet_on_cards,
            user_total_bet: andar + bahar,
          }));
          break;

        case "LIVE_GAME_SET_JOKER":
          setGameState("set_joker");
          setCenterCard(data.center_card);
          setToastMessage("Joker has been set for this round.");
          setToastType("info");
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_BET_START": {
          setGameState(data.game_state);
          const currentRoundKey =
            data.bet_no === "first_bet"
              ? "first"
              : data.bet_no === "second_bet"
                ? "second"
                : "third";

          setCoinPositions((prev) =>
            prev.filter(
              (pos) => pos.confirmed === true || pos.roundKey === currentRoundKey
            )
          );

          setCoinHistory((prev) =>
            prev.filter(
              (coin) => coin.confirmed === true || coin.roundKey === currentRoundKey
            )
          );

          // Reset pending bets only for the current round
          setPendingBets((prev) => ({
            ...prev,
            [currentRoundKey]: { andar: 0, bahar: 0 },
          }));

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
        }

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
          setData((prev) => ({
            ...prev,
            last_win_cards: data?.last_win_cards,
          }));
          setCoinHistory([]);
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_GAME_END_ROUND":
          setGameState(data.game_state);
          setToastMessage("Round has ended. Preparing for the next round.");
          setToastType("info");
          setCoinPositions([]);
          setPendingBets([]);
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
      const roundKey =
        gameState === "start_round_first_bet"
          ? "first"
          : gameState === "start_round_second_bet"
          ? "second"
          : "third";

      // Track in visual state
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
            {coin: selectedCoin, position, totalValue: selectedCoin.value, roundKey, confirmed: false},
          ];
        }
      });
      setPendingBets((prev) => {
        const roundData = prev[roundKey] || { andar: 0, bahar: 0 };
        const currentValue = roundData[position] || 0;

        return {
          ...prev,
          [roundKey]: {
            ...roundData,
            [position]: currentValue + selectedCoin.value,
          },
        };
      });
      setCoinHistory((prev) => [
        ...prev,
        {position, value: selectedCoin.value, roundKey, confirmed: false},
      ]);
    } else {
      setToastMessage("Betting is not allowed at this stage.");
      setToastType("error");
    }
    setToastKey((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (
      gameState === "start_round_first_bet" ||
      gameState === "start_round_second_bet" ||
      gameState === "start_round_third_bet"
    ) {
      if (coinHistory.length === 0) {
        setToastMessage("No coins to undo.");
        setToastType("error");
        setToastKey((prev) => prev + 1);
        return;
      }

      const lastCoin = coinHistory[coinHistory.length - 1];

      if (lastCoin.confirmed) {
        // 🚫 Can't undo confirmed coins (already placed in bet)
        setToastMessage("You cannot undo a confirmed bet.");
        setToastType("error");
        setToastKey((prev) => prev + 1);
        return;
      }

      // ✅ Undo only pending (unconfirmed) coins
      setPendingBets((prev) => ({
        ...prev,
        [lastCoin.roundKey]: {
          ...prev[lastCoin.roundKey],
          [lastCoin.position]:
            (prev[lastCoin.roundKey][lastCoin.position] || 0) - lastCoin.value,
        },
      }));

      setCoinPositions((prev) =>
        prev
          .map((pos) =>
            pos.position === lastCoin.position
              ? { ...pos, totalValue: pos.totalValue - lastCoin.value }
              : pos
          )
          .filter((pos) => pos.totalValue > 0)
      );

      setCoinHistory((prev) => prev.slice(0, -1));
    } else {
      setToastMessage("Cannot undo bets at this stage.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
    }
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

    // 2️⃣ Determine current round
    const roundKey =
      gameState === "start_round_first_bet"
        ? "first"
        : gameState === "start_round_second_bet"
        ? "second"
        : "third";

    // ✅ Pull directly from pendingBets for current round
    const currentPending = pendingBets[roundKey] || { andar: 0, bahar: 0 };
    const andarBet = currentPending.andar || 0;
    const baharBet = currentPending.bahar || 0;
    const totalBet = andarBet + baharBet;

    if (totalBet <= 0) {
      setToastMessage("No bets placed! Please select coins.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    if (totalBet > userBalance) {
      setToastMessage("Insufficient balance!");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    const payload = {
      card_details: {
        ...(andarBet > 0 && { andar: andarBet }),
        ...(baharBet > 0 && { bahar: baharBet }),
      },
    };

    const socket = getSocket();
    if (!socket) {
      setToastMessage("Socket connection not available!");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    // 5️⃣ Handle server response
    const handlePlaceBetResponse = (response) => {
      console.log("Server Response:", response);

      // Make event check case-insensitive
      if (!response.en || response.en.toLowerCase() !== "live_game_place_bet")
        return;

      if (response.err) {
        // ❌ Server rejected bet
        setToastMessage(response.msg || "Bet failed!");
        setToastType("error");
      } else {
        // ✅ Bet approved
        setToastMessage(
          `Bet Placed: ${andarBet > 0 ? `Andar ₹${andarBet} ` : ""}${baharBet > 0 ? `Bahar ₹${baharBet}` : ""}`.trim()
        );
        setToastType("success");
        console.log("Bet successfully placed:", totalBet);

        // Update bet amounts for this round
        setBetAmounts((prev) => ({
          ...prev,
          [roundKey]: (prev[roundKey] || 0) + totalBet,
        }));

        // Update user balance
        const newBalance = userBalance - totalBet;
        setUserBalance(newBalance);
        if (user) {
          const updatedUser = { ...user, chips: newBalance };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          localStorage.setItem("total_wallet", JSON.stringify(newBalance));
        }

        // Clear pending bets for this round
        setPendingBets((prev) => ({
          ...prev,
          [roundKey]: { andar: 0, bahar: 0 },
        }));
        console.log(pendingBets);

        // mark coinHistory entries as confirmed (you already do this)
        setCoinHistory((prev) =>
          prev.map((coin) =>
            coin.roundKey === roundKey ? { ...coin, confirmed: true } : coin
          )
        );

        setCoinPositions((prev) =>
          prev.map((pos) =>
            pos.roundKey === roundKey ? { ...pos, confirmed: true } : pos
          )
        );

      }

      // Trigger toast update
      setToastKey((prev) => prev + 1);

      // Remove this listener after response
      socket.off("res", handlePlaceBetResponse);
    };

    // 6️⃣ Add listener and send event
    socket.on("res", handlePlaceBetResponse);
    sendEvent("LIVE_GAME_PLACE_BET", payload);
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
        className="absolute bottom-0 w-full flex footerContainer gap-2 h-[50%] lg:h-[40%] z-11"
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
          selectedCoin={selectedCoin}
        />
        <Box3 data={data} />
      </div>
    </>
  );
}

export default FooterPart;
