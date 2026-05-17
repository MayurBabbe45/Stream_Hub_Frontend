import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiHome,
  FiVideo,
  FiThumbsUp,
  FiFolder,
  FiSearch,
  FiMenu,
  FiUploadCloud,
} from "react-icons/fi";
import { motion } from "framer-motion";

const Layout = () => {
  // Grab the user data directly from our Redux store!
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  // Search functionality hooks
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] text-white overflow-hidden">
      <nav className="h-16 w-full flex items-center justify-between px-4 border-b border-zinc-800 bg-[#0f0f0f] z-50">
        <div className="flex items-center gap-4 text-xl font-bold tracking-tighter">
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors md:hidden">
            <FiMenu />
          </button>
          <Link to="/" className="flex items-center gap-1 text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-1">
              <FiVideo className="text-white" />
            </div>
            Stream<span className="text-blue-500">Hub</span>
          </Link>
        </div>

        {/* --- UPDATED SEARCH FORM --- */}
        <div className="hidden sm:flex flex-1 max-w-xl items-center mx-4">
          <form 
            onSubmit={handleSearch}
            className="w-full flex items-center bg-[#121212] border border-zinc-700 rounded-full px-4 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
          >
            <button type="submit" className="text-zinc-400 hover:text-white transition-colors focus:outline-none">
              <FiSearch className="text-lg" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full bg-transparent outline-none px-3 text-zinc-100 placeholder-zinc-500"
            />
          </form>
        </div>

        <div>
          {authStatus && userData ? (
            <div className="flex items-center gap-4">
              {/* UPLOAD BUTTON */}
              <Link
                to="/upload"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-full transition-colors"
              >
                <FiUploadCloud /> Upload
              </Link>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <span className="hidden md:block font-medium text-sm text-zinc-300">
                  {userData.username}
                </span>
                <img
                  src={userData.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-zinc-800 hover:border-blue-500 transition-colors"
                />
              </motion.div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-500 hover:bg-blue-500/10 rounded-full font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-[#0f0f0f] py-4 px-3 overflow-y-auto">
          <SidebarItem icon={<FiHome />} label="Home" to="/" active />
          <SidebarItem icon={<FiThumbsUp />} label="Liked Videos" to="/liked" />
          <SidebarItem icon={<FiFolder />} label="Playlists" to="/playlists" />
          <div className="my-4 border-t border-zinc-800" />
          <SidebarItem
            icon={<FiVideo />}
            label="My Channel"
            to={`/c/${userData?.username || ""}`}
          />
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Reusable Sidebar Link Component with Hover Animations
const SidebarItem = ({ icon, label, to, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Layout;