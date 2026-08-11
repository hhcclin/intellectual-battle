// =====================================================
// ROOM SOCKET
// XỬ LÝ REALTIME CHO PHÒNG GAME
// =====================================================

export function registerRoomSocket(io) {
  console.log("🔌 Room Socket đã được đăng ký.");

  io.on("connection", (socket) => {
    console.log(
      "🟢 Socket kết nối:",
      socket.id
    );

    // ===================================================
    // THAM GIA ROOM SOCKET
    // ===================================================

    socket.on("joinRoomSocket", (roomId) => {
      if (!roomId) {
        return;
      }

      const roomName = `room:${roomId}`;

      socket.join(roomName);

      socket.data.roomId =
        String(roomId);

      console.log(
        `👤 ${socket.id} đã vào ${roomName}`
      );
    });

    // ===================================================
    // RỜI ROOM SOCKET
    // ===================================================

    socket.on("leaveRoomSocket", (roomId) => {
      if (!roomId) {
        return;
      }

      const roomName = `room:${roomId}`;

      socket.leave(roomName);

      if (
        socket.data.roomId ===
        String(roomId)
      ) {
        delete socket.data.roomId;
      }

      console.log(
        `👋 ${socket.id} rời ${roomName}`
      );
    });

    // ===================================================
    // CARO - NƯỚC ĐI
    // ===================================================

    socket.on(
      "caroMove",
      (data) => {
        if (!data) {
          return;
        }

        const {
          roomId,
          row,
          col,
          player,
          playerId,
        } = data;

        if (
          !roomId ||
          typeof row !== "number" ||
          typeof col !== "number" ||
          !player
        ) {
          return;
        }

        const roomName =
          `room:${roomId}`;

        console.log(
          "⭕ CARO MOVE:",
          {
            socketId:
              socket.id,
            roomId,
            row,
            col,
            player,
            playerId,
          }
        );

        // Gửi nước đi cho những người
        // khác trong cùng phòng
        socket.to(roomName).emit(
          "caroMove",
          {
            roomId,
            row,
            col,
            player,
            playerId,
          }
        );
      }
    );

    // ===================================================
    // CARO - RESET GAME
    // ===================================================

    socket.on(
      "caroRestart",
      (data) => {
        if (!data?.roomId) {
          return;
        }

        const roomName =
          `room:${data.roomId}`;

        socket.to(roomName).emit(
          "caroRestart",
          {
            roomId:
              data.roomId,
          }
        );
      }
    );

    // ===================================================
    // GAME CHAT
    // Có thể dùng sau này
    // ===================================================

    socket.on(
      "roomMessage",
      (data) => {
        if (
          !data?.roomId ||
          !data?.message
        ) {
          return;
        }

        const roomName =
          `room:${data.roomId}`;

        io.to(roomName).emit(
          "roomMessage",
          {
            roomId:
              data.roomId,

            playerId:
              data.playerId || null,

            playerName:
              data.playerName ||
              "Người chơi",

            message:
              String(
                data.message
              ).slice(0, 500),

            createdAt:
              new Date().toISOString(),
          }
        );
      }
    );

    // ===================================================
    // DISCONNECT
    // ===================================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "🔴 Socket ngắt:",
          socket.id
        );
      }
    );
  });
}