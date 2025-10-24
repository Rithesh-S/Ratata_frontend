import Particles from "./Particles";

const Layout = ({children}) => {
  return (
    <div className="relative min-h-screen bg-light-text overflow-hidden">
      <Particles
        particleColors={["#ffffff", "#ffffff"]}
        particleCount={300}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        alphaParticles={false}
        disableRotation={false}
      />

      <div className="relative h-dvh z-1">
        {children}
      </div>
    </div>
  );
};

export default Layout;
