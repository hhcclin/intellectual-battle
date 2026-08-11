function PlayerPanel() {
  return (
    <section>
      <h2>👥 Người chơi</h2>

      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        <h3>😀 Bạn</h3>

        <p>Sẵn sàng ✅</p>
      </div>

      <h3 style={{ textAlign: "center" }}>VS</h3>

      <div
        style={{
          border: "1px dashed gray",
          padding: "10px",
        }}
      >
        <h3>Chưa có người chơi</h3>

        <p>Đang chờ...</p>
      </div>

      <hr />
    </section>
  );
}

export default PlayerPanel;