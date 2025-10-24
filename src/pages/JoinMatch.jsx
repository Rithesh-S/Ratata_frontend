import Layout from "../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const JoinMatch = () => {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleJoinMatch = () => {
        if (!roomCode || roomCode.length !== 6) {
            toast.error("Please enter a valid 6-digit room code.");
            return;
        }

        setLoading(true);

        // Save room code in session storage
        sessionStorage.setItem("roomCode", roomCode);

        // Navigate to lobby
        navigate("/ratata/match/lobby", { replace: true });

        setLoading(false);
    };

    return (
        <Layout>
            <header className="p-6 flex items-center">
                <button
                    onClick={() => navigate("/ratata/home")}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
                >
                    <ArrowLeft size={24} />
                </button>
                <p className="text-white font-bold text-2xl pl-4 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Join Match
                </p>
            </header>
            
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
                <div className="glass-card p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                            <Users size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Join a Match</h2>
                        <p className="text-gray-300 mt-2">Enter the room code to join the game</p>
                    </div>

                    <div className="mb-6">
                        <label className="text-white mb-3 font-medium flex items-center gap-2">
                            Room Code
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            placeholder="Enter 6-digit code"
                            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={handleJoinMatch}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Joining Match...
                            </>
                        ) : (
                            <>
                                Join Match
                                <span className="absolute inset-0 bg-white/10 group-hover:bg-white/5 transition-colors"></span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                .glass-card {
                    backdrop-filter: blur(12px);
                    background: rgba(15, 23, 42, 0.7);
                }
            `}</style>
        </Layout>
    );
};

export default JoinMatch;
