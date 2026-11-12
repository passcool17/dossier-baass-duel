/** Simulations déterministes d’un joueur heuristique contre l’IA. */

import { createGame, applyMove, isOver, makeRng } from './engine.js';
import { chooseMove } from './ai.js';

export function playGame(opts = {}) {
  const seed = opts.seed != null ? opts.seed : 1;
  let state = createGame({
    difficulty: opts.difficulty || 'normal',
    seed,
    tutorial: false,
  });
  const rng = makeRng((seed ^ 0x9e3779b9) >>> 0);
  let steps = 0;
  const maxSteps = opts.maxSteps || 400;
  while (!isOver(state) && steps < maxSteps) {
    const side = state.currentActor;
    // En phase d’enchère, le joueur pose d’abord, puis l’IA — mais chaque camp
    // choisit sans se caler sur la carte adverse (chooseMove l’ignore).
    const actor = state.phase === 'bid' && !state.bid.player ? 'player' : side;
    const move = chooseMove(state, actor, rng);
    if (!move) break;
    try {
      state = applyMove(state, move);
    } catch {
      break;
    }
    steps++;
  }
  return {
    winner: state.winner,
    reason: state.endReason,
    round: state.round,
    liens: state.liens.length,
    secrecy: state.secrecy,
    steps,
    over: isOver(state),
  };
}

export function runSims(opts = {}) {
  const n = opts.n || 200;
  const seed0 = opts.seed0 != null ? opts.seed0 : 2026;
  const difficulty = opts.difficulty || 'normal';
  let player = 0;
  let dia = 0;
  let unfinished = 0;
  const reasons = {};
  for (let i = 0; i < n; i++) {
    const r = playGame({ difficulty, seed: (seed0 + i * 997) >>> 0 });
    if (r.winner === 'player') player++;
    else if (r.winner === 'dia') dia++;
    else unfinished++;
    const k = r.reason || 'none';
    reasons[k] = (reasons[k] || 0) + 1;
  }
  return {
    difficulty,
    n,
    player,
    dia,
    unfinished,
    playerRate: player / n,
    diaRate: dia / n,
    reasons,
  };
}

export function runAll(n = 200, seed0 = 2026) {
  return {
    facile: runSims({ n, seed0, difficulty: 'facile' }),
    normal: runSims({ n, seed0, difficulty: 'normal' }),
    difficile: runSims({ n, seed0, difficulty: 'difficile' }),
  };
}
