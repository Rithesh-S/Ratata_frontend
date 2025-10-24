import Layout from "../components/layout/Layout";
import { ToastContainer, toast } from "react-toastify";
import { ArrowLeft, Volume, Volume2, RotateCcw, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ElasticSlider from "../components/settings/ElasticSlider";
import 'react-toastify/dist/ReactToastify.css';

const Settings = () => {
  const navigate = useNavigate();

  const [volume, setVolume] = useState(50);
  const [controls, setControls] = useState({
      moveUp: "ArrowUp",
      moveDown: "ArrowDown",
      moveLeft: "ArrowLeft",
      moveRight: "ArrowRight",
      shoot: "Space",
      exit: "Escape",
    });


  useEffect(() => {
    const storedVolume = localStorage.getItem("volume");
    const storedControls = localStorage.getItem("controls");

    if (storedVolume) setVolume(Number(storedVolume));
    if (storedControls) setControls(JSON.parse(storedControls));
  }, []);

  const handleVolumeChange = (e) => {
    const val = Math.floor(Number(e));
    setVolume(val);
    localStorage.setItem("volume", val);
};

    const handleControlChange = (key, value) => {
        const isDuplicate = Object.keys(controls).some(
            (k) => k !== key && controls[k] === value
        );

        if (isDuplicate) {
            toast.error(`${value} is already assigned to another control`);
            return;
        }
        const updatedControls = { ...controls, [key]: value };
        setControls(updatedControls);
        localStorage.setItem("controls", JSON.stringify(updatedControls));
    };


  const handleResetControls = () => {
    const defaultControls = {
      moveUp: "ArrowUp",
      moveDown: "ArrowDown",
      moveLeft: "ArrowLeft",
      moveRight: "ArrowRight",
      shoot: "Space",
      exit: "Escape",
    };
    setControls(defaultControls);
    localStorage.setItem("controls", JSON.stringify(defaultControls));
    toast.info("Controls reset to default");
  };

  return (
    <Layout>
        <header className="p-6 flex items-center">
            <button 
            onClick={() => navigate('/ratata/profile')}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
            >
            <ArrowLeft size={24}/>
            </button>
            <p className="text-white font-bold text-2xl pl-4 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Settings
            </p>
        </header>

        <div className="flex flex-col items-center justify-start my-auto z-10 relative w-full px-4 pb-8 h-[calc(100vh-120px)]">
            <div className="bg-gray-900/80 backdrop-blur-md text-white border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-full">

            <div className="space-y-4 select-none">
                <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <Volume2 className="text-purple-400" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-gray-200">Audio Volume</h3>
                </div>
                
                <div className="flex justify-center">
                <ElasticSlider
                    leftIcon={<Volume size={20} className="text-gray-400" />}
                    rightIcon={<Volume2 size={20} className="text-purple-400" />}
                    startingValue={0}
                    defaultValue={volume}
                    onChange={handleVolumeChange}
                    maxValue={100}
                />
                </div>
                
                <div className="text-center text-sm text-gray-400">
                Current volume: {volume}%
                </div>
            </div>

            {/* Controls Section */}
            <div className="space-y-4 select-none">
                <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <Gamepad2 className="text-blue-400" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-gray-200">Controls Mapping</h3>
                </div>
                
                <div className="space-y-3">
                {Object.keys(controls).map((key) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/30 transition-colors">
                    <span className="capitalize text-gray-300 font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <input
                        type="text"
                        value={controls[key]}
                        readOnly
                        onKeyDown={(e) => {
                            e.preventDefault();
                            handleControlChange(key, e.code); 
                        }}
                        className="bg-gray-700/50 select-none text-white p-2 rounded-md w-32 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-600 transition-all"
                        onFocus={(e) => {
                            e.target.value = "Press a key...";
                        }}
                        onBlur={(e) => {
                            e.target.value = controls[key]; 
                        }}
                        />
                    </div>
                ))}
                </div>
                
                <button
                    onClick={handleResetControls}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-500 hover:to-blue-500 transition-all duration-200 flex items-center justify-center"
                >
                    <RotateCcw size={18} className="mr-2" />
                    Reset Controls
                </button>
                </div>
            </div>
        </div>
    </Layout>
  );
};

export default Settings;