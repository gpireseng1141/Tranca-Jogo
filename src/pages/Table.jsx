import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card.jsx";
import Melds from "../components/Melds.jsx";
import { socket } from "../services/socket.js";
import { botTurn, localAction, newLocalGame, startNextHand } from "../utils/localGame.js";

export default function Table() {
  const navigate = useNavigate();
  const mode = sessionStorage.getItem("tranca-mode") || "bot";
  const room = sessionStorage.getItem("tranca-room");
  const seat = Number(sessionStorage.getItem("tranca-seat") || 0);
  const name = sessionStorage.getItem("tranca-name") || "Jogador";
  const [local, setLocal] = useState(() => newLocalGame(name));
  const [remote, setRemote] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(mode === "online");

  const state = mode === "online" ? remote?.state : local;
  const mySeat = mode === "online" ? seat : 0;
  const me = state?.players?.[mySeat];
  const opponent = state?.players?.[1 - mySeat];
  const hand = me?.hand || [];
  const isMyTurn = state?.turn === mySeat && state?.status === "playing";

  useEffect(() => {
    if (mode !== "online") return;
    if (!socket.connected) socket.connect();
    const onState = (data) => { setRemote(data); setWaiting(false); setError(""); };
    const onClosed = (message) => setError(message);
    socket.on("room:state", onState);
    socket.on("room:closed", onClosed);
    socket.emit("room:sync", { code: room }, (result) => {
      if (!result?.ok) { setWaiting(false); setError(result?.error || "Não foi possível sincronizar a sala."); }
    });
    return () => { socket.off("room:state", onState); socket.off("room:closed", onClosed); };
  }, [mode]);

  useEffect(() => {
    if (mode !== "bot" || !local || local.turn !== 1 || local.status !== "playing") return;
    const timer = window.setTimeout(() => setLocal((current) => botTurn(current)), 700);
    return () => window.clearTimeout(timer);
  }, [mode, local]);

  useEffect(() => {
    if (state?.status === "finished") {
      sessionStorage.setItem("tranca-result", JSON.stringify({
        winner: state.winner,
        winnerName: state.players[state.winner]?.name,
        scores: state.players.map((p) => ({ name: p.name, score: p.score })),
        mode,
        handNumber: state.handNumber
      }));
      navigate("/resultado");
    }
  }, [state?.status, state?.winner, state?.players, state?.handNumber, mode, navigate]);

  const send = useCallback((action) => {
    setError("");
    if (mode === "bot") {
      setLocal((current) => {
        const result = localAction(current, 0, action);
        if (!result.ok) { setError(result.error); return current; }
        return result.game;
      });
    } else {
      socket.emit("game:action", { code: room, action }, (result) => {
        if (!result?.ok) setError(result?.error || "Não foi possível executar a jogada.");
      });
    }
    setSelected([]);
  }, [mode, room]);

  const toggleCard = (cardId) => setSelected((current) => current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId]);

  const canFormSet = useMemo(() => selected.length >= 3, [selected]);

  function nextHand() {
    if (mode === "bot") {
      setLocal((current) => startNextHand(current));
      navigate("/jogar");
    } else {
      socket.emit("game:next-hand", { code: room }, (result) => {
        if (!result?.ok) setError(result?.error || "Não foi possível iniciar a próxima rodada.");
        else navigate("/jogar");
      });
    }
  }

  if (mode === "online" && (waiting || !state)) {
    return <main className="table-loading"><div className="loader" /><h2>Aguardando o segundo jogador...</h2><p>Compartilhe o código da sala: <strong>{room}</strong></p><button className="outline-button" onClick={() => navigator.clipboard?.writeText(room || "")}>Copiar código</button><button className="link-button" onClick={() => navigate("/")}>Voltar ao início</button></main>;
  }

  return (
    <main className="table-page">
      <header className="table-topbar">
        <button className="back-link" onClick={() => navigate("/")}>← Sair da mesa</button>
        <div className="table-logo">♠ TR<span>ANCA</span></div>
        <div className="room-indicator">{mode === "online" ? `SALA ${room}` : "MODO TREINO"}</div>
      </header>

      <section className="felt-table">
        <div className="opponent-area">
          <div className="player-badge"><span className="avatar">♟</span><div><strong>{opponent?.name || "Adversário"}</strong><small>{opponent?.handCount ?? 11} cartas · {opponent?.score ?? 0} pts</small></div><span className={`turn-dot ${state.turn === 1 - mySeat ? "active" : ""}`} /></div>
          <div className="opponent-cards">{Array.from({ length: Math.min(opponent?.handCount ?? 11, 11) }, (_, i) => <Card key={i} back small />)}</div>
          <Melds melds={opponent?.melds} title="Jogos do adversário" />
        </div>

        <div className="center-zone">
          <Melds melds={me?.melds} title="Seus jogos na mesa" />
          <div className="piles">
            <div className="pile-block"><span>MONTE</span><button className="deck-pile" disabled={!isMyTurn || state.stockCount === 0} onClick={() => send({ type: "draw-stock" })}><span>♠</span><small>{state.stockCount}</small></button></div>
            <div className="pile-block"><span>LIXO</span><button className="discard-pile" disabled={!isMyTurn || !state.discard?.length} onClick={() => send({ type: "take-discard", cardIds: selected })}>{state.discard?.length ? <Card card={state.discard[state.discard.length - 1]} small /> : <span className="empty-pile">—</span>}<small>{state.discard?.length || 0}</small></button></div>
          </div>
          <p className="table-message">{state.message}</p>
        </div>

        <div className="my-area">
          <div className="player-badge"><span className="avatar you">♛</span><div><strong>{me?.name || name} <small>(você)</small></strong><small>{hand.length} cartas · {me?.score ?? 0} pts</small></div><span className={`turn-dot ${isMyTurn ? "active" : ""}`} /></div>
          <div className="my-hand">
            {hand.map((card) => <Card key={card.id} card={card} selected={selected.includes(card.id)} onClick={() => isMyTurn && toggleCard(card.id)} />)}
          </div>
          <div className="action-bar">
            <span className="selection-count">{selected.length} selecionada(s)</span>
            <button className="action-button" disabled={!isMyTurn || !canFormSet} onClick={() => send({ type: "meld", cardIds: selected })}>Baixar jogo</button>
            <button className="gold-button" disabled={!isMyTurn || selected.length !== 1} onClick={() => send({ type: "discard", cardId: selected[0] })}>Descartar</button>
          </div>
        </div>
      </section>
      {error && <div className="toast-error">{error}</div>}
      <footer className="rules-strip"><span>♣</span> Trincas e grupos do mesmo valor <span>♦</span> Canastra: 7 cartas <span>♥</span> Bater exige ao menos uma canastra <span>♠</span></footer>
    </main>
  );
}