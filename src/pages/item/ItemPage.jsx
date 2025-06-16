import { useEffect, useState } from "react";
import apiHelper from "../../../utils/ApiHelper";
import Navbar from "../../components/Navbar";

function ItemPage() {
  const [items, setItems] = useState([]);


  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiHelper.getAuthorization("/item/all");
        console.log(res)
        if (res.condition) setItems(res.items);
      } catch (err) {
        console.error("Failed to load items:", err);
      }
    };

    fetchItems();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">📦 All Tracked Items</h2>
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 shadow rounded p-3 text-sm">
              <div className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</div>
              <div className="text-gray-600 dark:text-gray-400">
                Quantity Bought: <b>{item.total_quantity}</b>
                <br />
                Total Spent: <b>Rp.{item.total_spent.toLocaleString()}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ItemPage
