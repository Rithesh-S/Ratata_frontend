import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import { useEffect } from "react";
import ProtectedRoute from "./security/ProtectedRoutes";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomeLayout from "./components/layout/HomeLayout";
import 'primereact/resources/themes/lara-light-blue/theme.css';   
import 'primereact/resources/primereact.min.css';               
import 'primeicons/primeicons.css';                               
import "./index.css";
import Settings from "./pages/Settings";
import CreateMatch from "./pages/CreateMatch";
import WaitingLobby from "./pages/WaitingLobby";
import { ToastContainer } from "react-toastify";
import JoinMatch from "./pages/JoinMatch";
import GameLayout from "./components/layout/GameLayout";

const Redirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      navigate("/login", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <PrimeReactProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Redirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/ratata/*"
            element={
              <ProtectedRoute>
                <HomeLayout />
              </ProtectedRoute>
            }
          />
          <Route path="ratata/profile/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>} />
          <Route path="ratata/match/create" element={<ProtectedRoute><CreateMatch/></ProtectedRoute>} />
          <Route path="ratata/match/join" element={<ProtectedRoute><JoinMatch/></ProtectedRoute>} />
          <Route path="ratata/match/lobby" element={<ProtectedRoute><WaitingLobby/></ProtectedRoute>} />
          <Route path="ratata/match" element={<ProtectedRoute><GameLayout/></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/ratata"/>}/>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

export default App;
