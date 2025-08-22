import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglassEnd } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import DesktopImage from "../assets/Desktop-2.png"; // Ensure correct path

const RegistrationPending = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-black text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${DesktopImage})` }}
    >
      <div className="text-center p-6 rounded-lg">
        {/* Use FontAwesomeIcon instead of class names */}
        <FontAwesomeIcon
          icon={faHourglassEnd}
          className="text-4xl mb-5"
          aria-label="Loading"
        />
        <p className="text-lg mb-2">Your registration is in process</p>
        <p className="text-lg mb-6">Please wait until approved</p>
        <Link
          to="/Dashboard"
          className="px-6 py-2 border border-white rounded-full hover:bg-white hover:text-black transition"
        >
          Exit
        </Link>
      </div>
    </div>
  );
};

export default RegistrationPending;
