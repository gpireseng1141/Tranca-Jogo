export const SUITS = [
  { id: "clubs", symbol: "♣", color: "black", name: "Paus" },
  { id: "diamonds", symbol: "♦", color: "red", name: "Ouros" },
  { id: "hearts", symbol: "♥", color: "red", name: "Copas" },
  { id: "spades", symbol: "♠", color: "black", name: "Espadas" }
];
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeDeck() {
  const cards = [];
  for (let deck = 0; deck < 2; deck++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) cards.push({ id: `${deck}-${suit.id}-${rank}`, rank, suit: suit.id, joker: false });
    }
    cards.push({ id: `${deck}-joker-1`, rank: "JOKER", suit: "joker", joker: true });
    cards.push({ id: `${deck}-joker-2`, rank: "JOKER", suit: "joker", joker: true });
  }
  return shuffle(cards);
}

function cardValue(card) {
  if (card.joker) return 20;
  if (card.rank === "2") return 10;
  if (["8", "9", "10", "J", "Q", "K", "A"].includes(card.rank)) return 10;
  return Number(card.rank);
}

export function createGame(names = ["Você", "Adversário"]) {
  const deck = makeDeck();
  const hands = [deck.splice(0, 11), deck.splice(0, 11)];
  const mortos = [deck.splice(0, 11), deck.splice(0, 11)];
  const firstDiscard = deck.pop();
  return {
    players: names.map((name, index) => ({ name, hand: hands[index], melds: [], score: 0, hasTakenMorto: false })),
    stock: deck,
    discard: [firstDiscard],
    mortos,
    turn: 0,
    hasDrawn: false,
    status: "playing",
    winner: null,
    message: `${names[0]} começa. Compre uma carta.`,
    handNumber: 1
  };
}

export function publicState(game, seat) {
  return {
    you: seat,
    players: game.players.map((p, index) => ({
      name: p.name,
      handCount: p.hand.length,
      hand: index === seat ? p.hand : null,
      melds: p.melds,
      score: p.score,
      hasTakenMorto: p.hasTakenMorto
    })),
    stockCount: game.stock.length,
    discard: game.discard,
    mortoCount: game.mortos[seat]?.length ?? 0,
    turn: game.turn,
    status: game.status,
    winner: game.winner,
    message: game.message,
    handNumber: game.handNumber,
    hasDrawn: Boolean(game.hasDrawn),
    canDraw: !game.hasDrawn,
    canTakeDiscard: game.discard.length > 0 && !game.hasDrawn
  };
}

function validMeld(cards) {
  if (cards.length < 3) return false;
  const naturals = cards.filter((c) => !c.joker && c.rank !== "2");
  if (naturals.length === 0) return false;
  const rank = naturals[0].rank;
  if (!naturals.every((c) => c.rank === rank)) return false;
  const wilds = cards.length - naturals.length;
  return wilds <= Math.floor(cards.length / 2);
}

function canastaBonus(meld) {
  if (meld.cards.length < 7) return 0;
  return meld.cards.some((c) => c.joker || c.rank === "2") ? 300 : 500;
}

function scorePlayer(player, won = false) {
  let total = player.melds.reduce((sum, meld) => {
    const base = meld.cards.reduce((s, card) => s + cardValue(card), 0);
    return sum + base + canastaBonus(meld);
  }, 0);
  total -= player.hand.reduce((sum, card) => sum + cardValue(card), 0);
  if (won) total += 100;
  return total;
}

export function applyAction(game, seat, action) {
  if (game.status !== "playing") return { ok: false, error: "A rodada já terminou." };
  if (game.turn !== seat) return { ok: false, error: "Ainda não é sua vez." };
  const next = structuredClone(game);
  const player = next.players[seat];

  if (action.type === "draw-stock") {
    if (next.hasDrawn) return { ok: false, error: "Você já comprou uma carta neste turno." };
    if (next.stock.length === 0) return { ok: false, error: "O monte acabou." };
    player.hand.push(next.stock.pop());
    next.hasDrawn = true;
    next.message = `${player.name} comprou do monte.`;
  } else if (action.type === "take-discard") {
    if (next.hasDrawn) return { ok: false, error: "Você já comprou uma carta neste turno." };
    if (!next.discard.length) return { ok: false, error: "Não há cartas no descarte." };
    const top = next.discard[next.discard.length - 1];
    if (player.hand.length === 0) return { ok: false, error: "Você precisa ter cartas na mão." };
    const selected = action.cardIds || [];
    const chosen = player.hand.filter((c) => selected.includes(c.id));
    if (!selected.includes(top.id) && !chosen.some((c) => c.rank === top.rank)) {
      return { ok: false, error: "Para pegar o lixo, selecione cartas que formem um jogo com a carta do topo." };
    }
    player.hand.push(...next.discard);
    next.discard = [];
    next.hasDrawn = true;
    next.message = `${player.name} pegou o lixo.`;
  } else if (action.type === "meld") {
    const selected = player.hand.filter((c) => action.cardIds.includes(c.id));
    if (selected.length !== action.cardIds.length || !validMeld(selected)) {
      return { ok: false, error: "Jogo inválido. Forme trincas ou grupos de cartas do mesmo valor." };
    }
    player.hand = player.hand.filter((c) => !action.cardIds.includes(c.id));
    player.melds.push({ id: `meld-${Date.now()}-${Math.random()}`, cards: selected });
    next.message = `${player.name} baixou um jogo de ${selected.length} cartas.`;
  } else if (action.type === "discard") {
    const card = player.hand.find((c) => c.id === action.cardId);
    if (!card) return { ok: false, error: "Selecione uma carta para descartar." };
    if (player.hand.length === 1 && !player.hasTakenMorto) {
      // O descarte continua permitido; pegar o morto ocorre quando a mão zera.
    }
    player.hand = player.hand.filter((c) => c.id !== card.id);
    next.discard.push(card);
    next.message = `${player.name} descartou ${card.rank === "JOKER" ? "coringa" : card.rank}.`;

    if (player.hand.length === 0) {
      if (!player.hasTakenMorto && next.mortos[seat].length) {
        player.hand = next.mortos[seat];
        next.mortos[seat] = [];
        player.hasTakenMorto = true;
        next.message += ` Pegou o morto!`;
      } else {
        const other = next.players[1 - seat];
        const hasCanasta = player.melds.some((meld) => meld.cards.length >= 7);
        if (hasCanasta) {
          next.status = "finished";
          next.winner = seat;
          next.players[seat].score += scorePlayer(player, true);
          next.players[1 - seat].score += scorePlayer(other, false);
          next.message = `${player.name} bateu e venceu a rodada!`;
        } else {
          next.message += " Para bater, é necessário ter ao menos uma canastra.";
        }
      }
    }
    if (next.status === "playing") {
      next.turn = 1 - seat;
      next.hasDrawn = false;
    }
  } else {
    return { ok: false, error: "Ação desconhecida." };
  }

  if (action.type !== "discard") next.message += " Baixe jogos ou descarte uma carta.";
  return { ok: true, game: next };
}

export function startNextHand(game) {
  const scores = game.players.map((p) => p.score);
  const names = game.players.map((p) => p.name);
  const next = createGame(names);
  next.players.forEach((p, i) => { p.score = scores[i]; });
  next.handNumber = game.handNumber + 1;
  next.message = "Nova rodada! " + names[next.turn] + " começa.";
  return next;
}

export function findSimpleMeld(hand) {
  const groups = new Map();
  for (const card of hand) {
    if (card.joker || card.rank === "2") continue;
    groups.set(card.rank, [...(groups.get(card.rank) || []), card]);
  }
  for (const cards of groups.values()) {
    if (cards.length >= 3) return cards.slice(0, 3);
  }
  return null;
}