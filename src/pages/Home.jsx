import { useEffect, useState } from "react";
import { aggregatedData } from "../api/api";
import { toast, ToastContainer } from "react-toastify";
import { Users, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {  
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate()

  // Load cached stats on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("userName") || "Warrior";
    const storedEmail = localStorage.getItem("email") || "warrior@example.com";
    const storedPic = localStorage.getItem("profilePic");
    const cachedStats = localStorage.getItem("cachedStats");

    setUserName(storedUsername);
    setEmail(storedEmail);
    if (storedPic) setProfilePic(storedPic);

    // Load cached stats if available
    if (cachedStats) {
      try {
        setStats(JSON.parse(cachedStats));
        setLoading(false);
      } catch (error) {
        console.error("Failed to parse cached stats:", error);
        localStorage.removeItem("cachedStats");
      }
    }

    // Always fetch fresh data on initial load (but don't wait for it)
    fetchStats(false);
  }, []);

  const fetchStats = async (forceRefresh = false) => {
    if (!forceRefresh) {
      // Check if we have recent cached data (less than 5 minutes old)
      const lastUpdated = localStorage.getItem("statsLastUpdated");
      if (lastUpdated && Date.now() - parseInt(lastUpdated) < 5 * 60 * 1000) {
        return; // Use cached data, no need to fetch
      }
    }

    try {
      if (forceRefresh) setRefreshing(true);
      
      const res = await aggregatedData(); 
      if (res.success) {
        setStats(res.data);
        // Cache the data
        localStorage.setItem("cachedStats", JSON.stringify(res.data));
        localStorage.setItem("statsLastUpdated", Date.now().toString());
      } else {
        console.error("Failed to fetch stats:", res.message);
        toast.error(res.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Network error. Using cached data if available.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(true); // Force refresh
  };

  return (
    <div className="flex flex-col md:flex-row min-h-dvh overscroll-auto justify-center w-full pt-20 md:pt-24 items-center p-4 z-10 relative">
        {/* Player Card */}
        <div className="flex flex-col text-white backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md mb-6 md:mb-0 md:mr-6">
            <div className="flex-1 select-none">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold select-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Player Card
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors disabled:opacity-50"
                  title="Refresh stats"
                >
                  <RefreshCw 
                    size={18} 
                    className={`text-gray-300 ${refreshing ? 'animate-spin' : ''}`} 
                  />
                </button>
            </div>

            <div className="flex items-center mb-6">
                <div className="size-16 md:size-20 rounded-full select-none overflow-hidden border-2 border-purple-500 ">
                {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br from-purple-600 to-blue-500">
                    {userName.charAt(0).toUpperCase()}
                    </div>
                )}
                </div>
                <div className="space-y-2 select-none pl-4">
                <div>
                    <p className="block text-gray-400 text-sm font-medium">Username</p>
                    <p className="text-sm font-semibold">{userName}</p>
                </div>

                <div>
                    <p className="block text-gray-400 text-sm font-medium">Email</p>
                    <p className="text-sm font-semibold truncate max-w-[140px] md:max-w-[180px]">{email}</p>
                </div>
                </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Game Stats
            </h3>
            </div>
            
            <div className="flex-1 pb-4 max-h-48 p-2 overflow-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10 scrollbar-thumb-rounded-full">
            {loading ? (
                <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-100 border-t-purple-500"></div>
                </div>
            ) : stats ? (
                <div className="grid grid-cols-2 select-none gap-3 md:gap-4 text-center">
                <div className="p-3 md:p-4 bg-gray-700/80 rounded-lg border border-gray-600 transition-all hover:scale-105">
                    <p className="text-xl md:text-2xl font-bold text-white">{stats.totalMatches}</p>
                    <p className="text-xs md:text-sm text-gray-300">Matches</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-700/80 rounded-lg border border-gray-600 transition-all hover:scale-105">
                    <p className="text-xl md:text-2xl font-bold text-white">{stats.totalKills}</p>
                    <p className="text-xs md:text-sm text-gray-300">Kills</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-700/80 rounded-lg border border-gray-600 transition-all hover:scale-105">
                    <p className="text-xl md:text-2xl font-bold text-white">{stats.totalDeaths}</p>
                    <p className="text-xs md:text-sm text-gray-300">Deaths</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-700/80 rounded-lg border border-gray-600 transition-all hover:scale-105">
                    <p className="text-xl md:text-2xl font-bold text-white">{stats.totalScore}</p>
                    <p className="text-xs md:text-sm text-gray-300">Score</p>
                </div>
                <div className="p-3 md:p-4 bg-green-700/80 rounded-lg border border-green-500/30 transition-all hover:scale-105">
                    <p className="text-xl md:text-2xl font-bold text-white">{stats.winCount}</p>
                    <p className="text-xs md:text-sm text-gray-200">Wins</p>
                </div>
                <div className="p-3 md:p-4 bg-red-700/80 rounded-lg border border-red-500/30 transition-all hover:scale-105">
                    <p className="text-xl md:text-2xl font-bold text-white">{stats.loseCount}</p>
                    <p className="text-xs md:text-sm text-gray-200">Losses</p>
                </div>
                </div>
            ) : (
                <p className="text-gray-400 text-center py-6">No stats available</p>
            )}
            </div>
        </div>
        
        {/* Room Buttons */}
        <div className="flex flex-col justify-center h-auto md:h-full md:p-4 gap-2 md:gap-6 w-full max-w-md overflow-y-auto">
          <button onClick={() => navigate('/ratata/match/join')} className="group relative flex flex-col items-center justify-center p-4 md:p-6 text-white border-2 border-purple-500/50 rounded-md md:rounded-2xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-2 hidden md:block md:p-3 mb-2 md:mb-3 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-500 group-hover:to-blue-400 transition-all">
                <Users size={24} className="text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold md:mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 group-hover:from-purple-300 group-hover:to-blue-300 transition-all">
                Join Room
              </span>
              <p className="hidden md:block md:text-sm text-gray-300 text-center">Enter an existing room code to join other players</p>
            </div>
          </button>
          
          <button onClick={() => navigate('/ratata/match/create')} className="group relative flex flex-col items-center justify-center p-4 md:p-6 text-white border-2 border-green-500/50 rounded-md md:rounded-2xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-2 hidden md:block md:p-3 mb-2 md:mb-3 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 group-hover:from-green-500 group-hover:to-emerald-400 transition-all">
                <Plus size={24} className="text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold md:mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 group-hover:from-green-300 group-hover:to-emerald-300 transition-all">
                Create Room
              </span>
              <p className="hidden md:block md:text-sm text-gray-300 text-center">Start a new room and invite friends to play together</p>
            </div>
          </button>
        </div>
    </div>
  );
}

export default Home;