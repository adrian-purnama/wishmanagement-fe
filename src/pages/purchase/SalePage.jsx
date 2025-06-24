import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SaleDialog from "../../components/SaleDialog";
import apiHelper from "../../../utils/ApiHelper";
import ConfirmDialog from "../../components/ConfirmDialog";
import Navbar from "../../components/Navbar";

const SalePage = () => {
    const [sales, setSales] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const limit = 10;

    const fetchSales = async (nextPage = 1) => {
        try {
            setLoadingMore(true);
            const res = await apiHelper.getAuthorization(
                `/sale/all?page=${nextPage}&limit=${limit}`
            );
            const newData = res.sales || [];

            if (nextPage === 1) {
                setSales(newData);
            } else {
                setSales((prev) => [...prev, ...newData]);
            }

            setHasMore(newData.length === limit);
            setPage(nextPage);
        } catch (err) {
            toast.error("Failed to fetch sales");
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.innerHeight + document.documentElement.scrollTop;
            const offsetHeight = document.documentElement.offsetHeight;

            if (scrollTop + 100 >= offsetHeight && hasMore && !loadingMore) {
                fetchSales(page + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, hasMore, loadingMore]);

    useEffect(() => {
        fetchSales();
    }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar />

            <div className="p-4 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">💰 Sales</h1>
                    <button
                        onClick={() => {
                            setEditTarget(null);
                            setShowDialog(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        + Add Sale
                    </button>
                </div>

                {showDialog && (
                    <SaleDialog
                        editData={editTarget}
                        onClose={(result) => {
                            setShowDialog(false);
                            setEditTarget(null);
                            fetchSales();
                            if (result && !editTarget) {
                                setTimeout(() => setShowDialog(true), 0);
                            }
                        }}
                    />
                )}

                <div className="space-y-4">
                    {sales.length === 0 && (
                        <p className="text-gray-400 dark:text-gray-500">No sales yet.</p>
                    )}

                    {sales.map((s) => (
                        <div key={s._id} className="bg-white dark:bg-gray-800 rounded shadow p-4">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span>{formatDate(s.date)}</span>
                                <span>
                                    Channel: <b>{s.channel}</b>
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                {s.note || "-"}
                            </div>
                            <div className="font-bold text-lg mb-2">
                                Rp. {s.amount.toLocaleString()}
                            </div>

                            <div className="flex justify-end gap-4 text-sm">
                                <button
                                    onClick={() => {
                                        setEditTarget(s);
                                        setShowDialog(true);
                                    }}
                                    className="text-blue-500"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(s)}
                                    className="text-red-500"
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {loadingMore && (
                    <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
                        Loading more sales...
                    </div>
                )}

                {confirmDelete && (
                    <ConfirmDialog
                        title="Delete Sale?"
                        description={`Rp. ${confirmDelete.amount.toLocaleString()} from ${
                            confirmDelete.channel
                        }`}
                        onCancel={() => setConfirmDelete(null)}
                        onConfirm={async () => {
                            try {
                                await apiHelper.deleteAuthorization(`/sale/${confirmDelete._id}`);
                                toast.success("Sale deleted");
                                fetchSales();
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

export default SalePage;
