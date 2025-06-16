import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiHelper from "../../utils/ApiHelper";


const SaleDialog = ({ onClose, editData = null }) => {
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState("Shopee");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

 useEffect(() => {
    if (editData) {
      setAmount(editData.amount);
      setChannel(editData.channel || "Shopee");
      setNote(editData.note || "");
      setDate(new Date(editData.date).toISOString().slice(0, 10));
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      amount: parseFloat(amount),
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
        toast.success("✅ Sale recorded");
      }
      onClose();
    } catch (err) {
      toast.error("🚨 Failed to save sale");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Sale</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border w-full p-2"
          />
          <input
            type="number"
            placeholder="Amount (e.g. 75000)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border w-full p-2"
            required
          />
          <input
            type="text"
            placeholder="Channel (e.g. Shopee)"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="border w-full p-2"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border w-full p-2"
          />
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleDialog;
