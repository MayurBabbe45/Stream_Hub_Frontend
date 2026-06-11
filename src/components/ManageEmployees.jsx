import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUserMinus, FiShield } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/memberships/approved");
        setEmployees(res.data.data || []);
      } catch (err) {
        toast.error("Could not load active employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleRevoke = async (membershipId) => {
    if (!window.confirm("Are you sure you want to revoke this employee's access to all corporate media?")) return;
    
    try {
      setProcessingId(membershipId);
      
      // Update state to REVOKED
      await axiosInstance.patch(`/memberships/status/${membershipId}`, { status: "REVOKED" });
      
      // Remove them from the active list visually
      setEmployees((prev) => prev.filter((req) => req._id !== membershipId));
      toast.success("Employee access permanently revoked.");
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke access");
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
      {employees.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-zinc-800 border-dashed flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
            <FiShield size={20} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300">No Active Employees</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            You currently do not have any employees approved to view your corporate catalog.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {employees.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={req.employee?.avatar}
                    alt={req.employee?.username}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                  />
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold text-base truncate">
                      {req.employee?.fullName}
                    </h4>
                    <p className="text-zinc-400 text-sm truncate">
                      @{req.employee?.username} • <span className="text-green-500">Active Access</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end w-full sm:w-auto border-t border-zinc-800/50 sm:border-t-0 pt-3 sm:pt-0">
                  <button
                    disabled={processingId === req._id}
                    onClick={() => handleRevoke(req._id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-red-900/30 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 font-medium text-sm rounded-lg transition-colors disabled:opacity-40"
                  >
                    {processingId === req._id ? "Revoking..." : <><FiUserMinus size={16} /> Revoke Access</>}
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

export default ManageEmployees;