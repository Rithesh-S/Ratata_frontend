import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Settings, LogOut, Edit, Save, User, Mail, Camera, X } from "lucide-react";
import { updateUserName } from "../api/api";
import { disconnectSocket } from "../api/socket";

const Profile = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("userName") || "Warrior";
    const storedEmail = localStorage.getItem("email") || "warrior@example.com";
    const storedPic = localStorage.getItem("profilePic");

    setUserName(storedUsername)
    setEmail(storedEmail)
    if (storedPic) setProfilePic(storedPic)
  }, [])

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("profilePic", reader.result);
      setProfilePic(reader.result);
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!userName.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    
    const response = await updateUserName(userName)
    if(response.success) {
        localStorage.setItem("userName", userName);
        toast.success("Profile updated successfully!");
    } else {
        toast.error("Failed to update profile");
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    const storedUsername = localStorage.getItem("userName") || "Warrior";
    setUserName(storedUsername);
    setIsEditing(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("email");
    localStorage.removeItem("profilePic");
    disconnectSocket()
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-1 justify-center items-start my-auto pt-20 md:pt-24 z-10 relative px-4">
      <div className="bg-gray-900/80 backdrop-blur-md text-white border border-white/20 rounded-2xl shadow-2xl p-4 md:p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Profile
          </h2>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="p-2 text-green-400 hover:bg-green-400/10 rounded-full transition-colors"
                  title="Save changes"
                >
                  <Save size={20}/>
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:bg-white/10 rounded-full transition-colors"
                  title="Cancel editing"
                >
                  <X size={20}/>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors"
                title="Edit profile"
              >
                <Edit size={20}/>
              </button>
            )}

            <button
              onClick={() => navigate('settings')}
              className="p-2 text-gray-400 hover:bg-white/10 rounded-full transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            
            <button
              onClick={handleSignOut}
              className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mb-4">
          <div 
            className="relative w-32 h-32 rounded-full select-none overflow-hidden border-2 border-purple-500/50 mb-4 group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}>
              <Camera size={32} className="text-white" />
            </div>
            
            <label className="absolute inset-0 cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePicUpload} 
              />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 select-none">
          <div>
            <label className="text-gray-300 mb-2 flex items-center">
              <User size={16} className="mr-2" />
              Username
            </label>
            <input
              type="text"
              value={userName}
              disabled={!isEditing}
              onChange={(e) => setUserName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-all ${
                isEditing 
                  ? "border-purple-500 bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50" 
                  : "border-gray-600 bg-gray-800/30"
              }`}
            />
          </div>

          <div>
            <label className="text-gray-300 mb-2 flex items-center">
              <Mail size={16} className="mr-2" />
              Email
            </label>
            <input
              type="email"
              disabled={true}
              readOnly
              value={email}
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/30 text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;