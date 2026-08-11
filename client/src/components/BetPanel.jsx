function BetPanel({ game }) {

  return (

    <section>

      <h2>💰 Tiền cược</h2>

      <input

        type="number"

        min="1"

        value={game.bet}

        onChange={(e)=>game.setBet(Number(e.target.value))}

      />

      <p>

        Tiền cược hiện tại:

        <strong> {game.bet}</strong>

      </p>

      <hr/>

    </section>

  );

}

export default BetPanel;