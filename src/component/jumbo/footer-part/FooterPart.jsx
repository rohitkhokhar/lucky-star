import React, { useState, useEffect } from "react";

import "./footer.css";
import LuckyStarLogo from "../../../assets/luckystarLogo.png";
import border1 from "../../../assets/border1.png";
import border2 from "../../../assets/border2.png";
import border3 from "../../../assets/border3.png";
import border4 from "../../../assets/border4.png";
import border5 from "../../../assets/border5.png";
import baharWins from "../../../assets/audio/bahar_wins.mp3";
import andarWins from "../../../assets/audio/andar_wins.mp3";
import firstShootBahar from "../../../assets/audio/first_shoot_bahar.mp3";
import secondShootBahar from "../../../assets/audio/second_shoot_bahar.mp3";
import firstShootAndar from "../../../assets/audio/first_shoot_andar.mp3";
import secondShootAndar from "../../../assets/audio/second_shoot_andar.mp3";
import { useDispatch, useSelector } from "react-redux";
import Box1 from "./Box1";
import Box2 from "./Box2";
import Box3 from "./Box3";
import {
  sendEvent,
  socketConnect,
  getSocket,
} from "../../../signals/socketConnection";
import Toast from "./Toast";
import {
  setSelectedCoin as setReduxSelectedCoin,
  setMarketType as setReduxMarketType,
  undoLastBet,
  clearBets,
  removeBet,
} from "../../../redux/betSlice";

let localCoinPositions = [];

const audioMap = {
  baharWins: new Audio(baharWins),
  andarWins: new Audio(andarWins),
  firstShootBahar: new Audio(firstShootBahar),
  firstShootAndar: new Audio(firstShootAndar),
  secondShootBahar: new Audio(secondShootBahar),
  secondShootAndar: new Audio(secondShootAndar),
};

const parseSocketMessage = (msg, fallback = "") => {
  if (msg === undefined || msg === null) return fallback;
  if (typeof msg === "string") return msg.trim() !== "" ? msg : fallback;
  if (typeof msg === "function" || React.isValidElement(msg)) return msg;

  if (typeof msg === "object") {
    if ("open" in msg || "close" in msg) {
      const openVal = typeof msg.open === "object" ? msg.open?.msg : msg.open;
      const closeVal = typeof msg.close === "object" ? msg.close?.msg : msg.close;

      const hasOpenString = typeof openVal === "string" && openVal.trim() !== "";
      const hasCloseString = typeof closeVal === "string" && closeVal.trim() !== "";

      if (hasOpenString && hasCloseString) {
        return `${openVal.trim()} | ${closeVal.trim()}`;
      }
      if (hasOpenString) return openVal.trim();
      if (hasCloseString) return closeVal.trim();

      const isOpenTruthy = Boolean(openVal && openVal !== "0" && openVal !== "false");
      const isCloseTruthy = Boolean(closeVal && closeVal !== "0" && closeVal !== "false");

      if (isOpenTruthy && isCloseTruthy) {
        return fallback || "Open & Close Round Started!";
      }
      if (isOpenTruthy) {
        return "Open Round Started!";
      }
      if (isCloseTruthy) {
        return "Close Round Started!";
      }
      return fallback;
    }

    if (typeof msg.msg === "string" && msg.msg.trim() !== "") {
      return msg.msg;
    }
    if (typeof msg.message === "string" && msg.message.trim() !== "") {
      return msg.message;
    }

    try {
      return JSON.stringify(msg);
    } catch {
      return fallback;
    }
  }

  return String(msg);
};

function FooterPart({ roomId }) {
  const dispatch = useDispatch();
  const reduxBet = useSelector((state) => state.bet) || {};
  const currentBets = reduxBet.bets || {};

  // const user = useSelector((state) => state.auth.user);
  const user = JSON.parse(localStorage.getItem("user")) ?? null;
  const total_wallet = JSON.parse(localStorage.getItem("total_wallet")) ?? 0;
  const [selectedCoin, setSelectedCoin] = useState(
    reduxBet.selectedCoin || null
  );
  const [marketType, setMarketType] = useState(
    reduxBet.marketType || "open"
  );
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
  const [showBetPreview, setShowBetPreview] = useState(false);
  // const [announcement, setAnnouncement] = useState("");
  // const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);


  const [openWinCard, setOpenWinCard] = useState(null);
  const [winNumber, setWinNumber] = useState(null);
  const [closeWinCard, setCloseWinCard] = useState(null);

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
  const [roundTimers, setRoundTimers] = useState({
    open: null,
    close: null,
    receivedAt: null,
  });

  const defaultCoins = [
    { value: 10, image: border1 },
    { value: 50, image: border2 },
    { value: 100, image: border3 },
    { value: 500, image: border4 },
    { value: 1000, image: border5 },
  ];

  const coins =
    data?.bet_slots && data.bet_slots.length > 0
      ? data.bet_slots.map((value, index) => ({
        value,
        image: [border1, border2, border3, border4, border5][index % 5],
      }))
      : defaultCoins;

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

  const playWinnerAudio = (winSide, betNo) => {
    try {
      if (!winSide) return;
      let audio;

      if (betNo === "first_bet") {
        audio =
          winSide === "bahar"
            ? audioMap.firstShootBahar
            : audioMap.firstShootAndar;
      } else if (betNo === "second_bet") {
        audio =
          winSide === "bahar"
            ? audioMap.secondShootBahar
            : audioMap.secondShootAndar;
      } else {
        audio =
          winSide === "bahar"
            ? audioMap.baharWins
            : audioMap.andarWins;
      }

      audio.currentTime = 0;
      audio.play().catch(() => { });
    } catch (err) {
      console.log("Audio play error:", err);
    }
  };

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
    openCard:
      parts[0] && parts[0] !== "***"
        ? parts[0]
        : null,

    number:
      parts[1] &&
      parts[1] !== "**" &&
      parts[1] !== "*" &&
      parts[1] !== "***"
        ? parts[1]
        : parts[1] === "*"
          ? "*"
          : null,

    closeCard:
      parts[2] && parts[2] !== "***"
        ? parts[2]
        : null,
  };
};

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    sendEvent("LIVE_MATKA_GAME_INFO", { roomId: roomId });

    const handleEventResponse = (response) => {
      if (!response) return;

      const { en, data } = response;

      if (response.err) {
        setIsPlacingBet(false);
        console.error(`Error from server (${en}):`, response.msg);

        const errorMsg = parseSocketMessage(
          response.msg,
          "Bet placement failed!"
        );
        setToastMessage(errorMsg);
        setToastType("error");
        setToastKey((prev) => prev + 1);
        return;
      }

      switch (en) {
        case "LIVE_MATKA_GAME_INFO":
        case "LIVE_GAME_INFO":
          console.log("LIVE_MATKA_GAME_INFO data:", data);
          setData(data);
          
          const parsedWinCard = parseWinCard(data?.win_card);

            console.log("RESTORE WIN CARD:", {
              win_card: data?.win_card,
              draw_details: data?.draw_details,
              parsed: parsedWinCard,
            });

            // OPEN RESULT
            if (data?.draw_details?.open?.state === "win") {
              setOpenWinCard(parsedWinCard.openCard);
              setWinNumber(parsedWinCard.number);
            } else {
              setOpenWinCard(null);
              setWinNumber(null);
            }

            // CLOSE RESULT
            if (data?.draw_details?.close?.state === "win") {
              setCloseWinCard(parsedWinCard.closeCard);
            } else {
              setCloseWinCard(null);
            }

          setGameState(data.game_state);
          if (data.game_state === "round_start" || data.game_state === "round_end") {
            setBtnDisabled(true);
          } else if (data.game_state && data.game_state.includes("bet")) {
            setBtnDisabled(false);
          }
          setCenterCard(data.center_card);

          const infoOpenTime =
            data?.msg?.open?.time ??
            (typeof data?.msg?.open === "number" ? data.msg.open : null);
          const infoCloseTime =
            data?.msg?.close?.time ??
            (typeof data?.msg?.close === "number" ? data.msg.close : null);
          if (infoOpenTime !== null || infoCloseTime !== null) {
            setRoundTimers({
              open: infoOpenTime !== null ? Number(infoOpenTime) : null,
              close: infoCloseTime !== null ? Number(infoCloseTime) : null,
              receivedAt: Date.now(),
            });
          }
          if (data.total_wallet)
            localStorage.setItem(
              "total_wallet",
              JSON.stringify(data.total_wallet),
            );
          if (data.min_max_config) {
            localStorage.setItem(
              "min_max_config",
              JSON.stringify(data.min_max_config),
            );
          } else {
            localStorage.removeItem("min_max_config");
          }

          // if (data.announcement_text) {
          //   setAnnouncement(data.announcement_text);
          //   setShowAnnouncement(true);
          // }

          const bets = data.bet_lists || [];
          const firstBetTotal = bets
            .filter((b) => b.bet_no === "first_bet")
            .reduce(
              (sum, b) =>
                sum + (b.card_details.andar || 0) + (b.card_details.bahar || 0),
              0,
            );

          const secondBetTotal = bets
            .filter((b) => b.bet_no === "second_bet")
            .reduce(
              (sum, b) =>
                sum + (b.card_details.andar || 0) + (b.card_details.bahar || 0),
              0,
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
          //console.log({ andar1, bahar1 });
          setData((prev) => ({
            ...prev,
            total_bet_on_cards: data.total_bet_on_cards,
            user_total_bet: andar1 + bahar1,
          }));

          setToastMessage(message);
          setToastType(type);
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_MATKA_GAME_START_ROUND":
        case "LIVE_GAME_START_ROUND":
          setGameState(data.game_state || "round_start");
          setBtnDisabled(true);

          setOpenWinCard(null);
          setWinNumber(null);
          setCloseWinCard(null);

          setShowBetPreview(false);
          dispatch(clearBets());
          dispatch(setReduxSelectedCoin(null));
          setSelectedCoin(null);
          setCenterCard(data.center_card || null);
          setRoundTimers({ open: null, close: null, receivedAt: null });
          setCoinPositions([]);
          setCoinHistory([]);
          localCoinPositions = [];
          setPendingBets({
            first: { andar: 0, bahar: 0 },
            second: { andar: 0, bahar: 0 },
            third: { andar: 0, bahar: 0 },
          });
          setRoundBets({
            first: { andar: 0, bahar: 0 },
            second: { andar: 0, bahar: 0 },
            third: { andar: 0, bahar: 0 },
          });
          setHasPlacedBet(false);
          setBetAmounts({ first: 0, second: 0, third: 0 });
          setData((prev) => ({
            ...prev,
            user_total_bet: 0,
            game_id: data.game_id || prev.game_id,
            last_win_cards: data.last_win_cards || prev.last_win_cards || [],
            total_bet_on_cards: {},
          }));
          setToastMessage(
            parseSocketMessage(
              data.msg,
              "New Round started, please wait to start open/close bet......!"
            )
          );
          setToastType("info");
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_MATKA_GAME_PLACE_BET":
        case "LIVE_GAME_PLACE_BET": {
          setIsPlacingBet(false);

          if (response.err || data?.err) {
            const errorMsg = response.msg || data?.msg || "Bet placement failed!";
            setToastMessage(errorMsg);
            setToastType("error");
            setToastKey((prev) => prev + 1);
            break;
          }

          // Handle Success
          const placedAmount = data?.total_bet_amount || totalBet;
          const ticketText = data?.ticket_id ? ` (Ticket: ${data.ticket_id})` : "";
          const successMsg =
            data?.msg && data.msg.trim() !== ""
              ? data.msg
              : `Bet Placed: ₹${Number(placedAmount).toLocaleString()} successfully!${ticketText}`;

          setToastMessage(successMsg);
          setToastType("success");
          setToastKey((prev) => prev + 1);

          // Update user balance from start_point
          if (data?.start_point !== undefined && data.start_point !== null) {
            const updatedBal = Number(data.start_point);
            setUserBalance(updatedBal);
            localStorage.setItem("total_wallet", JSON.stringify(updatedBal));
            const storedUser = JSON.parse(localStorage.getItem("user")) ?? user;
            if (storedUser) {
              const updatedUser = { ...storedUser, chips: updatedBal };
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          } else {
            const currentBal = total_wallet ?? userBalance ?? 0;
            const newBal = Math.max(0, currentBal - Number(placedAmount));
            setUserBalance(newBal);
            localStorage.setItem("total_wallet", JSON.stringify(newBal));
            const storedUser = JSON.parse(localStorage.getItem("user")) ?? user;
            if (storedUser) {
              const updatedUser = { ...storedUser, chips: newBal };
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          }

          // Update data total bets in game
          setData((prev) => ({
            ...prev,
            user_total_bet: (prev.user_total_bet || 0) + Number(placedAmount),
            game_id: data?.game_id || prev.game_id,
          }));

          // Clear bets after successful placement
          dispatch(clearBets());
          break;
        }

        case "LIVE_MATKA_GAME_PLACE_BET_INFO":
        case "LIVE_GAME_PLACE_BET_INFO":
          const { andar = 0, bahar = 0 } = data.total_bet_on_cards || {};
          setData((prev) => ({
            ...prev,
            total_bet_on_cards: data.total_bet_on_cards,
            user_total_bet: andar + bahar,
          }));
          console.log("LIVE_GAME_PLACE_BET_INFO", data);
          break;

        case "LIVE_MATKA_GAME_SET_JOKER":
        case "LIVE_GAME_SET_JOKER":
          setGameState("set_joker");
          setBtnDisabled(true);
          setShowBetPreview(false);
          setCenterCard(data.center_card);
          setToastMessage("Joker has been set for this round.");
          setToastType("info");
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_MATKA_GAME_BET_START":
        case "LIVE_GAME_BET_START": {
          setGameState(
            typeof data.game_state === "string"
              ? data.game_state
              : "start_round_first_bet"
          );
          const currentRoundKey =
            data.bet_no === "first_bet"
              ? "first"
              : data.bet_no === "second_bet"
                ? "second"
                : "third";

          setCoinPositions((prev) =>
            prev.filter(
              (pos) =>
                pos.confirmed === true || pos.roundKey === currentRoundKey,
            ),
          );

          setCoinHistory((prev) =>
            prev.filter(
              (coin) =>
                coin.confirmed === true || coin.roundKey === currentRoundKey,
            ),
          );

          // Reset pending bets only for the current round
          setPendingBets((prev) => ({
            ...prev,
            [currentRoundKey]: { andar: 0, bahar: 0 },
          }));

          setBtnDisabled(false);

          const rawOpenTime =
            data?.msg?.open?.time ??
            (typeof data?.msg?.open === "number" ? data.msg.open : null);
          const rawCloseTime =
            data?.msg?.close?.time ??
            (typeof data?.msg?.close === "number" ? data.msg.close : null);

          if (rawOpenTime !== null || rawCloseTime !== null) {
            setRoundTimers({
              open: rawOpenTime !== null ? Number(rawOpenTime) : null,
              close: rawCloseTime !== null ? Number(rawCloseTime) : null,
              receivedAt: Date.now(),
            });
          }
          const rawBetNo = typeof data.bet_no === "string" ? data.bet_no : "";
          const rawMarketType = typeof data.market_type === "string" ? data.market_type : "";
          const rawGameState = typeof data.game_state === "string" ? data.game_state : "";

          const betStartLabel = rawBetNo
            ? rawBetNo
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())
            : rawMarketType
              ? rawMarketType.toUpperCase()
              : rawGameState
                ? rawGameState
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())
                : "Betting";

          const displayMsg = parseSocketMessage(
            data.msg,
            `${betStartLabel} Round Started!`
          );
          setToastMessage(displayMsg);
          setToastType("info");
          setToastKey((prev) => prev + 1);
          setHasPlacedBet(false);
          break;
        }

        case "LIVE_MATKA_GAME_BET_LOCK":
        case "LIVE_GAME_BET_LOCK": {
          setBtnDisabled(true);
          setShowBetPreview(false);
          const rawBetNo = typeof data.bet_no === "string" ? data.bet_no : "";
          const rawMarketType = typeof data.market_type === "string" ? data.market_type : "";
          const rawGameState = typeof data.game_state === "string" ? data.game_state : "";

          const lockedBetLabel = rawBetNo
            ? rawBetNo
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())
            : rawMarketType
              ? rawMarketType.toUpperCase()
              : rawGameState
                ? rawGameState
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())
                : "Betting";

          setGameState(
            typeof data.game_state === "string"
              ? data.game_state
              : "bet_locked"
          );
          const displayMsg = parseSocketMessage(
            data.msg,
            `${lockedBetLabel} locked.`
          );
          setToastMessage(displayMsg);
          setToastType("error");
          setToastKey((prev) => prev + 1);
          break;
        }

        case "LIVE_MATKA_GAME_NO_MORE_BET":
        case "LIVE_GAME_NO_MORE_BET": {
          setBtnDisabled(true);
          setShowBetPreview(false);
          const rawBetNo = typeof data.bet_no === "string" ? data.bet_no : "";
          const rawMarketType = typeof data.market_type === "string" ? data.market_type : "";
          const rawGameState = typeof data.game_state === "string" ? data.game_state : "";

          const closedBetLabel = rawBetNo
            ? rawBetNo
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())
            : rawMarketType
              ? rawMarketType.toUpperCase()
              : rawGameState
                ? rawGameState
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())
                : "Betting";

          setGameState(
            typeof data.game_state === "string"
              ? data.game_state
              : "no_more_bet"
          );
          const displayMsg = parseSocketMessage(
            data.msg,
            `${closedBetLabel} round closed.`
          );
          setToastMessage(displayMsg);
          setToastType("error");
          setToastKey((prev) => prev + 1);
          break;
        }

        case "LIVE_MATKA_GAME_WINNER":
        case "LIVE_GAME_WINNER":
          setGameState(data.game_state || "winner");
          setBtnDisabled(true);
          setShowBetPreview(false);
          dispatch(clearBets());
          console.log(data);
          console.log("WINNER RESPONSE:", data);

          const { win_type, win_card } = data;
          const parsed = parseWinCard(win_card);

          if (win_type === "open") {
            setOpenWinCard(parsed.openCard);
            setWinNumber(parsed.number);
            setCloseWinCard(null);
          }

          if (win_type === "close") {
            setOpenWinCard(parsed.openCard);
            setWinNumber(parsed.number);
            setCloseWinCard(parsed.closeCard);
          }

          const winSide = data.win_side ? data.win_side.toLowerCase() : "";
          const betNo = data.win_round || "";

          if (winSide) {
            console.log("PLAY AUDIO", winSide, betNo);
            playWinnerAudio(winSide, betNo);
          }

          setToastMessage(() => {
            if (data.msg) {
              const parsedMsg = parseSocketMessage(data.msg);
              return <strong>{parsedMsg}</strong>;
            }
            if (!winSide) return <strong>Winner Declared!</strong>;
            const isFirstBet = data.bet_no === "first_bet";
            const isSecondBet = data.bet_no === "second_bet";

            const isInitialTwoCardsWin =
              isSecondBet && data.win_round === "second_bet";

            return (
              <>
                <strong>Winner Declared!</strong>
                <br />
                Winning side: <strong>{winSide.toUpperCase()}</strong>
                <br />
                {/* FIRST BET */}
                {isFirstBet && (
                  <>
                    {winSide === "bahar"
                      ? "First Shoot Bahar - 25%"
                      : "First Shoot Andar - 100%"}
                  </>
                )}
                {/* SECOND BET – INITIAL 2 CARDS */}
                {isInitialTwoCardsWin && (
                  <>
                    {winSide === "bahar"
                      ? "Second Shoot Bahar - 25%"
                      : "Second Shoot Andar - 100%"}
                  </>
                )}
                {/* SECOND BET – AFTER INITIAL 2 CARDS */}
                {/* {isSecondBet && !isInitialTwoCardsWin && (
                  <>
                    {winSide === "bahar"
                      ? "Second Shoot Bahar Win"
                      : "Second Shoot Andar Win"}
                  </>
                )} */}
              </>
            );
          });

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

        case "LIVE_MATKA_GAME_END_ROUND":
        case "LIVE_GAME_END_ROUND":
          setGameState(data.game_state || "round_end");
          setBtnDisabled(true);
          setShowBetPreview(false);
          dispatch(clearBets());
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
          setRoundTimers({ open: null, close: null, receivedAt: null });
          setToastKey((prev) => prev + 1);
          break;

        case "LIVE_MATKA_GAME_ROUND_WIN":
        case "LIVE_GAME_ROUND_WIN":
          if (data.user_id === user?._id) {
            setToastMessage(() => {
              const winSide = data.win_side?.toLowerCase();
              const isFirstBet = data.bet_no === "first_bet";
              const isSecondBet = data.bet_no === "second_bet";

              const isInitialTwoCardsWin =
                isSecondBet && data.win_round === "second_bet";

              return (
                <>
                  {/* FIRST BET */}
                  {isFirstBet && (
                    <>
                      <strong>🎉 You Won!</strong>
                      <br />
                      Amount: <strong>₹{data.win_amount}</strong>
                      <br />
                      Winning side: <strong>{winSide?.toUpperCase()}</strong>
                      <br />
                      {winSide === "bahar"
                        ? "First Shoot Bahar - 25%"
                        : "First Shoot Andar - 100%"}
                    </>
                  )}
                  {/* SECOND BET – INITIAL 2 CARDS */}
                  {isInitialTwoCardsWin && (
                    <>
                      <strong>🎉 You Won!</strong>
                      <br />
                      Amount: <strong>₹{data.win_amount}</strong>
                      <br />
                      Winning side: <strong>{winSide?.toUpperCase()}</strong>
                      <br />
                      {winSide === "bahar"
                        ? "Second Shoot Bahar - 25%"
                        : "Second Shoot Andar - 100%"}
                    </>
                  )}
                  {/* SECOND BET – AFTER INITIAL 2 CARDS */}
                  {isSecondBet && !isInitialTwoCardsWin && (
                    <>
                      <strong>🎉 You Won!</strong>
                      <br />
                      Amount: <strong>₹{data.win_amount}</strong>
                      <br />
                      Winning side: <strong>{winSide?.toUpperCase()}</strong>
                      {/* {winSide === "bahar"
                        ? "Second Shoot Bahar Win"
                        : "Second Shoot Andar Win"} */}
                    </>
                  )}
                </>
              );
            });

            setToastType("success");
            setToastKey((prev) => prev + 1);
          }
          break;

        case "LIVE_MATKA_GAME_ROUND_LOSE":
        case "LIVE_GAME_ROUND_LOSE":
          if (data.user_id === user?._id) {
            setToastMessage("😞 You lost this round. Better luck next time!");
            setToastType("error");
            setToastKey((prev) => prev + 1);
          }
          break;

        case "LIVE_MATKA_GAME_WINNER":
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

  const isBettingDisabled =
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

  const handleCoinSelect = (coin) => {
    if (isBettingDisabled) {
      setToastMessage("Coin selection is not allowed at this stage.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }
    setSelectedCoin(coin);
    dispatch(setReduxSelectedCoin(coin));
    setToastMessage(`Coin selected: ₹${coin.value}`);
    setToastType("info");
    setToastKey((prev) => prev + 1);
  };

  const placeCoin = (position) => {
    if (
      !isBettingDisabled &&
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
        const index = prev.findIndex((pos) => pos.position === position);

        if (index !== -1) {
          const updated = [...prev];

          updated[index] = {
            ...updated[index],
            totalValue: updated[index].totalValue + selectedCoin.value,

            // track round internally
            roundKey,
            confirmed: false,
          };

          return updated;
        }

        return [
          ...prev,
          {
            coin: selectedCoin,
            position,
            totalValue: selectedCoin.value,
            roundKey,
            confirmed: false,
          },
        ];
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
        { position, value: selectedCoin.value, roundKey, confirmed: false },
      ]);
    } else {
      setToastMessage("Betting is not allowed at this stage.");
      setToastType("error");
    }
    setToastKey((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (isBettingDisabled) {
      setToastMessage("Cannot undo at this stage.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }
    dispatch(undoLastBet());
    setToastMessage("Last bet undone.");
    setToastType("info");
    setToastKey((prev) => prev + 1);
  };

  const calculateTotalBet = (type) => {
    return coinPositions
      .filter((pos) => pos.position === type)
      .reduce((sum, pos) => sum + pos.totalValue, 0);
  };

  const totalBet = Object.values(currentBets).reduce(
    (sum, pos) => sum + Number(pos.amount || 0),
    0
  );

  const mapGameTypeToCategory = (gameType) => {
    switch (gameType) {
      case "single":
        return "single";
      case "jodi":
      case "cycle":
        return "jodi";
      case "single-patti":
      case "single_patti":
      case "single_pana":
        return "single_pana";
      case "double-patti":
      case "double_patti":
      case "double_pana":
        return "double_pana";
      case "triple-patti":
      case "triple_patti":
      case "triple_pana":
        return "triple_pana";
      default:
        return gameType ? gameType.replace("-", "_") : "single";
    }
  };

  const formatGameTypeLabel = (gameType) => {
    if (!gameType) return "Single";
    const map = {
      single: "Single",
      jodi: "Jodi",
      "single-patti": "Single Patti",
      single_patti: "Single Patti",
      single_pana: "Single Patti",
      "double-patti": "Double Patti",
      double_patti: "Double Patti",
      double_pana: "Double Patti",
      "triple-patti": "Triple Patti",
      triple_patti: "Triple Patti",
      triple_pana: "Triple Patti",
      cycle: "Cycle",
    };
    return (
      map[gameType.toLowerCase()] ||
      gameType.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const formatMarketLabel = (market) => {
    if (!market) return "Open";
    return market.charAt(0).toUpperCase() + market.slice(1).toLowerCase();
  };

  const placeBet = () => {
    if (isBettingDisabled) {
      setToastMessage("Betting is not allowed at this stage.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    if (isPlacingBet) {
      return;
    }

    if (totalBet <= 0) {
      setToastMessage("No bets placed! Please select coins and numbers.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    const currentBal = total_wallet ?? userBalance ?? 0;
    if (totalBet > currentBal && currentBal > 0) {
      setToastMessage("Insufficient balance!");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    const socket = getSocket();
    if (!socket || !socket.connected) {
      setToastMessage("Socket connection not available! Please try again.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    setShowBetPreview(true);
  };

  const confirmAndPlaceBet = () => {
    setShowBetPreview(false);

    if (isBettingDisabled) {
      setToastMessage("Betting is not allowed at this stage.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    if (totalBet <= 0) {
      setToastMessage("No bets placed! Please select coins and numbers.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    const currentBal = total_wallet ?? userBalance ?? 0;
    if (totalBet > currentBal && currentBal > 0) {
      setToastMessage("Insufficient balance!");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    const socket = getSocket();
    if (!socket || !socket.connected) {
      setToastMessage("Socket connection not available! Please try again.");
      setToastType("error");
      setToastKey((prev) => prev + 1);
      return;
    }

    // Group bets by mode ("open", "close")
    const betsByMode = {};

    Object.values(currentBets).forEach((bet) => {
      const mode = (bet.market || marketType || "open").toLowerCase();
      if (!betsByMode[mode]) {
        betsByMode[mode] = {};
      }
      const category = mapGameTypeToCategory(bet.gameType);
      if (!betsByMode[mode][category]) {
        betsByMode[mode][category] = {};
      }
      const numKey = String(bet.number);
      betsByMode[mode][category][numKey] =
        (betsByMode[mode][category][numKey] || 0) + Number(bet.amount || 0);
    });

    setIsPlacingBet(true);
    setToastMessage("Placing bet, please wait...");
    setToastType("info");
    setToastKey((prev) => prev + 1);

    Object.entries(betsByMode).forEach(([mode, card_details]) => {
      sendEvent("LIVE_MATKA_GAME_PLACE_BET", {
        mode,
        card_details,
      });
    });
  };

  // const AnnouncementPopup = () => (
  //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
  //     <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 text-center animate-fade-in">
  //       <h2 className="text-xl font-semibold text-gray-800 mb-3">
  //         📢 Announcement
  //       </h2>
  //       <p className="text-sm text-gray-700 mb-4">{announcement}</p>
  //       <button
  //         className="bg-blue-600 text-white font-medium py-2 px-6 rounded-full hover:bg-blue-700 transition-all"
  //         onClick={() => setShowAnnouncement(false)}
  //       >
  //         Close
  //       </button>
  //     </div>
  //   </div>
  // );

  console.log(openWinCard, closeWinCard, winNumber);

  return (
    <>
      {/* Bet Preview Modal */}
      {showBetPreview && (
        <div className="history-popup show" id="preview-popup">
          <div
            className="history-popup-content"
          >
            <h5
              style={{
                textAlign: "center",
                marginBottom: "15px",
                color: "#FFFFFF",
                fontWeight: "bold",
                fontSize: "1.25rem",
              }}
            >
              Review Your Bets
            </h5>
            <div
              id="preview-bets-list"
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                marginBottom: "15px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              {Object.values(currentBets).length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#888",
                    padding: "15px 0",
                  }}
                >
                  No bets placed
                </div>
              ) : (
                Object.values(currentBets).map((bet, index, arr) => (
                  <div
                    key={
                      bet.key || `${bet.gameType}-${bet.market}-${bet.number}`
                    }
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom:
                        index < arr.length - 1
                          ? "1px solid rgba(255, 255, 255, 0.1)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        onClick={() => dispatch(removeBet(bet.key))}
                        style={{
                          color: "#ff3b30",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          lineHeight: 1,
                          userSelect: "none",
                          padding: "0 2px",
                        }}
                        title="Remove bet"
                      >
                        &#10006;
                      </span>
                      <strong style={{ fontSize: "1.2rem", color: "white" }}>
                        {bet.number}
                      </strong>
                      <span style={{ fontSize: "0.95rem", color: "#ddd" }}>
                        ({formatGameTypeLabel(bet.gameType)} -{" "}
                        {formatMarketLabel(bet.market)})
                      </span>
                    </div>
                    <span
                      style={{
                        color: "var(--accent)",
                        fontWeight: "bold",
                        fontSize: "1.15rem",
                      }}
                    >
                      ₹{Number(bet.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                marginBottom: "20px",
                fontSize: "1.1rem",
                color: "white",
              }}
            >
              <span>Total Stake:</span>
              <span
                className="text-accent"
                id="preview-total"
                style={{ color: "var(--accent)", fontSize: "1.3rem" }}
              >
                ₹{Number(totalBet || 0).toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn-action btn-undo"
                id="btn-preview-cancel"
                style={{ flex: 1 }}
                onClick={() => setShowBetPreview(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-action btn-place"
                id="btn-preview-confirm"
                style={{ flex: 1 }}
                disabled={totalBet <= 0 || isPlacingBet}
                onClick={confirmAndPlaceBet}
              >
                Confirm Bet
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bottom-panel">
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
          isPlacingBet={isPlacingBet}
          gameState={gameState}
          total_wallet={total_wallet}
          btnDisabled={isBettingDisabled}
          betAmounts={betAmounts}
          selectedCoin={selectedCoin}
          marketType={marketType}
          setMarketType={setMarketType}
        />
        <Box2
          placeCoin={placeCoin}
          coinPositions={coinPositions}
          pendingBets={pendingBets}
          centerCard={centerCard}
          gameState={gameState}
          btnDisabled={isBettingDisabled}
          data={data}
          opencard={openWinCard}
          winumber={winNumber}
          closecard={closeWinCard}
          total_wallet={total_wallet}
          userBalance={userBalance}
          selectedCoin={selectedCoin}
          marketType={marketType}
          setMarketType={setMarketType}
          bets={currentBets}
          roundTimers={roundTimers}
        />
        <Box3
          data={data}
          selectedCoin={selectedCoin}
          totalBet={totalBet}
        />
      </div>
    </>
  );
}

export default FooterPart;
