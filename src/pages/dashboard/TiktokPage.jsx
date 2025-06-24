import { useEffect, useState } from "react";

const TikTokPage = () => {
  const [shopId, setShopId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopIdFromUrl = params.get("shop_id");
    if (shopIdFromUrl) {
      setShopId(shopIdFromUrl);
      // Optional: clear the query string
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnect = () => {
    window.location.href = "http://localhost:3003/tiktok/connect";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">🛒 TikTok Shop Integration</h1>

        {!shopId ? (
          <>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Connect your TikTok Shop to start managing orders and syncing products.
            </p>
            <button
              onClick={handleConnect}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Connect TikTok Shop
            </button>
          </>
        ) : (
          <>
            <p className="text-green-600 font-medium mb-2">
              ✅ TikTok Shop Connected
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Shop ID: <span className="font-mono">{shopId}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default TikTokPage;
