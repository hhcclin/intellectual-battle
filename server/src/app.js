import express from "express";
import cors from "cors";
import { getIO } from "./socket/io.js";

const app = express();

// =====================================================
// CORS
// =====================================================

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// =====================================================
// TEST API
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "Intellectual Battle API is running",
  });
});

// =====================================================
// CẤU HÌNH GAME
// =====================================================

const GAME_CONFIG = {
  RPS: {
    gameName: "Oẳn tù tì",
    minPlayers: 2,
    maxPlayers: 3,
    canLockSeats: true,
  },

  CHESS: {
    gameName: "Cờ tướng",
    minPlayers: 2,
    maxPlayers: 2,
    canLockSeats: false,
  },

  CARO: {
    gameName: "Cờ caro",
    minPlayers: 2,
    maxPlayers: 2,
    canLockSeats: false,
  },
};

// =====================================================
// DANH SÁCH PHÒNG
// =====================================================

const rooms = [
  {
    id: "001",

    roomName: "xin chỉ giáo",

    gameType: "RPS",
    gameName: "Oẳn tù tì",

    minPlayers: 2,
    maxPlayers: 3,

    players: [
      {
        id: "player_001",
        name: "Chủ phòng",
        seat: 1,
        isHost: true,
      },
    ],

    lockedSeats: [],

    // Phòng đã mở
    gameOpen: true,

    // Chưa đủ người để bắt đầu
    gameStarted: false,

    status: "WAITING",

    bet: 0,
  },

  {
    id: "002",

    roomName: "xin chỉ giáo",

    gameType: "CHESS",
    gameName: "Cờ tướng",

    minPlayers: 2,
    maxPlayers: 2,

    players: [
      {
        id: "player_002",
        name: "Chủ phòng",
        seat: 1,
        isHost: true,
      },
    ],

    // Cờ tướng không có khóa ghế
    lockedSeats: [],

    // Bàn cờ được mở ngay
    gameOpen: true,

    // Chờ đối thủ
    gameStarted: false,

    status: "WAITING",

    bet: 150,
  },

  {
    id: "003",

    roomName: "xin chỉ giáo",

    gameType: "CARO",
    gameName: "Cờ caro",

    minPlayers: 2,
    maxPlayers: 2,

    players: [
      {
        id: "player_003",
        name: "Chủ phòng",
        seat: 1,
        isHost: true,
      },
    ],

    // Cờ caro không có khóa ghế
    lockedSeats: [],

    // Bàn caro được mở ngay
    gameOpen: true,

    // Chờ đối thủ
    gameStarted: false,

    status: "WAITING",

    bet: 50,
  },
];

// =====================================================
// TẠO PLAYER ID
// =====================================================

const createPlayerId = () => {
  return `player_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;
};

// =====================================================
// TẠO ROOM ID
// =====================================================

const createRoomId = () => {
  let number = rooms.length + 1;

  let id = String(number).padStart(3, "0");

  while (rooms.some((room) => room.id === id)) {
    number += 1;

    id = String(number).padStart(3, "0");
  }

  return id;
};

// =====================================================
// LẤY SỐ NGƯỜI
// =====================================================

const getPlayerCount = (room) => {
  if (!Array.isArray(room.players)) {
    return 0;
  }

  return room.players.length;
};

// =====================================================
// KIỂM TRA ĐỦ NGƯỜI
// =====================================================

const isRoomReady = (room) => {
  return getPlayerCount(room) >= room.minPlayers;
};

// =====================================================
// CẬP NHẬT TRẠNG THÁI PHÒNG
// =====================================================

const updateRoomStatus = (room) => {
  if (room.status === "FINISHED") {
    return;
  }

  const playerCount = getPlayerCount(room);

  // ---------------------------------------------------
  // OẲN TÙ TÌ
  // ---------------------------------------------------
  //
  // 1/3 -> WAITING
  // 2/3 -> PLAYING
  // 3/3 -> PLAYING
  //
  // Nhưng 2/3 vẫn còn ghế để người thứ 3 tham gia.
  // ---------------------------------------------------

  if (room.gameType === "RPS") {
    if (playerCount >= room.minPlayers) {
      room.status = "PLAYING";
    } else {
      room.status = "WAITING";
    }

    return;
  }

  // ---------------------------------------------------
  // CỜ TƯỚNG / CỜ CARO
  // ---------------------------------------------------
  //
  // 1/2 -> WAITING
  // 2/2 -> PLAYING
  //
  // gameOpen vẫn true ở cả 1/2.
  // ---------------------------------------------------

  if (playerCount >= room.maxPlayers) {
    room.status = "PLAYING";
  } else {
    room.status = "WAITING";
  }
};

// =====================================================
// SOCKET - DANH SÁCH PHÒNG
// =====================================================

const emitRoomsUpdated = () => {
  try {
    const io = getIO();

    io.emit("roomsUpdated", rooms);
  } catch (error) {
    console.log("Socket.IO chưa sẵn sàng.");
  }
};

// =====================================================
// SOCKET - MỘT PHÒNG
// =====================================================

const emitRoomUpdated = (room) => {
  try {
    const io = getIO();

    io.emit("roomUpdated", room);
  } catch (error) {
    console.log("Socket.IO chưa sẵn sàng.");
  }
};

// =====================================================
// SOCKET - GAME BẮT ĐẦU
// =====================================================

const emitGameStarted = (room) => {
  try {
    const io = getIO();

    io.emit("gameStarted", {
      roomId: room.id,
      gameType: room.gameType,
      room,
    });
  } catch (error) {
    console.log("Socket.IO chưa sẵn sàng.");
  }
};

// =====================================================
// SOCKET - GAME ĐƯỢC MỞ
// =====================================================

const emitGameOpened = (room) => {
  try {
    const io = getIO();

    io.emit("gameOpened", {
      roomId: room.id,
      gameType: room.gameType,
      room,
    });
  } catch (error) {
    console.log("Socket.IO chưa sẵn sàng.");
  }
};

// =====================================================
// GET DANH SÁCH PHÒNG
// =====================================================

app.get("/api/rooms", (req, res) => {
  rooms.forEach((room) => {
    updateRoomStatus(room);
  });

  res.json(rooms);
});

// =====================================================
// GET MỘT PHÒNG
// =====================================================

app.get("/api/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;

  const room = rooms.find(
    (item) => item.id === roomId
  );

  if (!room) {
    return res.status(404).json({
      message: "Không tìm thấy phòng.",
    });
  }

  updateRoomStatus(room);

  res.json(room);
});

// =====================================================
// TẠO PHÒNG
// =====================================================

app.post("/api/rooms", (req, res) => {
  const {
    roomName,
    gameType,
    bet,
  } = req.body;

  // ---------------------------------------------------
  // KIỂM TRA GAME
  // ---------------------------------------------------

  if (!gameType) {
    return res.status(400).json({
      message: "Thiếu loại game.",
    });
  }

  const config = GAME_CONFIG[gameType];

  if (!config) {
    return res.status(400).json({
      message: "Loại game không hợp lệ.",
    });
  }

  // ---------------------------------------------------
  // TÊN PHÒNG
  // ---------------------------------------------------

  const finalRoomName =
    typeof roomName === "string" &&
    roomName.trim()
      ? roomName.trim()
      : "xin chỉ giáo";

  // ---------------------------------------------------
  // TẠO CHỦ PHÒNG
  // ---------------------------------------------------

  const hostPlayerId = createPlayerId();

  const hostPlayer = {
    id: hostPlayerId,

    name: "Chủ phòng",

    seat: 1,

    isHost: true,
  };

  // ---------------------------------------------------
  // TẠO ROOM
  // ---------------------------------------------------

  const newRoom = {
    id: createRoomId(),

    roomName: finalRoomName,

    gameType,

    gameName: config.gameName,

    minPlayers: config.minPlayers,

    maxPlayers: config.maxPlayers,

    players: [
      hostPlayer,
    ],

    // Chỉ RPS được khóa ghế
    lockedSeats: [],

    // Tất cả game đều mở phòng.
    gameOpen: true,

    // Chưa đủ người thì chưa bắt đầu game.
    gameStarted: false,

    status: "WAITING",

    bet:
      Number(bet) >= 0
        ? Number(bet)
        : 0,
  };

  // ---------------------------------------------------
  // THÊM ROOM
  // ---------------------------------------------------

  rooms.push(newRoom);

  // ---------------------------------------------------
  // CẬP NHẬT STATUS
  // ---------------------------------------------------

  updateRoomStatus(newRoom);

  // ---------------------------------------------------
  // REALTIME
  // ---------------------------------------------------

  emitRoomsUpdated();

  emitRoomUpdated(newRoom);

  emitGameOpened(newRoom);

  // ---------------------------------------------------
  // RESPONSE
  // ---------------------------------------------------

  res.status(201).json({
    room: newRoom,

    playerId: hostPlayerId,
  });
});

// =====================================================
// THAM GIA PHÒNG
// =====================================================

app.post("/api/rooms/:roomId/join", (req, res) => {
  const { roomId } = req.params;

  // Chấp nhận cả name và playerName
  // để tương thích với roomService hiện tại.
  const playerNameFromRequest =
    req.body.name ||
    req.body.playerName;

  // ---------------------------------------------------
  // TÌM PHÒNG
  // ---------------------------------------------------

  const room = rooms.find(
    (item) => item.id === roomId
  );

  if (!room) {
    return res.status(404).json({
      message: "Không tìm thấy phòng.",
    });
  }

  const playerCount = getPlayerCount(room);

  // ---------------------------------------------------
  // KIỂM TRA PHÒNG
  // ---------------------------------------------------
  //
  // CỜ TƯỚNG / CARO:
  //
  // 1/2 -> được tham gia
  // 2/2 -> đầy
  //
  // RPS:
  //
  // 1/3 -> được tham gia
  // 2/3 -> vẫn được tham gia
  // 3/3 -> đầy
  // ---------------------------------------------------

  if (playerCount >= room.maxPlayers) {
    return res.status(400).json({
      message: "Phòng đã đầy.",
    });
  }

  // ---------------------------------------------------
  // TÊN PLAYER
  // ---------------------------------------------------

  const playerName =
    typeof playerNameFromRequest === "string" &&
    playerNameFromRequest.trim()
      ? playerNameFromRequest.trim()
      : "Người chơi";

  // ---------------------------------------------------
  // KIỂM TRA TRÙNG TÊN
  // ---------------------------------------------------

  const alreadyJoined = room.players.find(
    (player) =>
      player.name.toLowerCase() ===
      playerName.toLowerCase()
  );

  if (alreadyJoined) {
    return res.status(400).json({
      message:
        "Tên người chơi này đã có trong phòng.",
    });
  }

  // ---------------------------------------------------
  // TÌM GHẾ TRỐNG
  // ---------------------------------------------------

  let availableSeat = null;

  for (
    let seat = 1;
    seat <= room.maxPlayers;
    seat++
  ) {
    const occupied = room.players.some(
      (player) => player.seat === seat
    );

    const locked =
      room.gameType === "RPS" &&
      room.lockedSeats.includes(seat);

    if (!occupied && !locked) {
      availableSeat = seat;
      break;
    }
  }

  // ---------------------------------------------------
  // KHÔNG CÒN GHẾ
  // ---------------------------------------------------

  if (availableSeat === null) {
    return res.status(400).json({
      message:
        "Không còn ghế trống.",
    });
  }

  // ---------------------------------------------------
  // TẠO PLAYER
  // ---------------------------------------------------

  const playerId = createPlayerId();

  const newPlayer = {
    id: playerId,

    name: playerName,

    seat: availableSeat,

    isHost: false,
  };

  room.players.push(newPlayer);

  // ---------------------------------------------------
  // KIỂM TRA ĐỦ NGƯỜI
  // ---------------------------------------------------

  const wasStarted = room.gameStarted;

  updateRoomStatus(room);

  // ---------------------------------------------------
  // CỜ TƯỚNG / CARO
  // ---------------------------------------------------
  //
  // Người thứ 2 vào -> bắt đầu game.
  // ---------------------------------------------------

  if (
    room.gameType !== "RPS" &&
    room.players.length >= room.minPlayers
  ) {
    room.gameStarted = true;
  }

  // ---------------------------------------------------
  // OẲN TÙ TÌ
  // ---------------------------------------------------
  //
  // Đủ 2 người -> bắt đầu.
  // ---------------------------------------------------

  if (
    room.gameType === "RPS" &&
    room.players.length >= room.minPlayers
  ) {
    room.gameStarted = true;
  }

  // ---------------------------------------------------
  // REALTIME
  // ---------------------------------------------------

  emitRoomsUpdated();

  emitRoomUpdated(room);

  // ---------------------------------------------------
  // GAME BẮT ĐẦU
  // ---------------------------------------------------

  if (!wasStarted && room.gameStarted) {
    emitGameStarted(room);
  }

  // ---------------------------------------------------
  // RESPONSE
  // ---------------------------------------------------

  res.json({
    room,

    player: newPlayer,
  });
});

// =====================================================
// BẮT ĐẦU GAME THỦ CÔNG
// =====================================================
//
// Endpoint này dành cho trường hợp frontend có nút
// "Bắt đầu game".
//
// Chỉ chủ phòng được bấm.
//
// Phải đủ số người tối thiểu.
// =====================================================

app.post("/api/rooms/:roomId/start", (req, res) => {
  const { roomId } = req.params;

  const { playerId } = req.body;

  const room = rooms.find(
    (item) => item.id === roomId
  );

  if (!room) {
    return res.status(404).json({
      message: "Không tìm thấy phòng.",
    });
  }

  // ---------------------------------------------------
  // TÌM PLAYER
  // ---------------------------------------------------

  const player = room.players.find(
    (item) => item.id === playerId
  );

  if (!player) {
    return res.status(403).json({
      message:
        "Bạn không thuộc phòng này.",
    });
  }

  // ---------------------------------------------------
  // HOST
  // ---------------------------------------------------

  if (!player.isHost) {
    return res.status(403).json({
      message:
        "Chỉ chủ phòng mới có thể bắt đầu game.",
    });
  }

  // ---------------------------------------------------
  // ĐÃ BẮT ĐẦU
  // ---------------------------------------------------

  if (room.gameStarted) {
    return res.status(400).json({
      message:
        "Game đã bắt đầu.",
    });
  }

  // ---------------------------------------------------
  // ĐỦ NGƯỜI
  // ---------------------------------------------------

  if (!isRoomReady(room)) {
    return res.status(400).json({
      message:
        `Cần ít nhất ${room.minPlayers} người để bắt đầu.`,
    });
  }

  // ---------------------------------------------------
  // START
  // ---------------------------------------------------

  room.status = "PLAYING";

  room.gameStarted = true;

  // ---------------------------------------------------
  // REALTIME
  // ---------------------------------------------------

  emitRoomsUpdated();

  emitRoomUpdated(room);

  emitGameStarted(room);

  // ---------------------------------------------------
  // RESPONSE
  // ---------------------------------------------------

  res.json({
    message: "Game đã bắt đầu.",

    room,
  });
});

// =====================================================
// KHÓA GHẾ
// =====================================================
//
// CHỈ OẲN TÙ TÌ ĐƯỢC KHÓA GHẾ.
// =====================================================

app.post(
  "/api/rooms/:roomId/seats/:seat/lock",
  (req, res) => {
    const {
      roomId,
      seat,
    } = req.params;

    const { playerId } = req.body;

    const room = rooms.find(
      (item) => item.id === roomId
    );

    if (!room) {
      return res.status(404).json({
        message:
          "Không tìm thấy phòng.",
      });
    }

    // ---------------------------------------------------
    // CHỈ RPS
    // ---------------------------------------------------

    const config =
      GAME_CONFIG[room.gameType];

    if (!config.canLockSeats) {
      return res.status(400).json({
        message:
          "Chỉ phòng Oẳn tù tì mới có thể khóa ghế.",
      });
    }

    // ---------------------------------------------------
    // GAME ĐÃ BẮT ĐẦU
    // ---------------------------------------------------

    if (room.gameStarted) {
      return res.status(400).json({
        message:
          "Không thể khóa ghế khi game đã bắt đầu.",
      });
    }

    // ---------------------------------------------------
    // HOST
    // ---------------------------------------------------

    const host = room.players.find(
      (player) =>
        player.id === playerId &&
        player.isHost
    );

    if (!host) {
      return res.status(403).json({
        message:
          "Chỉ chủ phòng mới có thể khóa ghế.",
      });
    }

    const seatNumber = Number(seat);

    // ---------------------------------------------------
    // GHẾ HỢP LỆ
    // ---------------------------------------------------

    if (
      seatNumber < 1 ||
      seatNumber > room.maxPlayers
    ) {
      return res.status(400).json({
        message:
          "Ghế không hợp lệ.",
      });
    }

    // ---------------------------------------------------
    // GHẾ ĐANG CÓ NGƯỜI
    // ---------------------------------------------------

    const occupied = room.players.some(
      (player) =>
        player.seat === seatNumber
    );

    if (occupied) {
      return res.status(400).json({
        message:
          "Không thể khóa ghế đang có người.",
      });
    }

    // ---------------------------------------------------
    // ĐÃ KHÓA
    // ---------------------------------------------------

    if (
      room.lockedSeats.includes(seatNumber)
    ) {
      return res.status(400).json({
        message:
          "Ghế đã được khóa.",
      });
    }

    // ---------------------------------------------------
    // KHÓA
    // ---------------------------------------------------

    room.lockedSeats.push(seatNumber);

    room.lockedSeats.sort(
      (a, b) => a - b
    );

    // ---------------------------------------------------
    // REALTIME
    // ---------------------------------------------------

    emitRoomsUpdated();

    emitRoomUpdated(room);

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    res.json({
      message:
        `Đã khóa ghế ${seatNumber}.`,

      room,
    });
  }
);

// =====================================================
// MỞ GHẾ
// =====================================================
//
// CHỈ OẲN TÙ TÌ ĐƯỢC MỞ GHẾ.
// =====================================================

app.post(
  "/api/rooms/:roomId/seats/:seat/unlock",
  (req, res) => {
    const {
      roomId,
      seat,
    } = req.params;

    const { playerId } = req.body;

    const room = rooms.find(
      (item) => item.id === roomId
    );

    if (!room) {
      return res.status(404).json({
        message:
          "Không tìm thấy phòng.",
      });
    }

    // ---------------------------------------------------
    // CHỈ RPS
    // ---------------------------------------------------

    const config =
      GAME_CONFIG[room.gameType];

    if (!config.canLockSeats) {
      return res.status(400).json({
        message:
          "Chỉ phòng Oẳn tù tì mới có thể mở ghế.",
      });
    }

    // ---------------------------------------------------
    // GAME ĐÃ BẮT ĐẦU
    // ---------------------------------------------------

    if (room.gameStarted) {
      return res.status(400).json({
        message:
          "Không thể mở ghế khi game đã bắt đầu.",
      });
    }

    // ---------------------------------------------------
    // HOST
    // ---------------------------------------------------

    const host = room.players.find(
      (player) =>
        player.id === playerId &&
        player.isHost
    );

    if (!host) {
      return res.status(403).json({
        message:
          "Chỉ chủ phòng mới có thể mở ghế.",
      });
    }

    const seatNumber = Number(seat);

    // ---------------------------------------------------
    // KIỂM TRA GHẾ
    // ---------------------------------------------------

    if (
      seatNumber < 1 ||
      seatNumber > room.maxPlayers
    ) {
      return res.status(400).json({
        message:
          "Ghế không hợp lệ.",
      });
    }

    // ---------------------------------------------------
    // MỞ GHẾ
    // ---------------------------------------------------

    room.lockedSeats =
      room.lockedSeats.filter(
        (seatItem) =>
          seatItem !== seatNumber
      );

    // ---------------------------------------------------
    // REALTIME
    // ---------------------------------------------------

    emitRoomsUpdated();

    emitRoomUpdated(room);

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    res.json({
      message:
        `Đã mở ghế ${seatNumber}.`,

      room,
    });
  }
);

// =====================================================
// KÍCH NGƯỜI CHƠI
// =====================================================
//
// Chủ phòng có thể kick khi game chưa bắt đầu.
// =====================================================

app.delete(
  "/api/rooms/:roomId/players/:targetPlayerId",
  (req, res) => {
    const {
      roomId,
      targetPlayerId,
    } = req.params;

    const { playerId } = req.body;

    const room = rooms.find(
      (item) => item.id === roomId
    );

    if (!room) {
      return res.status(404).json({
        message:
          "Không tìm thấy phòng.",
      });
    }

    // ---------------------------------------------------
    // GAME ĐÃ BẮT ĐẦU
    // ---------------------------------------------------

    if (room.gameStarted) {
      return res.status(400).json({
        message:
          "Không thể kích người khi game đã bắt đầu.",
      });
    }

    // ---------------------------------------------------
    // KIỂM TRA HOST
    // ---------------------------------------------------

    const host = room.players.find(
      (player) =>
        player.id === playerId &&
        player.isHost
    );

    if (!host) {
      return res.status(403).json({
        message:
          "Chỉ chủ phòng mới có thể kích người chơi.",
      });
    }

    // ---------------------------------------------------
    // TÌM PLAYER
    // ---------------------------------------------------

    const targetIndex =
      room.players.findIndex(
        (player) =>
          player.id === targetPlayerId
      );

    if (targetIndex === -1) {
      return res.status(404).json({
        message:
          "Không tìm thấy người chơi.",
      });
    }

    const targetPlayer =
      room.players[targetIndex];

    // ---------------------------------------------------
    // KHÔNG KICK HOST
    // ---------------------------------------------------

    if (targetPlayer.isHost) {
      return res.status(400).json({
        message:
          "Không thể kích chủ phòng.",
      });
    }

    // ---------------------------------------------------
    // XÓA PLAYER
    // ---------------------------------------------------

    room.players.splice(
      targetIndex,
      1
    );

    // ---------------------------------------------------
    // CẬP NHẬT STATUS
    // ---------------------------------------------------

    updateRoomStatus(room);

    // ---------------------------------------------------
    // REALTIME
    // ---------------------------------------------------

    emitRoomsUpdated();

    emitRoomUpdated(room);

    // ---------------------------------------------------
    // THÔNG BÁO NGƯỜI BỊ KICK
    // ---------------------------------------------------

    try {
      const io = getIO();

      io.emit(
        "kickedFromRoom",
        {
          roomId: room.id,

          playerId: targetPlayerId,

          message:
            "Bạn đã bị chủ phòng kích khỏi phòng.",
        }
      );
    } catch (error) {
      console.log(
        "Socket.IO chưa sẵn sàng."
      );
    }

    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    res.json({
      message:
        "Đã kích người chơi.",

      room,
    });
  }
);

// =====================================================
// EXPORT
// =====================================================

export default app;