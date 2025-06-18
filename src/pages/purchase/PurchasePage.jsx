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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 10;

  const fetchPurchases = async (nextPage = 1) => {
    try {
      setLoadingMore(true);
      const res = await apiHelper.getAuthorization(
        `/purchase/all?page=${nextPage}&limit=${limit}`
      );
      const newData = res.purchases || [];

      if (nextPage === 1) {
        setPurchases(newData);
      } else {
        setPurchases((prev) => [...prev, ...newData]);
      }

      setHasMore(newData.length === limit);
      setPage(nextPage);
    } catch (err) {
      toast.error("Failed to fetch purchases");
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPurchases(1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.innerHeight + document.documentElement.scrollTop;
      const offsetHeight = document.documentElement.offsetHeight;

      if (scrollTop + 100 >= offsetHeight && hasMore && !loadingMore) {
        fetchPurchases(page + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loadingMore]);

  const pollProgress = (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await apiHelper.getAuthorization(`/purchase/matching-status/${id}`);
        setProgressMap((prev) => ({ ...prev, [id]: res }));
        if (res.done) clearInterval(interval);
      } catch (err) {
        clearInterval(interval);
        console.log(err);
      }
    }, 1000);
  };

  const handleUploadReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("receipt", file);

    setLoading(true);

    try {
      const res = await apiHelper.postFormAuthorization("/purchase/upload-receipt", formData);
      if (res.condition && res.data) {
        const { items, admin_fee, shipping_fee } = res.data;

        const formatted = {
          store: "",
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price_per_unit,
          })),
          admin_fee,
          shipping_fee,
        };

        setParsedItems(formatted);
        setShowDialog(true);
        toast.success("Receipt parsed successfully");
      } else {
        toast.error("Could not parse receipt");
      }
    } catch (err) {
      toast.error("Error uploading file");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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
              <div className="flex justify-between text-sm mb-2 text-gray-500 dark:text-gray-400">
                <span>{formatDate(p.date)}</span>
                <span>
                  Store: <b>{p.store}</b>
                </span>
              </div>

<ul className="mb-2 space-y-2 text-sm">
  {p.items.map((i, idx) => (
    <li
      key={idx}
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2"
    >
      <span className="font-medium max-w-[40rem]">{i.name}</span>
      
      <div className="flex justify-between sm:justify-end sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-full sm:w-auto mt-1 sm:mt-0">
        <span>{i.quantity} × Rp.{i.price.toLocaleString()}</span>
        <span className="font-semibold text-right text-black dark:text-white">
          Rp.{(i.total ?? i.price * i.quantity).toLocaleString()}
        </span>
      </div>
    </li>
  ))}
</ul>



              <div className="text-sm text-gray-600 dark:text-gray-300">
                Admin Fee: Rp.{p.admin_fee.toLocaleString()}, Shipping: Rp.
                {p.shipping_fee.toLocaleString()}
              </div>

              <div className="font-bold mt-1">
                Total: Rp.{p.total.toLocaleString()}
              </div>

              {progressMap[p._id] && !progressMap[p._id].done && (
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-1 dark:text-gray-400">
                    Matching items: {progressMap[p._id].processed} / {progressMap[p._id].total}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded overflow-hidden">
                    <div
                      className="bg-green-500 h-full"
                      style={{
                        width: `${
                          (progressMap[p._id].processed / progressMap[p._id].total) * 100
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
                <button
                  onClick={() => setConfirmDelete(p)}
                  className="text-red-500"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {loadingMore && (
          <div className="text-center py-4 text-gray-500 text-sm dark:text-gray-400">
            Loading more purchases...
          </div>
        )}

        {confirmDelete && (
          <ConfirmDialog
            title="Delete Purchase?"
            description={`From ${confirmDelete.store} worth Rp.${confirmDelete.total.toLocaleString()}`}
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

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded shadow-md text-center animate-fade-in-scale">
              <p className="text-lg font-semibold mb-2">Processing receipt…</p>
              <p className="text-sm text-gray-500 dark:text-gray-300 animate-glow">
                This might take a few seconds
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasePage;
