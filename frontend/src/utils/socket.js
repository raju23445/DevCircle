import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });
  }
  return socket;
};

export const joinSocket = (userId) => {
  const s = getSocket();
  s.emit('join', userId);
  return s;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};
