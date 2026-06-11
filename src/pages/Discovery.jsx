import { useState } from "react";
import { Link } from "react-router-dom";
// 🚨 Added FiClock to the imports
import { FiSearch, FiBriefcase, FiLock, FiSend, FiCheckCircle, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const Discovery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestedIds, setRequestedIds] = useState(new Set()); // Track which businesses we've requested

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const res = await axiosInstance.get(`/users/businesses/search?query=${searchQuery}`);
      setBusinesses(res.data.data || []);
    } catch (error) {
      toast.error("Failed to search for businesses");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (businessId) => {
    try {
      await axiosInstance.post(`/memberships/request/${businessId}`);
      toast.success("Access request sent successfully!");
      
      // Update UI to show request was sent
      setRequestedIds((prev) => new Set(prev).add(businessId));
    } catch (err) {
      // If the backend throws our 400 error because a request already exists
      toast.error(err.response?.data?.message || "Failed to send request");
      if (err.response?.status === 400) {
         setRequestedIds((prev) => new Set(prev).add(businessId));
      }
    }
  };

  return (
    <div className="min-h-full w-full p-6 sm:p-10 flex flex-col items-center">
      
      {/* 1. Header & Onboarding Message */}
      <div className="max-w-2xl w-full text-center mt-10 mb-10">
        <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiBriefcase className="text-4xl text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Find Your Organization</h1>
        <p className="text-zinc-400 text-lg">
          You are not connected to any corporate catalogs yet. Search for your company's username below to request access to their secure media feed.
        </p>
      </div>

      {/* 2. The Search Bar */}
      <div className="max-w-2xl w-full mb-12">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-zinc-500 group-focus-within:text-blue-500 transition-colors text-xl" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by business name or @username..."
            className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 pl-12 pr-32 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg shadow-xl"
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* 3. Search Results */}
      <div className="max-w-3xl w-full">
        {hasSearched && !loading && businesses.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <p className="text-zinc-400">No organizations found matching "{searchQuery}".</p>
          </div>
        )}

        <div className="grid gap-4">
          <AnimatePresence>
            {businesses.map((business) => (
              <motion.div
                key={business._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <Link to={`/c/${business.username}`}>
                    <img 
                      src={business.avatar} 
                      alt={business.username} 
                      className="w-16 h-16 rounded-full object-cover border border-zinc-700 hover:border-blue-500 transition-colors cursor-pointer"
                    />
                  </Link>
                  <div>
                    <Link to={`/c/${business.username}`} className="text-lg font-bold text-white hover:text-blue-400 transition-colors block">
                      {business.fullName}
                    </Link>
                    <span className="text-zinc-500 text-sm">@{business.username}</span>
                  </div>
                </div>

                <div>
                  {business.membershipStatus === "APPROVED" ? (
                    <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-500 font-medium rounded-xl border border-green-500/20 cursor-not-allowed">
                      <FiCheckCircle /> Joined
                    </button>
                  ) : business.membershipStatus === "PENDING" || requestedIds.has(business._id) ? (
                    <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-zinc-400 font-medium rounded-xl border border-zinc-700 cursor-not-allowed">
                      <FiClock /> Request Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequestAccess(business._id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-blue-600 text-white font-medium rounded-xl border border-zinc-700 hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-600/20"
                    >
                      <FiSend /> Request Access
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default Discovery;