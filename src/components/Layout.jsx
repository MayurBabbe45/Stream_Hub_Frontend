import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice"; // Adjust path if needed
import toast from "react-hot-toast";
import {
  FiHome,
  FiVideo,
  FiThumbsUp,
  FiFolder,
  FiSearch,
  FiMenu,
  FiUploadCloud,
  FiLogOut,
  FiClock // 🚨 ADDED THIS
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Layout = () => {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const confirmLogout = async () => {
    try {
      // await axiosInstance.post("/users/logout"); 
      
      dispatch(logout());
      setShowLogoutModal(false);
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] text-white overflow-hidden relative">
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

        {/* SEARCH FORM */}
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
              <Link
                to="/upload"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-full transition-colors"
              >
                <FiUploadCloud /> Upload
              </Link>

              <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 ml-2">
                <Link to={`/c/${userData.username}`}>
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
                </Link>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  title="Logout"
                  className="p-2 ml-2 bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-zinc-400 rounded-full transition-all"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
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
          {/* 🚨 ADDED HISTORY LINK HERE */}
          <SidebarItem icon={<FiClock />} label="History" to="/history" />
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

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-2">Log Out?</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Are you sure you want to log out of your account? You will need to sign back in to upload or like videos.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/20"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

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