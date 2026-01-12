import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendEvent, getSocket } from "../signals/socketConnection";

export default function Profile() {
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [passwordServerMsg, setPasswordServerMsg] = useState<{
        type: "success" | "error" | "";
        message: string;
    }>({
        type: "",
        message: "",
    });

    const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
        setPasswordErrors({ ...passwordErrors, [name]: "" });
    };

    const validatePasswordForm = () => {
        const errors: { [key: string]: string } = {};

        if (!passwordData.old_password) {
            errors.old_password = "Old password is required";
        }

        if (!passwordData.new_password) {
            errors.new_password = "New password is required";
        } else if (passwordData.new_password.length < 6) {
            errors.new_password = "Password must be at least 6 characters";
        }

        if (!passwordData.confirm_password) {
            errors.confirm_password = "Confirm password is required";
        } else if (passwordData.new_password !== passwordData.confirm_password) {
            errors.confirm_password = "Passwords do not match";
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordSubmit = () => {
        console.log("STEP 1️⃣ Submit clicked");
        console.log("Password Form Data:", passwordData);

        if (!validatePasswordForm()) {
            console.log("❌ STEP 1 FAILED: Validation error", passwordErrors);
            return;
        }

        setPasswordServerMsg({ type: "", message: "" });

        const payload = {
            mobile_number: userData?.mobile_number,
            old_password: passwordData.old_password,
            new_password: passwordData.new_password,
            confrim_password: passwordData.confirm_password,
        };

        console.log("STEP 2️⃣ Sending PASSWORD_CHANGE event:", payload);

        sendEvent("PASSWORD_CHANGE", payload);
    };


    useEffect(() => {
        const socket = getSocket();
        console.log("STEP 3️⃣ Socket instance:", socket);

        if (!socket) {
            console.log("❌ STEP 3 FAILED: socket is null");
            return;
        }


        const handler = (response: any) => {
            console.log("STEP 4️⃣ RAW SOCKET RESPONSE:", response);

            if (!response?.en) {
                console.log("❌ STEP 4 FAILED: response.en missing");
                return;
            }

            if (response.en !== "PASSWORD_CHANGE") {
                console.log("ℹ️ Ignored event:", response.en);
                return;
            }

            console.log("STEP 5️⃣ PASSWORD_CHANGE response detected");

            if (response.err === false) {
                console.log("✅ STEP 6 SUCCESS RESPONSE", response);

                setPasswordServerMsg({
                    type: "success",
                    message:
                        response?.data?.msg ||
                        response?.msg ||
                        "Password changed successfully",
                });

                sendEvent("LOGOUT", {});
                // Clear all relevant localStorage items
                [
                    "user",
                    "authToken",
                    "min_max_config",
                    "total_wallet",
                    "wellcome_note",
                    "room_limit",
                ].forEach((key) => localStorage.removeItem(key));
                window.location.href = "/Login";
            } else {
                console.log("❌ STEP 6 ERROR RESPONSE", response);

                setPasswordServerMsg({
                    type: "error",
                    message: response?.msg || "Password change failed",
                });
            }
        };

        socket.on("res", handler);

        return () => {
            socket.off("res", handler);
        };
    }, []);

    useEffect(() => {
        console.log("STEP 7️⃣ passwordServerMsg updated:", passwordServerMsg);
    }, [passwordServerMsg]);




    interface UserData {
        full_name?: string;
        profile_url?: string;
        chips?: number;
        signup_bonus?: number;
        mobileNumber?: number;
    }

    const [userData, setUserData] = useState<UserData>({});
    const [formData, setFormData] = useState({
        upi_id: "",
        name: "",
        accno: "",
        ifsc: "",
        bank_name: "",
        branch_name: "",
        mobile_number: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [withdrawData, setWithdrawData] = useState({ amount: "", password: "" });
    const [withdrawErrors, setWithdrawErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const storedData = localStorage.getItem("user");
        if (storedData) {
            setUserData(JSON.parse(storedData as string));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        const isUPIFilled = formData.upi_id.trim() && /^\d{10}$/.test(formData.mobile_number);
        const isBankFilled = formData.name.trim() && formData.accno.trim() && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc) && formData.bank_name.trim() && formData.branch_name.trim() && /^\d{10}$/.test(formData.mobile_number);

        if (!isUPIFilled && !isBankFilled) {
            newErrors.upi_id = "Either UPI ID & Mobile Number or full bank details must be filled.";
            newErrors.name = "Either UPI ID & Mobile Number or full bank details must be filled.";
            setErrors(newErrors);
            return false;
        }

        // Only validate fields in the selected path
        if (isUPIFilled) {
            if (!formData.upi_id) newErrors.upi_id = "UPI ID is required.";
            if (!/^\d{10}$/.test(formData.mobile_number)) newErrors.mobile_number = "Valid 10-digit mobile number required.";
        }

        if (isBankFilled) {
            if (!formData.name) newErrors.name = "Beneficiary name is required.";
            if (!formData.accno) newErrors.accno = "Account number is required.";
            if (!formData.ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) newErrors.ifsc = "Invalid IFSC code.";
            if (!formData.bank_name) newErrors.bank_name = "Bank name is required.";
            if (!formData.branch_name) newErrors.branch_name = "Branch name is required.";
            if (!/^\d{10}$/.test(formData.mobile_number)) newErrors.mobile_number = "Valid 10-digit mobile number required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = () => {
        if (!validateForm()) return;

        const autoEmail = `${userData?.full_name?.replace(/\s+/g, "").toLowerCase()}@gmail.com`;

        const eventData = {
            upi_id: formData.upi_id,
            email_id: autoEmail,
            name: formData.name,
            ifsc: formData.ifsc,
            accno: formData.accno,
            ben_id: "",
            mobile_number: formData.mobile_number,
        };

        sendEvent("VERIFY_ACCOUNT_REQUEST", eventData);
        setShowForm(false);
    };

    useEffect(() => {
        const socket = getSocket();
        if (socket) {
            sendEvent("ACCOUNT_INFO", {});

            socket.on("res", (response: any) => {
                if (response?.en === "ACCOUNT_INFO") {
                    if (!response?.err) {
                        setFormData(prev => ({ ...prev, ...response.data }));
                    } else {
                        console.error("Failed to fetch account info:", response.err);
                    }
                }
            });

            // return () => {
            //     socket.off("res");
            // };
        }
    }, []);

    const handleCancel = () => {
        setShowForm(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

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

    const renderField = (label: string, name: keyof typeof formData) => {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                {showForm ? (
                    <>
                        <input
                            name={name}
                            placeholder={`Enter ${label}`}
                            value={formData[name]}
                            onChange={handleChange}
                            className={`w-full border ${errors[name] ? "border-red-500" : "border-gray-300"
                                } px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
                    </>
                ) : (
                    <div style={{ height: "42px" }} className="p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800">{formData[name]}</div>
                )}
            </div>
        );
    };

    return (
        <div className="h-screen overflow-y-auto bg-gradient-to-br from-blue-100 to-purple-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-200 min-h-full">
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        ← Back
                    </button>
                </div>

                <h1 className="text-4xl font-extrabold mb-6 text-gray-800 text-center">User Profile</h1>

                <div className="mb-8">
                    <div className="text-xl font-medium mb-2 text-gray-700 capitalize">
                        Name: <span className="text-blue-600">{userData?.full_name || ""}</span>
                    </div>
                    <div className="text-xl font-medium mb-2 text-gray-700">
                        Balance: <span className="text-blue-600">{userData?.chips || "-"}</span>
                    </div>
                    <div className="text-xl font-medium mb-2 text-gray-700">
                        Signup Bonus: <span className="text-blue-600">{userData?.signup_bonus || "-"}</span>
                    </div>
                    <div className="text-xl font-medium mb-2 text-gray-700">
                        Mobile Number: <span className="text-blue-600">{userData?.mobile_number || "-"}</span>
                    </div>
                </div>

                {!showForm && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition w-full sm:w-auto"
                        >
                            {formData.upi_id ? "Edit Bank Details" : "Add Bank Details"}
                        </button>

                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition w-full sm:w-auto"
                        >
                            Change Password
                        </button>


                        {/* <button
                            onClick={() => setShowWithdrawModal(true)}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition w-full sm:w-auto"
                        >
                            Withdraw Cash
                        </button> */}
                    </div>
                )}

                {(showForm || formData.upi_id) && (
                    <>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {renderField("UPI ID", "upi_id")}
                            {renderField("UPI Mobile Number", "mobile_number")}
                        </div>
                        <div className="m-3 grid  gap-12 text-center text-xs text-gray-700">*OR*
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {renderField("Beneficiary Name", "name")}
                            {renderField("Bank Account Number", "accno")}
                            {renderField("IFSC Code", "ifsc")}
                            {renderField("Bank Name", "bank_name")}
                            {renderField("Branch Name", "branch_name")}

                            {showForm && (
                                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4 mt-6">
                                    <button
                                        onClick={handleSave}
                                        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition w-full sm:w-auto"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition w-full sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
                {showPasswordForm && (
                    <div className="mt-10 p-6 bg-gray-50 border rounded-xl">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h2>


                        {passwordServerMsg.message && (
                            <div
                                className={`mb-4 p-3 rounded-lg text-sm font-medium ${passwordServerMsg.type === "success"
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-red-100 text-red-700 border border-red-300"
                                    }`}
                            >
                                {passwordServerMsg.message}
                            </div>
                        )}
                        {/* Old Password */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Old Password</label>
                            <input
                                type="password"
                                name="old_password"
                                value={passwordData.old_password}
                                onChange={handlePasswordChange}
                                className={`w-full border ${passwordErrors.old_password ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg`}
                            />
                            {passwordErrors.old_password && (
                                <p className="text-red-500 text-sm">{passwordErrors.old_password}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                className={`w-full border ${passwordErrors.new_password ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg`}
                            />
                            {passwordErrors.new_password && (
                                <p className="text-red-500 text-sm">{passwordErrors.new_password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                className={`w-full border ${passwordErrors.confirm_password ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg`}
                            />
                            {passwordErrors.confirm_password && (
                                <p className="text-red-500 text-sm">{passwordErrors.confirm_password}</p>
                            )}
                        </div>
                        {/* {console.log("STEP 8️⃣ Rendering password message:", passwordServerMsg)} */}



                        <div className="flex gap-4">
                            <button
                                onClick={handlePasswordSubmit}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                            >
                                Update Password
                            </button>
                            <button
                                onClick={() => setShowPasswordForm(false)}
                                className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Withdraw Cash Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "#000000b3" }}>
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl relative">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Withdraw Cash</h2>

                        {user && (
                            <p className="mt-1 text-xs text-center sm:text-sm">
                                Balance: ₹{user.chips}
                            </p>
                        )}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={withdrawData.amount}
                                onChange={handleWithdrawChange}
                                className={`w-full border ${withdrawErrors.amount ? "border-red-500" : "border-gray-300"
                                    } px-4 py-2 rounded-lg focus:outline-none`}
                            />
                            {withdrawErrors.amount && <p className="text-red-500 text-sm mt-1">{withdrawErrors.amount}</p>}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Current Password</label>
                            <input
                                type="password"
                                name="password"
                                value={withdrawData.password}
                                onChange={handleWithdrawChange}
                                className={`w-full border ${withdrawErrors.password ? "border-red-500" : "border-gray-300"
                                    } px-4 py-2 rounded-lg focus:outline-none`}
                            />
                            {withdrawErrors.password && (
                                <p className="text-red-500 text-sm mt-1">{withdrawErrors.password}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdrawSubmit}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
