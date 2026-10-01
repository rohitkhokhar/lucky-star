// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import betReducer from "./betSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    bet: betReducer,
  },
});

export default store;
