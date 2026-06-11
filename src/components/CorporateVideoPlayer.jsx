import { useRef, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const CorporateVideoPlayer = ({ videoId, videoUrl, poster }) => {
  const videoRef = useRef(null);

  // The function that extracts exact watched segments
  const syncProgressToDatabase = async (isClosingTab = false) => {
    const video = videoRef.current;
    if (!video) return;

    // Convert the HTML5 TimeRanges object into a standard array
    const playedRanges = [];
    for (let i = 0; i < video.played.length; i++) {
      playedRanges.push({
        start: video.played.start(i),
        end: video.played.end(i)
      });
    }

    // Don't waste an API call if they haven't watched anything
    if (playedRanges.length === 0) return;

    const payload = { videoId, playedRanges };

    try {
      if (isClosingTab) {
        // navigator.sendBeacon is highly optimized for firing exact payloads 
        // as a tab is closing. It requires formatting as a Blob for JSON.
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        
        // Note: sendBeacon doesn't automatically attach your Axios interceptor headers,
        // so if you use Cookies for JWT auth, this works natively. If you use LocalStorage,
        // you would need to append the token to the URL query string here.
        navigator.sendBeacon('http://localhost:8000/api/v1/progress/sync', blob);
      } else {
        // Standard sync (on pause or manual trigger)
        await axiosInstance.post("/progress/sync", payload);
      }
    } catch (error) {
      console.error("Failed to sync progress silently", error);
    }
  };

  useEffect(() => {
    // Sync if they close the tab or switch to another app/tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        syncProgressToDatabase(true);
      }
    };

    // Fallback for older browsers closing the window
    const handleBeforeUnload = () => syncProgressToDatabase(true);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Optional: Auto-sync every 30 seconds as a backup
    const interval = setInterval(() => syncProgressToDatabase(false), 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(interval);
      syncProgressToDatabase(false); // Sync one last time when component unmounts
    };
  }, [videoId]); // Re-run if the videoId changes

  return (
    <div className="w-full relative group">
      <video 
        ref={videoRef}
        src={videoUrl}
        poster={poster} // 🚨 ADD THIS LINE
        controls
        autoPlay // 🚨 AND THIS ONE
        controlsList="nodownload"
        onPause={() => syncProgressToDatabase(false)}
        onEnded={() => syncProgressToDatabase(false)}
        className="w-full h-full object-contain bg-black"
      />
    </div>
  );
};

export default CorporateVideoPlayer;