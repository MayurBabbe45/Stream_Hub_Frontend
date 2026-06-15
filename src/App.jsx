import { useState, useEffect } from "react";
// 🚨 Added Navigate to the router imports
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// 🚨 Added useSelector to read auth status
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./store/store";
import { login, logout } from "./store/authSlice";
import axiosInstance from "./utils/axiosInstance";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import VideoDetail from "./pages/VideoDetail";
import UploadVideo from "./pages/UploadVideo";
import ChannelProfile from "./pages/ChannelProfile";
import Search from "./pages/Search";
import History from "./pages/History";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import LikedVideos from "./pages/LikedVideos";
import Settings from "./pages/Settings";
import Discovery from "./pages/Discovery";
import Notifications from "./pages/Notifications";
import Landing from "./pages/Landing"; // 🚨 Imported the new Landing page
import ComplianceDashboard from "./pages/ComplianceDashboard";
import ManageVideos from "./components/ManageVideos";
import Messages from "./pages/Messages";

// We create an inner component so we can use `useDispatch` and `useSelector`
function AppContent() {
  const dispatch = useDispatch();
  // 🚨 Grab the current auth status from Redux
  const authStatus = useSelector((state) => state.auth.status);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Every time the app loads/refreshes, check if we have a valid session
    axiosInstance.get("/users/current-user")
      .then((response) => {
        // If the backend says yes, put the user back into Redux!
        dispatch(login(response.data.data));
      })
      .catch((error) => {
        // If the backend says no (or cookie expired), ensure Redux is cleared
        dispatch(logout());
      })
      .finally(() => {
        // Once the check is done, stop the loading screen
        setLoading(false);
      });
  }, [dispatch]);

  // Show a sleek loading screen while we verify the user
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f0f0f]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      <Routes>
        
        {/* ==========================================
            PUBLIC ROUTES (Outside the Layout) 
        ========================================== */}
        <Route path="/welcome" element={!authStatus ? <Landing /> : <Navigate to="/" />} />
        <Route path="/login" element={!authStatus ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!authStatus ? <Register /> : <Navigate to="/" />} />

        {/* ==========================================
            SECURE ROUTES (Inside the Layout) 
        ========================================== */}
        {/* 🚨 This parent route kicks anyone not logged in directly to /welcome */}
        <Route path="/" element={authStatus ? <Layout /> : <Navigate to="/welcome" />}>
          <Route index element={<Home />} />
          <Route path="/video/:videoId" element={<VideoDetail />} />
          <Route path="/upload" element={<UploadVideo />} />
          <Route path="/c/:username" element={<ChannelProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/history" element={<History />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
          <Route path="/liked" element={<LikedVideos />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/discover" element={<Discovery />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/manage-content" element={<ManageVideos />} />
          <Route path="/compliance/:videoId" element={<ComplianceDashboard />} />
          <Route path="/messages" element={<Messages />} />
        </Route>

      </Routes>
    </>
  );
}

// The main App component just provides the Store and Router to the AppContent
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;