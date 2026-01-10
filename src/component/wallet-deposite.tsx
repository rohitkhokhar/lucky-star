import React, { useState, useEffect } from "react";
import { getSocket, sendEvent } from "../signals/socketConnection";
import Toast from "./footer-part/Toast";

interface PaymentMethod {
  name: string;
  range: string;
  icon: string;
  status: string;
}

interface WalletDepositProps {
  onClose: () => void;
}

export default function WalletDeposit({ onClose }: WalletDepositProps): JSX.Element {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("Pay2M");
  const [activeTab, setActiveTab] = useState<string>("Deposit");
  const [qrOption, setQrOption] = useState<string>("qr1");
  const [depositDetails, setDepositDetails] = useState<any>();
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<{ mess: string; type: string } | null>(null);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [packs, setPacks] = useState<{ [amount: number]: string }>({});
  const [withdrawData, setWithdrawData] = useState({ amount: "", password: "" });
  const [withdrawErrors, setWithdrawErrors] = useState<{ [key: string]: string }>({});
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  // //console.log(transactions, "transactions");

  useEffect(() => {
    if (toastMessage !== null) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      sendEvent("TRANSACTIONS", {
        data: {
          type: "deposit&withdraw",
        }
      });

      const handleTransactionsResponse = (res: any) => {
        
      const { en, data } = res;
        if (en === "TRANSACTIONS" && !res.err) {
          setTransactions(res?.data?.lists || []);
        }
        if (en === "WITHDRAW_DETAILS" && !res.err){
          if (user) {
            user.chips = data.userInfos.chips;
            localStorage.setItem("user", JSON.stringify(user));
          }
        }
      };

      socket.on("res", (response: any) => {
        if (response?.en === "PLACE_WITHDRAW_REQUEST") {
          if (!response?.err) {
            setToastMessage({ mess: "Withdrawal request submitted successfully!", type: "success" });
            setActiveTab("History");
          } else {
            setToastMessage({ mess: response?.msg || "Failed to submit withdrawal request.", type: "error" });
          }
        }
        if (response?.en === "ADD_DEPOSIT_REQUEST") {
          if (!response?.err) {
            setUtrNumber("");
            setToastMessage({ mess: "Request sent. Please check your balance in few minutes!", type: "success" });
            sendEvent("TRANSACTIONS", {
              data: {
                type: "deposit&withdraw",
              }
            });
            setActiveTab("History");

          } else {
            setToastMessage({ mess: response?.msg || "Failed to submit withdrawal request.", type: "error" });
          }
        }
      });

      socket.on("res", handleTransactionsResponse);
      return () => {
        socket.off("res", handleTransactionsResponse);
      };
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    sendEvent("DEPOSIT_DETAILS", { type: "UTR" });


    socket.on("res", handleGameHistory);

    return () => {
      socket.off("res", handleGameHistory);
    };
  }, []);

  const handleGameHistory = (res: any) => {
    if (res?.en === "DEPOSIT_DETAILS" && !res.err) {
      setDepositDetails(res.data);

      // Extract amounts from packs and convert to numbers
      const dynamicAmounts = res.data?.packs?.map((pack: any) => Number(pack.amount)) || [];
      setAmounts(dynamicAmounts);
      const packMap: { [amount: number]: string } = {};
      res.data.packs.forEach((pack: any) => {
        packMap[Number(pack.amount)] = pack.pack_id;
      });
      setPacks(packMap);
      sendEvent("TRANSACTIONS", {
        data: {
          type: "deposit&withdraw",
        }
      });

    }
  };

  const handleUtrSubmit = () => {
    if (!selectedAmount || !utrNumber) {
      alert("Please enter valid amount and UTR number.");
      return;
    }

    const pack_id = packs[selectedAmount];
    if (!pack_id) {
      alert("Invalid amount selected, please choose from available packs.");
      return;
    }

    sendEvent("ADD_DEPOSIT_REQUEST", {
      trnx_amount: selectedAmount,
      utr_no: utrNumber,
      pack_id: pack_id,
      pay: 'UTR',
    });


    setUtrNumber("");
    setToastMessage({ mess: "Request sent. Please check your balance in few minutes!", type: "success" });
    // setActiveTab("History");
  };

  const paymentMethods: PaymentMethod[] = [
    { name: "QR 1", status: "active", range: "100-10000", icon: "QR1.png" },
    { name: "QR 2", status: "active", range: "100-5000", icon: "QR2.png" },
    { name: "QR 3", status: "active", range: "200-8000", icon: "QR3.png" },
    { name: "QR 4", status: "active", range: "500-10000", icon: "QR4.png" },
  ];

  const handleWithdrawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWithdrawData({ ...withdrawData, [name]: value });
    setWithdrawErrors({ ...withdrawErrors, [name]: "" });
  };

  const handleWithdrawSubmit = () => {
    const errors: { [key: string]: string } = {};
    if (!withdrawData.amount || isNaN(Number(withdrawData.amount)) || Number(withdrawData.amount) <= 0) {
      errors.amount = "Enter a valid amount.";
    }
    if (!withdrawData.password) {
      errors.password = "Password is required.";
    }

    if (Object.keys(errors).length > 0) {
      setWithdrawErrors(errors);
      return;
    }

    sendEvent("PLACE_WITHDRAW_REQUEST", {
      amount: withdrawData.amount,
      password: withdrawData.password,
    });

    setShowWithdrawModal(false);
    setWithdrawData({ amount: "", password: "" });
  };

  return (
    <React.Fragment>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
        <div className="max-w-md w-full max-h-full overflow-y-auto bg-white rounded-2xl p-6 shadow-lg relative">
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl">
            &times;
          </button>

          <h2 className="text-xl font-semibold mb-4 text-black">Wallet</h2>

          {/* Tabs */}
          <div className="wallet_tabs">
            <div className="tabs_box web light">
              <div className="tabs_main flex_css noLine">
                <div
                  className="select_bg"
                  style={{
                    width: `${100 / 3}%`,
                    left: `${["Deposit", "Withdraw", "History"].indexOf(activeTab) * (100 / 3)}%`,
                  }}
                ></div>
                {["Deposit", "Withdraw", "History"].map((tab) => (
                  <div
                    key={tab}
                    className={`tabs btn_com ${activeTab === tab ? "select" : "false"}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <div className="tab_text">{tab}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deposit Tab */}
          {activeTab === "Deposit" && (
            <>
              <div className="text-center mb-4">
                <p className="text-gray-400">Enter Amount</p>
                {/* <input
                  type="text"
                  value={`₹${selectedAmount || "0.00"}`}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    setSelectedAmount(Number(value));
                  }}
                  placeholder="₹0.00"
                  className="text-3xl font-bold text-gray-500 text-center w-full border-b-0 focus:outline-none"
                /> */}
                <p className="text-3xl font-bold text-gray-500 text-center w-full">
                  ₹{selectedAmount || "0.00"}
                </p>
              </div>

              <div className="flex flex-wrap justify-between gap-2 mb-4">
                {amounts.map((amount) => (
                  <button
                    key={amount}
                    className="bg-gray-100 px-4 py-2 rounded-lg flex-1 min-w-[80px] text-black"
                    onClick={() => setSelectedAmount(amount)}
                  >
                    ₹ {amount}
                  </button>
                ))}
              </div>

              <p className="font-semibold mb-2">Payment Methods</p>

              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const isDisabled = method.status !== "active";
                  return (
                    <label
                      key={method.name}
                      className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        } ${selectedMethod === method.name ? "border-blue-500" : "border-gray-200"}`}
                      onClick={() => {
                        !isDisabled && setSelectedMethod(method.name)
                        setQrOption(method.name.toLowerCase().replace(/\s+/g, ""));
                      }}
                    >
                      <p className="font-semibold text-gray-500 text-sm">{method.name}</p>
                      <p className=""> Instant Deposit </p>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedMethod === method.name}
                        readOnly
                        disabled={isDisabled}
                        className="accent-blue-500"
                      />
                    </label>
                  );
                })}
              </div>

              <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg font-semibold" onClick={() => setActiveTab("PaymentQRCode")}>
                Submit
              </button>
            </>
          )}

          {/* UPI QR + UTR Entry */}
          {activeTab === "PaymentQRCode" && (
            <div className="text-center mb-4">
              <p className="font-semibold text-xl text-black">Make payment of ₹{selectedAmount} and enter UTR number below</p>
              <p className="text-gray-400 mb-4">
                Marathi: कृपया खाली दिलेल्या QR वरती पेमेंट करून घ्यावे आणि पेमेंट झाल्यावरती खाली UTR no. टाकून सबमिट करावे.
              </p>

                {qrOption && (
                <img src={depositDetails?.manual_payment_config?.[qrOption] || ""} alt="QR Code" className="h-40 mx-auto mb-4" />
                )}

                <input
                type="text"
                name="UTR"
                value={utrNumber}
                placeholder="Enter UTR Number"
                onChange={(e) => setUtrNumber(e.target.value)}
                className={`w-full text-black p-2 border border-gray-300 rounded-lg focus:outline-none mb-4`}
                />

              <button className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold" onClick={handleUtrSubmit}>
                Submit UTR Number
              </button>
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === "Withdraw" && (
            <>
              <div className="inset-0 flex items-center justify-center z-50" style={{ background: "#000000b3" }}>
                <div className="bg-white w-full max-w-md relative">

                  {user && (
                    <p className="mt-1 text-xs sm:text-sm text-black">
                      Total Balance: ₹{user.chips}
                    </p>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-black">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={withdrawData.amount}
                      onChange={handleWithdrawChange}
                      className={`text-black w-full border ${withdrawErrors.amount ? "border-red-500" : "border-gray-300"
                        } px-4 py-2 rounded-lg focus:outline-none`}
                    />
                    {withdrawErrors.amount && <p className="text-red-500 text-sm mt-1">{withdrawErrors.amount}</p>}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1 text-black">Current Password</label>
                    <input
                      type="password"
                      name="password"
                      value={withdrawData.password}
                      onChange={handleWithdrawChange}
                      className={`text-black w-full border ${withdrawErrors.password ? "border-red-500" : "border-gray-300"
                        } px-4 py-2 rounded-lg focus:outline-none`}
                    />
                    {withdrawErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{withdrawErrors.password}</p>
                    )}
                  </div>

                  <div className="w-full">
                    <button
                      onClick={handleWithdrawSubmit}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* History Tab (Mocked) */}

          {activeTab === "History" && (
            <div className="overflow-x-auto text-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Code</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Type</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Amount</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-black divide-y divide-gray-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-4 py-2">{transaction.game_id || "N/A"}</td>
                      <td className="px-4 py-2">{new Date(transaction.cd).toLocaleString()}</td>
                      <td className="px-4 py-2">{transaction.trnx_type_txt}</td>
                      <td className={`px-4 py-2 text-right ${transaction.trnx_amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {transaction.trnx_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded ${transaction.trnx_amount > 0 ? "bg-green-500" : "bg-red-500"}`}>
                          {transaction.trnx_amount > 0 ? "Credit" : "Debit"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Additional mock rows can be added here */}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg relative">
            <h2 className="text-lg font-semibold text-black mb-4">Enter Password</h2>
            <input
              type="password"
              placeholder="Password"
              value={withdrawData.password}
              onChange={(e) => setWithdrawData({ ...withdrawData, password: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg mb-2 text-black"
            />
            {withdrawErrors.password && (
              <p className="text-sm text-red-500 mb-2">{withdrawErrors.password}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {toastMessage !== null && <Toast message={toastMessage?.mess} type={toastMessage?.type ?? "success"} style={{ opacity: "1 !important", zIndex: 111 }} />}
    </React.Fragment>
  );
}
