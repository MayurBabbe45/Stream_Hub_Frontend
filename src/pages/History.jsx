import { useState, useEffect } from "react";
import { FiClock, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Ensure this matches your backend user route!
        const response = await axiosInstance.get("/users/history");
        setHistory(response.data.data || []);
      } catch (err) {
        setError("Failed to load watch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FiClock className="text-blue-500" /> Watch History
        </h1>
        {history.length > 0 && (
          <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-medium">
            <FiTrash2 /> Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(8)].map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10 text-xl">{error}</div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
          <FiClock className="text-5xl mb-4 opacity-50" />
          <p className="text-xl">Your watch history is empty.</p>
          <p className="text-sm mt-2">Videos you watch will show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {history.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;