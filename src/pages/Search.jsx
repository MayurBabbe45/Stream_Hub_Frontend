import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import axiosInstance from "../utils/axiosInstance";
import VideoCard from "../components/VideoCard";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q"); // Grabs the '?q=keyword' from the URL

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      
      try {
        setLoading(true);
        // Send the query to your backend
        const response = await axiosInstance.get(`/videos?query=${query}`);
        setVideos(response.data.data.docs || response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to search videos");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]); // Re-run this whenever the URL query changes!

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full mt-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-20 text-xl">{error}</div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FiSearch className="text-blue-500" /> 
        Results for "{query}"
      </h2>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
          <FiSearch className="text-5xl mb-4 opacity-50" />
          <p className="text-xl">No videos found matching your search.</p>
          <p className="text-sm mt-2">Try different keywords or check your spelling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;