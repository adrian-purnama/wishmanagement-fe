import { useEffect, useState } from "react";
import apiHelper from "../../utils/ApiHelper";

const ResyncProgressBar = () => {
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let interval = null;

    const pollStatus = async () => {
      try {
        const res = await apiHelper.getAuthorization("/item/resync-status");
        if (res.inProgress) {
          setIsSyncing(true);
          setProgress({ processed: res.processed, total: res.total });
        } else {
          setIsSyncing(false);
          setProgress({ processed: 0, total: 0 });
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to poll resync status", err);
        setIsSyncing(false);
        clearInterval(interval);
      }
    };

    pollStatus();
    interval = setInterval(pollStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isSyncing) return null;

  const percent = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  return (
    <div className="w-full py-3">
      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
        Resyncing in Progress - {progress.processed} / {progress.total} processed
      </div>
      <div className="w-full h-3 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300 min-w-[2px]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ResyncProgressBar;
