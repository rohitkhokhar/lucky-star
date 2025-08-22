import { useEffect, useState } from "react";
import RotateImage from "../assets/rotate.png";

const RotateScreenWarning = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setShowWarning(window.innerWidth < window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white text-center p-6">
      <img
        src={RotateImage}
        alt="Rotate Icon"
        className="w-24 h-24 animate-spin-slow mb-4"
      />
      <h2 className="text-xl font-semibold">Please Rotate Your Device</h2>
      <p className="text-sm opacity-80 mt-2">
        This application works best in landscape mode.
      </p>
    </div>
  );
};

export default RotateScreenWarning;
