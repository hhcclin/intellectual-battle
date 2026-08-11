import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../services/roomService";

const GAME_CONFIG = {
  CHESS: {
    name: "Cờ tướng",
    icon: "♟️",
    minPlayers: 2,
    maxPlayers: 2,
    description: "Trò chơi đối kháng dành cho 2 người.",
  },

  RPS: {
    name: "Oẳn tù tì",
    icon: "✊",
    minPlayers: 2,
    maxPlayers: 3,
    description: "Có thể bắt đầu với 2 người và tối đa 3 người.",
  },

  CARO: {
    name: "Cờ caro",
    icon: "⭕",
    minPlayers: 2,
    maxPlayers: 2,
    description: "Trò chơi đối kháng dành cho 2 người.",
  },
};

function CreateRoom() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [roomName, setRoomName] = useState("xin chỉ giáo");

  const [gameType, setGameType] = useState("RPS");

  const [bet, setBet] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // GAME ĐANG CHỌN
  // =====================================================

  const selectedGame = GAME_CONFIG[gameType];

  // =====================================================
  // TẠO PHÒNG
  // =====================================================

  const handleCreateRoom = async (event) => {
    event.preventDefault();

    setError("");

    const cleanRoomName = roomName.trim();

    if (!cleanRoomName) {
      setError("Vui lòng nhập tên phòng.");
      return;
    }

    if (!GAME_CONFIG[gameType]) {
      setError("Vui lòng chọn một trò chơi.");
      return;
    }

    try {
      setLoading(true);

      const result = await createRoom({
        roomName: cleanRoomName,
        gameType,
        bet: Number(bet) || 0,
      });

      console.log("🎮 Phòng đã tạo:", result);

      if (!result || !result.room) {
        throw new Error(
          "Server không trả về thông tin phòng."
        );
      }

      if (result.playerId) {
        localStorage.setItem(
          `room_${result.room.id}_playerId`,
          result.playerId
        );
      }

      navigate(`/room/${result.room.id}`);
    } catch (err) {
      console.error("❌ Lỗi tạo phòng:", err);

      setError(
        err.message ||
          "Không thể tạo phòng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // QUAY LẠI
  // =====================================================

  const handleBack = () => {
    if (!loading) {
      navigate("/lobby");
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <h1>🎮 Tạo phòng</h1>

        <p
          style={{
            color: "#666",
          }}
        >
          Tạo phòng và chờ người chơi tham gia
        </p>
      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleCreateRoom}
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "25px",
          background: "#fff",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* =================================================
            TÊN PHÒNG
        ================================================= */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <label
            htmlFor="roomName"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            🏠 Tên phòng
          </label>

          <input
            id="roomName"
            type="text"
            value={roomName}
            onChange={(event) =>
              setRoomName(event.target.value)
            }
            placeholder="Nhập tên phòng"
            disabled={loading}
            maxLength={50}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </div>

        {/* =================================================
            CHỌN GAME
        ================================================= */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "bold",
            }}
          >
            🎯 Chọn trò chơi
          </label>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {Object.entries(GAME_CONFIG).map(
              ([type, game]) => {
                const isSelected = gameType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    disabled={loading}
                    onClick={() => setGameType(type)}
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "10px",
                      border: isSelected
                        ? "2px solid #2563eb"
                        : "1px solid #ccc",
                      backgroundColor: isSelected
                        ? "#eff6ff"
                        : "#fff",
                      cursor: loading
                        ? "not-allowed"
                        : "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        {game.icon} {game.name}
                      </span>

                      {isSelected && (
                        <span>✅</span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      {game.description}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      👥 Tối đa: {game.maxPlayers} người
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* =================================================
            THÔNG TIN GAME
        ================================================= */}

        <div
          style={{
            marginBottom: "25px",
            padding: "16px",
            borderRadius: "10px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <h3
            style={{
              marginTop: 0,
            }}
          >
            {selectedGame.icon} {selectedGame.name}
          </h3>

          <p>
            <strong>👥 Số ghế:</strong>{" "}
            {selectedGame.maxPlayers}
          </p>

          <p>
            <strong>▶️ Số người tối thiểu:</strong>{" "}
            {selectedGame.minPlayers}
          </p>

          {gameType === "RPS" && (
            <p
              style={{
                marginBottom: 0,
                color: "#2563eb",
              }}
            >
              💡 Oẳn tù tì có thể bắt đầu với 2 người.
              Ghế thứ 3 có thể được khóa bởi chủ phòng.
            </p>
          )}
        </div>

        {/* =================================================
            TIỀN CƯỢC
        ================================================= */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <label
            htmlFor="bet"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            💰 Tiền cược
          </label>

          <input
            id="bet"
            type="number"
            min="0"
            value={bet}
            onChange={(event) =>
              setBet(event.target.value)
            }
            disabled={loading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* =================================================
            TẠO PHÒNG
        ================================================= */}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: loading
              ? "#9ca3af"
              : "#2563eb",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "⏳ Đang tạo phòng..."
            : "🚀 Tạo phòng"}
        </button>

        {/* =================================================
            QUAY LẠI
        ================================================= */}

        <button
          type="button"
          disabled={loading}
          onClick={handleBack}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#fff",
            color: "#333",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          ← Quay lại
        </button>
      </form>
    </main>
  );
}

export default CreateRoom;