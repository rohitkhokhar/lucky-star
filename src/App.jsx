import React, { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RotateScreenWarning from "./component/RotateWarning";
import Login from "./component/Login";
import HorizontalDesign from "./component/HorizontalDesign";
import Signup from "./component/Signup";
import PrivacyPolicy from "./component/PrivacyPolicy";
import TermsAndConditions from "./component/TermsAndConditions";
import Process from "./component/Process";
import Dashboard from "./component/Dashboard";
import Profile from "./component/Profile";
import Index from "./component/Index";
import {
  socketConnect,
  sendEvent,
  getSocket,
} from "./signals/socketConnection";

// Auth checker function
const checkAuth = () => {
  const user = localStorage.getItem("user");
  return Boolean(user);
};

// PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
  const isAuth = checkAuth();
  return isAuth ? <>{children}</> : <Navigate to="/Login" replace />;
};

const App = () => {
  const [isLandscape, setIsLandscape] = useState(
    window.matchMedia("(orientation: landscape)").matches,
  );
  const [isAuth, setIsAuth] = useState(checkAuth());
  const [socketConnected, setSocketConnected] = useState(false); // 🔥 New state
  const authToken = JSON.parse(localStorage.getItem("authToken"));
  // //console.log("Auth Token:", authToken, isAuth, socketConnected);

  useEffect(() => {
    const connectAndRestart = () => {
      const socket = socketConnect();
      socket.off("connect");
      socket.on("connect", () => {
        //console.log("🟢 Socket fully connected, now sending RESTART_GAME");
        setSocketConnected(true);

        if (authToken) {
          sendEvent(
            "RESTART_GAME",
            { relogin_token: authToken },
            (response) => {
              if (response?.relogin_token) {
                localStorage.setItem(
                  "authToken",
                  JSON.stringify(response.relogin_token),
                );
              }
            },
          );
        }
      });

      // 🔥 Handle SHUTDOWN event
      socket.on("SHUTDOWN", () => {
        console.warn("🔴 SHUTDOWN received from server. Logging out user...");
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        setIsAuth(false);
        window.location.href = "/Login"; // 👈 force redirect to Login
      });
    };

    connectAndRestart();

    const mediaQuery = window.matchMedia("(orientation: landscape)");
    const handleOrientationChange = () => {
      setIsLandscape(mediaQuery.matches);
    };

    const authChangeListener = () => {
      setIsAuth(checkAuth());
    };

    mediaQuery.addEventListener("change", handleOrientationChange);
    window.addEventListener("storage", authChangeListener);

    return () => {
      mediaQuery.removeEventListener("change", handleOrientationChange);
      window.removeEventListener("storage", authChangeListener);
    };
  }, [authToken]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={isAuth ? <Navigate to="/Dashboard" replace /> : <Index />}
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route
          path="/Login"
          element={isAuth ? <Navigate to="/Dashboard" replace /> : <Login />}
        />
        <Route
          path="/Signup"
          element={isAuth ? <Navigate to="/Dashboard" replace /> : <Signup />}
        />
        <Route path="/Process" element={<Process />} />

        {/* Protected Routes */}
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/Profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/live/:tableId"
          element={
            <PrivateRoute>
              {socketConnected ? (
                isLandscape ? (
                  <HorizontalDesign />
                ) : (
                  <RotateScreenWarning />
                )
              ) : (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  Connecting to server...
                </div>
              )}
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
