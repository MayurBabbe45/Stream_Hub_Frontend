import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiThumbsUp, FiShare2, FiPlusSquare } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import CommentSection from "../components/CommentSection";
import SubscribeButton from "../components/SubscribeButton";
import { useSelector } from "react-redux";
import LikeButton from "../components/LikeButton";
import SaveToPlaylistModal from "../components/SaveToPlaylistModal";
import UpNext from "../components/UpNext"; // 🚨 Imported the new component

const VideoDetail = () => {
  const { videoId } = useParams(); // Grab the ID from the URL
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const currentUser = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        // Hit your backend endpoint to get a single video by ID
        const response = await axiosInstance.get(`/videos/${videoId}`);
        setVideo(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-xl">
        {error || "Video not found"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col xl:flex-row gap-8">
      {/* --- LEFT SIDE: Main Video Player & Details --- */}
      <div className="flex-1">
        {/* Video Player */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
          <video
            controls
            autoPlay
            className="w-full h-full object-contain"
            poster={video.thumbnail}
            src={video.videoFile}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Title & Primary Metadata */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-6 mb-2">
          {video.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-zinc-400 pb-4 border-b border-zinc-800">
          <p>
            {video.views} views •{" "}
            {new Date(video.createdAt).toLocaleDateString()}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <LikeButton
              targetId={video._id}
              initialLikesCount={video.likesCount}
              initialIsLiked={video.isLiked}
              type="video"
            />
            <button
              onClick={() => setIsPlaylistModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors font-medium"
            >
              <FiPlusSquare /> Save
            </button>
          </div>
        </div>

        {/* Channel Info & Description */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Link
            to={`/c/${video.owner?.username}`}
            className="flex items-center gap-4 group"
          >
            <img
              src={video.owner?.avatar || "https://via.placeholder.com/150"}
              alt={video.owner?.username}
              className="w-12 h-12 rounded-full object-cover border border-zinc-700 group-hover:border-blue-500 transition-colors"
            />
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                {video.owner?.fullName || video.owner?.username}
              </h3>
              <p className="text-sm text-zinc-400">
                Subscriber count coming soon
              </p>
            </div>
          </Link>

          {/* Check if the logged-in user owns this video */}
          {currentUser?._id !== video.owner?._id ? (
            <SubscribeButton
              channelId={video.owner?._id}
              initialIsSubscribed={video.isSubscribed}
            />
          ) : (
            <button className="px-6 py-2.5 bg-zinc-800/50 text-zinc-400 font-bold rounded-full cursor-default border border-zinc-700/50">
              You
            </button>
          )}
        </div>

        {/* Description Box */}
        <div className="mt-6 p-4 bg-zinc-900 rounded-xl border border-zinc-800/50 text-zinc-300 text-sm md:text-base leading-relaxed">
          {video.description}
        </div>

        {/* Comments Section */}
        <div className="mt-10">
          <CommentSection videoId={videoId} />
        </div>
      </div>

      {/* --- RIGHT SIDE: Recommended Videos --- */}
      {/* 🚨 Replaced the placeholder with the actual component! */}
      <UpNext currentVideoId={videoId} />
      
      {/* Modals */}
      <SaveToPlaylistModal
        videoId={videoId}
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
    </div>
  );
};

export default VideoDetail;