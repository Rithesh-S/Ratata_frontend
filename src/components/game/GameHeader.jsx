import { Clock, Users, Heart, Trophy, Info, UserCheck, Crown } from "lucide-react";
import React, { useMemo } from 'react'; // Import React for React.memo

// ============================================================================
// 1. MEMOIZED PLAYER LIST (Moved from GameMatrix)
// ============================================================================
const PlayerList = React.memo(({ players, currentPlayerId, createdBy, roomStatus }) => {
    
    const colors = useMemo(() => [
        '#FF2E63', '#08D9D6', '#FCE38A', '#EAFF00', '#FF9A76', 
        '#A3DE83', '#FF6B9C', '#00F5FF', '#FFD93D', '#6BCF7F', 
        '#FF8E6E', '#9D65C9'
    ], []);

    // 2. Create a stable string of sorted player IDs to use as a memo dependency
    // This ensures the map only recalculates when a player joins or leaves,
    // not when their health or position changes.
    const sortedPlayerIds = useMemo(() => {
        if (!players || roomStatus === 'waiting' || Object.keys(players).length === 0) return "";
        return Object.keys(players).sort().join(',');
    }, [players, roomStatus]);

    // 3. Create the color map. This only re-runs when the sorted list of IDs changes.
    const playerColorMap = useMemo(() => {
        if (!sortedPlayerIds) return {};

        const map = {};
        const ids = sortedPlayerIds.split(',');
        
        ids.forEach((playerId, index) => {
            // This is the key: assign color by sorted index
            // This guarantees unique colors for the first 12 players
            map[playerId] = colors[index % colors.length];
        });
        return map;
    }, [sortedPlayerIds, colors]);
    // In waiting room, 'players' is an array.
    // In active game, 'players' is an object.
    const isWaiting = roomStatus === 'waiting';

    const playerArray = isWaiting 
        ? (players || []) // Use empty array as default for waiting
        : Object.entries(players || {}); // Use empty object as default for active

    return (
        <div className="space-y-2 max-h-60 p-1 overflow-y-auto">
            {playerArray.map((playerEntry, index) => {
                let id, player, isHost;

                if (isWaiting) {
                    player = playerEntry;
                    id = player.socketId; // We need socketId in the waiting room player object
                    isHost = createdBy === player.socketId;
                } else {
                    [id, player] = playerEntry;
                    isHost = createdBy === id; // In active game, 'id' is the socketId key
                }
                
                const isDead = player.status === 'dead';
                const isDisconnected = player.status === 'disconnected';
                const isInactive = isDead || isDisconnected;

                return (
                    <div 
                        key={id || index} 
                        className={`
                            flex items-center gap-3 p-2 rounded-lg transition-all 
                            ${id === currentPlayerId ? 'bg-slate-700/80 ring-1 ring-cyan-400/50' : 'bg-slate-700/40'}
                            ${isInactive ? 'opacity-50 grayscale' : ''} 
                        `}
                    >
                        <div 
                            className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white/50" 
                            style={{ backgroundColor: playerColorMap[id] || colors[index % colors.length] }}
                        />
                        
                        <span 
                            className={`
                                text-sm font-medium truncate flex-1
                                ${isInactive 
                                    ? 'text-slate-400 line-through'  // Style for inactive players
                                    : (id === currentPlayerId 
                                        ? 'text-cyan-300 font-semibold' // Style for the current player
                                        : 'text-white')                 // Style for other active players
                                }
                            `}
                        >
                            {player.userName || 'Player'} 
                            {/* The "(You)" span is now removed */}
                            {isHost && <Crown size={14} className="inline ml-1 text-yellow-400" title="Host" />}
                        </span>

                        {/* Show stats only if game is active */}
                        {!isWaiting && (
                            <div className="flex items-center gap-2 text-xs">
                                {isDead ? (
                                    <span className="text-slate-400">💀 Dead</span>
                                ) : isDisconnected ? (
                                    <span className="text-slate-400">Offline</span>
                                ) : (
                                    <span className="text-red-400">❤️ {player.health ?? 100}</span>
                                )}
                                <span className="text-yellow-400">⚔️ {player.kills || 0}</span>
                            </div>
                        )}

                        {/* Show waiting status */}
                        {isWaiting && (
                            <div className="flex items-center gap-2 text-xs">
                                {isHost && <span className="text-yellow-400 font-bold">Host</span>}
                                {player.status === 'waiting' && <span className="text-cyan-300">Ready</span>}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});


// ============================================================================
// 2. MAIN HEADER COMPONENT (Now a Sidebar)
// ============================================================================

const GameHeader = ({ players, currentPlayerId, timeLeft, roomStatus, createdBy }) => {
    const isWaiting = roomStatus === 'waiting';

    const playerCount = isWaiting 
        ? (players ? players.length : 0)
        : (players ? Object.keys(players).length : 0);
        
    const currentPlayer = players && currentPlayerId && !isWaiting ? players[currentPlayerId] : null;

    const formatTime = (milliseconds) => {
        if (!milliseconds) return '00:00';
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const getTimeColor = () => {
        if (!timeLeft) return 'text-green-400';
        if (timeLeft < 30000) return 'text-red-400 animate-pulse';
        if (timeLeft < 60000) return 'text-yellow-400';
        return 'text-green-400';
    }

    return (
        // Changed to flex-col and set a h-full
        <div className="w-full select-none flex flex-col justify-start items-center gap-4 p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl h-full">
            
            {/* Game Stats (Top) */}
            <div className="flex flex-wrap gap-3 justify-center w-full">
                {/* Timer */}
                <div className={`flex items-center flex-grow gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl font-semibold border border-blue-500/30 shadow-lg ${getTimeColor()}`}>
                    <Clock size={18} />
                    <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                </div>
                {/* Player Count */}
                <div className="flex items-center justify-center gap-2 bg-slate-800/80 px-6 py-2.5 rounded-xl font-semibold text-blue-300 border border-blue-500/30 shadow-lg">
                    <Users size={18} className="text-blue-400" />
                    <span className="text-white font-mono text-lg">{playerCount}</span>
                </div>
            </div>

            {/* Current Player Stats (Only if game is active) */}
            {!isWaiting && currentPlayer && (
                <div className="flex flex-wrap gap-3 justify-center w-full">
                    {/* Score */}
                    <div className="flex items-center flex-grow gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl font-semibold text-yellow-300 border border-yellow-500/30 shadow-lg">
                        <Trophy size={18} className="text-yellow-400" />
                        <span className="text-white font-mono">{currentPlayer?.score || 0}</span>
                    </div>
                    {/* Health */}
                    <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl font-semibold text-red-300 border border-red-500/30 shadow-lg">
                        <Heart size={18} className="text-red-400" />
                        <span className="text-white font-mono">{currentPlayer?.health ?? 100}</span>
                    </div>
                </div>
            )}

            {/* Waiting Room Info */}
            {isWaiting && (
                 <div className="w-full p-4 bg-slate-800/80 rounded-xl border border-cyan-500/30 text-center">
                    <Info size={18} className="text-cyan-400 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">Waiting Room</h3>
                    <p className="text-sm text-slate-300">Waiting for host to start...</p>
                 </div>
            )}

            {/* Divider */}
            <hr className="w-full border-t border-slate-700 my-2" />

            {/* Player List (Moved Here) */}
            <div className="w-full">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2 px-1">
                    <span className={`w-2 h-2 rounded-full ${isWaiting ? 'bg-cyan-400' : 'bg-green-400'} animate-pulse`}></span>
                    {isWaiting ? 'Players in Lobby' : 'Scoreboard'}
                </h3>
                <PlayerList 
                    players={players} 
                    currentPlayerId={currentPlayerId}
                    createdBy={createdBy}
                    roomStatus={roomStatus}
                />
            </div>
        </div>
    )
}

export default GameHeader;