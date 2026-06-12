import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiVideo, FiBarChart2, FiShield, FiCalendar, FiEye, FiLink } from "react-icons/fi"; // 🚨 Added FiLink
import { motion } from "framer-motion";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast"; // 🚨 Added toast

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCorporateCatalog = async () => {
      try {
        const response = await axiosInstance.get("/videos?limit=50");
        setVideos(response.data.data || []);
      } catch (error) {
        console.error("Failed to load corporate catalog", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCorporateCatalog();
  }, []);

  // 🚨 THE INVITE GENERATOR LOGIC
  const handleGenerateInvite = async () => {
    try {
      const response = await axiosInstance.post("/memberships/generate-invite");
      const { inviteLink } = response.data.data;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink);
      toast.success("48-Hour Invite Link copied to clipboard! 📋", { duration: 4000 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate invite link");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Corporate Media Manager</h1>
          <p className="text-zinc-400">Track analytics, manage visibility, and audit employee training compliance.</p>
        </div>
        
        {/* 🚨 THE GENERATOR BUTTON */}
        <button 
          onClick={handleGenerateInvite}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] whitespace-nowrap"
        >
          <FiLink /> Generate Invite Link
        </button>
      </div>

      {/* Video Inventory List */}
      <div className="flex flex-col gap-4">
        {videos.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <FiVideo className="text-4xl text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No training media uploaded yet.</p>
            <Link to="/upload" className="mt-4 inline-block text-sm text-blue-500 hover:underline">
              Upload your first video
            </Link>
          </div>
        ) : (
          videos.map((video) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl gap-4 hover:border-zinc-700 transition-colors"
            >
              {/* Left Side: Thumbnail & Title Info */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0 relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded font-mono text-zinc-300">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{video.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1">
                    <span className="flex items-center gap-1"><FiEye /> {video.views} views</span>
                    <span className="flex items-center gap-1"><FiCalendar /> {new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Compliance Action Portal */}
              <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-zinc-800/60 pt-3 sm:pt-0 justify-end">
                <Link
                  to={`/video/${video._id}`}
                  className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-xl border border-zinc-700 transition-colors"
                >
                  Preview
                </Link>
                <Link
                  to={`/compliance/${video._id}`}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-semibold rounded-xl border border-blue-500/20 hover:border-blue-500 transition-all shadow-md"
                >
                  <FiShield /> Audit Compliance
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageVideos;