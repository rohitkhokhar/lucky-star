import React, { useState } from "react";
import CoinSelection from "./Box1";
import BalanceDisplay from "./Box3";
import BettingArea from "./Box2";
s;
function FooterPart() {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinPositions, setCoinPositions] = useState([]);

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  const handleUndo = () => {
    setCoinPositions([]);
  };

  const placeCoin = (position) => {
    if (selectedCoin) {
      setCoinPositions((prevPositions) => {
        const existing = prevPositions.find((pos) => pos.position === position);
        if (existing) {
          return prevPositions.map((pos) =>
            pos.position === position
              ? { ...pos, totalValue: pos.totalValue + selectedCoin.value }
              : pos
          );
        } else {
          return [
            ...prevPositions,
            {
              coin: { ...selectedCoin },
              position,
              totalValue: selectedCoin.value,
            },
          ];
        }
      });
    }
  };

  return (
    <div className="absolute bottom-0 w-full flex footerContainer gap-2 h-[40%] lg:h-[30%] z-11">
      <CoinSelection onSelect={handleCoinSelect} onUndo={handleUndo} />
      <BettingArea placeCoin={placeCoin} coinPositions={coinPositions} />
      <BalanceDisplay balance={5000} totalBet={5055} />
    </div>
  );
}

export default FooterPart;
