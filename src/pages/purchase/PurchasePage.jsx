import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PurchaseDialog from "../../components/PurchaseDialog";
import apiHelper from "../../../utils/ApiHelper";
import ConfirmDialog from "../../components/ConfirmDialog";
import Navbar from "../../components/Navbar";

const PurchasePage = () => {
    const [purchases, setPurchases] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [parsedItems, setParsedItems] = useState([]);
    const [editTarget, setEditTarget] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [progressMap, setProgressMap] = useState({});

    const fetchPurchases = async () => {
        try {
            const res = await apiHelper.getAuthorization("/purchase/all");
            setPurchases(res.purchases || []);

            // Start polling for each purchase progress
            res.purchases?.forEach((p) => pollProgress(p._id));
        } catch (err) {
            toast.error("Failed to fetch purchases");
            console.error(err);
        }
    };
    const pollProgress = (id) => {
        const interval = setInterval(async () => {
            try {
                const res = await apiHelper.getAuthorization(`/purchase/matching-status/${id}`);
                setProgressMap((prev) => ({ ...prev, [id]: res }));

                if (res.done) clearInterval(interval);
            } catch (err) {
                clearInterval(interval);
            }
        }, 1000);
    };

    const handleUploadReceipt = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await apiHelper.postFormAuthorization("/purchase/upload-receipt", formData);
            if (res.condition) {
                setParsedItems(res.parsed); // for pre-fill
                toast.success("Receipt parsed successfully");
                setShowDialog(true);
            } else {
                toast.error("Could not parse receipt");
            }
        } catch (err) {
            toast.error("Error uploading file");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString();

    return (
        <div>
            <Navbar />

        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">📦 Purchases</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowDialog(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        + Add Purchase
                    </button>

                    <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded">
                        📄 Upload Receipt
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={handleUploadReceipt}
                        />
                    </label>
                </div>
            </div>

            {showDialog && (
                <PurchaseDialog
                    parsedItems={parsedItems}
                    editData={editTarget}
                    onClose={() => {
                        setShowDialog(false);
                        setParsedItems([]);
                        setEditTarget(null);
                        fetchPurchases();
                    }}
                />
            )}

            <div className="space-y-4">
                {purchases.length === 0 && <p className="text-gray-400">No purchases yet.</p>}

                {purchases.map((p) => (
                    <div key={p._id} className="bg-white dark:bg-gray-800 rounded shadow p-4">
                        <div className="flex justify-between text-sm mb-2 text-gray-500">
                            <span>{formatDate(p.date)}</span>
                            <span>
                                Store: <b>{p.store}</b>
                            </span>
                        </div>

                        <ul className="mb-2 text-sm">
                            {p.items.map((i, idx) => (
                                <li key={idx}>
                                    • {i.name} — {i.quantity} × Rp.{i.price.toLocaleString()} ={" "}
                                    <b>Rp.{(i.total ?? i.price * i.quantity).toLocaleString()}</b>
                                </li>
                            ))}
                        </ul>

                        <div className="text-sm text-gray-600">
                            Admin Fee: Rp.{p.admin_fee.toLocaleString()}, Shipping: Rp.
                            {p.shipping_fee.toLocaleString()}
                        </div>

                        <div className="font-bold mt-1">Total: Rp.{p.total.toLocaleString()}</div>

                        {/* ✅ Progress bar inside the card */}
                        {progressMap[p._id] && !progressMap[p._id].done && (
                            <div className="mt-4">
                                <div className="text-xs text-gray-500 mb-1">
                                    Matching items: {progressMap[p._id].processed} /{" "}
                                    {progressMap[p._id].total}
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full"
                                        style={{
                                            width: `${
                                                (progressMap[p._id].processed /
                                                    progressMap[p._id].total) *
                                                100
                                            }%`,
                                            transition: "width 0.3s",
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 text-sm mt-4">
                            <button
                                onClick={() => {
                                    setEditTarget(p);
                                    setShowDialog(true);
                                }}
                                className="text-blue-500"
                            >
                                ✏️ Edit
                            </button>
                            <button onClick={() => setConfirmDelete(p)} className="text-red-500">
                                🗑 Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {confirmDelete && (
                <ConfirmDialog
                    title="Delete Purchase?"
                    description={`From ${
                        confirmDelete.store
                    } worth Rp.${confirmDelete.total.toLocaleString()}`}
                    onCancel={() => setConfirmDelete(null)}
                    onConfirm={async () => {
                        try {
                            await apiHelper.deleteAuthorization(`/purchase/${confirmDelete._id}`);
                            toast.success("Purchase deleted");
                            fetchPurchases();
                        } catch (err) {
                            toast.error("Failed to delete");
                            console.error(err);
                        } finally {
                            setConfirmDelete(null);
                        }
                    }}
                />
            )}
        </div>
        </div>
    );
};

export default PurchasePage;
