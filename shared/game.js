export const SUITS = [
  { id: "clubs", symbol: "♣", color: "black", name: "Paus" },
  { id: "diamonds", symbol: "♦", color: "red", name: "Ouros" },
  { id: "hearts", symbol: "♥", color: "red", name: "Copas" },
  { id: "spades", symbol: "♠", color: "black", name: "Espadas" }
];
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const ORDER = new Map(RANKS.map((rank, index) => [rank, index + 1]));

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// A Tranca usa dois baralhos sem os jokers tradicionais.
function makeDeck() {
  const cards = [];
  for (let deck = 0; deck < 2; deck++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({ id: `${deck}-${suit.id}-${rank}`, rank, suit: suit.id, joker: false });
      }
    }
  }
  return shuffle(cards);
}

export function cardValue(card) {
  if (card.rank === "2") return 10;
  if (["8", "9", "10", "J", "Q", "K", "A"].includes(card.rank)) return 10;
  return Number(card.rank);
}

function isConsecutive(ranks) {
  const values = ranks.map((rank) => ORDER.get(rank)).sort((a, b) => a - b);
  return values.every((value, index) => index === 0 || value === values[index - 1] + 1);
}

function sequenceSuit(cards) {
  const nonTwos = cards.filter((card) => card.rank !== "2");
  if (nonTwos.length < 2) return null;
  const suit = nonTwos[0].suit;
  if (!nonTwos.every((card) => card.suit === suit)) return null;
  return suit;
}

// O 2 é natural somente quando completa sua posição real na sequência do mesmo naipe.
export function isNaturalTwo(cards, twoCard) {
  if (!twoCard || twoCard.rank !== "2") return false;
  const others = cards.filter((card) => card.id !== twoCard.id);
  if (others.length < 2 || !others.every((card) => card.suit === twoCard.suit)) return false;
  return isConsecutive([...others.map((card) => card.rank), "2"]);
}

export function isDirtyMeld(cards) {
  if (cards.some((card) => card.joker)) return true;
  const two = cards.find((card) => card.rank === "2");
  if (!two) return false;
  return !isNaturalTwo(cards, two);
}

export function validMeld(cards) {
  if (!Array.isArray(cards) || cards.length < 3 || cards.some((card) => card.joker)) return false;
  const twos = cards.filter((card) => card.rank === "2");
  if (twos.length > 1) return false;

  // Primeiro aceita uma sequência natural, incluindo A-2-3 do mesmo naipe.
  if (cards.every((card) => card.suit === cards[0].suit) && isConsecutive(cards.map((card) => card.rank))) {
    return true;
  }

  // Um único 2 pode substituir uma carta em uma sequência do mesmo naipe.
  if (twos.length === 1) {
    const naturals = cards.filter((card) => card.id !== twos[0].id);
    const suit = sequenceSuit(cards);
    if (suit && naturals.every((card) => card.suit === suit)) {
      const values = naturals.map((card) => ORDER.get(card.rank)).sort((a, b) => a - b);
      const gaps = values.slice(1).map((value, index) => value - values[index]);
      if (gaps.every((gap) => gap === 1) || (gaps.filter((gap) => gap === 2).length === 1 && gaps.every((gap) => gap === 1 || gap === 2))) {
        return true;
      }
    }
  }

  // Trinca/grupo de mesmo valor: o 2 pode ser o único curinga.
  const naturals = cards.filter((card) => card.rank !== "2");
  return naturals.length >= 2 && naturals.every((card) => card.rank === naturals[0].rank);
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

function canastaBonus(meld) {
  if (meld.cards.length < 7) return 0;
  return isDirtyMeld(meld.cards) ? 100 : 200;
}

export function scorePlayer(player, won = false) {
  const total = player.melds.reduce((sum, meld) => {
    const base = meld.cards.reduce((s, card) => s + cardValue(card), 0);
    return sum + base + canastaBonus(meld);
  }, 0);
  const handPenalty = player.hand.reduce((sum, card) => sum + cardValue(card), 0);
  return total - handPenalty + (won ? 100 : 0);
}

function isBlackThree(card) {
  return card?.rank === "3" && (card.suit === "clubs" || card.suit === "spades");
}

function canReplaceTwo(meld, twoCard, replacement) {
  if (!twoCard || twoCard.rank !== "2" || !replacement || replacement.rank === "2" || replacement.joker) return false;
  if (isNaturalTwo(meld.cards, twoCard)) return false;
  const naturals = meld.cards.filter((card) => card.id !== twoCard.id);
  if (naturals.length < 2 || !naturals.every((card) => card.suit === naturals[0].suit)) return false;
  const values = naturals.map((card) => ORDER.get(card.rank)).sort((a, b) => a - b);
  const gapIndex = values.findIndex((value, index) => index > 0 && value - values[index - 1] === 2);
  if (gapIndex < 0) return false;
  const expected = values[gapIndex - 1] + 1;
  return ORDER.get(replacement.rank) === expected && replacement.suit === naturals[0].suit;
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
    if (isBlackThree(top)) return { ok: false, error: "O 3 preto tranca a lixeira. Compre do monte." };
    const selected = action.cardIds || [];
    const chosen = player.hand.filter((card) => selected.includes(card.id));
    if (chosen.length !== selected.length) return { ok: false, error: "Seleção de cartas inválida." };
    if (top.rank === "2") {
      if (chosen.length < 2 || chosen.some((card) => card.rank === "2") || !validMeld([...chosen, top])) {
        return { ok: false, error: "O 2 no topo não pode ser a única chave. Encaixe-o em um jogo formado por cartas naturais." };
      }
    } else if (!validMeld([...chosen, top])) {
      return { ok: false, error: "Para pegar a lixeira, use a carta do topo em um jogo válido com cartas da sua mão." };
    }
    player.hand.push(...next.discard);
    next.discard = [];
    next.hasDrawn = true;
    next.message = `${player.name} pegou a lixeira.`;
  } else if (action.type === "meld") {
    const selected = player.hand.filter((card) => action.cardIds.includes(card.id));
    if (selected.length !== action.cardIds.length || !validMeld(selected)) {
      return { ok: false, error: "Jogo inválido. Forme trincas ou sequências e use no máximo um 2 como curinga." };
    }
    player.hand = player.hand.filter((card) => !action.cardIds.includes(card.id));
    player.melds.push({ id: `meld-${Date.now()}-${Math.random()}`, cards: selected });
    next.message = `${player.name} baixou um jogo de ${selected.length} cartas.`;
  } else if (action.type === "replace-wild") {
    const meld = player.melds.find((item) => item.id === action.meldId);
    const two = meld?.cards.find((card) => card.id === action.wildCardId);
    const replacement = player.hand.find((card) => card.id === action.replacementCardId);
    if (!meld || !canReplaceTwo(meld, two, replacement)) {
      return { ok: false, error: "Só é possível trocar o 2 curinga pela carta natural que faltava na sequência." };
    }
    const updated = meld.cards.filter((card) => card.id !== two.id);
    updated.push(replacement, two); // O 2 permanece no mesmo jogo, em uma das pontas.
    if (!validMeld(updated)) return { ok: false, error: "A troca não forma uma sequência válida." };
    meld.cards = updated;
    player.hand = player.hand.filter((card) => card.id !== replacement.id);
    next.message = `${player.name} colocou a carta natural no lugar e moveu o 2 para a ponta do mesmo jogo.`;
  } else if (action.type === "discard") {
    const card = player.hand.find((item) => item.id === action.cardId);
    if (!card) return { ok: false, error: "Selecione uma carta para descartar." };
    player.hand = player.hand.filter((item) => item.id !== card.id);
    next.discard.push(card);
    next.message = `${player.name} descartou ${card.rank}.`;

    if (player.hand.length === 0) {
      if (!player.hasTakenMorto && next.mortos[seat].length) {
        player.hand = next.mortos[seat];
        next.mortos[seat] = [];
        player.hasTakenMorto = true;
        next.message += " Pegou o morto!";
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
  const scores = game.players.map((player) => player.score);
  const names = game.players.map((player) => player.name);
  const next = createGame(names);
  next.players.forEach((player, index) => { player.score = scores[index]; });
  next.handNumber = game.handNumber + 1;
  next.message = "Nova rodada! " + names[next.turn] + " começa.";
  return next;
}

export function findSimpleMeld(hand) {
  const groups = new Map();
  for (const card of hand) {
    if (card.rank === "2" || card.joker) continue;
    groups.set(card.rank, [...(groups.get(card.rank) || []), card]);
  }
  for (const cards of groups.values()) {
    if (cards.length >= 3) return cards.slice(0, 3);
  }
  return null;
}

[executed on device: DESKTOP-D2HOUDN (d24de8ce-8a96-439d-8997-f665b587f1ec)]