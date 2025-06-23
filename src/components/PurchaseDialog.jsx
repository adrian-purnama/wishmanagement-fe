import { useEffect, useState } from "react";
import apiHelper from "../../utils/ApiHelper";
import toast from "react-hot-toast";
import { XCircle, Trash2 } from "lucide-react";

const PurchaseDialog = ({
    onClose,
    parsedItems = [],
    editData = null,
    noOverlay = false,
    disabled = false,
}) => {
    const [store, setStore] = useState("Shopee");
    const [items, setItems] = useState([{ name: "", price: "", quantity: "" }]);
    const [adminFee, setAdminFee] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [bypassWarning, setBypassWarning] = useState(false);

    const formatNumber = (num) => Number(num || 0).toLocaleString("id-ID");
    const unformatNumber = (val) => (val || "").toString().replace(/[^\d]/g, "");

    useEffect(() => {
        const bypassUntil = localStorage.getItem("purchaseBypassUntil");
        if (bypassUntil && new Date(bypassUntil) > new Date()) {
            setBypassWarning(true);
        }
    }, []);

    useEffect(() => {
        if (editData) {
            setStore(editData.store);
            setItems(
                editData.items.map((i) => ({
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                }))
            );
            setAdminFee(editData.admin_fee);
            setShippingFee(editData.shipping_fee);
        } else if (parsedItems?.items?.length > 0) {
            setStore(parsedItems.store || "Shopee");
            setItems(
                parsedItems.items.map((i) => ({
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                }))
            );
            setAdminFee(parsedItems.admin_fee ?? 0);
            setShippingFee(parsedItems.shipping_fee ?? 0);
        }
    }, [parsedItems, editData]);

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const addItem = () => setItems([...items, { name: "", price: "", quantity: "" }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
    const calculateTotal = () =>
        items.reduce((sum, i) => sum + (+i.price || 0) * (+i.quantity || 0), 0) +
        (+adminFee || 0) +
        (+shippingFee || 0);

    const handleSubmit = async (e, override = false) => {
        e.preventDefault();
        if (disabled) return;

        const validItems = items.filter((i) => i.name && i.price && i.quantity);
        if (!store || validItems.length === 0) {
            return toast.error("Fill all required fields");
        }

        const rawItems = validItems.map((i) => ({
            ...i,
            price: parseFloat(unformatNumber(i.price)),
            quantity: parseInt(i.quantity),
        }));

        if (!override && !bypassWarning) {
            const outOfRange = rawItems.some((i) => {
                const total = i.price * i.quantity;
                return total < 10000 || total > 900000;
            });

            if (outOfRange) {
                setShowConfirm(true);
                return;
            }
        }

        const payload = {
            store,
            items: rawItems,
            admin_fee: parseFloat(unformatNumber(adminFee)) || 0,
            shipping_fee: parseFloat(unformatNumber(shippingFee))  || 0,
        };

        try {
            if (editData) {
                await apiHelper.putAuthorization(`/purchase/${editData._id}`, payload);
                toast.success("✅ Purchase updated");
            } else {
                const res = await apiHelper.postAuthorization("/purchase/manual", payload);
                toast.success("✅ Purchase recorded");
                onClose(res.purchase_id);
            }
            onClose();
        } catch (err) {
            toast.error("🚨 Failed to save purchase");
            console.error(err);
        }
    };

    const suppressWarningFor24Hours = () => {
        const until = new Date();
        until.setHours(until.getHours() + 24);
        localStorage.setItem("purchaseBypassUntil", until.toISOString());
        setBypassWarning(true);
        setShowConfirm(false);
    };

    return (
        <>
            {!noOverlay && <div className="fixed inset-0 bg-black/60 z-40" />}

            <div
                className={`${
                    noOverlay ? "" : "fixed inset-0"
                } z-50 flex items-center justify-center p-4`}
            >
                <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-fit max-h-[70vh] overflow-hidden">
                    <h2 className="text-2xl font-bold mb-4 shrink-0">Manual Purchase Entry</h2>

                    <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
                        <input
                            disabled={disabled}
                            className={`w-full p-2 rounded border ${
                                disabled
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                    : "bg-white dark:bg-gray-700 dark:border-gray-600"
                            }`}
                            placeholder="Store Name"
                            value={store}
                            onChange={(e) => setStore(e.target.value)}
                            required
                        />

                        {items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <input
                                    disabled={disabled}
                                    className={`flex-1 p-2 rounded border ${
                                        disabled
                                            ? "bg-gray-100 text-gray-500"
                                            : "bg-white dark:bg-gray-700 dark:border-gray-600"
                                    }`}
                                    placeholder="Item Name"
                                    value={item.name}
                                    onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    className={`w-24 p-2 rounded border ${
                                        disabled
                                            ? "bg-gray-100 text-gray-500"
                                            : "bg-white dark:bg-gray-700 dark:border-gray-600"
                                    }`}
                                    disabled={disabled}
                                    value={formatNumber(item.price)}
                                    onChange={(e) =>
                                        handleItemChange(
                                            idx,
                                            "price",
                                            unformatNumber(e.target.value)
                                        )
                                    }
                                    required
                                />

                                <input
                                    disabled={disabled}
                                    type="number"
                                    className={`w-20 p-2 rounded border ${
                                        disabled
                                            ? "bg-gray-100 text-gray-500"
                                            : "bg-white dark:bg-gray-700 dark:border-gray-600"
                                    }`}
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleItemChange(idx, "quantity", e.target.value)
                                    }
                                    required
                                />
                                {!disabled && items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {!disabled && (
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-blue-500 text-sm hover:underline"
                            >
                                + Add Another Item
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1">Admin / Tax Fee</label>
                                <input
                                    disabled={disabled}
                                    type="text"
                                    className={`w-full p-2 rounded border ${
                                        disabled
                                            ? "bg-gray-100 text-gray-500"
                                            : "bg-white dark:bg-gray-700 dark:border-gray-600"
                                    }`}
                                    value={formatNumber(adminFee)}
                                    onChange={(e) => setAdminFee(unformatNumber(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Shipping Fee</label>
                                <input
                                    disabled={disabled}
                                    type="text"
                                    className={`w-full p-2 rounded border ${
                                        disabled
                                            ? "bg-gray-100 text-gray-500"
                                            : "bg-white dark:bg-gray-700 dark:border-gray-600"
                                    }`}
                                    value={formatNumber(shippingFee)}
                                    onChange={(e) => setShippingFee(unformatNumber(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="text-right font-semibold text-lg">
                            Total: Rp {calculateTotal().toLocaleString()}
                        </div>

                        <div className="flex justify-between mt-6">
                            {!disabled && (
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                >
                                    Save
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className={`flex items-center gap-1 ${
                                    disabled
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-gray-600 hover:underline"
                                }`}
                            >
                                <XCircle size={18} /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showConfirm && (
                <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm text-center">
                        <h3 className="text-lg font-semibold mb-4">⚠️ Are you sure?</h3>
                        <p className="mb-4">
                            Some item totals are outside the normal range (10,000 – 900,000).
                            Proceed anyway?
                        </p>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={(e) => handleSubmit(e, true)}
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
        </>
    );
};

export default PurchaseDialog;
