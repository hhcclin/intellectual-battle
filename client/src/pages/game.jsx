import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../socket/socket";

function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [connected, setConnected] = useState(socket.connected);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleConnect = () => {
      console.log("🎮 Connected to game:", socket.id);
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log("❌ Disconnected from server");
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const handleBack = () => {
    navigate("/lobby");
  };

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <h1>🎮 Rock Paper Scissors</h1>

      <div
        style={{
          padding: "15px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <p>
          <strong>🏠 Phòng:</strong> #{roomId}
        </p>

        <p>
          <strong>🔌 Kết nối:</strong>{" "}
          {connected ? "🟢 Đã kết nối" : "🔴 Chưa kết nối"}
        </p>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "25px",
          textAlign: "center",
        }}
      >
        <h2>✊ ✋ ✌️</h2>

        <h3>Trận đấu</h3>

        <p>
          {message || "Đang chờ người chơi..."}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button onClick={() => setMessage("Bạn chọn ✊ Búa")}>
            ✊ Búa
          </button>

          <button onClick={() => setMessage("Bạn chọn ✋ Bao")}>
            ✋ Bao
          </button>

          <button onClick={() => setMessage("Bạn chọn ✌️ Kéo")}>
            ✌️ Kéo
          </button>
        </div>
      </div>

      <button
        onClick={handleBack}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
        }}
      >
        ← Quay lại Lobby
      </button>
    </main>
  );
}

export default Game;