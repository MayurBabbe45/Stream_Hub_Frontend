import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiCheckCircle, FiXCircle, FiBell } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import AccessRequests from "../components/AccessRequests"; // Reusing your existing component!

const Notifications = () => {
  const currentUser = useSelector((state) => state.auth.userData);
  const isBusiness = currentUser?.role === "BUSINESS";

  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // We only need to fetch data here if the user is an EMPLOYEE
  useEffect(() => {
    if (isBusiness) return; // The AccessRequests component handles its own fetching

    const fetchMyRequests = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/memberships/my-requests");
        setMyRequests(res.data.data || []);
      } catch (error) {
        toast.error("Failed to load your request history");
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, [isBusiness]);

  // Helper function for status badges
 const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-bold border border-green-500/20">
            <FiCheckCircle /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-bold border border-red-500/20">
            <FiXCircle /> Rejected
          </span>
        );
      // 🚨 THE NEW REVOKED BADGE
      case "REVOKED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-400 text-sm font-bold border border-zinc-500/20">
            <FiXCircle /> Access Revoked
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-bold border border-yellow-500/20">
            <FiClock /> Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 w-full min-h-screen">
      
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-800">
        <div className="p-3 bg-blue-600/10 rounded-xl">
          <FiBell className="text-2xl text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notification Center</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isBusiness ? "Manage incoming access requests" : "Track your corporate access requests"}
          </p>
        </div>
      </div>

      {isBusiness ? (
        /* 🚨 BUSINESS VIEW: Drop in the component we already built! */
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
          <AccessRequests />
        </div>
      ) : (
        /* 🚨 EMPLOYEE VIEW: Render their sent requests */
        <div>
          {loading ? (
             <div className="flex flex-col gap-4">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="h-20 w-full bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800"></div>
               ))}
             </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-zinc-800 border-dashed flex flex-col items-center gap-3">
              <FiClock className="text-4xl text-zinc-600 mb-2" />
              <h3 className="text-lg font-semibold text-zinc-300">No requests sent</h3>
              <p className="text-sm text-zinc-500">You haven't requested access to any organizations yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {myRequests.map((req) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors shadow-lg"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={req.business?.avatar}
                        alt={req.business?.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-zinc-700"
                      />
                      <div>
                        <h4 className="text-white font-bold text-lg">
                          {req.business?.fullName}
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Requested on {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end w-full sm:w-auto">
                      {getStatusBadge(req.status)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;