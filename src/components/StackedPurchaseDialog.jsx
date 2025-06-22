import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PurchaseDialog from "./PurchaseDialog";
import toast from "react-hot-toast";

const StackedPurchaseDialog = ({ items = [], onSubmitSuccess, onCancel }) => {
  const [index, setIndex] = useState(0);
  const [statusMap, setStatusMap] = useState(Array(items.length).fill("editing"));

  const status = statusMap[index];
  const isDisabled = status !== "editing";
  const canGoPrev = index > 0;
  const canGoNext = index < items.length - 1;

  const handleNext = (purchaseId) => {
    const updated = [...statusMap];
    updated[index] = "saved";
    setStatusMap(updated);

    if (index + 1 >= items.length) {
      onSubmitSuccess(updated.filter((s) => s === "saved").length);
    } else {
      setIndex(index + 1);
    }
  };

  const handleCancelStep = () => {
    const updated = [...statusMap];
    updated[index] = "canceled";
    setStatusMap(updated);
    toast("Receipt canceled.");
    if (index + 1 < items.length) {
      setIndex(index + 1);
    } else {
      onCancel();
    }
  };

  const handleCancelAll = () => {
    const updated = [...statusMap];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i] === "editing") updated[i] = "canceled";
    }
    setStatusMap(updated);
    toast("All remaining receipts canceled.");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl h-full max-h-[95vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 text-center text-sm font-semibold bg-gray-200 dark:bg-gray-700 rounded px-3 py-1">
                Receipt {index + 1} of {items.length}
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  status === "saved"
                    ? "bg-green-100 text-green-700"
                    : status === "canceled"
                    ? "bg-gray-200 text-gray-600 line-through"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {status === "saved"
                  ? "✅ Saved"
                  : status === "canceled"
                  ? "❌ Canceled"
                  : "⏳ Not Submitted"}
              </span>

              <button
                onClick={handleCancelAll}
                className="ml-2 text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded shadow"
              >
                ✕ Cancel All
              </button>
            </div>

            {/* Dialog Content */}
            <div className="flex-1">
              <PurchaseDialog
                parsedItems={items[index]}
                onClose={handleNext}
                editData={null}
                noOverlay
                disabled={isDisabled}
              />
            </div>

            {/* Navigation */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={() => canGoPrev && setIndex(index - 1)}
                  disabled={!canGoPrev}
                  className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded disabled:opacity-40"
                >
                  ◀ Prev
                </button>

                {!isDisabled && ( 
                  <button
                    disabled
                    className="text-sm bg-gray-300 text-gray-500 px-4 py-1 rounded cursor-not-allowed"
                  >
                    {status === "canceled" ? "Canceled" : "Saved"}
                  </button>
                )}

                <button
                  onClick={() => canGoNext && setIndex(index + 1)}
                  disabled={!canGoNext}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded disabled:opacity-40"
                >
                  Next ▶
                </button>
              </div>

              <div className="flex justify-center gap-1">
                {items.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      statusMap[i] === "saved"
                        ? "bg-green-500"
                        : statusMap[i] === "canceled"
                        ? "bg-gray-400"
                        : i === index
                        ? "bg-blue-500 scale-125"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StackedPurchaseDialog;
