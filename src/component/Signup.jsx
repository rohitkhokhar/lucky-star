import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupImage from "../assets/signup.png";
import { sendEvent, getSocket } from "../signals/socketConnection";

function Signup() {
  const [signupForm, setSignupForm] = useState({
    full_name: "",
    user_name: "",
    mobile_number: "",
    // otp: "",
    password: "",
    confrim_password: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      // Listen for AppLunchDetails in useEffect
      socket.on("res", (data) => {
        if (data.en === "AppLunchDetails") {
          if (!data.err) {
            //console.log("✅ Received AppLunchDetails:", data.data);
            navigate("/login"); // Redirect to login on successful AppLunchDetails
          } else {
            console.error("❌ Error in AppLunchDetails:", data.msg);
            setErrorMessage(data.msg || "Error fetching AppLunchDetails.");
          }
        }
      });
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off("res");
      }
    };
  }, [navigate]);

  // Step 1: Send OTP
  const onSendOtp = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      signupForm.full_name &&
      signupForm.user_name &&
      signupForm.mobile_number
    ) {
      sendEvent("SEND_OTP", { mobile_number: signupForm.mobile_number });
      setOtpSent(true);
    } else {
      setErrorMessage("Please fill all required fields.");
    }
  };

  // Step 2: Complete Signup
  const onSignup = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (signupForm.mobile_number) {
      sendEvent("SINGUP", signupForm);

      // Listen for the AppLunchDetails response after sending the signup event
      const socket = getSocket();
      if (socket) {
        socket.on("res", (data) => {
          if (data.en === "AppLunchDetails") {
            if (!data.err) {
              navigate("/login"); // Redirect to login on success
            } else {
              console.error(
                "❌ Error in AppLunchDetails after signup:",
                data.msg
              );
              setErrorMessage(data.msg || "Signup failed. Please try again.");
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
    setSignupForm({ ...signupForm, [name]: value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white overflow-x-auto">
      <div className="container mx-auto p-5">
        <div className="flex flex-row bg-opacity-90 rounded-2xl overflow-hidden shadow-lg p-5 md:p-10 lg:p-16 bg-gray-800">
          <div className="w-1/2 flex justify-center items-center">
            <img
              src={signupImage}
              alt="Signup"
              className="object-cover w-full max-w-xs md:max-w-sm lg:max-w-md mr-5"
            />
          </div>
          <div className="w-1/2 flex flex-col justify-center text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Signup
            </h1>
            {errorMessage && (
              <div className="mb-4 text-red-500 text-sm md:text-base">
                {errorMessage}
              </div>
            )}
            <form onSubmit={onSignup}>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                className="w-full p-2 md:p-3 rounded bg-transparent border border-white mb-3 md:mb-4"
                value={signupForm.full_name}
                onChange={onChangeFormData}
                disabled={otpSent}
                required
              />
              <input
                type="text"
                name="user_name"
                placeholder="User Name"
                className="w-full p-2 md:p-3 rounded bg-transparent border border-white mb-3 md:mb-4"
                value={signupForm.user_name}
                onChange={onChangeFormData}
                disabled={otpSent}
                required
              />
              <input
                type="text"
                name="mobile_number"
                placeholder="Phone Number"
                className="w-full p-2 md:p-3 rounded bg-transparent border border-white mb-3 md:mb-4"
                value={signupForm.mobile_number}
                onChange={onChangeFormData}
                disabled={otpSent}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-2 md:p-3 rounded bg-transparent border border-white mb-3 md:mb-4"
                value={signupForm.password}
                onChange={onChangeFormData}
                required
              />
              <input
                type="password"
                name="confrim_password"
                placeholder="Confirm Password"
                className="w-full p-2 md:p-3 rounded bg-transparent border border-white mb-3 md:mb-4"
                value={signupForm.confrim_password}
                onChange={onChangeFormData}
                required
              />
              <button
                type="submit"
                className="w-full bg-gray-600 hover:bg-gray-500 text-white p-2 md:p-3 rounded"
              >
                {!otpSent ? "Signup" : "Send OTP"}
              </button>
            </form>
            <p className="mt-4 md:mt-6 text-xs md:text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-500"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
