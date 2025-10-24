import { Clock, Users, Heart, Trophy } from "lucide-react";

const GameHeader = ({ players, currentPlayerId, timeLeft }) => {
    const playerCount = players ? Object.keys(players).length : 0;
    const currentPlayer = players && currentPlayerId ? players[currentPlayerId] : null;

    const formatTime = (milliseconds) => {
        if (!milliseconds) return '00:00';
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Time warning colors
    const getTimeColor = () => {
        if (!timeLeft) return 'text-green-400';
        if (timeLeft < 30000) return 'text-red-400 animate-pulse';
        if (timeLeft < 60000) return 'text-yellow-400';
        return 'text-green-400';
    }

    return (
        <div className="w-full select-none max-w-6xl flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 p-4 lg:p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl">
            {/* Game Title */}
           <div className="flex items-center">
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#1e3a8a] via-[#581c87] to-[#991b1b] bg-clip-text text-transparent tracking-tight">
                    RATATA
                </h1>
            </div>
            
            {/* Game Stats */}
            <div className="flex flex-wrap gap-3 justify-center">
                {/* Player Count */}
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl font-semibold text-blue-300 border border-blue-500/30 shadow-lg">
                    <Users size={18} className="text-blue-400" />
                    <span className="text-white font-mono">{playerCount}</span>
                </div>

                {/* Health */}
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl font-semibold text-red-300 border border-red-500/30 shadow-lg">
                    <Heart size={18} className="text-red-400" />
                    <span className="text-white font-mono">{currentPlayer?.health || 0}</span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl font-semibold text-yellow-300 border border-yellow-500/30 shadow-lg">
                    <Trophy size={18} className="text-yellow-400" />
                    <span className="text-white font-mono">{currentPlayer?.score || 0}</span>
                </div>

                {/* Timer */}
                <div className={`flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl font-semibold border border-blue-500/30 shadow-lg ${getTimeColor()}`}>
                    <Clock size={18} />
                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
            </div>
        </div>
    )
}

export default GameHeader