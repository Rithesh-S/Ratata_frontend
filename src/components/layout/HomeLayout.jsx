import { useEffect, useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import ProtectedRoute from "../../security/ProtectedRoutes";
import Home from "../../pages/Home";
import Profile from "../../pages/Profile";
import History from "../../pages/History";

const HomeLayout = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    const handlePopState = () => {
      if (!localStorage.getItem("token")) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const items = [
    { label: "Home", icon: "pi pi-home", command: () => navigate("/ratata/home") },
    { label: "Match History", icon: "pi pi-book", command: () => navigate("/ratata/history") },
    { label: "Profile", icon: "pi pi-user", command: () => navigate("/ratata/profile") },
  ];

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // 1. Create a reusable function to set the volume
    const updateVolume = () => {
        // --- THIS IS THE FIX ---
        // Your localStorage stores 0-100. Your default should also be 0-100.
        // Change the default from '0.5' to '50' (for 50%).
        const savedVolume = localStorage.getItem('volume') || '50'; 
        
        // This calculation is now correct for both stored values and the default:
        // '50' -> 50 / 100 = 0.5
        // '80' -> 80 / 100 = 0.8
        const volume = parseFloat(savedVolume) / 100; 

        // Ensure volume is in the valid 0.0 - 1.0 range
        audioEl.volume = Math.max(0, Math.min(1, volume));
        console.log(audioEl.volume)
    };

    // 2. Set the volume on initial load
    updateVolume();

    // 3. Define an async function to handle browser autoplay policies
    const playAudio = async () => {
        try {
            await audioEl.play();
            // Autoplay started successfully!
        } catch (error) {
            // Autoplay was blocked. This is common.
            console.warn("Audio autoplay was blocked by the browser. Waiting for user interaction to start." + error);

            const playOnFirstClick = async () => {
                try {
                    // Try to play again on the first user click
                    await audioEl.play();
                } catch (err) {
                    console.error("Audio still failed to play after click:", err);
                }
            };

            // Add a one-time listener for the first user interaction
            window.addEventListener('click', playOnFirstClick, { once: true });

            // Return a cleanup function for *this* listener
            return () => {
                window.removeEventListener('click', playOnFirstClick);
            };
        }
    };
    const listenerCleanupPromise = playAudio();


    // --- THIS FIXES "NOT CHANGING" ---
    
    // 4. Listen for volume changes from other tabs
    window.addEventListener('storage', updateVolume);

    // 5. Listen for volume changes from *this* tab
    // (You must dispatch this custom event from your settings/slider component)
    window.addEventListener('volumeChanged', updateVolume);


    // 6. Cleanup: Stop music and remove all listeners
    return () => {
        audioEl.pause();
        
        window.removeEventListener('storage', updateVolume);
        window.removeEventListener('volumeChanged', updateVolume);

        listenerCleanupPromise.then(cleanup => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        });
      };
  }, []);

  return (
    <Layout>
        <audio 
          ref={audioRef} 
          src="/electric_pow_wow_drums.mp3" 
          loop 
        />
        <div className="absolute z-50 bg-white lg:bg-transparent lg:top-10 lg:flex lg:justify-center w-full">
          <Menubar
            model={items}
            pt={{
              root: {
                className: `
                  !rounded-none !border-none
                  lg:!rounded-md lg:!border lg:!border-gray-300 lg:!shadow-sm
                `,
              },
            }}
          />
        </div>

        <div className="h-dvh absolute w-full flex">
          <Routes>
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History/></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/ratata" replace />} /> 
          </Routes>
        </div>
    </Layout>
  );
};

export default HomeLayout;
