import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // 🚨 Added Link for routing
import { useSelector } from "react-redux"; // 🚨 Added Redux to check roles
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
import { FiAlertCircle, FiSearch, FiUploadCloud } from "react-icons/fi"; // 🚨 Added UI icons

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚨 Grab the current user to conditionally render the empty states
  const currentUser = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/videos");
        setVideos(response.data.data.docs || response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load corporate feed");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch videos if the user is actually logged in
    if (currentUser) {
      fetchVideos();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(8)].map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-zinc-400 gap-4">
        <FiAlertCircle className="text-5xl text-red-500/50" />
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  // 🚨 THE SMART B2B EMPTY STATES
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        {currentUser?.role === "EMPLOYEE" ? (
          // EMPLOYEE EMPTY STATE -> Redirect to Discovery
          <div className="max-w-md w-full flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6">
              <FiSearch className="text-4xl text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your Feed is Empty</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              You currently do not have approved access to any corporate media. If you haven't joined your organization yet, find them in the directory to request access.
            </p>
            <Link
              to="/discover"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <FiSearch /> Discover Organizations
            </Link>
          </div>
        ) : (
          // BUSINESS EMPTY STATE -> Redirect to Upload
          <div className="max-w-md w-full flex flex-col items-center">
            <div className="w-20 h-20 bg-purple-600/10 border border-purple-500/20 rounded-full flex items-center justify-center mb-6">
              <FiUploadCloud className="text-4xl text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Media Uploaded</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Your secure corporate catalog is currently empty. Upload media to start training and sharing with your approved employees.
            </p>
            <Link
              to="/upload"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              <FiUploadCloud /> Upload Media
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Home;