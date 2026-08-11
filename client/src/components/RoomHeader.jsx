function RoomHeader({ roomId, roomType, status, gameState }) {
  return (
    <header>
      <h1>🎮 Room #{roomId}</h1>

      <p>
        <strong>Loại phòng:</strong> {roomType} người
      </p>

      <p>
        <strong>Trạng thái:</strong> {status}
      </p>

      <p>
        <strong>Game State:</strong> {gameState}
      </p>

      <hr />
    </header>
  );
}

export default RoomHeader;