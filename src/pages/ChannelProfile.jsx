import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // 🚨 Added Link here!
import { useSelector } from "react-redux";
import { FiUserPlus, FiCheck, FiTrash2, FiEdit3 } from "react-icons/fi"; // 🚨 Added FiEdit3
import { motion, AnimatePresence } from "framer-motion"; 
import toast from "react-hot-toast"; 
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/VideoCard";
import SubscribeButton from "../components/SubscribeButton";

const ChannelProfile = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the Delete Video Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        
        const profileResponse = await axiosInstance.get(`/users/c/${username}`);
        const channelData = profileResponse.data.data;
        setChannel(channelData);

        const videosResponse = await axiosInstance.get(`/videos?userId=${channelData._id}`);
        setVideos(videosResponse.data.data.docs || videosResponse.data.data || []);
        
      } catch (err) {
        setError(err.response?.data?.message || "Channel not found");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username]);

  // Function to handle opening the modal
  const handleDeleteClick = (e, videoId) => {
    e.preventDefault(); // Prevent accidental navigation
    setVideoToDelete(videoId);
    setDeleteModalOpen(true);
  };

  // Function to actually delete the video
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Hit the backend delete route
      await axiosInstance.delete(`/videos/${videoToDelete}`);
      
      // Optimistically remove the video from the UI
      setVideos((prev) => prev.filter((v) => v._id !== videoToDelete));
      
      toast.success("Video deleted successfully");
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete video");
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-xl">
        {error || "Channel does not exist"}
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === channel.username;

  return (
    <div className="w-full flex flex-col relative">
      
      {/* --- 1. COVER IMAGE BANNER --- */}
      <div className="w-full h-48 md:h-64 lg:h-80 bg-zinc-800 relative">
        {channel.coverImage ? (
          <img 
            src={channel.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 via-purple-900 to-black"></div>
        )}
      </div>

      {/* --- 2. CHANNEL INFO SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-12 sm:-mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-800">
          
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#0f0f0f] overflow-hidden bg-zinc-900">
            <img 
              src={channel.avatar || "https://via.placeholder.com/150"} 
              alt={channel.username} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 w-full pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {channel.fullName}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-400 mt-1">
                <span className="font-medium text-zinc-300">@{channel.username}</span>
                <span>•</span>
                <span>{channel.subscribersCount} subscribers</span>
                <span>•</span>
                <span>{channel.channelsSubscribedToCount} subscribed</span>
              </div>
            </div>

            {/* 🚨 Updated Button Logic Here */}
            {!isOwnProfile ? (
              <SubscribeButton 
                channelId={channel._id} 
                initialIsSubscribed={channel.isSubscribed} 
              />
            ) : (
              <Link 
                to="/settings"
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-full transition-colors border border-zinc-700"
              >
                <FiEdit3 /> Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* --- 3. CHANNEL VIDEOS GRID --- */}
        <div className="mt-8 mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Videos</h2>
          
          {videos.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/50 border-dashed">
              This channel hasn't uploaded any videos yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {videos.map((video) => (
                <div key={video._id} className="relative group">
                  
                  <VideoCard video={video} showHoverStats={isOwnProfile} />
                  
                  {isOwnProfile && (
                    <button
                      onClick={(e) => handleDeleteClick(e, video._id)}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400 z-[60]"
                      title="Delete Video"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>

      {/* --- 4. CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-2">Delete Video?</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Are you sure you want to permanently delete this video? This action cannot be undone, and it will be removed from all playlists and watch histories.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg font-medium text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete It"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ChannelProfile;