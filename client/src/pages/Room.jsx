import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { joinRoom } from "../services/roomService";
import socket from "../socket/socket";

import ChessGame from "../game/ChessGame";
import CaroGame from "../game/CaroGame";

const API = "http://localhost:5000/api";

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [room, setRoom] = useState(null);

  const [playerId, setPlayerId] = useState(
    localStorage.getItem(`room_${roomId}_playerId`) || ""
  );

  const [playerName, setPlayerName] = useState(
    localStorage.getItem("playerName") || ""
  );

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ROOM
  // =====================================================

  const loadRoom = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/rooms/${roomId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể tải phòng."
        );
      }

      console.log("🏠 ROOM:", data);
      console.log("🎮 GAME TYPE:", data.gameType);

      setRoom(data);
    } catch (err) {
      console.error("❌ Lỗi tải phòng:", err);

      setError(
        err.message || "Không thể tải phòng."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // THAM GIA PHÒNG
  // =====================================================

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError("Vui lòng nhập tên người chơi.");
      return;
    }

    try {
      setJoining(true);
      setError("");

      const result = await joinRoom(
        roomId,
        playerName.trim()
      );

      console.log("🎮 JOIN ROOM:", result);

      if (result.player?.id) {
        setPlayerId(result.player.id);

        localStorage.setItem(
          `room_${roomId}_playerId`,
          result.player.id
        );
      }

      localStorage.setItem(
        "playerName",
        playerName.trim()
      );

      if (result.room) {
        setRoom(result.room);
      }
    } catch (err) {
      console.error(
        "❌ Lỗi tham gia phòng:",
        err
      );

      setError(
        err.message ||
          "Không thể tham gia phòng."
      );
    } finally {
      setJoining(false);
    }
  };

  // =====================================================
  // BẮT ĐẦU GAME
  // =====================================================

  const handleStartGame = async () => {
    if (!playerId) {
      setError(
        "Không xác định được người chơi."
      );
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API}/rooms/${roomId}/start`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            playerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Không thể bắt đầu game."
        );
      }

      console.log(
        "🚀 GAME STARTED:",
        data.room
      );

      setRoom(data.room);
    } catch (err) {
      console.error(
        "❌ Lỗi bắt đầu game:",
        err
      );

      setError(
        err.message ||
          "Không thể bắt đầu game."
      );
    }
  };

  // =====================================================
  // KHÓA GHẾ
  // CHỈ OẲN TÙ TÌ ĐƯỢC KHÓA
  // =====================================================

  const handleLockSeat = async (seat) => {
    if (room?.gameType !== "RPS") {
      return;
    }

    if (!playerId) {
      setError(
        "Không xác định được chủ phòng."
      );
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API}/rooms/${roomId}/seats/${seat}/lock`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            playerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Không thể khóa ghế."
        );
      }

      setRoom(data.room);
    } catch (err) {
      console.error(
        "❌ Lỗi khóa ghế:",
        err
      );

      setError(
        err.message ||
          "Không thể khóa ghế."
      );
    }
  };

  // =====================================================
  // MỞ GHẾ
  // CHỈ OẲN TÙ TÌ ĐƯỢC MỞ
  // =====================================================

  const handleUnlockSeat = async (seat) => {
    if (room?.gameType !== "RPS") {
      return;
    }

    if (!playerId) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API}/rooms/${roomId}/seats/${seat}/unlock`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            playerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Không thể mở ghế."
        );
      }

      setRoom(data.room);
    } catch (err) {
      console.error(
        "❌ Lỗi mở ghế:",
        err
      );

      setError(
        err.message ||
          "Không thể mở ghế."
      );
    }
  };

  // =====================================================
  // KÍCH NGƯỜI CHƠI
  // =====================================================

  const handleKick = async (
    targetPlayerId,
    targetName
  ) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn kích ${targetName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API}/rooms/${roomId}/players/${targetPlayerId}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            playerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Không thể kích người chơi."
        );
      }

      setRoom(data.room);
    } catch (err) {
      console.error(
        "❌ Lỗi kích người chơi:",
        err
      );

      setError(
        err.message ||
          "Không thể kích người chơi."
      );
    }
  };

  // =====================================================
  // SOCKET.IO
  // =====================================================

  useEffect(() => {
    loadRoom();

    // ---------------------------------------------------
    // ROOM UPDATED
    // ---------------------------------------------------

    const handleRoomUpdated = (
      updatedRoom
    ) => {
      if (
        !updatedRoom ||
        String(updatedRoom.id) !==
          String(roomId)
      ) {
        return;
      }

      console.log(
        "🔄 ROOM UPDATED:",
        updatedRoom
      );

      setRoom(updatedRoom);
    };

    // ---------------------------------------------------
    // GAME STARTED
    // ---------------------------------------------------

    const handleGameStarted = (data) => {
      if (
        String(data?.roomId) !==
        String(roomId)
      ) {
        return;
      }

      console.log(
        "🚀 GAME STARTED SOCKET:",
        data
      );

      if (data.room) {
        setRoom(data.room);
      } else {
        loadRoom();
      }
    };

    // ---------------------------------------------------
    // BỊ KÍCH
    // ---------------------------------------------------

    const handleKicked = (data) => {
      if (
        String(data?.roomId) !==
        String(roomId)
      ) {
        return;
      }

      if (
        String(data?.playerId) !==
        String(playerId)
      ) {
        return;
      }

      localStorage.removeItem(
        `room_${roomId}_playerId`
      );

      alert(
        data.message ||
          "Bạn đã bị kích khỏi phòng."
      );

      navigate("/lobby");
    };

    socket.on(
      "roomUpdated",
      handleRoomUpdated
    );

    socket.on(
      "gameStarted",
      handleGameStarted
    );

    socket.on(
      "kickedFromRoom",
      handleKicked
    );

    return () => {
      socket.off(
        "roomUpdated",
        handleRoomUpdated
      );

      socket.off(
        "gameStarted",
        handleGameStarted
      );

      socket.off(
        "kickedFromRoom",
        handleKicked
      );
    };
  }, [roomId, playerId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
        }}
      >
        ⏳ Đang tải phòng...
      </div>
    );
  }

  // =====================================================
  // ROOM KHÔNG TỒN TẠI
  // =====================================================

  if (!room) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
        }}
      >
        <h2>
          ❌ Không tìm thấy phòng
        </h2>

        {error && (
          <p>{error}</p>
        )}

        <button
          type="button"
          onClick={() =>
            navigate("/lobby")
          }
        >
          ← Quay lại sảnh
        </button>
      </div>
    );
  }

  // =====================================================
  // DATA PHÒNG
  // =====================================================

  const players = Array.isArray(
    room.players
  )
    ? room.players
    : [];

  const maxPlayers =
    room.maxPlayers || 2;

  const minPlayers =
    room.minPlayers || 2;

  const myPlayer = players.find(
    (player) =>
      String(player.id) ===
      String(playerId)
  );

  const isHost =
    myPlayer?.isHost === true;

  const playerCount =
    players.length;

  // =====================================================
  // KIỂM TRA LOẠI GAME
  // =====================================================

  const isCaro =
    room.gameType === "CARO";

  const isChess =
    room.gameType === "CHESS";

  const isRPS =
    room.gameType === "RPS";

  // =====================================================
  // ĐỦ NGƯỜI
  // =====================================================

  const hasEnoughPlayers =
    playerCount >= minPlayers;

  // =====================================================
  // CHỈ CHO PHÉP CHỦ PHÒNG START
  // =====================================================

  const canStart =
    isHost &&
    hasEnoughPlayers &&
    room.status === "WAITING";

  // =====================================================
  // GAME ĐÃ BẮT ĐẦU
  // =====================================================

  if (room.status === "PLAYING") {

    // ===================================================
    // CỜ CARO
    // ===================================================

    if (isCaro) {
      return (
        <main
          style={{
            minHeight: "100vh",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <CaroGame
            room={room}
            playerId={playerId}
          />
        </main>
      );
    }

    // ===================================================
    // CỜ TƯỚNG
    // ===================================================

    if (isChess) {
      return (
        <main
          style={{
            minHeight: "100vh",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <ChessGame
            room={room}
            playerId={playerId}
          />
        </main>
      );
    }

    // ===================================================
    // OẲN TÙ TÌ
    // ===================================================

    if (isRPS) {
      return (
        <main
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1>
            ✊ Oẳn tù tì
          </h1>

          <p>
            👥 Người chơi:{" "}
            {playerCount}/{maxPlayers}
          </p>

          <h2>
            🎮 Game đã bắt đầu!
          </h2>

          <p>
            Phần gameplay Oẳn tù tì
            sẽ được hoàn thiện tiếp
            theo.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/lobby")
            }
          >
            ← Quay lại sảnh
          </button>
        </main>
      );
    }

    // ===================================================
    // GAME KHÔNG XÁC ĐỊNH
    // ===================================================

    return (
      <main
        style={{
          textAlign: "center",
          padding: "50px",
        }}
      >
        <h2>
          ❌ Không xác định được
          loại game
        </h2>

        <p>
          gameType:{" "}
          {room.gameType ||
            "undefined"}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/lobby")
          }
        >
          ← Quay lại sảnh
        </button>
      </main>
    );
  }

  // =====================================================
  // PHÒNG ĐANG CHỜ
  // =====================================================

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "15px",
        }}
      >
        <div>

          <h1>
            {isChess && "♟️"}
            {isCaro && "⭕"}
            {isRPS && "✊"}{" "}

            {room.roomName ||
              "xin chỉ giáo"}
          </h1>

          <p>
            🎮{" "}
            {room.gameName ||
              (isChess
                ? "Cờ tướng"
                : isCaro
                ? "Cờ caro"
                : "Oẳn tù tì")}
          </p>

          <p>
            Phòng #{room.id}
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/lobby")
          }
        >
          ← Sảnh
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* =================================================
          THÔNG TIN PHÒNG
      ================================================= */}

      <div
        style={{
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "10px",
          background: "#f5f5f5",
        }}
      >
        <p>
          <strong>
            🏠 Tên phòng:
          </strong>{" "}
          {room.roomName ||
            "xin chỉ giáo"}
        </p>

        <p>
          <strong>
            🎮 Game:
          </strong>{" "}
          {room.gameName ||
            "Game"}
        </p>

        <p>
          <strong>
            👥 Người chơi:
          </strong>{" "}
          {playerCount}/{maxPlayers}
        </p>

        <p>
          <strong>
            ▶️ Tối thiểu:
          </strong>{" "}
          {minPlayers} người
        </p>

        <p>
          <strong>
            💰 Cược:
          </strong>{" "}
          {room.bet || 0} Coin
        </p>
      </div>

      {/* =================================================
          CARO / CỜ TƯỚNG KHI CHƯA ĐỦ 2 NGƯỜI
      ================================================= */}

      {(isCaro || isChess) &&
        playerCount < 2 && (
          <div
            style={{
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "#fff7ed",
              border:
                "1px solid #fed7aa",
              textAlign: "center",
            }}
          >
            <h2>
              {isCaro
                ? "⭕ Bàn cờ caro"
                : "♟️ Bàn cờ tướng"}
            </h2>

            <p
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#9a3412",
              }}
            >
              ⏳ Chờ người chơi khác
              tham gia...
            </p>

            <p>
              👥 Người chơi:{" "}
              {playerCount}/2
            </p>

            <p>
              Khi người chơi thứ 2
              tham gia, game sẽ
              tự động bắt đầu.
            </p>
          </div>
        )}

      {/* =================================================
          FORM THAM GIA
      ================================================= */}

      {!myPlayer &&
        room.status === "WAITING" && (
          <div
            style={{
              padding: "20px",
              marginBottom: "20px",
              border:
                "1px solid #ddd",
              borderRadius: "10px",
            }}
          >
            <h3>
              👤 Tham gia phòng
            </h3>

            <input
              value={playerName}
              onChange={(event) =>
                setPlayerName(
                  event.target.value
                )
              }
              placeholder="Tên người chơi"
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding: "10px",
                marginBottom:
                  "10px",
              }}
            />

            <button
              type="button"
              onClick={handleJoin}
              disabled={joining}
              style={{
                padding:
                  "10px 20px",
              }}
            >
              {joining
                ? "⏳ Đang tham gia..."
                : "🎮 Tham gia"}
            </button>
          </div>
        )}

      {/* =================================================
          GHẾ NGƯỜI CHƠI
      ================================================= */}

      <h2>
        🪑 Ghế người chơi
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        {Array.from(
          { length: maxPlayers },
          (_, index) => {
            const seat =
              index + 1;

            const player =
              players.find(
                (item) =>
                  item.seat === seat
              );

            const locked =
              Array.isArray(
                room.lockedSeats
              ) &&
              room.lockedSeats.includes(
                seat
              );

            return (
              <div
                key={seat}
                style={{
                  minHeight:
                    "140px",
                  padding:
                    "20px",
                  border:
                    "1px solid #ccc",
                  borderRadius:
                    "10px",
                  background:
                    player
                      ? "#f0fdf4"
                      : locked
                      ? "#f3f4f6"
                      : "#fff",
                }}
              >
                <h3>
                  🪑 Ghế {seat}
                </h3>

                {/* =======================================
                    GHẾ CÓ NGƯỜI
                ======================================= */}

                {player ? (
                  <>
                    <p
                      style={{
                        fontWeight:
                          "bold",
                        fontSize:
                          "18px",
                      }}
                    >
                      {player.isHost
                        ? "👑"
                        : "👤"}{" "}
                      {player.name}
                    </p>

                    {player.isHost && (
                      <p>
                        Chủ phòng
                      </p>
                    )}

                    {/* Chủ phòng có thể kích */}
                    {isHost &&
                      !player.isHost && (
                        <button
                          type="button"
                          onClick={() =>
                            handleKick(
                              player.id,
                              player.name
                            )
                          }
                          style={{
                            color:
                              "#dc2626",
                          }}
                        >
                          ❌ Kích
                        </button>
                      )}
                  </>
                ) : locked ? (

                  /* =====================================
                     GHẾ BỊ KHÓA
                  ===================================== */

                  <>
                    <p>
                      🔒 Ghế đã khóa
                    </p>

                    {isHost &&
                      isRPS && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUnlockSeat(
                              seat
                            )
                          }
                        >
                          🔓 Mở ghế
                        </button>
                      )}
                  </>

                ) : (

                  /* =====================================
                     GHẾ TRỐNG
                  ===================================== */

                  <>
                    <p
                      style={{
                        color:
                          "#16a34a",
                      }}
                    >
                      🟢 Ghế trống
                    </p>

                    {/* CHỈ RPS ĐƯỢC KHÓA GHẾ */}

                    {isHost &&
                      isRPS && (
                        <button
                          type="button"
                          onClick={() =>
                            handleLockSeat(
                              seat
                            )
                          }
                        >
                          🔒 Khóa ghế
                        </button>
                      )}
                  </>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* =================================================
          TRẠNG THÁI BẮT ĐẦU
      ================================================= */}

      <div
        style={{
          padding: "20px",
          border:
            "1px solid #ddd",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >

        {isHost ? (

          <>
            {!hasEnoughPlayers ? (

              <p>
                ⏳ Cần ít nhất{" "}
                <strong>
                  {minPlayers}
                </strong>{" "}
                người để bắt đầu.
              </p>

            ) : (

              <p
                style={{
                  color:
                    "#16a34a",
                  fontWeight:
                    "bold",
                }}
              >
                ✅ Đã đủ người.
              </p>
            )}

            {/* -------------------------------------------
                CARO / CHESS:
                ĐỦ 2 NGƯỜI THÌ SERVER TỰ START
            ------------------------------------------- */}

            {(isCaro || isChess) &&
              hasEnoughPlayers && (
                <p
                  style={{
                    color:
                      "#2563eb",
                    fontWeight:
                      "bold",
                  }}
                >
                  🚀 Đủ 2 người.
                  Game sẽ tự động
                  bắt đầu...
                </p>
              )}

            {/* -------------------------------------------
                RPS:
                CÓ THỂ START TỪ 2 NGƯỜI
            ------------------------------------------- */}

            {isRPS &&
              hasEnoughPlayers && (
                <button
                  type="button"
                  onClick={
                    handleStartGame
                  }
                  disabled={!canStart}
                  style={{
                    padding:
                      "12px 25px",
                    border: "none",
                    borderRadius:
                      "8px",
                    background:
                      canStart
                        ? "#16a34a"
                        : "#9ca3af",
                    color: "#fff",
                    fontWeight:
                      "bold",
                    cursor:
                      canStart
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  ▶️ Bắt đầu game
                </button>
              )}
          </>

        ) : (

          <p>
            ⏳ Đang chờ chủ phòng
            bắt đầu...
          </p>

        )}

      </div>
    </main>
  );
}

export default Room;