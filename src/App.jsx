import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider, useDispatch } from "react-redux";
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

// We create an inner component so we can use `useDispatch` (which requires the Redux Provider to exist)
function AppContent() {
  const dispatch = useDispatch();
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/video/:videoId" element={<VideoDetail />} />
          <Route path="/upload" element={<UploadVideo />} />
          <Route path="/c/:username" element={<ChannelProfile />} />
          <Route path="/search" element={<Search />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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