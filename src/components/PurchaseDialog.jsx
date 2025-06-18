import { useEffect, useState } from "react";
import apiHelper from "../../utils/ApiHelper";
import toast from "react-hot-toast";

const PurchaseDialog = ({ onClose, parsedItems = [], editData = null }) => {
  const [store, setStore] = useState("Shopee");
  const [items, setItems] = useState([{ name: "", price: "", quantity: "" }]);
  const [adminFee, setAdminFee] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    if (editData) {
      setStore(editData.store);
      setItems(editData.items.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })));
      setAdminFee(editData.admin_fee);
      setShippingFee(editData.shipping_fee);
    } else if (parsedItems && parsedItems.items?.length > 0) {
      setStore(parsedItems.store || "Shopee");
      setItems(parsedItems.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })));
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

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const calculateTotal = () => {
    const itemTotal = items.reduce((sum, item) => {
      const price = parseFloat(item.price || 0);
      const qty = parseInt(item.quantity || 0);
      return sum + price * qty;
    }, 0);
    return itemTotal + parseFloat(adminFee || 0) + parseFloat(shippingFee || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = items.filter(i => i.name && i.price && i.quantity);
    if (!store || validItems.length === 0) {
      return toast.error("Fill all required fields");
    }

    const payload = {
      store,
      items: validItems.map(item => ({
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
      })),
      admin_fee: parseFloat(adminFee),
      shipping_fee: parseFloat(shippingFee),
    };

    try {
      if (editData) {
        await apiHelper.putAuthorization(`/purchase/${editData._id}`, payload);
        toast.success("✅ Purchase updated");
      } else {
        await apiHelper.postAuthorization("/purchase/manual", payload);
        toast.success("✅ Purchase recorded");
      }
      onClose();
    } catch (err) {
      toast.error("🚨 Failed to save purchase");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-100 p-6 rounded-lg w-full max-w-xl shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Add Purchase Manually</h2>

        <form onSubmit={handleSubmit}>
          <input
            className="border rounded p-2 w-full mb-4 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Store Name"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            required
          />

          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-3">
              <input
                className="border rounded p-2 flex-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Item Name"
                value={item.name}
                onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                required
              />
              <input
                className="border rounded p-2 w-24 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Price"
                type="number"
                value={item.price}
                onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                required
              />
              <input
                className="border rounded p-2 w-24 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Qty"
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                required
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-red-500"
                >
                  🗑
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="text-sm text-blue-500 mb-4"
          >
            + Add Item
          </button>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Admin / Tax Fee
              </label>
              <input
                className="border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                type="number"
                placeholder="e.g. 3000"
                value={adminFee}
                onChange={(e) => setAdminFee(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Shipping Fee
              </label>
              <input
                className="border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                type="number"
                placeholder="e.g. 8000"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
              />
            </div>
          </div>

          <p className="mb-4 font-bold">Total: Rp. {calculateTotal().toLocaleString()}</p>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-300 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseDialog;
