let io = null;

export function setIO(socketIO) {
  io = socketIO;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO chưa được khởi tạo.");
  }

  return io;
}