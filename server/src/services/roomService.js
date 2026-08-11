import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Intellectual Battle API is running",
  });
});

const rooms = [
  {
    id: "001",
    host: "Ola",
    gameType: "RPS",
    gameName: "Oẳn tù tì",
    maxPlayers: 3,
    players: 1,
    status: "WAITING",
    bet: 0,
  },
  {
    id: "002",
    host: "David",
    gameType: "CHESS",
    gameName: "Cờ tướng",
    maxPlayers: 2,
    players: 1,
    status: "WAITING",
    bet: 150,
  },
  {
    id: "003",
    host: "Alex",
    gameType: "CARO",
    gameName: "Cờ caro",
    maxPlayers: 2,
    players: 1,
    status: "WAITING",
    bet: 50,
  },
];

app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

app.post("/api/rooms", (req, res) => {
  const { host, gameType } = req.body;

  if (!host || !gameType) {
    return res.status(400).json({
      message: "Thiếu host hoặc gameType.",
    });
  }

  const gameConfig = {
    RPS: {
      gameName: "Oẳn tù tì",
      maxPlayers: 3,
    },

    CHESS: {
      gameName: "Cờ tướng",
      maxPlayers: 2,
    },

    CARO: {
      gameName: "Cờ caro",
      maxPlayers: 2,
    },
  };

  const config = gameConfig[gameType];

  if (!config) {
    return res.status(400).json({
      message: "Loại game không hợp lệ.",
    });
  }

  const newRoom = {
    id: String(rooms.length + 1).padStart(3, "0"),
    host: host.trim(),
    gameType,
    gameName: config.gameName,
    maxPlayers: config.maxPlayers,
    players: 1,
    status: "WAITING",
    bet: 0,
  };

  rooms.push(newRoom);

  res.status(201).json(newRoom);
});

/*
 * Tham gia phòng
 */
app.post("/api/rooms/:roomId/join", (req, res) => {
  const { roomId } = req.params;

  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return res.status(404).json({
      message: "Không tìm thấy phòng.",
    });
  }

  if (room.status !== "WAITING") {
    return res.status(400).json({
      message: "Phòng đã bắt đầu chơi.",
    });
  }

  if (room.players >= room.maxPlayers) {
    return res.status(400).json({
      message: "Phòng đã đầy.",
    });
  }

  room.players += 1;

  if (room.players >= room.maxPlayers) {
    room.status = "PLAYING";
  }

  res.json(room);
});

export default app;