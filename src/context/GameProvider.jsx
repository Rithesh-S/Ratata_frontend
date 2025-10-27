/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { initSocket, getSocket } from "../api/socket";
import { GameContext } from "./GameContext";

export const GameProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [players, setPlayers] = useState({});
  const [roomStatus, setRoomStatus] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [spawnCount, setSpawnCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [createdBy, setCreatedBy] = useState(null)
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const [bullets,setBullets] = useState(null)

  const isLeavingRef = useRef(false);

  useEffect(() => {

    const token = localStorage.getItem("token");
    let s = getSocket();
    
    if (token && !s) {
      s = initSocket(import.meta.env.VITE_BASE_URL);

      s.on("connect", () => {
        setIsConnected(true);
        sessionStorage.setItem("socketId",s.id)
        console.log("Connected with ID:", s.id);
      });

      s.on("disconnect", () => {
        setIsConnected(false);
        console.log("Disconnected");
      });

      s.on("stateUpdate", (data) => {
        setPlayers(data.players || {})
        setRoomStatus(data.status || "")
        setTimeLeft(data.timeLeft || 0)
        if(data.createdBy) setCreatedBy(data.createdBy || "")
        if(data.spawnCount) setSpawnCount(data.spawnCount || 0);
        if(data.map) setMap(data.map || [])
        if(data.bullets) setBullets(data.bullets || [])
      });
    }

    const handleBeforeUnload = (event) => {
      if (isConnected && !isLeavingRef.current) {
        event.preventDefault();
        event.returnValue = "You have an active game session. Are you sure you want to leave?";
        setShowReloadWarning(true);
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (s) {
        s.off("connect");
        s.off("disconnect");
        s.off("stateUpdate");
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const emitEvent = (event, payload) => {
    const s = getSocket();
    if (s && isConnected) {
      s.emit(event, payload);
    } else {
      console.warn("Socket not connected. Tried to emit:", event, payload);
    }
  };

  const confirmLeave = useCallback(() => {
    isLeavingRef.current = true;
    setShowReloadWarning(false);
    window.location.reload();
  }, []);

  const cancelLeave = useCallback(() => {
    setShowReloadWarning(false);
  }, []);

  const contextValue = useMemo(() => ({
      map,
      bullets,
      players,
      roomStatus,
      timeLeft,
      spawnCount,
      isConnected,
      createdBy,
      emitEvent,
      showReloadWarning,
      confirmLeave,
      cancelLeave,
  }), [
      map, bullets, players, roomStatus, timeLeft, spawnCount, 
      isConnected, createdBy, showReloadWarning, confirmLeave, cancelLeave
  ]);

  return (
    <GameContext.Provider value={contextValue}>
        {children}
    </GameContext.Provider>
  );
};