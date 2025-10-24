import { useEffect } from "react";
import { Menubar } from "primereact/menubar";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import ProtectedRoute from "../../security/ProtectedRoutes";
import Home from "../../pages/Home";
import Profile from "../../pages/Profile";
import History from "../../pages/History";

const HomeLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    const handlePopState = () => {
      if (!localStorage.getItem("token")) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const items = [
    { label: "Home", icon: "pi pi-home", command: () => navigate("/ratata/home") },
    { label: "Match History", icon: "pi pi-book", command: () => navigate("/ratata/history") },
    { label: "Profile", icon: "pi pi-user", command: () => navigate("/ratata/profile") },
  ];

  return (
    <Layout>
        <div className="absolute z-50 bg-white lg:bg-transparent lg:top-10 lg:flex lg:justify-center w-full">
          <Menubar
            model={items}
            pt={{
              root: {
                className: `
                  !rounded-none !border-none
                  lg:!rounded-md lg:!border lg:!border-gray-300 lg:!shadow-sm
                `,
              },
            }}
          />
        </div>

        <div className="h-dvh absolute w-full flex">
          <Routes>
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History/></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/ratata" replace />} /> 
          </Routes>
        </div>
    </Layout>
  );
};

export default HomeLayout;
