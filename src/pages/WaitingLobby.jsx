/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import Layout from "../components/layout/Layout";
import { Users, Clock, Copy, CheckCircle, XCircle, Play, UserPlus, Share } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hook/UseSocket';
import { toast } from 'react-toastify';
import { useGameProvider } from '../context/UseGameProvider';

const WaitingLobby = () => {
    const [roomCode, setRoomCode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserSocketId, setCurrentUserSocketId] = useState(null);

    const { 
        players,
        roomStatus,
        timeLeft,
        spawnCount,
        isConnected,
        createdBy,
        emitEvent
    } = useGameProvider();

    const userName = localStorage.getItem("userName");
    const navigate = useNavigate();

    const exitMatch = (isReally, toastMsg = "You've left the Match") => {
        toast.error(toastMsg)
        if(isReally) emitEvent("removePlayer", { roomId: roomCode });
        sessionStorage.removeItem("roomCode")
        navigate("/ratata/home", { replace: true })
    } 

    useEffect(() => {
        const roomCode = sessionStorage.getItem("roomCode");
        // Get current user's socket ID from sessionStorage
        const socketId = sessionStorage.getItem("socketId");
        setCurrentUserSocketId(socketId);
        
        if (!roomCode) exitMatch(false)
        setRoomCode(roomCode);

        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        if (!roomCode || !userName) exitMatch(false)
        
        if(isConnected) emitEvent("joinRoom", { userName, roomId: roomCode });
        else exitMatch(false)

        return () => clearTimeout(loadingTimer);
    }, []);

    useSocket("roomResponse", (data) => {
        if (data.type === 'success') {
            toast.success(data.message);
            if(data.message === "The room is started") {
                navigate("/ratata/match")
            }
        } else {
            toast.error(data.message);
            navigate("/ratata/home",{ replace: true })
        }
    });
    
    useSocket("matchDeleted",(data) => {
        exitMatch(false,data.message)
    })
    
    const formatTime = (milliseconds) => {
        if (!milliseconds) return '00:00';
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        toast.info('Room code copied to clipboard!');
    };

    const shareRoomCode = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join my game',
                text: `Join my game using room code: ${roomCode}`,
            }).catch(error => console.log('Error sharing:', error));
        } else {
            copyRoomCode();
        }
    };

    const startGame = () => {
        emitEvent("startMatch", { roomId: roomCode });
    };

    // Check if current user is the room creator
    const isRoomCreator = createdBy && currentUserSocketId && createdBy === currentUserSocketId;

    const SkeletonRow = () => (
        <tr className="border-b border-white/5 last:border-0">
            <td className="py-4 pl-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700/30 animate-pulse"></div>
                    <div>
                        <div className="h-4 w-32 bg-gray-700/30 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-gray-700/30 rounded mt-2 animate-pulse"></div>
                    </div>
                </div>
            </td>
            <td className="py-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-700/30 animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-700/30 rounded animate-pulse"></div>
                </div>
            </td>
            <td className="py-4 pr-5 text-right">
                <div className="w-5 h-5 bg-gray-700/30 rounded-full ml-auto animate-pulse"></div>
            </td>
        </tr>
    );

    return (
        <Layout>
            <div className="flex flex-col h-screen">
                <header className="p-6 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center">
                        <p className="text-white font-bold text-2xl bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Waiting Lobby
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="flex items-center gap-2 bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-700/30">
                                <div className="w-4 h-4 bg-gray-700/30 rounded-full animate-pulse"></div>
                                <div className="h-4 w-10 bg-gray-700/30 rounded animate-pulse"></div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-700/30">
                                <Clock size={18} className="text-blue-400" />
                                <span className="text-white">{formatTime(timeLeft)}</span>
                            </div>
                        )}
                        
                        {isLoading ? (
                            <div className="flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-700/30">
                                <div className="h-4 w-16 bg-gray-700/30 rounded animate-pulse"></div>
                                <div className="w-4 h-4 bg-gray-700/30 rounded animate-pulse"></div>
                            </div>
                        ) : (
                            <div 
                                className="flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-700/30 cursor-pointer hover:bg-purple-900/40 transition-colors"
                                onClick={copyRoomCode}
                            >
                                <span className="text-white font-mono">{roomCode}</span>
                                <Copy size={16} className="text-purple-400" />
                            </div>
                        )}
                    </div>
                </header>
                
                <div className="flex flex-col flex-grow p-6 pt-0 overflow-hidden">
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl flex flex-col h-full">
                        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-5 border-b border-white/10 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    {isLoading ? (
                                        <>
                                            <div className="h-6 w-48 bg-gray-700/30 rounded animate-pulse mb-2"></div>
                                            <div className="h-4 w-64 bg-gray-700/30 rounded animate-pulse"></div>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Users size={24} className="text-blue-400" />
                                                Players Joined ({players.length}/{spawnCount})
                                                {roomStatus && (
                                                    <span className="text-sm font-normal bg-blue-900/50 px-2 py-1 rounded-md ml-2">
                                                        {roomStatus}
                                                    </span>
                                                )}
                                            </h2>
                                            <p className="text-gray-300 text-sm mt-1">
                                                {players.length === spawnCount 
                                                    ? 'All players joined! Ready to start.' 
                                                    : 'Waiting for players to join the match...'
                                                }
                                                {isRoomCreator && " You are the room creator."}
                                            </p>
                                        </>
                                    )}
                                </div>
                                {!isLoading && (
                                    <button 
                                        onClick={shareRoomCode}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                                    >
                                        <Share size={16} />
                                        Invite
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Player Table - Scrollable Area */}
                        <div className="flex-grow overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-900 z-10">
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 text-gray-400 font-medium text-sm pl-5">Player</th>
                                        <th className="text-left py-3 text-gray-400 font-medium text-sm">Status</th>
                                        <th className="text-right py-3 text-gray-400 font-medium text-sm pr-5">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <SkeletonRow key={index} />
                                        ))
                                    ) : (
                                        Array.from({ length: spawnCount }).map((_, index) => {
                                            const player = players[index];
                                            const isJoined = !!player;
                                            const isConnected = player?.status === "alive";
                                            const isCreator = player?.socketId === createdBy;
                                            
                                            return (
                                                <tr key={index} className="border-b border-white/5 last:border-0">
                                                    <td className="py-4 pl-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                isJoined 
                                                                    ? (isConnected ? 'bg-blue-500/20' : 'bg-gray-700/30 opacity-60') 
                                                                    : 'bg-gray-700/30'
                                                            }`}>
                                                                {isJoined ? (
                                                                    <span className={`font-semibold ${
                                                                        isConnected ? 'text-blue-400' : 'text-gray-500'
                                                                    }`}>
                                                                        {player.userName.charAt(0).toUpperCase()}
                                                                    </span>
                                                                ) : (
                                                                    <UserPlus size={16} className="text-gray-500" />
                                                                )}
                                                            </div>
                                                            <div className={!isConnected ? 'opacity-60' : ''}>
                                                                <p className={`font-medium ${
                                                                    isJoined 
                                                                        ? (isConnected ? 'text-white' : 'text-gray-400')
                                                                        : 'text-white'
                                                                }`}>
                                                                    {isJoined ? player.userName : `Waiting for player...`}
                                                                    {isCreator && (
                                                                        <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                                                            Creator
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className={`text-xs ${
                                                                    isJoined 
                                                                        ? (isConnected ? 'text-green-400' : 'text-gray-500')
                                                                        : 'text-gray-500'
                                                                }`}>
                                                                    {isJoined 
                                                                        ? (isConnected ? 'Connected' : 'Disconnected') 
                                                                        : 'Not joined yet'
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                isJoined 
                                                                    ? (isConnected ? 'bg-green-500' : 'bg-gray-500')
                                                                    : 'bg-gray-500'
                                                            }`}></div>
                                                            <span className={
                                                                isJoined 
                                                                    ? (isConnected ? 'text-green-400' : 'text-gray-500')
                                                                    : 'text-gray-500'
                                                            }>
                                                                {isJoined 
                                                                    ? (isConnected ? 'Ready' : 'Disconnected')
                                                                    : 'Waiting'
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-5 text-right">
                                                        {isJoined ? (
                                                            isConnected ? (
                                                                <CheckCircle size={20} className="text-green-500 ml-auto" />
                                                            ) : (
                                                                <XCircle size={20} className="text-gray-500 ml-auto opacity-60" />
                                                            )
                                                        ) : (
                                                            <XCircle size={20} className="text-gray-500 ml-auto" />
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 pb-5 pt-4 border-t border-white/5 flex-shrink-0">
                            {isLoading ? (
                                <div className="w-full bg-gray-700/30 rounded-full h-2.5 animate-pulse"></div>
                            ) : (
                                <>
                                    <div className="w-full bg-gray-700/30 rounded-full h-2.5">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${spawnCount > 0 ? (players.length / spawnCount) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                                        <span>{players.length} of {spawnCount} players</span>
                                        <span>{spawnCount > 0 ? Math.round((players.length / spawnCount) * 100) : 0}%</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-6 flex-shrink-0">
                        {isLoading ? (
                            <>
                                <div className="px-6 py-3 rounded-lg bg-gray-700/30 animate-pulse w-32"></div>
                                <div className="px-6 py-3 rounded-lg bg-gray-700/30 animate-pulse w-40"></div>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => exitMatch(true)}
                                    className="px-6 py-3 rounded-lg font-medium text-white bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/30 transition-all"
                                >
                                    Exit Match
                                </button>
                                
                                <button 
                                    onClick={startGame}
                                    disabled={players.length < 2 || !isRoomCreator}
                                    className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    title={!isRoomCreator ? "Only the room creator can start the game" : players.length < 2 ? "Need at least 2 players to start" : "Start the game"}
                                >
                                    <Play size={18} />
                                    Start Game
                                    {isRoomCreator && (
                                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded ml-2">
                                            You're Creator
                                        </span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .glass-card {
                    backdrop-filter: blur(12px);
                    background: rgba(15, 23, 42, 0.7);
                }
                table {
                    border-collapse: separate;
                    border-spacing: 0;
                    width: 100%;
                }
                th, td {
                    padding: 12px 15px;
                }
                tr {
                    transition: background-color 0.2s;
                }
                tr:hover {
                    background-color: rgba(255, 255, 255, 0.03);
                }
                
                /* Custom scrollbar for the player list */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </Layout>
    );
};

export default WaitingLobby;