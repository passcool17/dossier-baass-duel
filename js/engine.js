/** Moteur pur : pas de DOM. Toutes les règles du duel. */

import {
  CARDS,
  PLAYER_DECK,
  DIA_DECK,
  TRACKS,
  INFORMANTS,
  LIENS_TO_WIN,
  SECRECY_TO_WIN,
  REDACT_TO_WIN,
  MAX_ROUNDS,
  HAND_SIZE,
  PLAYS_PER_ROUND,
  TRACK_MIN,
  TRACK_MAX,
  cardById,
  trackById,
} from './data.js';

export { cardById, trackById };

const DIFFICULTIES = new Set(['facile', 'normal', 'difficile']);

/** Générateur déterministe (Mulberry32). */
export function makeRng(seed, state) {
  let s = (state != null ? state : (seed >>> 0) || 1) >>> 0;
  const rng = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.getState = () => s;
  return rng;
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyTracks() {
  const o = {};
  for (const t of TRACKS) o[t.id] = { pos: 0, locked: null };
  return o;
}

function emptyInformants() {
  const o = {};
  for (const p of INFORMANTS) o[p.id] = { placed: false, linkedTrack: null };
  return o;
}

function drawTo(hand, deck, discard, n, rng) {
  const h = hand.slice();
  let d = deck.slice();
  let dis = discard.slice();
  while (h.length < n) {
    if (d.length === 0) {
      if (dis.length === 0) break;
      d = shuffle(dis, rng);
      dis = [];
    }
    h.push(d.shift());
  }
  return { hand: h, deck: d, discard: dis };
}

export function createGame(opts = {}) {
  const difficulty = DIFFICULTIES.has(opts.difficulty) ? opts.difficulty : 'normal';
  const seed = opts.seed != null ? opts.seed >>> 0 : (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
  const rng = makeRng(seed, opts.rngState);
  let playerDeck = shuffle(PLAYER_DECK.map((c) => c.id), rng);
  let diaDeck = shuffle(DIA_DECK.map((c) => c.id), rng);

  if (opts.stacked) {
    if (opts.stacked.player) playerDeck = opts.stacked.player.slice().concat(playerDeck.filter((id) => !opts.stacked.player.includes(id)));
    if (opts.stacked.dia) diaDeck = opts.stacked.dia.slice().concat(diaDeck.filter((id) => !opts.stacked.dia.includes(id)));
  }

  const pDraw = drawTo([], playerDeck, [], HAND_SIZE, rng);
  const dDraw = drawTo([], diaDeck, [], HAND_SIZE, rng);

  const state = {
    version: 1,
    difficulty,
    seed,
    rngState: rng.getState(),
    tutorial: Boolean(opts.tutorial),
    round: 1,
    phase: 'bid', // bid | elan | play | gameover
    initiative: null,
    currentActor: 'player',
    playsLeft: { player: PLAYS_PER_ROUND, dia: PLAYS_PER_ROUND },
    tracks: emptyTracks(),
    informants: emptyInformants(),
    liens: [],
    secrecy: 0,
    hands: { player: pDraw.hand, dia: dDraw.hand },
    decks: { player: pDraw.deck, dia: dDraw.deck },
    discards: { player: pDraw.discard, dia: dDraw.discard },
    bid: { player: null, dia: null },
    lastBid: null,
    log: ['Nouvelle partie. Enchère d’initiative : jouez une carte pour sa valeur.'],
    winner: null,
    endReason: null,
    lastMove: null,
  };

  if (opts.setup) opts.setup(state);
  return checkEnd(state);
}

export function cloneState(state) {
  return structuredClone(state);
}

function withRng(state) {
  return makeRng(state.seed, state.rngState);
}

function commitRng(state, rng) {
  state.rngState = rng.getState();
}

function log(state, msg) {
  state.log = [...(state.log || []), msg].slice(-12);
}

export function unlockedTracks(state) {
  return TRACKS.map((t) => t.id).filter((id) => !state.tracks[id].locked);
}

export function controlledTracks(state, side = 'player') {
  return TRACKS.map((t) => t.id).filter((id) => {
    const tr = state.tracks[id];
    if (side === 'player') return tr.pos >= 1 && tr.locked !== 'dia';
    return tr.pos <= -1 && tr.locked !== 'player';
  });
}

export function lockedCount(state, side) {
  return TRACKS.filter((t) => state.tracks[t.id].locked === side).length;
}

/** Tire un jeton vers `side`. Retourne le déplacement réel. */
export function pullTrack(state, side, trackId, amount) {
  const tr = state.tracks[trackId];
  if (!tr || tr.locked || amount <= 0) return 0;
  const dir = side === 'player' ? 1 : -1;
  let pos = tr.pos;
  let moved = 0;
  for (let i = 0; i < amount; i++) {
    const next = pos + dir;
    if (next > TRACK_MAX || next < TRACK_MIN) break;
    pos = next;
    moved++;
    if (pos === TRACK_MAX) {
      tr.pos = pos;
      tr.locked = 'player';
      return moved;
    }
    if (pos === TRACK_MIN) {
      tr.pos = pos;
      tr.locked = 'dia';
      return moved;
    }
  }
  tr.pos = pos;
  return moved;
}

function cardTitle(id) {
  const c = cardById(id);
  return c ? c.title : id;
}

function resolveBids(state) {
  const p = cardById(state.bid.player);
  const d = cardById(state.bid.dia);
  if (!p || !d) return;
  let winner;
  if (p.value > d.value) winner = 'player';
  else if (d.value > p.value) winner = 'dia';
  else winner = state.initiative || 'player'; // égalité : on conserve l’initiative (1re manche : Enquête)

  state.initiative = winner;
  state.lastBid = { player: p.id, dia: d.id, playerValue: p.value, diaValue: d.value, winner };
  // Bid cards go to discard
  state.discards.player = [...state.discards.player, p.id];
  state.discards.dia = [...state.discards.dia, d.id];
  const who = winner === 'player' ? 'l’Enquête' : 'le Secret DIA';
  log(
    state,
    `Enchère : Enquête ${p.value} (« ${p.title} ») contre Secret DIA ${d.value} (« ${d.title} »). Initiative : ${who}. Élan pour le gagnant.`,
  );
  state.phase = 'elan';
  state.currentActor = winner;
  state.playsLeft = { player: PLAYS_PER_ROUND, dia: PLAYS_PER_ROUND };
}

function endRound(state) {
  const rng = withRng(state);
  const p = drawTo(state.hands.player, state.decks.player, state.discards.player, HAND_SIZE, rng);
  const d = drawTo(state.hands.dia, state.decks.dia, state.discards.dia, HAND_SIZE, rng);
  commitRng(state, rng);
  state.hands = { player: p.hand, dia: d.hand };
  state.decks = { player: p.deck, dia: d.deck };
  state.discards = { player: p.discard, dia: d.discard };
  state.bid = { player: null, dia: null };

  if (state.round >= MAX_ROUNDS) {
    // Temps écoulé : le dossier est classé, sauf victoire déjà constatée.
    if (!state.winner) {
      state.winner = 'dia';
      state.endReason = 'time-secret';
      log(state, 'Fin des 8 manches : le dossier reste classé. Victoire du Secret DIA.');
      state.phase = 'gameover';
    }
    return checkEnd(state);
  }

  state.round += 1;
  state.phase = 'bid';
  state.currentActor = 'player';
  log(state, `Manche ${state.round}. Nouvelle enchère d’initiative.`);
  return checkEnd(state);
}

function afterPlay(state) {
  const actor = state.currentActor;
  state.playsLeft[actor] = Math.max(0, state.playsLeft[actor] - 1);
  const other = actor === 'player' ? 'dia' : 'player';
  if (state.playsLeft[other] > 0) {
    state.currentActor = other;
  } else if (state.playsLeft[actor] > 0) {
    state.currentActor = actor;
  } else {
    return endRound(checkEnd(state));
  }
  return checkEnd(state);
}

export function checkEnd(state) {
  if (state.phase === 'gameover' && state.winner) return state;
  if (state.liens.length >= LIENS_TO_WIN) {
    state.winner = 'player';
    state.endReason = 'liens';
    state.phase = 'gameover';
    log(state, 'Chaîne de divulgation complète (4 liens). Victoire de l’Enquête.');
    return state;
  }
  if (state.secrecy >= SECRECY_TO_WIN) {
    state.winner = 'dia';
    state.endReason = 'secrecy';
    state.phase = 'gameover';
    log(state, 'Le secret atteint son maximum. Victoire du Secret DIA.');
    return state;
  }
  if (lockedCount(state, 'dia') >= REDACT_TO_WIN) {
    state.winner = 'dia';
    state.endReason = 'redact';
    state.phase = 'gameover';
    log(state, 'Trois pistes entièrement caviardées. Victoire du Secret DIA.');
    return state;
  }
  return state;
}

function takeFromHand(state, side, cardId) {
  const hand = state.hands[side];
  const i = hand.indexOf(cardId);
  if (i < 0) throw new Error(`Carte ${cardId} absente de la main de ${side}`);
  const next = hand.slice();
  next.splice(i, 1);
  state.hands[side] = next;
  state.discards[side] = [...state.discards[side], cardId];
}

function addSecrecy(state, n = 1) {
  const before = state.secrecy;
  state.secrecy = Math.min(SECRECY_TO_WIN, state.secrecy + n);
  return state.secrecy - before;
}

function linkInformant(state, person, trackId) {
  const info = state.informants[person];
  if (!info) throw new Error(`Informateur inconnu : ${person}`);
  info.placed = true;
  if (!trackId) return false;
  if (info.linkedTrack) return false;
  const tr = state.tracks[trackId];
  if (!tr || tr.locked !== 'player') return false;
  if (state.liens.some((l) => l.track === trackId)) return false; // une piste, un lien
  info.linkedTrack = trackId;
  state.liens = [...state.liens, { person, track: trackId }];
  const t = trackById(trackId);
  log(state, `Lien formé (fiction) : AAP Person ${person} → ${t ? t.name : trackId}.`);
  return true;
}

function describePull(side, trackId, moved) {
  const t = trackById(trackId);
  const name = t ? t.name : trackId;
  const who = side === 'player' ? 'l’Enquête' : 'le Secret DIA';
  const pos = null;
  return `${who} tire ${name} de ${moved} (${side === 'player' ? '+' : '−'}${moved}).`;
}

function applyAction(state, side, card, opts) {
  const kind = card.action.kind;
  const amount = card.action.amount || 0;

  if (kind === 'pullFixed') {
    const tid = card.action.track;
    if (state.tracks[tid] && !state.tracks[tid].locked) {
      const m = pullTrack(state, side, tid, amount);
      log(state, `${side === 'player' ? 'Tu joues' : 'Secret DIA joue'} « ${card.title} » : ${describePull(side, tid, m)}`);
      return;
    }
    // Fallback : piste verrouillée, tirer une autre si demandée
    const tid2 = opts.trackId;
    if (tid2 && state.tracks[tid2] && !state.tracks[tid2].locked) {
      const m = pullTrack(state, side, tid2, Math.min(2, amount));
      log(state, `« ${card.title} » : piste prévue verrouillée. ${describePull(side, tid2, m)}`);
      return;
    }
    log(state, `« ${card.title} » : aucune piste à tirer (action sans effet).`);
    return;
  }

  if (kind === 'pullAny' || kind === 'pullStrong') {
    const tid = opts.trackId;
    if (!tid || !state.tracks[tid] || state.tracks[tid].locked) {
      throw new Error('Il faut choisir une piste non verrouillée.');
    }
    const m = pullTrack(state, side, tid, amount);
    const bar = kind === 'pullStrong' ? 'barre noire — ' : '';
    log(
      state,
      `${side === 'dia' ? 'Secret DIA joue une barre de caviardage' : 'Tu joues'} « ${card.title} » : ${bar}${describePull(side, tid, m)}`,
    );
    return;
  }

  if (kind === 'pullTwoTracks') {
    const a = opts.trackId;
    const b = opts.trackId2;
    if (!a || !b || a === b) throw new Error('Il faut deux pistes différentes.');
    if (!state.tracks[a] || state.tracks[a].locked || !state.tracks[b] || state.tracks[b].locked) {
      throw new Error('Pistes invalides.');
    }
    const m1 = pullTrack(state, side, a, amount);
    const m2 = pullTrack(state, side, b, amount);
    log(state, `« ${card.title} » : ${describePull(side, a, m1)} ${describePull(side, b, m2)}`);
    return;
  }

  if (kind === 'secrecy') {
    const n = addSecrecy(state, amount || 1);
    log(state, `Secret DIA joue « ${card.title} » : le secret monte de ${n} (${state.secrecy}/${SECRECY_TO_WIN}). (mécanique de fiction)`);
    return;
  }

  if (kind === 'secrecyOrPull') {
    if (opts.choose === 'secrecy') {
      const n = addSecrecy(state, 1);
      log(state, `« ${card.title} » : le secret monte de ${n} (${state.secrecy}/${SECRECY_TO_WIN}).`);
      return;
    }
    const tid = opts.trackId;
    if (!tid || !state.tracks[tid] || state.tracks[tid].locked) throw new Error('Piste invalide.');
    const m = pullTrack(state, side, tid, amount);
    log(state, `« ${card.title} » : ${describePull(side, tid, m)}`);
    return;
  }

  if (kind === 'secrecyIfLocked') {
    if (lockedCount(state, 'dia') > 0) {
      const n = addSecrecy(state, 1);
      log(state, `« ${card.title} » : une piste est déjà caviardée, le secret monte de ${n} (${state.secrecy}/${SECRECY_TO_WIN}).`);
    } else {
      const tid = opts.trackId;
      if (!tid || !state.tracks[tid] || state.tracks[tid].locked) throw new Error('Piste invalide.');
      const m = pullTrack(state, side, tid, amount);
      log(state, `« ${card.title} » : ${describePull(side, tid, m)}`);
    }
    return;
  }

  if (kind === 'placeAndLink') {
    const person = card.action.person;
    const info = state.informants[person];
    if (!info) throw new Error('Informateur inconnu.');
    if (info.linkedTrack) {
      const tid = opts.trackId;
      if (!tid || !state.tracks[tid] || state.tracks[tid].locked) throw new Error('Piste invalide (informateur déjà lié).');
      const m = pullTrack(state, side, tid, 2);
      log(state, `AAP Person ${person} est déjà lié. « ${card.title} » : ${describePull(side, tid, m)}`);
      return;
    }
    const wasPlaced = info.placed;
    info.placed = true;
    if (!wasPlaced) log(state, `AAP Person ${person} est placé. (fiction de jeu — seule la désignation vient du document)`);
    if (opts.trackId) {
      const ok = linkInformant(state, person, opts.trackId);
      if (!ok && !wasPlaced) log(state, `Pas de lien : il faut avoir verrouillé une piste de ton côté (+4).`);
    }
    return;
  }

  throw new Error(`Action inconnue : ${kind}`);
}

function applyValue(state, side, card, pulls) {
  const list = Array.isArray(pulls) ? pulls : [];
  const total = list.reduce((s, p) => s + (p.steps || 0), 0);
  if (total > card.value) throw new Error('Trop de points de valeur.');
  let movedTotal = 0;
  const parts = [];
  const used = {};
  for (const p of list) {
    if (!p.trackId || !p.steps) continue;
    if (!state.tracks[p.trackId] || state.tracks[p.trackId].locked) throw new Error('Piste verrouillée ou inconnue.');
    const already = used[p.trackId] || 0;
    const allowed = Math.min(p.steps, Math.max(0, 2 - already)); // max 2 cases par piste et par jeu de valeur
    used[p.trackId] = already + allowed;
    if (allowed <= 0) continue;
    const m = pullTrack(state, side, p.trackId, allowed);
    movedTotal += m;
    if (m) parts.push(`${trackById(p.trackId)?.name || p.trackId} ${side === 'player' ? '+' : '−'}${m}`);
  }
  log(
    state,
    `${side === 'player' ? 'Tu joues' : 'Secret DIA joue'} « ${card.title} » pour sa valeur (${card.value}) : ${parts.join(', ') || 'aucun tirage'}.`,
  );
  return movedTotal;
}

/**
 * Applique un coup. Retourne un nouvel état (clone).
 * Coups :
 *   { type: 'bid', cardId }
 *   { type: 'elan', trackId } | { type: 'elan', skip: true }
 *   { type: 'play', cardId, use: 'action', trackId?, trackId2?, choose?, }
 *   { type: 'play', cardId, use: 'value', pulls: [{trackId, steps}] }
 */
export function applyMove(prev, move) {
  if (!prev || prev.phase === 'gameover') throw new Error('La partie est terminée.');
  const state = cloneState(prev);
  const side = move.side || state.currentActor;

  if (move.type === 'bid') {
    if (state.phase !== 'bid') throw new Error('Ce n’est pas le moment d’enchérir.');
    if (!state.hands[side].includes(move.cardId)) throw new Error('Carte absente de la main.');
    if (state.bid[side]) throw new Error('Enchère déjà posée.');
    state.bid[side] = move.cardId;
    state.hands[side] = state.hands[side].filter((id) => id !== move.cardId);
    const c = cardById(move.cardId);
    log(state, `${side === 'player' ? 'Tu enchéris' : 'Secret DIA enchérít'} avec « ${c.title} » (valeur ${c.value}).`);
    state.lastMove = move;
    if (state.bid.player && state.bid.dia) resolveBids(state);
    else state.currentActor = state.bid.player ? 'dia' : 'player';
    return checkEnd(state);
  }

  if (move.type === 'elan') {
    if (state.phase !== 'elan') throw new Error('Ce n’est pas le moment de l’élan.');
    if (side !== state.currentActor) throw new Error('Ce n’est pas ton élan.');
    if (move.skip) {
      log(state, `${side === 'player' ? 'Tu laisses' : 'Le Secret DIA laisse'} l’élan de côté.`);
    } else {
      const tid = move.trackId;
      if (!tid || !state.tracks[tid] || state.tracks[tid].locked) throw new Error('Piste d’élan invalide.');
      const m = pullTrack(state, side, tid, 1);
      log(state, `Élan : ${describePull(side, tid, m)}`);
    }
    state.phase = 'play';
    state.currentActor = state.initiative;
    state.lastMove = move;
    return checkEnd(state);
  }

  if (move.type === 'play') {
    if (state.phase !== 'play') throw new Error('Ce n’est pas la phase de jeu.');
    if (side !== state.currentActor) throw new Error('Ce n’est pas ton tour.');
    if (state.playsLeft[side] <= 0) throw new Error('Plus de jeu pour ce camp.');
    const card = cardById(move.cardId);
    if (!card) throw new Error('Carte inconnue.');
    if (!state.hands[side].includes(move.cardId)) throw new Error('Carte absente de la main.');
    if (card.side !== side && !(side === 'dia' && card.side === 'dia')) {
      // player cards are side player, dia are dia — enforce
      if (card.side !== side) throw new Error('Cette carte n’appartient pas à ce camp.');
    }
    takeFromHand(state, side, move.cardId);
    if (move.use === 'value') {
      applyValue(state, side, card, move.pulls || []);
    } else if (move.use === 'action') {
      applyAction(state, side, card, move);
    } else {
      throw new Error('Il faut choisir action ou valeur.');
    }
    state.lastMove = move;
    return afterPlay(state);
  }

  throw new Error(`Coup inconnu : ${move.type}`);
}

function actionMovesForCard(state, side, card) {
  const moves = [];
  const kind = card.action.kind;
  const free = unlockedTracks(state);
  const base = { type: 'play', side, cardId: card.id, use: 'action' };

  if (kind === 'pullFixed') {
    if (state.tracks[card.action.track] && !state.tracks[card.action.track].locked) {
      moves.push({ ...base, trackId: card.action.track });
    } else {
      for (const t of free) moves.push({ ...base, trackId: t });
      if (free.length === 0) moves.push({ ...base }); // no-op legal to not get stuck
    }
    return moves;
  }
  if (kind === 'pullAny' || kind === 'pullStrong') {
    for (const t of free) moves.push({ ...base, trackId: t });
    if (free.length === 0) moves.push({ ...base });
    return moves;
  }
  if (kind === 'pullTwoTracks') {
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        moves.push({ ...base, trackId: free[i], trackId2: free[j] });
      }
    }
    if (free.length === 1) moves.push({ ...base, trackId: free[0], trackId2: free[0], _partial: true });
    // partial same track not allowed by apply — handle: if 1 free, treat as pull 1 via a special path
    // We'll not emit _partial same; instead emit a value-like single. For legality, allow a one-track pull as action via trackId2 omitted — apply throws.
    // If only 0-1 tracks, offer no-op or single as value instead. Offer no-op:
    if (free.length < 2) moves.push({ ...base, _noop: true });
    return moves.filter((m) => !m._partial);
  }
  if (kind === 'secrecy') {
    moves.push({ ...base });
    return moves;
  }
  if (kind === 'secrecyOrPull') {
    moves.push({ ...base, choose: 'secrecy' });
    for (const t of free) moves.push({ ...base, choose: 'pull', trackId: t });
    return moves;
  }
  if (kind === 'secrecyIfLocked') {
    if (lockedCount(state, 'dia') > 0) {
      moves.push({ ...base });
    } else {
      for (const t of free) moves.push({ ...base, trackId: t });
      if (free.length === 0) moves.push({ ...base, _noop: true });
    }
    return moves.filter((m) => !m._noop);
  }
  if (kind === 'placeAndLink') {
    const person = card.action.person;
    const info = state.informants[person];
    const linkedTracks = new Set(state.liens.map((l) => l.track));
    const ctrl = TRACKS.map((x) => x.id).filter((id) => state.tracks[id].locked === 'player' && !linkedTracks.has(id));
    if (info.linkedTrack) {
      for (const t of free) moves.push({ ...base, trackId: t });
      if (free.length === 0) moves.push({ ...base });
    } else {
      moves.push({ ...base }); // place only
      for (const t of ctrl) moves.push({ ...base, trackId: t });
    }
    return moves;
  }
  return moves;
}

/** Coups légaux pour le camp courant (l’enchère DIA aussi si phase bid et bid.dia vide). */
export function legalMoves(state, side) {
  if (!state || state.phase === 'gameover') return [];
  const actor = side || state.currentActor;
  const out = [];

  if (state.phase === 'bid') {
    if (state.bid[actor]) return [];
    for (const id of state.hands[actor]) {
      out.push({ type: 'bid', side: actor, cardId: id });
    }
    return out;
  }

  if (state.phase === 'elan') {
    if (actor !== state.currentActor) return [];
    out.push({ type: 'elan', side: actor, skip: true });
    for (const t of unlockedTracks(state)) {
      out.push({ type: 'elan', side: actor, trackId: t });
    }
    return out;
  }

  if (state.phase === 'play') {
    if (actor !== state.currentActor || state.playsLeft[actor] <= 0) return [];
    for (const id of state.hands[actor]) {
      const card = cardById(id);
      if (!card) continue;
      // value plays: a generic marker; concrete pulls chosen later. For AI we expand.
      out.push({ type: 'play', side: actor, cardId: id, use: 'value', pulls: [] });
      out.push(...actionMovesForCard(state, actor, card));
    }
    return out;
  }
  return out;
}

/**
 * Distribue `value` points vers `side` de façon concrète pour l’IA / la sim.
 * `alloc` = {trackId: steps}.
 */
export function valueMove(cardId, side, alloc) {
  const pulls = Object.entries(alloc)
    .filter(([, n]) => n > 0)
    .map(([trackId, steps]) => ({ trackId, steps }));
  return { type: 'play', side, cardId, use: 'value', pulls };
}

export function serialize(state) {
  return JSON.stringify(state);
}

export function deserialize(json) {
  const state = typeof json === 'string' ? JSON.parse(json) : json;
  return state;
}

/** Force une fin (paramètre de debug). */
export function debugForceEnd(prev, winner, reason) {
  const state = cloneState(prev);
  state.winner = winner;
  state.endReason = reason || (winner === 'player' ? 'liens' : 'secrecy');
  state.phase = 'gameover';
  log(state, winner === 'player' ? 'Divulgation (debug).' : 'Dossier enterré (debug).');
  return state;
}

export function playerLiens(state) {
  return state.liens.length;
}

export function isOver(state) {
  return state.phase === 'gameover' && Boolean(state.winner);
}

export const RULES = {
  LIENS_TO_WIN,
  SECRECY_TO_WIN,
  REDACT_TO_WIN,
  MAX_ROUNDS,
  HAND_SIZE,
  PLAYS_PER_ROUND,
  TRACK_MIN,
  TRACK_MAX,
};
