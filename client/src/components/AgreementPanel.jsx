function AgreementPanel({ game }) {

  return (

    <section>

      <h2>✅ Sẵn sàng</h2>

      <button

        onClick={()=>game.setReady(true)}

      >

        Tôi đã sẵn sàng

      </button>

      <hr/>

    </section>

  );

}

export default AgreementPanel;