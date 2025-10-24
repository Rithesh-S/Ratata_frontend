// Updated useSocket hook
import { useEffect, useCallback, useRef } from "react";
import { getSocket } from "../api/socket";

export const useSocket = (event, handler) => {
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !event || !handler) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]); 

  const emit = useCallback(
    (emitEvent, payload, callback) => {
      const socket = socketRef.current;
      if (!socket) return;
      socket.emit(emitEvent, payload, callback);
    },
    []
  );

  return { emit };
};