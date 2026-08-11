function CountdownPanel({ game }) {

  if (game.gameState !== "COUNTDOWN") {

    return null;

  }

  return (

    <section>

      <h2>⏳ Chuẩn bị...</h2>

      <h1>{game.countdown}</h1>

      <hr/>

    </section>

  );

}

export default CountdownPanel;