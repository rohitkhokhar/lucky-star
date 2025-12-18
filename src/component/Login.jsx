import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Quads_A from "../assets/Quads_A.png";
import PrivacyPolicy from "./PrivacyPolicy";
import {
  sendEvent,
  socketConnect,
  getSocket,
} from "../signals/socketConnection";
import { setUser } from "../redux/authSlice";
import TermsAndConditions from "./TermsAndConditions";
import PopupMessage from './PopupMessage'

function Login() {
  const [loginForm, setLoginForm] = useState({
    mobile_number: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [supportNumber, setsupportNumber] = useState("");

  // 🔥 popup states
  const [showPolicyPopup, setShowPolicyPopup] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    socketConnect(navigate);
  }, [navigate]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleSettings = (data) => {
      if (data.en === "SETTING" && !data.err) {
        setsupportNumber(data.data.support_number);
      }
    };

    socket.on("res", handleSettings);
    return () => socket.off("res", handleSettings);
  }, []);

  // 🔹 FORM SUBMIT (only open popup)
  const onFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginForm.mobile_number || !loginForm.password) {
      setErrorMessage("Please enter mobile number and password.");
      return;
    }

    setPendingLogin(true);
    setShowPolicyPopup(true);
  };

  // 🔹 ACCEPT POLICY → LOGIN
  const handleAccept = () => {
    setShowPolicyPopup(false);

    if (!pendingLogin) return;

    sendEvent("LOGIN", loginForm);

    const socket = getSocket();
    if (!socket) return;

    socket.on("res", (data) => {
      if (data.en === "AppLunchDetails") {
        if (!data.err) {
          localStorage.setItem("user", JSON.stringify(data.data));
          localStorage.setItem(
            "authToken",
            JSON.stringify(data?.data?.relogin_token ?? "")
          );
          navigate("/Dashboard");
        } else {
          setErrorMessage(data.msg || "Login failed.");
        }
      }
    });
  };

  // 🔹 DECLINE POLICY → BLOCK LOGIN
  const handleDecline = () => {
    setShowPolicyPopup(false);
    setPendingLogin(false);
    setErrorMessage("You must accept Privacy Policy & Terms to login.");
  };

  const onChangeFormData = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="container mx-auto p-5">
          <div className="flex md:flex-row bg-gray-800 rounded-2xl p-10 md:p-16 shadow-lg">
            {/* LEFT IMAGE */}
            <div className="w-full md:w-1/2 flex justify-center items-center">
              <img src={Quads_A} alt="Live Game" className="w-3/4 md:w-1/2" />
            </div>

            {/* LOGIN FORM */}
            <div className="w-full md:w-1/2">
              <p className="text-center text-sm mb-3">
                For Amusement Purpose Only
              </p>

              <h1 className="text-3xl font-bold mb-6">Login</h1>

              {errorMessage && (
                <div className="text-red-500 mb-4">{errorMessage}</div>
              )}

              <form onSubmit={onFormSubmit}>
                <input
                  type="text"
                  name="mobile_number"
                  placeholder="Phone Number"
                  value={loginForm.mobile_number}
                  onChange={onChangeFormData}
                  className="w-full p-3 mb-4 rounded bg-transparent border border-white"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={onChangeFormData}
                  className="w-full p-3 mb-4 rounded bg-transparent border border-white"
                />

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded font-bold"
                >
                  Login
                </button>
              </form>

              <div className="flex justify-between text-sm mt-4">
                <p>
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-purple-400 hover:text-purple-500"
                  >
                    Sign Up!
                  </Link>
                </p>

                <p className="text-gray-400 text-sm text-center">
                  <span className="text-purple-400">
                    <Link to="/privacy-policy">Privacy Policy</Link>
                  </span>{" "}
                  |{" "}
                  <span className="text-purple-400">
                    <Link to="/terms-and-conditions">Terms & Conditions</Link>
                  </span>
                </p>

                {/* {supportNumber && (
                <a
                  href={`https://wa.me/${supportNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-500"
                >
                  Forgot password?
                </a>
              )} */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPolicyPopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-900 text-white rounded-xl w-11/12 md:w-2/3 p-4 max-h-[80vh] overflow-y-auto">
            <div className="text-sm text-gray-300 max-h-[50vh] overflow-y-auto">
              <PopupMessage/>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleDecline}
                className="w-1/2 bg-red-600 hover:bg-red-700 py-3 rounded"
              >
                Decline
              </button>

              <button
                onClick={handleAccept}
                className="w-1/2 bg-purple-600 hover:bg-purple-700 py-3 rounded"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
