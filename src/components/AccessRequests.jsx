import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiClock, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const AccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Tracks individual button loading states

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/memberships/pending");
        setRequests(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch pending requests:", err);
        toast.error("Could not load pending access requests");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleAction = async (membershipId, status) => {
    try {
      setProcessingId(membershipId);
      
      // Hit the patch route to update the status machine state ("APPROVED" or "REJECTED")
      await axiosInstance.patch(`/memberships/status/${membershipId}`, { status });
      
      // Animate the row out of the list upon completion
      setRequests((prev) => prev.filter((req) => req._id !== membershipId));
      
      if (status === "APPROVED") {
        toast.success("Employee approved! Access granted to corporate feed.");
      } else {
        toast.success("Access request rejected.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 w-full bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-zinc-800 border-dashed flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
            <FiClock size={20} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300">All caught up!</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            There are currently no pending access requests from employees for this business catalog.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {requests.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
              >
                {/* Employee Profile Metadata */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={req.employee?.avatar || "https://via.placeholder.com/150"}
                    alt={req.employee?.username}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                  />
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold text-base truncate">
                      {req.employee?.fullName}
                    </h4>
                    <p className="text-zinc-400 text-sm truncate">
                      @{req.employee?.username} • <span className="text-zinc-500">{req.employee?.email}</span>
                    </p>
                  </div>
                </div>

                {/* State Machine Action Controls */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t border-zinc-800/50 sm:border-t-0 pt-3 sm:pt-0">
                  <button
                    disabled={processingId !== null}
                    onClick={() => handleAction(req._id, "REJECTED")}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-red-400 font-medium text-sm rounded-lg transition-colors disabled:opacity-40"
                  >
                    <FiX size={16} /> Reject
                  </button>
                  <button
                    disabled={processingId !== null}
                    onClick={() => handleAction(req._id, "APPROVED")}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-blue-600/10 disabled:opacity-40"
                  >
                    {processingId === req._id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FiCheck size={16} /> Approve
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AccessRequests;