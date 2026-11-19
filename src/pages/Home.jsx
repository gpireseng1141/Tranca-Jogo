import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link to="/" className="landing-brand"><span>♠</span> TRANCA<span className="brand-gold">.</span></Link>
        <div className="landing-links"><a href="#como-jogar">Como jogar</a><a href="#recursos">Recursos</a></div>
        <Link to="/salas" className="nav-play">Jogar agora <span>↗</span></Link>
      </nav>
      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-kicker"><i/> O CLÁSSICO, AGORA ONLINE</div>
          <h1>Sua próxima<br/>grande jogada<br/><em>começa aqui.</em></h1>
          <p>Entre na mesa, monte suas canastras e desafie seus amigos. A emoção da Tranca, direto no seu navegador.</p>
          <div className="landing-actions"><Link to="/salas" className="landing-cta">Começar a jogar <span>→</span></Link><a href="#como-jogar" className="landing-secondary">Conhecer o jogo</a></div>
          <div className="landing-proof"><div className="proof-avatars"><b>♟</b><b>♠</b><b>♥</b></div><span><strong>Chame alguém para a mesa</strong><small>Crie uma sala e compartilhe o código</small></span></div>
        </div>
        <div className="hero-art" aria-label="Cartas de baralho sobre uma mesa verde">
          <div className="art-glow"/><div className="art-card art-card-back">♠</div><div className="art-card art-card-red"><small>A</small>♥</div><div className="art-card art-card-black"><small>K</small>♣</div><div className="art-chip">♠ <span>TR</span></div>
          <div className="art-caption"><span>♧</span><div><b>ESTRATÉGIA EM CADA CARTA</b><small>Uma mesa. Duas pessoas. Muitas possibilidades.</small></div></div>
        </div>
        <div className="hero-index">01 <span/> 03</div>
      </section>
      <section className="landing-stats" id="recursos"><div><strong>02</strong><span>JOGADORES POR PARTIDA</span></div><div><strong>02</strong><span>BARALHOS</span></div><div><strong>02</strong><span>CURINGA (CARTA 2)</span></div><div className="stats-note">Feito para jogar junto,<br/><em>mesmo de longe.</em></div></section>
      <section className="how-section" id="como-jogar">
        <div className="section-kicker">SIMPLES DE COMEÇAR</div><h2>Prepare a mesa.<br/><em>O resto é estratégia.</em></h2>
        <div className="how-grid"><article><span>01</span><div className="how-icon">♧</div><h3>Entre na partida</h3><p>Jogue contra o robô ou crie uma sala online para jogar com outra pessoa.</p></article><article><span>02</span><div className="how-icon">▤</div><h3>Monte suas canastras</h3><p>Combine trincas ou sequências e use o 2 como curinga quando necessário.</p></article><article><span>03</span><div className="how-icon">♛</div><h3>Vença a rodada</h3><p>Use estratégia para baixar suas cartas e conquistar a vitória.</p></article></div>
        <div className="bottom-cta"><div><small>A MESA ESTÁ TE ESPERANDO</small><h2>Vamos jogar uma?</h2></div><Link to="/salas" className="landing-cta">Entrar na mesa <span>→</span></Link></div>
      </section>
      <footer className="landing-footer"><Link to="/" className="landing-brand"><span>♠</span> TRANCA<span className="brand-gold">.</span></Link><span>UM CLÁSSICO PARA COMPARTILHAR.</span><span>© 2026 TRANCA ONLINE</span></footer>
    </main>
  );
}
