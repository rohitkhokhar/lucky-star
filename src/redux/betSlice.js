import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCoin: null,
  marketType: "open", // 'open' or 'close'
  bets: {}, // { [key]: { key, number, amount, gameType, market, odds } }
  betHistory: [], // [{ type: 'single', key, amount }, ...] for undo
};

const betSlice = createSlice({
  name: "bet",
  initialState,
  reducers: {
    setSelectedCoin: (state, action) => {
      state.selectedCoin = action.payload;
    },
    setMarketType: (state, action) => {
      state.marketType = action.payload.toLowerCase();
    },
    addBet: (state, action) => {
      const { gameType, market, number, amount, odds } = action.payload;
      const key = `${gameType}-${market}-${number}`;
      const existingAmount = state.bets[key]?.amount || 0;

      state.bets[key] = {
        key,
        number: String(number),
        amount: existingAmount + amount,
        gameType,
        market,
        odds: odds || 1,
      };

      state.betHistory.push({
        type: "single",
        key,
        amount,
      });
    },
    removeBet: (state, action) => {
      const key = action.payload;
      if (state.bets[key]) {
        delete state.bets[key];
        state.betHistory = state.betHistory.filter((item) => item.key !== key);
      }
    },
    addCycleBets: (state, action) => {
      const { combinations, currentStake, marketType, odds } = action.payload;
      const addedKeys = [];

      combinations.forEach((number) => {
        const key = `jodi-${marketType}-${number}`;
        const existingAmount = state.bets[key]?.amount || 0;

        state.bets[key] = {
          key,
          number: String(number),
          amount: existingAmount + currentStake,
          gameType: "jodi",
          market: marketType,
          odds: odds || 90,
        };
        addedKeys.push({ key, amount: currentStake });
      });

      state.betHistory.push({
        type: "cycle",
        items: addedKeys,
      });
    },
    undoLastBet: (state) => {
      if (state.betHistory.length === 0) return;

      const lastAction = state.betHistory.pop();

      if (lastAction.type === "single") {
        const { key, amount } = lastAction;
        if (state.bets[key]) {
          const newAmount = state.bets[key].amount - amount;
          if (newAmount <= 0) {
            delete state.bets[key];
          } else {
            state.bets[key].amount = newAmount;
          }
        }
      } else if (lastAction.type === "cycle") {
        lastAction.items.forEach(({ key, amount }) => {
          if (state.bets[key]) {
            const newAmount = state.bets[key].amount - amount;
            if (newAmount <= 0) {
              delete state.bets[key];
            } else {
              state.bets[key].amount = newAmount;
            }
          }
        });
      }
    },
    clearBets: (state) => {
      state.bets = {};
      state.betHistory = [];
    },
    setBetsState: (state, action) => {
      state.bets = action.payload.bets || {};
      if (action.payload.selectedCoin !== undefined) {
        state.selectedCoin = action.payload.selectedCoin;
      }
      if (action.payload.marketType !== undefined) {
        state.marketType = action.payload.marketType;
      }
    },
  },
});

export const {
  setSelectedCoin,
  setMarketType,
  addBet,
  removeBet,
  addCycleBets,
  undoLastBet,
  clearBets,
  setBetsState,
} = betSlice.actions;

export default betSlice.reducer;
