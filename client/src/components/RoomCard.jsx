import { useNavigate } from "react-router-dom";

function RoomCard({ room }) {
  const navigate = useNavigate();

  // =====================================================
  // SỐ NGƯỜI CHƠI HIỆN TẠI
  // =====================================================

  const playerCount = Array.isArray(room.players)
    ? room.players.length
    : typeof room.players === "number"
      ? room.players
      : 0;

  // =====================================================
  // SỐ GHẾ TỐI ĐA
  // =====================================================

  const maxPlayers = room.maxPlayers || 2;

  // =====================================================
  // KIỂM TRA PHÒNG ĐẦY
  // =====================================================

  const isFull = playerCount >= maxPlayers;

  // =====================================================
  // TÊN GAME
  // =====================================================

  const getGameName = () => {
    if (room.gameType === "CHESS") {
      return "♟️ Cờ tướng";
    }

    if (room.gameType === "CARO") {
      return "⭕ Cờ caro";
    }

    if (room.gameType === "RPS") {
      return "✊ Oẳn tù tì";
    }

    return room.gameName || "Game";
  };

  // =====================================================
  // XEM TRẬN
  // =====================================================

  const handleViewGame = () => {
    navigate(`/room/${room.id}`);
  };

  // =====================================================
  // THAM GIA PHÒNG
  // =====================================================

  const handleJoin = () => {
    if (isFull) {
      return;
    }

    navigate(`/room/${room.id}`);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "18px",
        marginBottom: "15px",
        background: "#fff",
        boxShadow:
          "0 2px 6px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* =================================================
          TÊN PHÒNG
      ================================================= */}

      <h3
        style={{
          marginTop: 0,
          marginBottom: "12px",
        }}
      >
        🏠 {room.roomName || "xin chỉ giáo"}
      </h3>

      {/* =================================================
          GAME
      ================================================= */}

      <p>
        <strong>🎮 Game:</strong>{" "}
        {getGameName()}
      </p>

      {/* =================================================
          NGƯỜI CHƠI
      ================================================= */}

      <p>
        <strong>👥 Người chơi:</strong>{" "}
        {playerCount} / {maxPlayers}
      </p>

      {/* =================================================
          TIỀN CƯỢC
      ================================================= */}

      <p>
        <strong>💰 Tiền cược:</strong>{" "}
        {room.bet || 0} Coin
      </p>

      {/* =================================================
          TRẠNG THÁI
      ================================================= */}

      <p>
        <strong>📢 Trạng thái:</strong>{" "}

        {room.status === "PLAYING" ? (
          <span
            style={{
              color: "#dc2626",
              fontWeight: "bold",
            }}
          >
            🔴 Đang chơi
          </span>
        ) : (
          <span
            style={{
              color: "#16a34a",
              fontWeight: "bold",
            }}
          >
            🟢 Đang chờ
          </span>
        )}
      </p>

      {/* =================================================
          NÚT
      ================================================= */}

      {room.status === "PLAYING" ? (
        // -------------------------------------------------
        // PHÒNG ĐANG CHƠI
        // -------------------------------------------------

        <button
          type="button"
          onClick={handleViewGame}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          👀 Xem đấu
        </button>
      ) : (
        // -------------------------------------------------
        // PHÒNG ĐANG CHỜ
        // -------------------------------------------------

        <button
          type="button"
          onClick={handleJoin}
          disabled={isFull}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: isFull
              ? "#9ca3af"
              : "#16a34a",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: isFull
              ? "not-allowed"
              : "pointer",
          }}
        >
          {isFull
            ? "🚫 Phòng đầy"
            : "🎮 Tham gia"}
        </button>
      )}
    </div>
  );
}

export default RoomCard;