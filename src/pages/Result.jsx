import { useNavigate } from "react-router-dom";

export default function Result() {
  const navigate = useNavigate();
  let result = null;
  try { result = JSON.parse(sessionStorage.getItem("tranca-result") || "null"); } catch {}
  const isWin = result?.winner === Number(sessionStorage.getItem("tranca-seat") || 0);

  return (
    <main className="result-page">
      <section className="result-card">
        <div className="result-emblem">{isWin ? "🏆" : "♠"}</div>
        <p className="eyebrow">FIM DA RODADA</p>
        <h1>{isWin ? "Grande vitória!" : "Rodada encerrada"}</h1>
        <p className="result-copy">{result?.winnerName ? `${result.winnerName} venceu esta rodada.` : "A partida terminou."}</p>
        <div className="scoreboard">
          {(result?.scores || []).map((player, index) => (
            <div className="score-row" key={player.name}>
              <span>{index === result?.winner ? "♛" : "♟"}</span><strong>{player.name}</strong><b>{player.score} pts</b>
            </div>
          ))}
        </div>
        <p className="result-note">Rodada {result?.handNumber || 1} · Tranca para 2 jogadores</p>
        <button className="gold-button large" onClick={() => navigate("/jogar")}>Nova rodada</button>
        <button className="link-button" onClick={() => navigate("/")}>Voltar ao início</button>
      </section>
    </main>
  );
}