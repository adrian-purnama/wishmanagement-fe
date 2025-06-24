import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiHelper from "../../utils/ApiHelper";

const SaleDialog = ({ onClose, editData = null }) => {
    const [amount, setAmount] = useState("");
    const [channel, setChannel] = useState("Shopee");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [showConfirm, setShowConfirm] = useState(false);
    const [bypassWarning, setBypassWarning] = useState(false);

    const formatter = new Intl.NumberFormat("id-ID");

    useEffect(() => {
        if (editData) {
            setAmount(editData.amount.toString());
            setChannel(editData.channel || "Shopee");
            setNote(editData.note || "");
            setDate(new Date(editData.date).toISOString().slice(0, 10));
        }
    }, [editData]);

    useEffect(() => {
        const bypassUntil = localStorage.getItem("bypassWarningUntil");
        if (bypassUntil && new Date(bypassUntil) > new Date()) {
            setBypassWarning(true);
        }
    }, []);

    const handleFormattedAmountChange = (e) => {
        const raw = e.target.value.replace(/[^\d]/g, "");
        setAmount(raw);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rawAmount = parseInt(amount, 10);

        if ((rawAmount < 10000 || rawAmount > 900000) && !bypassWarning) {
            return setShowConfirm(true); // show warning modal
        }

        const payload = {
            amount: rawAmount,
            channel,
            note,
            date: new Date(date),
        };

        try {
            if (editData) {
                await apiHelper.putAuthorization(`/sale/${editData._id}`, payload);
                toast.success("✅ Sale updated");
            } else {
                await apiHelper.postAuthorization("/sale/manual", payload);
                onClose(true);
                toast.success("✅ Sale recorded");
            }
            onClose();
        } catch (err) {
            toast.error("🚨 Failed to save sale");
            console.error(err);
        }
    };

    const suppressWarningFor24Hours = () => {
        const until = new Date();
        until.setHours(until.getHours() + 24);
        localStorage.setItem("bypassWarningUntil", until.toISOString());
        setBypassWarning(true);
        setShowConfirm(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded-lg w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">{editData ? "Edit Sale" : "Add Sale"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border w-full p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded"
                    />
                    <input
                        type="text"
                        placeholder="Amount (e.g. 75,000)"
                        value={formatter.format(Number(amount || "0"))}
                        onChange={handleFormattedAmountChange}
                        className="border w-full p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Channel (e.g. Shopee)"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                        className="border w-full p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded"
                    />
                    <input
                        type="text"
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="border w-full p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded"
                    />
                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => onClose(false)} // <- Tell parent we cancelled
                            className="text-gray-600 dark:text-gray-300 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* ⚠️ Confirmation Modal */}
            {showConfirm && (
                <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm text-center">
                        <h3 className="text-lg font-semibold mb-4">⚠️ Are you sure?</h3>
                        <p className="mb-4">
                            The amount is outside the normal range (10,000 – 900,000). Proceed
                            anyway?
                        </p>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    handleSubmit(new Event("submit")); // manually retry
                                }}
                                className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                            >
                                Yes, continue
                            </button>
                            <button
                                onClick={suppressWarningFor24Hours}
                                className="text-sm text-gray-500 hover:underline"
                            >
                                Don’t show again for 24 hours
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="text-sm text-gray-400 hover:underline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaleDialog;
