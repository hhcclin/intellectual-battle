function ChoicePanel({ game }) {

  if (game.gameState !== "CHOOSING") {

    return null;

  }

  return (

    <section>

      <h2>✊ Chọn nước đi</h2>

      <button onClick={()=>game.setChoice("ROCK")}>

        ✊ Búa

      </button>

      {" "}

      <button onClick={()=>game.setChoice("PAPER")}>

        ✋ Bao

      </button>

      {" "}

      <button onClick={()=>game.setChoice("SCISSORS")}>

        ✌️ Kéo

      </button>

      <hr/>

    </section>

  );

}

export default ChoicePanel;