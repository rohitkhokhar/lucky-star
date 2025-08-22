import React from "react";

const ProgressBar = ({ blackRatio }) => {
  // Ensure blackRatio is between 0 to 100
  const blackWidth = Math.min(100, Math.max(0, blackRatio));
  const redWidth = 100 - blackWidth;

  return (
    <div className="w-[75%] h-[15px] rounded-full bg-gray-700 overflow-hidden flex border border-gray-400">
      {/* Black Section */}
      <div
        className="bg-[#313131] transition-all duration-500"
        style={{ width: `${blackWidth}%` }}
      ></div>

      {/* Red Section */}
      <div
        className="bg-[#AD1417] transition-all duration-500"
        style={{ width: `${redWidth}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
