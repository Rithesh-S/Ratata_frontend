import Layout from "../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Dropdown } from 'primereact/dropdown';
import { createMatch } from "../api/api";

const CreateMatch = () => {
    const navigate = useNavigate();
    const [spawnCount, setSpawnCount] = useState(2);
    const [loading, setLoading] = useState(false);
    const options = [2, 3, 4, 5, 6];

    const handleCreateMatch = async () => {
        setLoading(true);

        const res = await createMatch(spawnCount)

        if (!res.success) {
            toast.error(res.message || "Failed to create match!");
        } else {
            toast.success("Match created successfully!");
            navigate("/ratata/match/lobby",{ replace: true })
            sessionStorage.setItem("roomCode",res.data.roomCode)
        }
        setLoading(false);
    }

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
                    Create Match
                </p>
            </header>
            
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
                <div className="glass-card p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                            <Users size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Create New Match</h2>
                        <p className="text-gray-300 mt-2">Select the number of players and start the game</p>
                    </div>

                    <div className="mb-8">
                        <label className="text-white mb-3 font-medium flex items-center gap-2">
                            <Users size={18} /> Number of Players
                        </label>
                        <Dropdown 
                            value={spawnCount} 
                            onChange={(e) => setSpawnCount(e.value)} 
                            options={options}
                            placeholder="Select Players" 
                            className="w-full custom-dropdown" 
                            checkmark={true} 
                            highlightOnSelect={true}
                        />
                    </div>

                    <button
                        onClick={handleCreateMatch}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Creating Match...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
                                Create Match
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
                .custom-dropdown .p-dropdown {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.07);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .custom-dropdown .p-dropdown:hover {
                    border-color: rgba(255, 255, 255, 0.3);
                }
                .custom-dropdown .p-dropdown:not(.p-disabled).p-focus {
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
                    border-color: rgba(99, 102, 241, 0.5);
                }
                .custom-dropdown .p-dropdown-panel {
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                }
                .custom-dropdown .p-dropdown-item {
                    color: rgba(255, 255, 255, 0.8);
                    border-radius: 8px;
                    margin: 2px 4px;
                }
                .custom-dropdown .p-dropdown-item.p-highlight {
                    background: rgba(99, 102, 241, 0.2);
                    color: white;
                }
                .custom-dropdown .p-dropdown-label {
                    color: black;
                    padding: 0.75rem;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </Layout>
    );
};

export default CreateMatch;