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

function Login() {
  const [loginForm, setLoginForm] = useState({
    mobile_number: "",
    password: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [supportNumber, setsupportNumber] = useState("");
  const [agree, setAgree] = useState(false); // ✅ checkbox state

  const user = JSON.parse(localStorage.getItem("user")) ?? null;
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    socketConnect(navigate);
  }, [navigate]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleSettings = (data) => {
      if (data.en === "SETTING") {
        if (!data.err) {
          setsupportNumber(data.data.support_number);
        }
      }
    };

    socket.on("res", handleSettings);
    return () => socket.off("res", handleSettings);
  }, []);

  const onFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    // ✅ checkbox validation
    if (!agree) {
      setErrorMessage(
        "Please accept Privacy Policy & Terms and Conditions."
      );
      return;
    }

    if (loginForm.password && loginForm.mobile_number) {
      sendEvent("LOGIN", loginForm);

      const socket = getSocket();
      if (socket) {
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
      }
    } else {
      setErrorMessage("Please enter mobile number and password.");
    }
  };

  const onChangeFormData = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white overflow-y-auto">
      <div className="container mx-auto p-5">
        <div className="flex md:flex-row bg-opacity-90 rounded-2xl overflow-hidden shadow-lg p-10 md:p-16 bg-gray-800">
          
          {/* LEFT IMAGE */}
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <img
              src={Quads_A}
              alt="Live Game"
              className="w-3/4 md:w-1/2"
            />
          </div>

          {/* RIGHT LOGIN FORM */}
          <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
              <p className="text-lg text-center text-white">
                For Amusement Purpose Only
              </p>
              
            <h1 className="text-3xl font-bold mb-6">Login</h1>

            {errorMessage && (
              <div className="mb-4 text-red-500">{errorMessage}</div>
            )}

            <form onSubmit={onFormSubmit} className="mb-6">
              <input
                type="text"
                name="mobile_number"
                placeholder="Phone Number"
                value={loginForm.mobile_number}
                onChange={onChangeFormData}
                className="w-full p-3 rounded-lg bg-transparent border border-white placeholder-white focus:outline-none mb-4"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={loginForm.password}
                onChange={onChangeFormData}
                className="w-full p-3 rounded-lg bg-transparent border border-white placeholder-white focus:outline-none mb-4"
                required
              />

              {/* ✅ PRIVACY & TERMS CHECKBOX */}
              <div className="flex items-start gap-2 text-sm text-left mt-2">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 accent-purple-600"
                />
                <p className="text-gray-300">
                  I agree to the{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-purple-400 hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/terms-and-conditions"
                    className="text-purple-400 hover:underline"
                  >
                    Terms and Conditions
                  </Link>
                </p>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={!agree}
                className={`w-full mt-6 font-bold py-3 rounded-lg transition duration-300
                  ${
                    agree
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
              >
                Login
              </button>

            </form>

            {/* SIGNUP + FORGOT */}
            <div className="flex justify-between text-sm">
              <p>
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-purple-400 hover:text-purple-500"
                >
                  Sign Up!
                </Link>
              </p>

              {supportNumber && (
                <a
                  href={`https://wa.me/${supportNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-500"
                >
                  Forgot password?
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
