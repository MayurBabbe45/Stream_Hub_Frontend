import { useState } from "react";
import { useSelector } from "react-redux";
import { FiThumbsUp } from "react-icons/fi";
import { FaThumbsUp } from "react-icons/fa"; // Solid icon for when it's liked
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const LikeButton = ({ targetId, initialLikesCount = 0, initialIsLiked = false, type = "video" }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  const authStatus = useSelector((state) => state.auth.status);

  const handleLikeToggle = async () => {
    // 1. Must be logged in
    if (!authStatus) {
      toast.error("You must be logged in to like this!");
      return;
    }

    if (loading) return;

    // 2. Optimistic UI Update: Instantly flip the state and adjust the number
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setLoading(true);

    try {
      // 3. Determine the correct backend route based on what we are liking
      const route = type === "video" 
        ? `/likes/toggle/v/${targetId}` 
        : `/likes/toggle/c/${targetId}`;

      await axiosInstance.post(route);
      
    } catch (error) {
      // 4. If the server fails, revert the optimistic update back to reality
      setIsLiked(isLiked);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
      toast.error("Failed to toggle like");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-medium border ${
        isLiked
          ? "bg-blue-600/10 text-blue-500 border-blue-600/20 hover:bg-blue-600/20"
          : "bg-zinc-800 text-white border-transparent hover:bg-zinc-700"
      }`}
    >
      {isLiked ? <FaThumbsUp /> : <FiThumbsUp />} 
      <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
};

export default LikeButton;