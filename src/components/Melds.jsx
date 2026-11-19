import Card from "./Card.jsx";
import { isDirtyMeld } from "../../shared/game.js";

export default function Melds({ melds = [], title = "Jogos na mesa", onWildClick }) {
  return (
    <div className="melds-area">
      <span className="area-label">{title}</span>
      <div className="melds-row">
        {melds.length === 0 && <span className="empty-meld">Os jogos baixados aparecerão aqui</span>}
        {melds.map((meld) => (
          <div className="meld-group" key={meld.id}>
            {meld.cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                small
                onClick={card.rank === "2" && onWildClick ? () => onWildClick(meld.id, card.id) : undefined}
              />
            ))}
            {meld.cards.length >= 7 && <span className="canasta-tag">{isDirtyMeld(meld.cards) ? "SUJA · 100" : "LIMPA · 200"}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

[executed on device: DESKTOP-D2HOUDN (d24de8ce-8a96-439d-8997-f665b587f1ec)]