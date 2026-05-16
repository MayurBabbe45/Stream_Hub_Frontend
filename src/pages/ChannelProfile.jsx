import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiUserPlus, FiCheck } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/VideoCard";
import SubscribeButton from "../components/SubscribeButton";

const ChannelProfile = () => {
  const { username } = useParams(); // Grab the username from the URL (/c/username)
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Grab the currently logged-in user to see if they are looking at their own profile
  const currentUser = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch the Channel Profile details
        const profileResponse = await axiosInstance.get(`/users/c/${username}`);
        const channelData = profileResponse.data.data;
        setChannel(channelData);

        // 2. Now use the channel's _id to fetch ONLY their videos
        const videosResponse = await axiosInstance.get(`/videos?userId=${channelData._id}`);
        setVideos(videosResponse.data.data.docs || videosResponse.data.data || []);
        
      } catch (err) {
        setError(err.response?.data?.message || "Channel not found");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username]); // Re-run if the URL username changes

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
    <div className="w-full flex flex-col">
      
      {/* --- 1. COVER IMAGE BANNER --- */}
      <div className="w-full h-48 md:h-64 lg:h-80 bg-zinc-800 relative">
        {channel.coverImage ? (
          <img 
            src={channel.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          // Fallback gradient if they didn't upload a cover image
          <div className="w-full h-full bg-gradient-to-r from-blue-900 via-purple-900 to-black"></div>
        )}
      </div>

      {/* --- 2. CHANNEL INFO SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-12 sm:-mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-zinc-800">
          
          {/* Avatar (Overlapping the banner) */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#0f0f0f] overflow-hidden bg-zinc-900">
            <img 
              src={channel.avatar || "https://via.placeholder.com/150"} 
              alt={channel.username} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Details & Subscribe Button */}
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

          
           {/* Subscribe Action Button */}
            {!isOwnProfile ? (
              <SubscribeButton 
                channelId={channel._id} 
                initialIsSubscribed={channel.isSubscribed} 
              />
            ) : (
              <button className="px-6 py-2.5 bg-blue-600/10 text-blue-500 font-bold rounded-full cursor-default border border-blue-600/20">
                Your Channel
              </button>
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
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default ChannelProfile;