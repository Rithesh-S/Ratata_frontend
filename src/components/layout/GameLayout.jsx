import { toast } from 'react-toastify';
import { useGameProvider } from '../../context/UseGameProvider';
import { useSocket } from '../../hook/UseSocket';
import GameHeader from '../game/GameHeader'; // This is now the Sidebar
import GameMatrix from '../game/GameMatrix';
import Layout from './Layout';
import { useEffect, useMemo, useRef } from 'react';

const GameLayout = () => {
    const audioRef = useRef(null);
    // Get all relevant state from the provider
    const { 
        map, players, bullets, timeLeft, emitEvent, 
        roomStatus, createdBy 
    } = useGameProvider();
    
    const currentPlayerId = sessionStorage.getItem('socketId');
    
    // Use useMemo to prevent unnecessary re-renders
    const currentPlayer = useMemo(() => {
        return players ? players[currentPlayerId] : null;
    }, [players, currentPlayerId]);

    const isPlayerDead = useMemo(() => {
        return currentPlayer?.status === 'dead';
    }, [currentPlayer]);

    // Memoize player list to pass down
    const playerList = useMemo(() => {
        return players || {};
    }, [players]);

    useSocket("stateUpdateInfo", (data) => {
        toast.info(data.message);
    });

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
            {/* Main container: stacks on mobile, row on desktop */}
            <div className="min-h-screen text-white flex flex-col md:flex-row items-start p-4 md:p-6 gap-6 overflow-hidden relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                
                {/* Death Overlay (Unchanged) */}
                {isPlayerDead && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center text-center p-6">
                        <div className="bg-gradient-to-br from-red-900/90 to-red-800/90 border border-red-600 rounded-2xl p-8 shadow-2xl max-w-md w-full">
                            <div className="text-6xl mb-4">💀</div>
                            <h2 className="text-4xl font-black text-red-100 mb-4">
                                ELIMINATED
                            </h2>
                            <div className="space-y-3 text-red-200">
                                <p className="text-lg font-semibold">
                                    {currentPlayer?.userName || 'Player'}
                                </p>
                                <p className="text-sm opacity-80">
                                    Final Score: <span className="text-yellow-300 font-bold">{currentPlayer?.score || 0}</span>
                                </p>
                                <p className="text-sm opacity-80">
                                    Kills: <span className="text-green-300 font-bold">{currentPlayer?.kills || 0}</span>
                                </p>
                            </div>
                            <div className="mt-6 p-3 bg-red-950/50 rounded-lg border border-red-700/50">
                                <p className="text-red-300 text-sm font-medium">
                                    Waiting for respawn...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Left Sidebar (Was GameHeader) */}
                <div className="w-72 flex-shrink-0">
                    <GameHeader 
                        players={playerList} 
                        currentPlayerId={currentPlayerId} 
                        timeLeft={timeLeft}
                        roomStatus={roomStatus} // Pass new props
                        createdBy={createdBy}   // Pass new props
                    />
                </div>

                {/* Main Game Area (GameMatrix) */}
                <div className="w-full h-full flex-grow">
                    <GameMatrix
                        map={map} 
                        players={playerList} 
                        currentPlayerId={currentPlayerId} 
                        emitEvent={emitEvent}
                        bullets={bullets}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default GameLayout;