import { toast } from 'react-toastify';
import { useGameProvider } from '../../context/UseGameProvider';
import { useSocket } from '../../hook/UseSocket';
import GameHeader from '../game/GameHeader';
import GameMatrix from '../game/GameMatrix';
import Layout from './Layout';

const GameLayout = () => {
    const { map, players, bullets, timeLeft, emitEvent } = useGameProvider();
    const currentPlayerId = sessionStorage.getItem('socketId');
    const currentPlayer = players ? players[currentPlayerId] : null;
    const isPlayerDead = currentPlayer?.status === 'dead';

    useSocket("stateUpdateInfo",(data) => {
        toast.info(data.message)
    })

    return (
        <Layout>
            <div className="min-h-screen text-white flex flex-col items-center p-4 md:p-6 overflow-hidden relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                
                {/* Death Overlay */}
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

                <GameHeader 
                    players={players} 
                    currentPlayerId={currentPlayerId} 
                    timeLeft={timeLeft}
                />
                <GameMatrix
                    map={map} 
                    players={players} 
                    currentPlayerId={currentPlayerId} 
                    emitEvent={emitEvent}
                    bullets={bullets}
                />
            </div>
        </Layout>
    );
};

export default GameLayout;