import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../services/socket.js";

export default function Lobby() {
  const [name, setName] = useState("Jogador");
  const [roomCode, setRoomCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function startBot() {
    sessionStorage.setItem("tranca-mode", "bot");
    sessionStorage.setItem("tranca-name", name.trim() || "Jogador");
    navigate("/jogar");
  }

  function createRoom() {
    setBusy(true); setError("");
    socket.connect();
    socket.emit("room:create", { name }, (result) => {
      setBusy(false);
      if (!result?.ok) return setError(result?.error || "Não foi possível criar a sala.");
      sessionStorage.setItem("tranca-mode", "online");
      sessionStorage.setItem("tranca-room", result.code);
      sessionStorage.setItem("tranca-seat", String(result.seat));
      sessionStorage.setItem("tranca-name", name.trim() || "Jogador");
      navigate("/jogar");
    });
  }

  function joinRoom() {
    setBusy(true); setError("");
    socket.connect();
    socket.emit("room:join", { code: roomCode, name }, (result) => {
      setBusy(false);
      if (!result?.ok) return setError(result?.error || "Não foi possível entrar na sala.");
      sessionStorage.setItem("tranca-mode", "online");
      sessionStorage.setItem("tranca-room", result.code);
      sessionStorage.setItem("tranca-seat", String(result.seat));
      sessionStorage.setItem("tranca-name", name.trim() || "Jogador");
      navigate("/jogar");
    });
  }

  return (
    <main className="lobby-page">
      <header className="top-brand"><Link to="/" className="brand-home"><span className="brand-icon">♠</span><span>TR<span className="brand-gold">ANCA</span></span></Link><small>MESA DE CARTAS</small></header>
      <section className="hero"><p className="eyebrow">ESTRATÉGIA • PARCERIA • TRADIÇÃO</p><h1>A mesa está<br /><em>preparada.</em></h1><p className="hero-copy">Reúna suas cartas, forme canastras e vença a partida.</p></section>
      <section className="lobby-card">
        <label className="field-label" htmlFor="player-name">Seu nome na mesa</label>
        <input id="player-name" value={name} maxLength={18} onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome" />
        <div className="mode-card bot-mode"><div className="mode-icon">♟</div><div className="mode-info"><strong>Jogar contra o robô</strong><span>Treine suas jogadas em uma partida local.</span></div><button className="gold-button" onClick={startBot}>Jogar</button></div>
        <div className="online-heading"><span /> MULTIPLAYER ONLINE <span /></div>
        <div className="mode-card"><div className="mode-icon online">◎</div><div className="mode-info"><strong>Criar uma sala</strong><span>Gere um código e convide outra pessoa.</span></div><button className="outline-button" disabled={busy} onClick={createRoom}>Criar sala</button></div>
        <div className="join-row"><input value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 5))} placeholder="CÓDIGO DA SALA" maxLength={5} /><button className="outline-button" disabled={busy || roomCode.length !== 5} onClick={joinRoom}>Entrar</button></div>
        {error && <p className="error-message">{error}</p>}
        <p className="lobby-foot">Partidas para 2 jogadores • 2 baralhos • 4 curingas</p>
      </section>
      <footer className="site-footer">TRANCA <span>◆</span> JOGO DE CARTAS</footer>
    </main>
  );
}