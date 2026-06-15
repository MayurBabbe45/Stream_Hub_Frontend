import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiTrash2, FiEdit3, FiLock, FiClock, FiLayers, FiUsers, FiShield, FiLink } from "react-icons/fi"; 
import { motion, AnimatePresence } from "framer-motion"; 
import toast from "react-hot-toast"; 
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/VideoCard";
import SubscribeButton from "../components/SubscribeButton";
import AccessRequests from "../components/AccessRequests"; 
import ManageEmployees from "../components/ManageEmployees";

const ChannelProfile = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // B2B State Machine UI
  const [accessRequested, setAccessRequested] = useState(false);
  const [activeTab, setActiveTab] = useState("videos"); 

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

  const handleDeleteClick = (e, videoId) => {
    e.preventDefault();
    setVideoToDelete(videoId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/videos/${videoToDelete}`);
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

  const handleRequestAccess = async () => {
    try {
      await axiosInstance.post(`/memberships/request/${channel._id}`);
      toast.success("Access request sent to business administrators!");
      setAccessRequested(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const response = await axiosInstance.post("/memberships/generate-invite");
      const { inviteLink } = response.data.data;
      
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

  if (error || !channel) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-xl px-4 text-center">
        {error || "Channel does not exist"}
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === channel.username;
  const isEmployeeViewingBusiness = currentUser?.role === "EMPLOYEE" && channel.role === "BUSINESS";
  const isBusinessOwner = isOwnProfile && currentUser?.role === "BUSINESS";

  return (
    <div className="w-full flex flex-col relative pb-20">
      
      {/* --- 1. COVER IMAGE BANNER --- */}
      <div className="w-full h-32 sm:h-48 md:h-64 lg:h-80 bg-zinc-800 relative">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 via-purple-900 to-black"></div>
        )}
      </div>

      {/* --- 2. CHANNEL INFO SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 sm:-mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 pb-6 border-b border-zinc-800">
          
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 shrink-0 rounded-full border-4 border-[#0f0f0f] overflow-hidden bg-zinc-900">
            <img src={channel.avatar || "https://via.placeholder.com/150"} alt={channel.username} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 w-full flex flex-col lg:flex-row justify-between items-center lg:items-end gap-4 sm:gap-6 pt-2">
            <div className="text-center sm:text-left flex flex-col items-center sm:items-start w-full lg:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight break-all line-clamp-1">
                {channel.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-zinc-400 mt-1">
                <span className="font-medium text-zinc-300">@{channel.username}</span>
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-zinc-800 text-zinc-300">
                  {channel.role === "BUSINESS" ? "Business Account" : "Employee"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-3 w-full lg:w-auto">
              {!isOwnProfile ? (
                isEmployeeViewingBusiness ? (
                  <button
                    onClick={handleRequestAccess}
                    disabled={accessRequested}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-full transition-all border w-full sm:w-auto ${
                      accessRequested 
                        ? "bg-zinc-800 text-zinc-400 border-zinc-700 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    }`}
                  >
                    {accessRequested ? <><FiClock /> Request Pending</> : <><FiLock /> Request Access</>}
                  </button>
                ) : (
                  <div className="w-full sm:w-auto">
                    <SubscribeButton channelId={channel._id} initialIsSubscribed={channel.isSubscribed} />
                  </div>
                )
              ) : (
                <>
                  {/* 🚨 RESPONSIVE BUTTONS: w-full on mobile, auto on desktop */}
                  {isBusinessOwner && (
                    <button
                      onClick={handleGenerateInvite}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors border border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                    >
                      <FiLink /> <span className="whitespace-nowrap">Generate Invite Link</span>
                    </button>
                  )}
                  
                  <Link 
                    to="/settings"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-full transition-colors border border-zinc-700"
                  >
                    <FiEdit3 /> <span className="whitespace-nowrap">Edit Profile</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* --- 3. TAB CONTROLLER BAR --- */}
        {isBusinessOwner && (
          <div className="flex gap-4 sm:gap-6 mt-6 border-b border-zinc-800 text-sm font-semibold overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 pb-3 transition-colors relative ${
                activeTab === "videos" ? "text-blue-500" : "text-zinc-400 hover:text-white"
              }`}
            >
              <FiLayers /> Corporate Media
              {activeTab === "videos" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 pb-3 transition-colors relative ${
                activeTab === "requests" ? "text-blue-500" : "text-zinc-400 hover:text-white"
              }`}
            >
              <FiUsers /> Access Requests
              {activeTab === "requests" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("employees")}
              className={`flex items-center gap-2 pb-3 transition-colors relative ${
                activeTab === "employees" ? "text-blue-500" : "text-zinc-400 hover:text-white"
              }`}
            >
              <FiShield /> Manage Access
              {activeTab === "employees" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>
        )}

        {/* --- 4. CONDITIONAL TAB VIEW RENDERING --- */}
        <div className="mt-6">
          {activeTab === "requests" && isBusinessOwner ? (
            <AccessRequests />
          ) : activeTab === "employees" && isBusinessOwner ? (
            <ManageEmployees />
          ) : (
            <>
              {activeTab === "videos" && !isBusinessOwner && (
                <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Corporate Media</h2>
              )}
              
              {videos.length === 0 ? (
                <div className="text-center py-12 sm:py-16 px-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                  {isEmployeeViewingBusiness ? (
                     <div className="flex flex-col items-center gap-3">
                       <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                         <FiLock className="text-2xl sm:text-3xl text-zinc-500" />
                       </div>
                       <h3 className="text-lg sm:text-xl font-bold text-white">Catalog Locked</h3>
                       <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto">
                         You do not have approved access to view this business's private media. Request access above to unlock these resources.
                       </p>
                     </div>
                  ) : (
                     <p className="text-sm sm:text-base text-zinc-500">This channel hasn't uploaded any media yet.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {videos.map((video) => (
                    <div key={video._id} className="relative group">
                      <VideoCard video={video} showHoverStats={isOwnProfile} />
                      {isOwnProfile && (
                        <button
                          onClick={(e) => handleDeleteClick(e, video._id)}
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400 z-[60]"
                          title="Delete Video"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- 5. CONFIRMATION MODAL --- */}
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