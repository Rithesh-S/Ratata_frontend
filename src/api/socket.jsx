import { io } from "socket.io-client";

const socketRef = { current: null };

export const initSocket = (url) => {
  if (!socketRef.current) {
    const token = localStorage.getItem("token");
    socketRef.current = io(url, {
      transports: ["websocket"],
      auth: { token },
    });
  }
  return socketRef.current;
};

export const getSocket = () => socketRef.current;

export const disconnectSocket = () => {
  if (socketRef.current) {
    socketRef.current.disconnect();
    socketRef.current = null;
  }
};