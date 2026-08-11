import { useEffect, useState } from "react";
import RoomCard from "./RoomCard";
import socket from "../socket/socket";
import { getRooms } from "../services/roomService";

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getRooms();

        setRooms(data);
      } catch (err) {
        console.error(err);

        setError(
          "Không thể tải danh sách phòng."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRooms();

    const handleRoomsUpdated = (newRooms) => {
      console.log(
        "Realtime rooms:",
        newRooms
      );

      setRooms(newRooms);
    };

    socket.on(
      "roomsUpdated",
      handleRoomsUpdated
    );

    return () => {
      socket.off(
        "roomsUpdated",
        handleRoomsUpdated
      );
    };
  }, []);

  return (
    <section
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h2>🎮 Danh sách phòng</h2>

      {loading && (
        <p>⏳ Đang tải danh sách phòng...</p>
      )}

      {error && (
        <p
          style={{
            color: "#dc2626",
          }}
        >
          ❌ {error}
        </p>
      )}

      {!loading &&
        !error &&
        rooms.length === 0 && (
          <p>
            Chưa có phòng nào.
          </p>
        )}

      {!loading &&
        rooms.length > 0 && (
          <div>
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
              />
            ))}
          </div>
        )}
    </section>
  );
}

export default RoomList;