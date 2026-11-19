import { applyAction, createGame, publicState, startNextHand } from "../../shared/game.js";

export function newLocalGame(name = "Você") {
  return createGame([name, "Robô"]);
}

export function localAction(game, seat, action) {
  return applyAction(game, seat, action);
}

export function botTurn(game) {
  if (game.status !== "playing" || game.turn !== 1) return game;
  let next = game;
  let result = applyAction(next, 1, { type: "draw-stock" });
  if (!result.ok) return next;
  next = result.game;

  const bot = next.players[1];
  const ranks = new Map();
  bot.hand.forEach((card) => {
    if (!card.joker && card.rank !== "2") ranks.set(card.rank, [...(ranks.get(card.rank) || []), card]);
  });
  const group = [...ranks.values()].find((cards) => cards.length >= 3);
  if (group) {
    result = applyAction(next, 1, { type: "meld", cardIds: group.slice(0, 3).map((c) => c.id) });
    if (result.ok) next = result.game;
  }

  const discard = [...bot.hand].sort((a, b) => {
    const aKeep = [...ranks.values()].some((g) => g.includes(a));
    const bKeep = [...ranks.values()].some((g) => g.includes(b));
    return Number(aKeep) - Number(bKeep);
  })[0];
  if (discard) {
    result = applyAction(next, 1, { type: "discard", cardId: discard.id });
    if (result.ok) next = result.game;
  }
  return next;
}

export { publicState, startNextHand };