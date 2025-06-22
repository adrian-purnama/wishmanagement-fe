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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (disabled) return;

        const validItems = items.filter((i) => i.name && i.price && i.quantity);
        if (!store || validItems.length === 0) {
            return toast.error("Fill all required fields");
        }

        const payload = {
            store,
            items: validItems.map((i) => ({
                ...i,
                price: parseFloat(i.price),
                quantity: parseInt(i.quantity),
            })),
            admin_fee: parseFloat(adminFee),
            shipping_fee: parseFloat(shippingFee),
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
                                    disabled={disabled}
                                    type="number"
                                    className={`w-24 p-2 rounded border ${
                                        disabled
                                            ? "bg-gray-100 text-gray-500"
                                            : "bg-white dark:bg-gray-700 dark:border-gray-600"
                                    }`}
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(idx, "price", e.target.value)}
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
                                    type="number"
                                    className={`w-full p-2 rounded border ${
                                        disabled
                                            ? "bg-gray-100 text-gray-500"
                                            : "bg-white dark:bg-gray-700 dark:border-gray-600"
                                    }`}
                                    value={adminFee}
                                    onChange={(e) => setAdminFee(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Shipping Fee</label>
                                <input
                                    disabled={disabled}
                                    type="number"
                                    className={`w-full p-2 rounded border ${
                                        disabled
                                            ? "bg-gray-100 text-gray-500"
                                            : "bg-white dark:bg-gray-700 dark:border-gray-600"
                                    }`}
                                    value={shippingFee}
                                    onChange={(e) => setShippingFee(e.target.value)}
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
        </>
    );
};

export default PurchaseDialog;
