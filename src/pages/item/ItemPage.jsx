import { useEffect, useState } from "react";
import apiHelper from "../../../utils/ApiHelper";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import ResyncProgressBar from "../../components/ResyncProgressBar";

function ItemPage() {
    const [items, setItems] = useState([]);
    const [resyncing, setResyncing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchItems = async (nextPage = 1) => {
        try {
            setLoadingMore(true);
            const res = await apiHelper.getAuthorization(`/item/all?page=${nextPage}&limit=50`);
            if (res.condition) {
                setItems((prev) => [...prev, ...res.items]);
                setHasMore(res.hasMore);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Failed to load items:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const pollResyncStatus = () => {
        const interval = setInterval(async () => {
            try {
                const res = await apiHelper.getAuthorization("/item/resync-status");
                if (res.inProgress) {
                    setResyncing(true);
                } else {
                    clearInterval(interval);
                    setResyncing(false);
                    setItems([]);
                    fetchItems(1);
                    toast.success("✅ Resync complete");
                }
            } catch (err) {
                clearInterval(interval);
                setResyncing(false);
                console.error("Polling error", err);
            }
        }, 1000);
    };

    const handleResync = async () => {
        try {
            setResyncing(true);
            const res = await apiHelper.postAuthorization("/item/resync-items");
            if (res.condition) {
                pollResyncStatus();
            } else {
                toast.error("Resync failed");
                setResyncing(false);
            }
            window.location.reload();
        } catch (err) {
            toast.error("Error during resync");
            console.error(err);
            setResyncing(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const res = await apiHelper.getAuthorization("/item/resync-status");
                if (res.inProgress) {
                    setResyncing(true);
                    pollResyncStatus();
                }
            } catch (err) {
                console.error("Init resync check failed", err);
            }
        };

        init();
        fetchItems(1);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const nearBottom =
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
            if (nearBottom && hasMore && !loadingMore && !resyncing) {
                fetchItems(page + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, hasMore, loadingMore, resyncing]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <Navbar />
            <div className="p-4 max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-2">📦 All Tracked Items</h2>

                <div className="bg-yellow-100 dark:bg-yellow-300/20 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-400 p-3 rounded mb-4 text-sm flex justify-between items-center">
                    <span>
                        ⚠️ Items are automatically created during purchase entry using name
                        matching. Some entries may not be accurate due to fuzzy logic.
                    </span>
                    <button
                        onClick={handleResync}
                        disabled={resyncing}
                        className={`ml-4 px-3 py-1 text-xs rounded ${
                            resyncing
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        🔁 Resync Items
                    </button>
                </div>

                <ResyncProgressBar />

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

                {loadingMore && (
                    <div className="text-center py-3 text-sm text-gray-500">
                        Loading more items...
                    </div>
                )}
            </div>
        </div>
    );
}

export default ItemPage;
