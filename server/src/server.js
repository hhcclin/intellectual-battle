import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { setIO } from "./socket/io.js";
import { registerRoomSocket } from "./socket/roomSocket.js";
const PORT = 5000;

// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
    ],

    methods: ["GET", "POST"],

    credentials: true,
  },
});

// =====================================================
// CHIA SẺ IO CHO APP.JS
// =====================================================

setIO(io);
registerRoomSocket(io);
// =====================================================
// TRẠNG THÁI GAME CARO
// =====================================================
//
// {
//   roomId: {
//     roomId: "003",
//     board: [...],
//     currentPlayer: "X",
//     winner: null,
//     moveCount: 0
//   }
// }
//
// =====================================================

const caroGames = new Map();

// =====================================================
// SOCKET PLAYER THEO ROOM
// =====================================================
//
// roomPlayers:
// {
//   roomId: {
//     playerId: {
//       socketId: "...",
//       symbol: "X"
//     }
//   }
// }
//
// Caro:
//   player 1 -> X
//   player 2 -> O
//
// =====================================================

const roomPlayers = new Map();

// =====================================================
// SOCKET -> PLAYER INFO
// =====================================================
//
// {
//   socketId: {
//     roomId,
//     playerId,
//     symbol
//   }
// }
//
// =====================================================

const socketPlayers = new Map();

// =====================================================
// CẤU HÌNH CARO
// =====================================================

const BOARD_SIZE = 15;

// =====================================================
// TẠO BÀN CARO
// =====================================================

function createEmptyCaroBoard() {
  return Array.from(
    {
      length: BOARD_SIZE,
    },
    () =>
      Array(
        BOARD_SIZE
      ).fill(null)
  );
}

// =====================================================
// TẠO GAME CARO
// =====================================================

function createCaroGame(roomId) {
  const game = {
    roomId,

    board: createEmptyCaroBoard(),

    currentPlayer: "X",

    winner: null,

    moveCount: 0,
  };

  caroGames.set(
    roomId,
    game
  );

  return game;
}

// =====================================================
// LẤY GAME CARO
// =====================================================

function getCaroGame(roomId) {
  let game = caroGames.get(roomId);

  if (!game) {
    game = createCaroGame(roomId);
  }

  return game;
}

// =====================================================
// KIỂM TRA THẮNG CARO
// =====================================================

function checkCaroWinner(
  board,
  row,
  col,
  player
) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [
    dr,
    dc,
  ] of directions) {
    let count = 1;

    // -------------------------------------------------
    // HƯỚNG THỨ NHẤT
    // -------------------------------------------------

    let r = row + dr;
    let c = col + dc;

    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[r][c] === player
    ) {
      count += 1;

      r += dr;
      c += dc;
    }

    // -------------------------------------------------
    // HƯỚNG NGƯỢC LẠI
    // -------------------------------------------------

    r = row - dr;
    c = col - dc;

    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[r][c] === player
    ) {
      count += 1;

      r -= dr;
      c -= dc;
    }

    if (count >= 5) {
      return true;
    }
  }

  return false;
}

// =====================================================
// LẤY PLAYER SOCKET TRONG ROOM
// =====================================================

function getRoomPlayers(roomId) {
  let players = roomPlayers.get(roomId);

  if (!players) {
    players = new Map();

    roomPlayers.set(
      roomId,
      players
    );
  }

  return players;
}

// =====================================================
// GÁN SYMBOL CHO PLAYER
// =====================================================
//
// Player đầu tiên:
//   X
//
// Player thứ hai:
//   O
//
// Không lấy symbol từ dữ liệu caroMove của client.
// =====================================================

function assignCaroPlayer(
  roomId,
  playerId,
  socketId
) {
  const players =
    getRoomPlayers(roomId);

  const existing =
    players.get(playerId);

  if (existing) {
    existing.socketId =
      socketId;

    return existing;
  }

  // ---------------------------------------------------
  // PLAYER ĐÃ CÓ SOCKET KHÁC
  // ---------------------------------------------------

  for (const player of players.values()) {
    if (
      player.socketId ===
      socketId
    ) {
      return player;
    }
  }

  // ---------------------------------------------------
  // TÌM SYMBOL CÒN TRỐNG
  // ---------------------------------------------------

  const usedSymbols =
    new Set(
      Array.from(
        players.values()
      ).map(
        (player) =>
          player.symbol
      )
    );

  let symbol = null;

  if (!usedSymbols.has("X")) {
    symbol = "X";
  } else if (
    !usedSymbols.has("O")
  ) {
    symbol = "O";
  }

  // ---------------------------------------------------
  // CARO CHỈ CÓ 2 PLAYER
  // ---------------------------------------------------

  if (!symbol) {
    return null;
  }

  const player = {
    playerId,
    socketId,
    symbol,
  };

  players.set(
    playerId,
    player
  );

  return player;
}

// =====================================================
// TÌM PLAYER THEO SOCKET
// =====================================================

function getSocketPlayer(
  socketId
) {
  return socketPlayers.get(
    socketId
  );
}

// =====================================================
// XÓA PLAYER SOCKET
// =====================================================

function removeSocketPlayer(
  socketId
) {
  const info =
    socketPlayers.get(
      socketId
    );

  if (!info) {
    return;
  }

  const {
    roomId,
    playerId,
  } = info;

  const players =
    roomPlayers.get(
      roomId
    );

  if (players) {
    const player =
      players.get(
        playerId
      );

    // Chỉ xóa nếu socket
    // hiện tại đúng là socket
    // đang giữ player này.
    if (
      player &&
      player.socketId ===
        socketId
    ) {
      players.delete(
        playerId
      );
    }

    if (
      players.size === 0
    ) {
      roomPlayers.delete(
        roomId
      );
    }
  }

  socketPlayers.delete(
    socketId
  );
}

// =====================================================
// SOCKET CONNECTION
// =====================================================

io.on(
  "connection",
  (socket) => {
    console.log(
      "Client connected:",
      socket.id
    );

    // =================================================
    // THAM GIA ROOM SOCKET
    // =================================================

    socket.on(
      "joinRoom",
      ({
        roomId,
        playerId,
      } = {}) => {
        // ---------------------------------------------
        // KIỂM TRA DỮ LIỆU
        // ---------------------------------------------

        if (!roomId) {
          socket.emit(
            "roomError",
            {
              message:
                "Thiếu roomId.",
            }
          );

          return;
        }

        if (!playerId) {
          socket.emit(
            "roomError",
            {
              message:
                "Thiếu playerId.",
            }
          );

          return;
        }

        // ---------------------------------------------
        // SOCKET JOIN ROOM
        // ---------------------------------------------

        const socketRoom =
          `room:${roomId}`;

        socket.join(
          socketRoom
        );

        // ---------------------------------------------
        // GHI NHẬN PLAYER
        // ---------------------------------------------

        const playerInfo =
          assignCaroPlayer(
            roomId,
            playerId,
            socket.id
          );

        if (!playerInfo) {
          socket.emit(
            "roomError",
            {
              message:
                "Phòng đã đủ người chơi.",
            }
          );

          socket.leave(
            socketRoom
          );

          return;
        }

        socketPlayers.set(
          socket.id,
          {
            roomId,
            playerId,
            symbol:
              playerInfo.symbol,
          }
        );

        console.log(
          `Socket ${socket.id} joined room ${roomId} as player ${playerId} (${playerInfo.symbol})`
        );

        // ---------------------------------------------
        // GỬI THÔNG TIN PLAYER
        // ---------------------------------------------

        socket.emit(
          "playerAssigned",
          {
            roomId,
            playerId,
            symbol:
              playerInfo.symbol,
          }
        );

        // ---------------------------------------------
        // CARO STATE
        // ---------------------------------------------

        const game =
          caroGames.get(
            roomId
          );

        if (game) {
          socket.emit(
            "caroState",
            game
          );
        }
      }
    );

    // =================================================
    // CARO - NƯỚC ĐI
    // =================================================

    socket.on(
      "caroMove",
      ({
        roomId,
        row,
        col,
      } = {}) => {
        // ---------------------------------------------
        // PLAYER CỦA SOCKET
        // ---------------------------------------------

        const socketPlayer =
          getSocketPlayer(
            socket.id
          );

        if (!socketPlayer) {
          socket.emit(
            "caroError",
            {
              message:
                "Bạn chưa tham gia phòng.",
            }
          );

          return;
        }

        // ---------------------------------------------
        // KIỂM TRA ROOM
        // ---------------------------------------------

        if (
          socketPlayer.roomId !==
          roomId
        ) {
          socket.emit(
            "caroError",
            {
              message:
                "Bạn không thuộc phòng này.",
            }
          );

          return;
        }

        // ---------------------------------------------
        // KIỂM TRA TỌA ĐỘ
        // ---------------------------------------------

        if (
          typeof row !==
            "number" ||
          typeof col !==
            "number"
        ) {
          return;
        }

        if (
          row < 0 ||
          row >= BOARD_SIZE ||
          col < 0 ||
          col >= BOARD_SIZE
        ) {
          return;
        }

        // ---------------------------------------------
        // SYMBOL ĐƯỢC SERVER GÁN
        // ---------------------------------------------

        const player =
          socketPlayer.symbol;

        // ---------------------------------------------
        // LẤY GAME
        // ---------------------------------------------

        const game =
          getCaroGame(
            roomId
          );

        // ---------------------------------------------
        // GAME ĐÃ KẾT THÚC
        // ---------------------------------------------

        if (game.winner) {
          return;
        }

        // ---------------------------------------------
        // KHÔNG ĐÚNG LƯỢT
        // ---------------------------------------------

        if (
          game.currentPlayer !==
          player
        ) {
          socket.emit(
            "caroError",
            {
              message:
                "Chưa đến lượt của bạn.",
            }
          );

          return;
        }

        // ---------------------------------------------
        // Ô ĐÃ CÓ QUÂN
        // ---------------------------------------------

        if (
          game.board[row][col]
        ) {
          return;
        }

        // ---------------------------------------------
        // ĐẶT QUÂN
        // ---------------------------------------------

        game.board[row][col] =
          player;

        game.moveCount +=
          1;

        // ---------------------------------------------
        // KIỂM TRA THẮNG
        // ---------------------------------------------

        if (
          checkCaroWinner(
            game.board,
            row,
            col,
            player
          )
        ) {
          game.winner =
            player;
        }

        // ---------------------------------------------
        // KIỂM TRA HÒA
        // ---------------------------------------------

        if (
          !game.winner &&
          game.moveCount >=
            BOARD_SIZE *
              BOARD_SIZE
        ) {
          game.winner =
            "DRAW";
        }

        // ---------------------------------------------
        // ĐỔI LƯỢT
        // ---------------------------------------------

        if (!game.winner) {
          game.currentPlayer =
            player === "X"
              ? "O"
              : "X";
        }

        // ---------------------------------------------
        // GỬI STATE CHO CẢ ROOM
        // ---------------------------------------------

        io.to(
          `room:${roomId}`
        ).emit(
          "caroState",
          game
        );
      }
    );

    // =================================================
    // CARO - CHƠI LẠI
    // =================================================

    socket.on(
      "caroRestart",
      ({
        roomId,
      } = {}) => {
        const socketPlayer =
          getSocketPlayer(
            socket.id
          );

        if (!socketPlayer) {
          return;
        }

        if (
          socketPlayer.roomId !==
          roomId
        ) {
          return;
        }

        const game =
          createCaroGame(
            roomId
          );

        io.to(
          `room:${roomId}`
        ).emit(
          "caroState",
          game
        );
      }
    );

    // =================================================
    // DISCONNECT
    // =================================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Disconnected:",
          socket.id
        );

        removeSocketPlayer(
          socket.id
        );
      }
    );
  }
);

// =====================================================
// START SERVER
// =====================================================

server.listen(
  PORT,
  () => {
    console.log(
      `🚀 Server running at http://localhost:${PORT}`
    );
  }
);  