import { useState, useEffect } from "react";
import { FiClock, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // 🚨 NEW IMPORTS

// Assuming you have this component from your Home/Search pages!
import VideoCard from "../components/VideoCard"; 

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal and loading states
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/users/history"); 
      setHistory(res.data.data || []);
    } catch (err) {
      setError("Failed to load watch history");
    } finally {
      setLoading(false);
    }
  };

  // 🚨 UPDATED: This now does the actual clearing after confirmation
  const confirmClearHistory = async () => {
    try {
      setIsClearing(true);
      await axiosInstance.delete("/users/history/clear"); 
      setHistory([]); // Instantly clear the UI
      setShowClearModal(false); // Close the modal
      toast.success("Watch history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <FiClock className="text-blue-500" /> Watch History
        </h1>
        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3">
              <div className="w-full aspect-video bg-zinc-800 rounded-xl"></div>
              <div className="h-5 bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-20 text-xl">{error}</div>;
  }

  return (
    <div className="relative p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FiClock className="text-blue-500" /> Watch History
        </h1>
        
        {history.length > 0 && (
          <button 
            onClick={() => setShowClearModal(true)} // 🚨 UPDATED: Now opens the modal
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:text-white hover:bg-red-600 rounded-full transition-all border border-red-500/30 hover:border-red-600"
          >
            <FiTrash2 /> Clear all history
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
          <FiClock className="text-5xl mb-4 opacity-50" />
          <p className="text-xl">Your watch history is empty.</p>
          <p className="text-sm mt-2">Videos you watch will show up here.</p>
          <Link to="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
            Explore Videos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {history.map((video) => (
            <VideoCard key={video._id} video={video} /> 
          ))}
        </div>
      )}

      {/* --- 🚨 NEW: CLEAR HISTORY CONFIRMATION MODAL 🚨 --- */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-2">Clear Watch History?</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Are you sure you want to clear your entire watch history? This action cannot be undone, and these videos will be removed from your recent views.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearModal(false)}
                  disabled={isClearing}
                  className="px-4 py-2 rounded-lg font-medium text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearHistory}
                  disabled={isClearing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {isClearing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Clearing...
                    </>
                  ) : (
                    "Yes, Clear It"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default History;