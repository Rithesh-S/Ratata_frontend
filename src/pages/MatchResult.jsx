import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Skull, Home } from 'lucide-react';
import Layout from '../components/layout/Layout';

const MatchResults = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the player data passed from the previous page
    const players = location.state?.players;

    // If a user lands on this page directly, redirect them home
    useEffect(() => {
        if (!players) {
            navigate('/ratata/home', { replace: true });
        }
    }, [players, navigate]);

    // Sort players by score in descending order for the leaderboard
    const sortedPlayers = players ? [...players].sort((a, b) => b.score - a.score) : [];

    const handleExit = () => {
        navigate('/ratata/home', { replace: true });
    };

    if (!players) {
        // Render nothing or a loader while redirecting
        return null; 
    }

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
                <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8">
                    <div className="text-center mb-8">
                        <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Match Over</h1>
                        <p className="text-slate-400 mt-2">Final Leaderboard</p>
                    </div>

                    <div className="space-y-3">
                        {sortedPlayers.map((player, index) => (
                            <div 
                            key={index} 
                            className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                                index === 0 ? 'bg-yellow-400/20 border-2 border-yellow-400 scale-105' : 'bg-slate-700/50 border border-transparent'
                            }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-2xl font-bold w-8 text-center ${index === 0 ? 'text-yellow-300' : 'text-slate-400'}`}>
                                        {index + 1}
                                    </span>
                                    <span className="text-lg font-semibold">{player.userName}</span>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <span className="flex items-center gap-2 text-yellow-400">
                                        <Trophy className="w-4 h-4" /> {player.score} PTS
                                    </span>
                                    <span className="flex items-center gap-2 text-red-400">
                                        <Skull className="w-4 h-4" /> {player.kills} Kills
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center flex justify-center mt-10">
                        <button
                            onClick={handleExit}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition-transform duration-200 hover:scale-105"
                            >
                            <Home className="w-5 h-5" />
                            Exit to Home
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MatchResults;