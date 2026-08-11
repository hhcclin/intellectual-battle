import express from "express";
import { getIO } from "../socket/io.js";

import {
  getAllRooms,
  createRoom,
  joinRoom,
} from "../services/roomService.js";

const router = express.Router();

/**
 * GET /api/rooms
 */
router.get("/", (req, res) => {
  res.json(getAllRooms());
});

/**
 * POST /api/rooms
 */
router.post("/", (req, res) => {
  try {
    const { host, type, bet = 0 } = req.body;

    if (!host || !type) {
      return res.status(400).json({
        message: "Thiếu host hoặc type.",
      });
    }

    const room = createRoom({
      host,
      type,
      bet,
    });

    // Báo cho tất cả client cập nhật danh sách phòng
    getIO().emit("roomsUpdated", getAllRooms());

    return res.status(201).json(room);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

/**
 * POST /api/rooms/:roomId/join
 */
router.post("/:roomId/join", (req, res) => {
  try {
    const { roomId } = req.params;

    const room = joinRoom(roomId);

    // Báo realtime cho tất cả client
    getIO().emit("roomsUpdated", getAllRooms());

    return res.json({
      message: "Tham gia phòng thành công.",
      room,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

export default router;