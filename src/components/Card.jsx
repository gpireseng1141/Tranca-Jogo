import { SUITS } from "../../shared/game.js";

export default function Card({ card, selected = false, onClick, back = false, small = false }) {
  if (back) return <div className={`playing-card card-back ${small ? "small" : ""}`} aria-label="Carta virada"><span>✦</span></div>;
  const suit = SUITS.find((item) => item.id === card.suit);
  const symbol = card.joker ? "★" : suit?.symbol;
  const color = card.joker ? "joker" : suit?.color;
  return (
    <button
      type="button"
      className={`playing-card ${color} ${selected ? "selected" : ""} ${small ? "small" : ""}`}
      onClick={onClick}
      aria-label={`${card.rank} ${suit?.name || "coringa"}`}
    >
      <span className="card-corner">{card.rank === "JOKER" ? "★" : card.rank}<br />{symbol}</span>
      <span className="card-center">{symbol}</span>
      <span className="card-corner bottom">{card.rank === "JOKER" ? "★" : card.rank}<br />{symbol}</span>
    </button>
  );
}