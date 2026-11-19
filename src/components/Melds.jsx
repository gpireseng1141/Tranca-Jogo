import Card from "./Card.jsx";

export default function Melds({ melds = [], title = "Jogos na mesa" }) {
  return (
    <div className="melds-area">
      <span className="area-label">{title}</span>
      <div className="melds-row">
        {melds.length === 0 && <span className="empty-meld">Os jogos baixados aparecerão aqui</span>}
        {melds.map((meld) => (
          <div className="meld-group" key={meld.id}>
            {meld.cards.map((card) => <Card key={card.id} card={card} small />)}
            {meld.cards.length >= 7 && <span className="canasta-tag">{meld.cards.some((c) => c.joker || c.rank === "2") ? "SUJA" : "LIMPA"}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}