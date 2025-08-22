import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Quads_A from "../assets/Quads_A.png";
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
  }); //otp: ""
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [supportNumber, setsupportNumber] = useState("");

  // const user = useSelector((state) => state.auth.user);
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
          console.log("🛠️ SETTINGS received:", data.data);
          setsupportNumber(data.data.support_number);
        } else {
          console.error("❌ Error in SETTING:", data.msg);
        }
      }
    };

    socket.on("res", handleSettings);

    return () => {
      socket.off("res", handleSettings); // Cleanup
    };
  }, []);

  const onSendOtp = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (loginForm.mobile_number && loginForm.password) {
      console.log("Requesting OTP for:", loginForm.mobile_number);
      sendEvent("SEND_OTP", { mobile_number: loginForm.mobile_number });
      setOtpSent(true);
    } else {
      setErrorMessage("Please enter your mobile number.");
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (loginForm.password) {
      console.log("Submitting Login Form:", loginForm);

      // Handle LOGIN event and receive AppLunchDetails
      sendEvent("LOGIN", loginForm);
      const socket = getSocket();
      if (socket) {
        socket.on("res", (data) => {
          if (data.en === "AppLunchDetails") {
            if (!data.err) {
              console.log(
                "✅ AppLunchDetails received during login:",
                data.data
              );
              localStorage.setItem("user", JSON.stringify(data.data));
              localStorage.setItem(
                "authToken",
                JSON.stringify(data?.data?.relogin_token ?? "")
              );
              // dispatch(setUser(data.data));
              navigate("/Dashboard"); // Redirect to login on success
            } else {
              console.error(
                "❌ Error in AppLunchDetails after signup:",
                data.msg
              );
              setErrorMessage(data.msg || "Signup failed. Please try again.");
            }
          }
          if (data.en === "ONLINE_ROOM") {
            console.log("setRoomLimit ", data)
            if (!data.err) {
              setRoomLimit(data?.data?.online_room_counter)
            } else {
              console.error("❌ Error in ONLINE_ROOM:", data.msg);
            }
          }
        });
      }
    } else {
      setErrorMessage("Please enter the OTP.");
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
          <div className="w-full md:w-1/2 flex justify-center items-center md:flex">
            <img
              src={Quads_A}
              alt="Andar Bahar Game"
              className="w-3/4 md:w-1/2"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            {errorMessage && (
              <div className="mb-4 text-red-500">Error: {errorMessage}</div>
            )}
            {/* <form onSubmit={otpSent ? onFormSubmit : onSendOtp}> */}
            <form onSubmit={onFormSubmit} className="mb-6">
              <input
                type="text"
                name="mobile_number"
                placeholder="Phone Number"
                value={loginForm.mobile_number}
                onChange={onChangeFormData}
                className="w-full p-3 rounded-lg bg-transparent border border-white placeholder-white focus:outline-none mb-4"
                disabled={otpSent}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={loginForm.password || ""}
                onChange={onChangeFormData}
                className="w-full p-3 rounded-lg bg-transparent border border-white placeholder-white focus:outline-none mb-4"
                required
              />
              {/* {otpSent && (
                <>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={loginForm.otp}
                    onChange={onChangeFormData}
                    className="w-full p-3 rounded-lg bg-transparent border border-white placeholder-white focus:outline-none mb-4"
                    required
                  />
                </>
              )} */}
              <button
                type="submit"
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300"
              >
                {/* {otpSent ? "Login" : "Send OTP"} */}
                {"Login"}
              </button>
            </form>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <p className="text-sm">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-purple-400 hover:text-purple-500"
                >
                  Sign Up!
                </Link>
              </p>
              {supportNumber && (
                <p className="text-sm">
                  <a
                    href={`https://wa.me/${supportNumber}`} // Replace with your WhatsApp number
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-500"
                  >
                    Forgot password?
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
