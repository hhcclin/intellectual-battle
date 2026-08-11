function ResultPanel({ game }) {
  return (
    <section>
      <h2>🏆 Kết quả</h2>

      <p>{game.result}</p>

      <hr />
    </section>
  );
}

export default ResultPanel;