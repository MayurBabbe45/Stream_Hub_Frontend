import { Link } from "react-router-dom";
import { FiEye, FiThumbsUp } from "react-icons/fi"; // 🚨 Import icons for the hover overlay

// 🚨 Add showHoverStats to your props (default it to false so it doesn't show everywhere)
const VideoCard = ({ video, showHoverStats = false }) => {
  
  // Helper to format duration if you have one
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <Link to={`/video/${video._id}`} className="flex flex-col gap-3 group w-full cursor-pointer">
      
      {/* THUMBNAIL CONTAINER */}
      <div className="relative w-full aspect-video bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded z-10">
          {formatDuration(video.duration)}
        </span>

        {/* 🚨 THE NEW HOVER OVERLAY 🚨 */}
        {showHoverStats && (
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white backdrop-blur-sm z-20">
            <div className="flex flex-col items-center justify-center">
              <FiEye className="text-2xl mb-1 text-blue-400" />
              <span className="font-bold text-sm">{video.views || 0}</span>
              <span className="text-xs text-zinc-300">Views</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <FiThumbsUp className="text-2xl mb-1 text-purple-400" />
              {/* Note: Ensure your backend actually returns a likesCount field, otherwise this will show 0 */}
              <span className="font-bold text-sm">{video.likesCount || 0}</span>
              <span className="text-xs text-zinc-300">Likes</span>
            </div>
          </div>
        )}
      </div>

      {/* VIDEO DETAILS (Title, Avatar, etc.) */}
      <div className="flex gap-3 items-start pr-6">
        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
          <img src={video.owner?.avatar} alt={video.owner?.username} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-zinc-400 text-xs mt-1 hover:text-white transition-colors">
            {video.owner?.fullName || video.owner?.username}
          </p>
          <p className="text-zinc-500 text-xs mt-0.5">
            {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;