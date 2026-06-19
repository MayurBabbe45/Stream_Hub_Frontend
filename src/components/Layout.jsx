import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice"; 
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
  FiClock,
  FiBell,
  FiBarChart2,
  FiMessageSquare,
  FiX // 🚨 ADDED: Close icon for the mobile menu
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import axiosInstance from "../utils/axiosInstance"; 

const Layout = () => {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // 🚨 NEW: State for mobile sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const isBusiness = userData?.role === "BUSINESS";

  useEffect(() => {
    const fetchTotalUnread = async () => {
      if (!userData?._id) return;
      try {
        const response = await axiosInstance.get("/chat/unread");
        setTotalUnread(response.data.data.total);
      } catch (error) {
        // fail silently
      }
    };

    fetchTotalUnread();
    window.addEventListener("chatStateChanged", fetchTotalUnread);
    
    return () => {
      window.removeEventListener("chatStateChanged", fetchTotalUnread);
    };
  }, [userData]);

  useEffect(() => {
    if (!userData?._id) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8000", {
      query: { userId: userData._id },
    });

    socket.on("notification", (data) => {
      if (data.type === "success") {
        toast.success(data.message, { duration: 5000, icon: "🎉" });
      } else if (data.type === "error") {
        toast.error(data.message, { duration: 5000, icon: "🚨" });
      } else {
        toast(data.message, { duration: 5000, icon: "🔔" });
      }
    });

    socket.on("receiveMessage", () => {
      window.dispatchEvent(new Event("chatStateChanged"));
    });

    return () => {
      socket.disconnect();
    };
  }, [userData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false); // Close mobile menu if searching from it
    }
  };

  const confirmLogout = async () => {
    try {
      await axiosInstance.post("/users/logout");
      dispatch(logout());
      setShowLogoutModal(false);
      navigate("/welcome");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout");
    }
  };

  // 🚨 NEW: Reusable function to render links for both desktop and mobile
  const renderNavLinks = (onItemClick = () => {}) => (
    <>
      <SidebarItem icon={<FiHome />} label="Home" to="/" onClick={onItemClick} active={location.pathname === "/"} />
      
      {!isBusiness && (
        <SidebarItem icon={<FiSearch />} label="Find Organization" to="/discover" onClick={onItemClick} />
      )}

      <SidebarItem 
        icon={
          <div className="relative flex items-center justify-center">
            <FiMessageSquare />
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0f0f0f] shadow-sm">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>
        } 
        label="Messages" 
        to="/messages" 
        onClick={onItemClick}
      />

      <SidebarItem icon={<FiClock />} label="History" to="/history" onClick={onItemClick} />
      <SidebarItem icon={<FiThumbsUp />} label="Liked Videos" to="/liked" onClick={onItemClick} />
      <SidebarItem icon={<FiFolder />} label="Playlists" to="/playlists" onClick={onItemClick} />
      
      {isBusiness && (
        <>
          <div className="my-4 border-t border-zinc-800" />
          <SidebarItem icon={<FiBarChart2 />} label="Manage Content" to="/manage-content" onClick={onItemClick} />
          <SidebarItem icon={<FiVideo />} label="My Channel" to={`/c/${userData?.username || ""}`} onClick={onItemClick} />
        </>
      )}
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] text-white overflow-hidden relative">
      <nav className="h-16 w-full flex items-center justify-between px-4 border-b border-zinc-800 bg-[#0f0f0f] z-40">
        <div className="flex items-center gap-4 text-xl font-bold tracking-tighter">
          
          {/* 🚨 UPDATED: Hamburger button now toggles the state */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors md:hidden"
          >
            <FiMenu />
          </button>
          
          <Link to="/" className="flex items-center gap-1 text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-1">
              <FiVideo className="text-white" />
            </div>
            Stream<span className="text-blue-500">Hub</span>
          </Link>
        </div>

        {/* SEARCH FORM (Desktop) */}
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
              placeholder="Search corporate media..."
              className="w-full bg-transparent outline-none px-3 text-zinc-100 placeholder-zinc-500"
            />
          </form>
        </div>

        <div>
          {authStatus && userData ? (
            <div className="flex items-center gap-4">
              {isBusiness && (
                <Link
                  to="/upload"
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-full transition-colors"
                >
                  <FiUploadCloud /> Upload
                </Link>
              )}

              <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 ml-2">
                <Link 
                  to="/notifications" 
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all relative"
                >
                  <FiBell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>

                <Link to={isBusiness ? `/c/${userData.username}` : "/settings"}>
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 cursor-pointer">
                    <span className="hidden md:block font-medium text-sm text-zinc-300">
                      {userData.username}
                    </span>
                    <img src={userData.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-zinc-800 hover:border-blue-500 transition-colors" />
                  </motion.div>
                </Link>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2 ml-2 bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-zinc-400 rounded-full transition-all hidden sm:block"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
             // ... login links unchanged
             <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-blue-500 hover:bg-blue-500/10 rounded-full font-medium transition-colors hidden sm:block">Log In</Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-blue-500/20">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-[#0f0f0f] py-4 px-3 overflow-y-auto">
          {renderNavLinks()}
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          <Outlet />
        </main>
      </div>

      {/* 🚨 NEW: MOBILE SLIDING SIDEBAR */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Overlay Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            
            {/* Sliding Menu Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0f0f0f] border-r border-zinc-800 z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-white text-xl font-bold tracking-tighter">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-1">
                    <FiVideo className="text-white" />
                  </div>
                  Stream<span className="text-blue-500">Hub</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Mobile Search Bar */}
              <div className="p-4 border-b border-zinc-800 sm:hidden">
                <form onSubmit={handleSearch} className="w-full flex items-center bg-[#121212] border border-zinc-700 rounded-xl px-4 py-2 focus-within:border-blue-500 transition-all">
                  <FiSearch className="text-zinc-400 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search media..."
                    className="w-full bg-transparent outline-none text-zinc-100 placeholder-zinc-500"
                  />
                </form>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {renderNavLinks(() => setIsMobileMenuOpen(false))}
              </div>

              {/* Mobile Logout Button */}
              {authStatus && (
                <div className="p-4 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-medium transition-all"
                  >
                    <FiLogOut /> Log Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                Are you sure you want to log out of your account? You will need to sign back in to access corporate media.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 rounded-lg font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmLogout} className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/20">
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

// 🚨 UPDATED: Added onClick support to the SidebarItem component
const SidebarItem = ({ icon, label, to, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
  >
    <span className="text-xl flex-shrink-0">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Layout;