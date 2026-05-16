import { useState } from "react";
import { useSelector } from "react-redux";
import { FiUserPlus, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const SubscribeButton = ({ channelId, initialIsSubscribed, size = "md" }) => {
  // Local state to instantly toggle the button UI
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [loading, setLoading] = useState(false);

  // Check if the current user is logged in
  const authStatus = useSelector((state) => state.auth.status);

  const handleSubscribeToggle = async () => {
    // 1. Prevent unauthenticated users from subscribing
    if (!authStatus) {
      toast.error("You must be logged in to subscribe!");
      return;
    }

    // 2. Prevent spam clicks
    if (loading) return;

    // 3. Optimistic UI update (flip it instantly for the user)
    setIsSubscribed(!isSubscribed);
    setLoading(true);

    try {
      // Hit your backend toggle route
      // (Check your backend routes: usually it's POST /api/v1/subscriptions/c/:channelId)
      await axiosInstance.post(`/subscriptions/c/${channelId}`);
      
      if (!isSubscribed) {
        toast.success("Subscribed!");
      } else {
        toast.success("Unsubscribed");
      }
    } catch (error) {
      // If the backend fails, revert the button back to its original state
      setIsSubscribed(isSubscribed);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Determine button sizes based on where we place it
  const sizeClasses = size === "sm" 
    ? "px-4 py-2 text-sm" 
    : "px-6 py-2.5 text-base";

  return (
    <button
      onClick={handleSubscribeToggle}
      disabled={loading}
      className={`flex items-center gap-2 font-bold rounded-full transition-all ${sizeClasses} ${
        isSubscribed
          ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
          : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      {isSubscribed ? (
        <>
          <FiCheck /> Subscribed
        </>
      ) : (
        <>
          <FiUserPlus /> Subscribe
        </>
      )}
    </button>
  );
};

export default SubscribeButton;