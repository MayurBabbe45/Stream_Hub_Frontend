import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const UpNext = ({ currentVideoId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedVideos = async () => {
      try {
        setLoading(true);
        // Hit your generic videos endpoint. 
        // (If your backend has pagination, you might need to append ?limit=15)
        const res = await axiosInstance.get("/videos"); 
        
        // Safely extract the array. Adjust depending on your backend pagination (e.g., res.data.data.docs)
        const allVideos = res.data.data.docs || res.data.data || [];

        // Filter out the video currently being watched so we don't recommend it, 
        // and grab the first 10 for the sidebar.
        const filteredVideos = allVideos
          .filter((v) => v._id !== currentVideoId)
          .slice(0, 10);
        
        setVideos(filteredVideos);
      } catch (error) {
        console.error("Failed to fetch up next videos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentVideoId) {
      fetchSuggestedVideos();
    }
  }, [currentVideoId]);

  // Helper function to format duration (e.g., 125 seconds -> "2:05")
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 w-full lg:w-[350px] xl:w-[400px] flex-shrink-0">
        <div className="h-6 w-24 bg-zinc-800 rounded mb-2 animate-pulse"></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-2 animate-pulse">
            <div className="w-40 aspect-video bg-zinc-800 rounded-lg flex-shrink-0"></div>
            <div className="flex flex-col gap-2 flex-1 py-1">
              <div className="h-4 w-full bg-zinc-800 rounded"></div>
              <div className="h-3 w-2/3 bg-zinc-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full lg:w-[350px] xl:w-[400px] flex-shrink-0">
      <h3 className="text-white font-bold text-lg mb-1">Up Next</h3>
      
      {videos.map((video) => (
        <Link 
          to={`/video/${video._id}`} 
          key={video._id} 
          className="group flex items-start gap-3 p-2 hover:bg-zinc-900 rounded-xl transition-colors border border-transparent hover:border-zinc-800"
        >
          {/* Thumbnail Container */}
          <div className="relative w-40 aspect-video bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          </div>

          {/* Video Details */}
          <div className="flex-1 min-w-0 py-0.5">
            <h4 className="text-white font-medium text-sm leading-snug mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
              {video.title}
            </h4>
            <p className="text-xs text-zinc-400 mb-0.5 hover:text-white transition-colors">
              {video.owner?.fullName || video.owner?.username || "Unknown Creator"}
            </p>
            <p className="text-xs text-zinc-500">
              {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UpNext;