/** IA du Secret DIA, et joueur heuristique pour les simulations. */

import { cardById, TRACKS, LIENS_TO_WIN, SECRECY_TO_WIN, REDACT_TO_WIN } from './data.js';
import {
  applyMove,
  legalMoves,
  unlockedTracks,
  lockedCount,
  cloneState,
  valueMove,
  isOver,
} from './engine.js';

function rngOf(state, rng) {
  if (rng) return rng;
  // fallback non-déterministe seulement si aucun rng fourni (UI devrait fournir)
  let s = (state.rngState >>> 0) || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Score du point de vue du Secret DIA (plus haut = mieux pour l’IA). */
export function scoreForDia(state) {
  if (state.winner === 'dia') return 10000 + (20 - state.round);
  if (state.winner === 'player') return -10000 - state.liens.length * 10;

  let s = 0;
  const secrecyWeight = state.round >= 5 ? 80 : 35;
  s += state.secrecy * secrecyWeight;
  s += lockedCount(state, 'dia') * 200;
  s += lockedCount(state, 'player') * -180;
  s += state.liens.length * -320;
  if (state.liens.length >= LIENS_TO_WIN - 1) s -= 280;
  if (state.secrecy >= SECRECY_TO_WIN - 1) s += 140;
  if (lockedCount(state, 'dia') >= REDACT_TO_WIN - 1) s += 160;

  let unlinkedPlaced = 0;
  for (const id of Object.keys(state.informants)) {
    const p = state.informants[id];
    if (p.placed && !p.linkedTrack) unlinkedPlaced++;
  }

  for (const t of TRACKS) {
    const tr = state.tracks[t.id];
    s += -tr.pos * 22;
    if (tr.pos >= 2 && !tr.locked) s -= 90;
    if (tr.pos >= 3 && !tr.locked) s -= 80;
    if (tr.pos <= -2 && !tr.locked) s += 55;
    if (tr.pos >= 1 && unlinkedPlaced > 0) s -= 40 * unlinkedPlaced;
  }

  s += unlinkedPlaced * -25;
  // légèrement préférer la fin de manche avancée si on mène
  if (state.secrecy > state.liens.length) s += state.round * 2;
  return s;
}

/** Score du point de vue de l’Enquête. */
export function scoreForPlayer(state) {
  return -scoreForDia(state) + state.liens.length * 20;
}

function valueAllocations(state, side, value) {
  const free = unlockedTracks(state);
  if (free.length === 0 || value <= 0) return [{}];
  const allocs = [];
  const cap = 2; // même limite que le moteur
  // jusqu’à 2 sur une piste
  for (const t of free) {
    allocs.push({ [t]: Math.min(cap, value) });
  }
  if (free.length >= 2 && value >= 2) {
    const threats =
      side === 'dia'
        ? free.slice().sort((a, b) => state.tracks[b].pos - state.tracks[a].pos)
        : free.slice().sort((a, b) => state.tracks[b].pos - state.tracks[a].pos);
    const a = threats[0];
    const b = threats[1] || threats[0];
    const first = Math.min(cap, value);
    const rest = Math.min(cap, Math.max(0, value - first));
    allocs.push({ [a]: first, [b]: rest });
    if (value >= 3 && threats.length > 2) {
      allocs.push({ [a]: 2, [threats[2]]: Math.min(cap, value - 2) });
    }
  }
  return allocs;
}

function expandMoves(state, side) {
  const raw = legalMoves(state, side);
  const out = [];
  for (const m of raw) {
    if (m.type === 'play' && m.use === 'value') {
      const card = cardById(m.cardId);
      const allocs = valueAllocations(state, side, card.value);
      for (const alloc of allocs) {
        out.push(valueMove(m.cardId, side, alloc));
      }
    } else if (m._noop) {
      continue;
    } else {
      out.push(m);
    }
  }
  // toujours au moins les coups bruts si tout a été filtré
  if (out.length === 0) {
    return raw.filter((m) => !m._noop);
  }
  return out;
}

function tryMove(state, move) {
  try {
    return applyMove(state, move);
  } catch {
    return null;
  }
}

function pickByDifficulty(scored, difficulty, rng, maximize) {
  if (scored.length === 0) return null;
  scored.sort((a, b) => (maximize ? b.score - a.score : a.score - b.score));
  if (difficulty === 'difficile') return scored[0].move;
  if (difficulty === 'normal') {
    if (scored.length > 1 && rng() < 0.12) return scored[1].move;
    return scored[0].move;
  }
  // facile : davantage d’erreurs pour viser ~65 % de victoires au joueur heuristique
  if (scored.length > 1 && rng() < 0.50) return scored[Math.min(scored.length - 1, 1 + Math.floor(rng() * 3))].move;
  if (rng() < 0.22) return scored[Math.floor(rng() * scored.length)].move;
  return scored[0].move;
}

/**
 * Vue d’enchère simultanée : la mise adverse n’est pas visible, et sa carte
 * est remise en main (état de début de phase). Infos publiques conservées :
 * pistes, liens, secret, défausses, taille des mains.
 */
export function simultaneousBidView(state, side) {
  const s = cloneState(state);
  const other = side === 'dia' ? 'player' : 'dia';
  if (s.bid && s.bid[other]) {
    const id = s.bid[other];
    if (!s.hands[other].includes(id)) s.hands[other] = [...s.hands[other], id];
  }
  s.bid = { player: null, dia: null };
  return s;
}

function publicThreat(state, side) {
  if (side === 'dia') {
    return (
      TRACKS.some((t) => state.tracks[t.id].pos >= 2 && !state.tracks[t.id].locked) ||
      state.liens.length >= LIENS_TO_WIN - 1 ||
      lockedCount(state, 'player') >= 2
    );
  }
  return (
    TRACKS.some((t) => state.tracks[t.id].pos <= -2 && !state.tracks[t.id].locked) ||
    state.secrecy >= SECRECY_TO_WIN - 1 ||
    lockedCount(state, 'dia') >= REDACT_TO_WIN - 1
  );
}

function chooseBid(state, side, difficulty, rng) {
  // Jamais la mise adverse : on travaille uniquement sur la vue simultanée.
  const view = simultaneousBidView(state, side);
  const moves = legalMoves(view, side).filter((m) => m.type === 'bid');
  if (moves.length === 0) return null;
  const cards = moves.map((m) => ({ move: m, card: cardById(m.cardId) }));
  cards.sort((a, b) => a.card.value - b.card.value);

  const threat = publicThreat(view, side);
  // Infos publiques seulement (défausse, secret, pistes). Jamais state.bid adverse.

  if (side === 'dia' && difficulty === 'facile') {
    return cards[0].move; // toujours une petite mise
  }
  if (side === 'dia' && difficulty === 'difficile') {
    // Mise agressive sur info publique seulement (jamais la carte adverse) :
    // on réserve une petite carte, on mise souvent haut pour l’initiative.
    const pubPress =
      threat ||
      view.round <= 3 ||
      view.secrecy >= SECRECY_TO_WIN - 2 ||
      lockedCount(view, 'player') >= 1 ||
      TRACKS.some((t) => view.tracks[t.id].pos >= 1 && !view.tracks[t.id].locked) ||
      (view.discards && view.discards.player && view.discards.player.length >= 6);
    if (pubPress) return cards[cards.length - 1].move;
    // Sinon l’avant-dernière (garde un 4-5 pour plus tard si ce n’est pas urgent)
    if (cards.length >= 2) return cards[cards.length - 2].move;
    return cards[cards.length - 1].move;
  }
  if (side === 'dia') {
    // normal
    if (threat) return cards[cards.length - 1].move;
    return cards[Math.floor((cards.length - 1) / 2)].move;
  }

  // joueur heuristique : éviter de miser un informateur
  const nonInfo = cards.filter((c) => c.card.kind !== 'informant');
  const pool = nonInfo.length ? nonInfo : cards;
  if (threat) return pool[Math.max(0, pool.length - 1)].move;
  return pool[Math.floor(pool.length / 2)].move;
}

function chooseElan(state, side, difficulty, rng) {
  const moves = legalMoves(state, side);
  const scored = [];
  for (const m of moves) {
    const next = tryMove(state, m);
    if (!next) continue;
    const score = side === 'dia' ? scoreForDia(next) : scoreForPlayer(next);
    scored.push({ move: m, score });
  }
  if (scored.length === 0) return moves[0] || null;
  const maximize = true;
  if (side === 'dia' && difficulty === 'facile' && rng() < 0.28) {
    return moves.find((m) => m.skip) || scored[0].move;
  }
  scored.sort((a, b) => b.score - a.score);
  return scored[0].move;
}

/**
 * Choisit un coup pour `side` ('dia' ou 'player').
 * En phase d’enchère, la décision passe par simultaneousBidView : l’IA n’a
 * jamais accès à la mise adverse (enchère simultanée).
 */
export function chooseMove(state, side, rng) {
  const r = rngOf(state, rng);
  const difficulty = side === 'dia' ? state.difficulty : 'normal';

  if (state.phase === 'bid') return chooseBid(state, side, difficulty, r);
  if (state.phase === 'elan') return chooseElan(state, side, difficulty, r);

  const moves = expandMoves(state, side);
  if (side === 'player') {
    const lien = moves.find((m) => {
      if (m.use !== 'action' || !m.trackId) return false;
      const c = cardById(m.cardId);
      return c && c.kind === 'informant' && !state.informants[c.person]?.linkedTrack;
    });
    if (lien) return lien;
  }
  const scored = [];
  for (const m of moves) {
    const next = tryMove(state, m);
    if (!next) continue;
    const score = side === 'dia' ? scoreForDia(next) : scoreForPlayer(next);
    scored.push({ move: m, score });
  }
  if (scored.length === 0) {
    const raw = legalMoves(state, side);
    return raw[0] || null;
  }
  return pickByDifficulty(scored, difficulty, r, true);
}

export { expandMoves };
