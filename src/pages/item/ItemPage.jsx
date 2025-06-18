import { useEffect, useState } from "react";
import apiHelper from "../../../utils/ApiHelper";
import Navbar from "../../components/Navbar";

function ItemPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiHelper.getAuthorization("/item/all");
        if (res.condition) setItems(res.items);
      } catch (err) {
        console.error("Failed to load items:", err);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-2">📦 All Tracked Items</h2>

        {/* ⚠️ Auto Item Warning */}
        <div className="bg-yellow-100 dark:bg-yellow-300/20 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-400 p-3 rounded mb-4 text-sm">
          ⚠️ Items are automatically created during purchase entry using name matching.
          Some entries may not be accurate due to fuzzy logic.
        </div>

        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 shadow rounded p-3 text-sm"
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {item.name}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Quantity Bought: <b>{item.total_quantity}</b>
                <br />
                Total Spent: <b>Rp.{item.total_spent.toLocaleString("id-ID")}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ItemPage;
