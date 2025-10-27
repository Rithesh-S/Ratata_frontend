/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "../../hook/UseSocket";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ============================================================================
// 1. MEMOIZED CHILD COMPONENTS FOR PERFORMANCE
// These components will only re-render when their specific props change.
// ============================================================================

const Player = React.memo(({ playerData, isCurrentPlayer, playerId, color }) => {
    const { position, health, direction, userName, kills, status } = playerData;
    if (status === 'dead') return null;

    const initials = userName ? userName.charAt(0).toUpperCase() : 'P';
    const CELL_SIZE = 32;

    const DirectionIndicator = () => {
        const baseStyle = "absolute w-2 h-2 rounded-full transition-all duration-200 bg-white shadow-lg";
        const currentPlayerStyle = "w-3 h-3 ring-2 ring-white animate-pulse";
        const style = isCurrentPlayer ? `${baseStyle} ${currentPlayerStyle}` : baseStyle;

        switch(direction) {
            case 'up': return <div className={`${style} -top-1 left-1/2 -translate-x-1/2`} />;
            case 'down': return <div className={`${style} -bottom-1 left-1/2 -translate-x-1/2`} />;
            case 'left': return <div className={`${style} -left-1 top-1/2 -translate-y-1/2`} />;
            case 'right': return <div className={`${style} -right-1 top-1/2 -translate-y-1/2`} />;
            default: return null;
        }
    };

    return (
        <div
            className="absolute transition-all duration-100 ease-linear"
            style={{
                top: `${position.y * CELL_SIZE}px`,
                left: `${position.x * CELL_SIZE}px`,
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
            }}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                {health < 100 && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-slate-700 rounded-full">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-300"
                            style={{ width: `${health}%` }}
                        />
                    </div>
                )}
                <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-white relative z-10 transition-all duration-200 ${
                        isCurrentPlayer
                            ? 'ring-3 ring-yellow-400 shadow-lg shadow-yellow-400/50 scale-110 animate-pulse-slow'
                            : 'ring-2 ring-white/80 shadow-md'
                    } ${health < 30 ? 'animate-pulse-fast' : ''}`}
                    style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
                    title={`${userName} | Health: ${health} | Kills: ${kills}`}
                >
                    <span className="drop-shadow-md text-xs font-bold select-none">{initials}</span>
                </div>
                <DirectionIndicator />
            </div>
        </div>
    );
});

const Bullet = React.memo(({ bulletData }) => {
    const { position } = bulletData;
    const CELL_SIZE = 32;

    return (
        <div
            className="absolute transition-all duration-100 ease-linear flex items-center justify-center"
            style={{
                top: `${position.y * CELL_SIZE}px`,
                left: `${position.x * CELL_SIZE}px`,
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
            }}
        >
            <div className="w-2.5 h-2.5 rounded-full border border-white animate-pulse" style={{ backgroundColor: '#FFF', boxShadow: '0 0 12px 3px #FFF' }} />
        </div>
    );
});


const MemoizedCell = React.memo(({ type }) => {
    // Simplified classes for better performance. Avoid complex gradients on every cell if possible.
    const cellClass = type === 1
        ? 'bg-slate-700 border-r border-b border-slate-600/50'
        : 'bg-transparent';
    return <div className={`w-8 h-8 ${cellClass}`}></div>;
});

// ============================================================================
// 2. MAIN GAME COMPONENT - NOW ACTS AS A CONTROLLER
// Its job is to manage state and render the memoized children efficiently.
// ============================================================================

const GameMatrix = ({ emitEvent, players, currentPlayerId, map, bullets }) => {
    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [keyBindings, setKeyBindings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const gameContainerRef = useRef(null);

    const navigate = useNavigate();
    const mazeGrid = map || [];
    const CELL_SIZE = 32;

    // --- ORIGINAL HOOKS (Unchanged) ---

    useEffect(() => {
        const loadingTimer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(loadingTimer);
    }, []);

    useSocket("matchDeleted", () => { // ✨ The callback no longer needs a parameter
        toast.success("Match Ended!");
        sessionStorage.removeItem("roomCode");

        const finalPlayers = players ? Object.values(players) : [];

        navigate("/ratata/match/result", { 
            replace: true, 
            state: { players: finalPlayers } 
        });
    });

    useEffect(() => {
        const loadKeyBindings = () => {
            try {
                const bindings = JSON.parse(localStorage.getItem('controls'));
                const defaultBindings = {
                    exit: "Escape", moveDown: "ArrowDown", moveLeft: "ArrowLeft",
                    moveRight: "ArrowRight", moveUp: "ArrowUp", shoot: "Space"
                };
                setKeyBindings(bindings || defaultBindings);
            } catch (error) {
                console.error('Error loading key bindings:', error);
            }
        };
        loadKeyBindings();
    }, []);

    useEffect(() => {
        const updateSize = () => {
            if (gameContainerRef.current) {
                const { width, height } = gameContainerRef.current.getBoundingClientRect();
                setContainerSize({ width, height });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const pressedKeys = new Set();
        const handleKeyPress = (event) => {
            if (event.repeat || !keyBindings || isLoading) {
                return;
            }
            const key = event.key;
            const code = event.code;
            if (pressedKeys.has(key) || pressedKeys.has(code)) {
                event.preventDefault();
                return;
            }
            let action = Object.keys(keyBindings).find(act => keyBindings[act] === key || keyBindings[act] === code);

            if (action) {
                if (key) pressedKeys.add(key);
                if (code) pressedKeys.add(code);

                switch(action) {
                    case 'moveUp': emitEvent("movePlayer", { dir: "up" }); break;
                    case 'moveDown': emitEvent("movePlayer", { dir: "down" }); break;
                    case 'moveLeft': emitEvent("movePlayer", { dir: "left" }); break;
                    case 'moveRight': emitEvent("movePlayer", { dir: "right" }); break;
                    case 'shoot': emitEvent("createBullet"); break;
                    case 'exit': console.log('Exiting'); break;
                    default: break;
                }
                if (['moveUp', 'moveDown', 'moveLeft', 'moveRight', 'shoot'].includes(action)) {
                    event.preventDefault();
                }
            }
        };
        const handleKeyUp = (event) => {
            pressedKeys.delete(event.key);
            pressedKeys.delete(event.code);
        };
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [keyBindings, isLoading, emitEvent]);

    // --- OPTIMIZED HOOKS & LOGIC ---

    const updateCamera = useCallback(() => {
        if (players && currentPlayerId && players[currentPlayerId]?.position && containerSize.width > 0 && mazeGrid.length > 0) {
            const playerPos = players[currentPlayerId].position;
            const mazeWidth = mazeGrid[0].length * CELL_SIZE;
            const mazeHeight = mazeGrid.length * CELL_SIZE;
            const centerX = containerSize.width / 2;
            const centerY = containerSize.height / 2;
            const playerPixelX = playerPos.x * CELL_SIZE + (CELL_SIZE / 2);
            const playerPixelY = playerPos.y * CELL_SIZE + (CELL_SIZE / 2);

            let offsetX = centerX - playerPixelX;
            let offsetY = centerY - playerPixelY;

            if (mazeWidth > containerSize.width) {
                offsetX = Math.min(0, Math.max(containerSize.width - mazeWidth, offsetX));
            } else {
                offsetX = (containerSize.width - mazeWidth) / 2;
            }
            if (mazeHeight > containerSize.height) {
                offsetY = Math.min(0, Math.max(containerSize.height - mazeHeight, offsetY));
            } else {
                offsetY = (containerSize.height - mazeHeight) / 2;
            }
            setCameraOffset({ x: offsetX, y: offsetY });
        }
    }, [players, currentPlayerId, containerSize, mazeGrid]);

    useEffect(() => {
        updateCamera();
    }, [updateCamera]);

    const getPlayerColor = useCallback((playerId) => {
        const colors = ['#FF2E63', '#08D9D6', '#FCE38A', '#EAFF00', '#FF9A76', '#A3DE83', '#FF6B9C', '#00F5FF', '#FFD93D', '#6BCF7F', '#FF8E6E', '#9D65C9'];
        let hash = 0;
        for (let i = 0; i < playerId.length; i++) {
            hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }, []);

    // Use useMemo to render the heavy maze grid only once
    const renderedMaze = useMemo(() => {
        if (!mazeGrid || mazeGrid.length === 0) return null;
        return mazeGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
                {row.map((cell, cellIndex) => (
                    <MemoizedCell key={`${rowIndex}-${cellIndex}`} type={cell} />
                ))}
            </div>
        ));
    }, [mazeGrid]);

    const bulletArray = useMemo(() => {
        if (!bullets) return [];
        return Array.isArray(bullets) ? bullets : Object.values(bullets);
    }, [bullets]);


    // --- UI COMPONENTS (Copied from original) ---
    const SkeletonLoader = () => (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent animate-shimmer" />
             <div className="text-center relative z-10">
                 <div className="animate-spin rounded-full h-20 w-20 border-4 border-cyan-400 border-t-transparent mx-auto mb-6 shadow-lg shadow-cyan-400/30"></div>
                 <p className="text-cyan-200 font-bold text-xl mb-3 animate-pulse">Loading Arena</p>
                 <p className="text-slate-300 text-sm">Preparing battlefield...</p>
             </div>
        </div>
    );

    const PlayerList = () => (
        <div className="absolute top-4 left-4 select-none bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 shadow-2xl min-w-48">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Players ({Object.keys(players || {}).length})
            </h3>
            <div className="space-y-2 max-h-40 p-1 overflow-y-auto">
                {Object.entries(players || {}).map(([id, player]) => (
                    <div key={id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${id === currentPlayerId ? 'bg-slate-700/80 ring-1 ring-cyan-400/50' : 'bg-slate-700/40'}`}>
                        <div className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white/50" style={{ backgroundColor: getPlayerColor(id) }} />
                        <span className="text-white text-sm font-medium truncate flex-1">
                            {player.userName || 'Player'} {id === currentPlayerId && <span className="text-cyan-300 text-xs ml-1">(You)</span>}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-red-400">❤️ {player.health || 100}</span>
                            <span className="text-yellow-400">⚔️ {player.kills || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- FINAL RENDER ---
    return (
        <div className="relative w-full max-w-6xl mx-auto">
            <div ref={gameContainerRef} className="w-full h-[70vh] max-h-[700px] overflow-hidden rounded-2xl border-2 border-slate-600/50 bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] shadow-2xl relative">
                {isLoading ? ( <SkeletonLoader /> ) : (
                    <>
                        <div
                            className="absolute transition-transform duration-200 ease-out"
                            style={{
                                transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
                                width: `${mazeGrid[0]?.length * CELL_SIZE}px`,
                                height: `${mazeGrid.length * CELL_SIZE}px`
                            }}
                        >
                            {/* Render the static maze grid first, as the background */}
                            {renderedMaze}

                            {/* Render all players on top of the grid using absolute positioning */}
                            {Object.entries(players).map(([id, data]) => (
                                <Player key={id} playerId={id} playerData={data} isCurrentPlayer={id === currentPlayerId} color={getPlayerColor(id)} />
                            ))}

                            {/* Render all bullets on top of the grid */}
                            {bulletArray.map((bullet) => (
                                <Bullet key={bullet.bulletId} bulletData={bullet} />
                            ))}
                        </div>

                        <PlayerList />

                        <div className="absolute bottom-4 right-4 select-none bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50">
                            <div className="text-white text-xs font-medium mb-2">Mini Map</div>
                            <div className="w-24 h-24 bg-slate-700/50 rounded border border-slate-600/50 relative overflow-hidden">
                                {players && currentPlayerId && players[currentPlayerId]?.position && (
                                    <div className="absolute w-2 h-2 bg-cyan-400 rounded-full ring-2 ring-white animate-pulse" style={{
                                        left: `${(players[currentPlayerId].position.x / mazeGrid[0]?.length) * 100}%`,
                                        top: `${(players[currentPlayerId].position.y / mazeGrid.length) * 100}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }} />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default GameMatrix;