import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame,
  applyMove,
  legalMoves,
  pullTrack,
  checkEnd,
  debugForceEnd,
  isOver,
  unlockedTracks,
  lockedCount,
  cloneState,
  RULES,
} from '../js/engine.js';
import { LIENS_TO_WIN, SECRECY_TO_WIN, REDACT_TO_WIN, TRACKS, cardById } from '../js/data.js';
import { chooseMove } from '../js/ai.js';
import { makeRng } from '../js/engine.js';

function bidBoth(state, pCard, dCard) {
  let s = applyMove(state, { type: 'bid', side: 'player', cardId: pCard });
  s = applyMove(s, { type: 'bid', side: 'dia', cardId: dCard });
  return s;
}

function skipElan(state) {
  if (state.phase !== 'elan') return state;
  return applyMove(state, { type: 'elan', side: state.currentActor, skip: true });
}

test('une partie neuve a 5 cartes en main, pistes à 0, phase enchère', () => {
  const s = createGame({ difficulty: 'normal', seed: 7 });
  assert.equal(s.phase, 'bid');
  assert.equal(s.hands.player.length, 5);
  assert.equal(s.hands.dia.length, 5);
  assert.equal(s.round, 1);
  assert.equal(s.secrecy, 0);
  assert.equal(s.liens.length, 0);
  for (const t of TRACKS) {
    assert.equal(s.tracks[t.id].pos, 0);
    assert.equal(s.tracks[t.id].locked, null);
  }
  const bids = legalMoves(s, 'player');
  assert.equal(bids.length, 5);
  assert.ok(bids.every((m) => m.type === 'bid'));
});

test('le secret commence à 0 quelle que soit la difficulté (mêmes règles)', () => {
  assert.equal(createGame({ difficulty: 'facile', seed: 1 }).secrecy, 0);
  assert.equal(createGame({ difficulty: 'normal', seed: 1 }).secrecy, 0);
  assert.equal(createGame({ difficulty: 'difficile', seed: 1 }).secrecy, 0);
});

test('enchère : la plus haute valeur gagne l’initiative et un élan', () => {
  const s0 = createGame({ difficulty: 'normal', seed: 11 });
  // choisir des valeurs différentes si possible
  const pCards = s0.hands.player.map((id) => cardById(id)).sort((a, b) => b.value - a.value);
  const dCards = s0.hands.dia.map((id) => cardById(id)).sort((a, b) => a.value - b.value);
  const s = skipElan(bidBoth(s0, pCards[0].id, dCards[0].id));
  if (pCards[0].value > dCards[0].value) {
    assert.equal(s.initiative, 'player');
  } else if (pCards[0].value < dCards[0].value) {
    assert.equal(s.initiative, 'dia');
  }
  assert.equal(s.phase, 'play');
  assert.equal(s.currentActor, s.initiative);
  assert.equal(s.playsLeft.player, 2);
  assert.equal(s.playsLeft.dia, 2);
  // les cartes d’enchère sont défaussées, plus en main
  assert.equal(s.hands.player.includes(pCards[0].id), false);
  assert.equal(s.discards.player.includes(pCards[0].id), true);
});

test('égalité d’enchère : l’initiative se conserve (Enquête au premier tour)', () => {
  function playTie(diff) {
    const s0 = createGame({ difficulty: diff, seed: 3 });
    // Trouver une paire de même valeur, ou forcer en remplaçant la main (via setup)
    return s0;
  }
  const sN = createGame({
    difficulty: 'normal',
    seed: 1,
    stacked: { player: ['area-lift'], dia: ['dia-cover'] },
  });
  // area-lift value 2, dia-cover value 1 — not a tie. Force after deal? Use setup.
  const a = createGame({
    difficulty: 'normal',
    seed: 99,
    setup(st) {
      // put known values: info-4 is 3, dia-conf-3 is 3
      st.hands.player = ['info-4', ...st.hands.player.filter((id) => id !== 'info-4')].slice(0, 5);
      st.hands.dia = ['dia-conf-3', ...st.hands.dia.filter((id) => id !== 'dia-conf-3')].slice(0, 5);
    },
  });
  assert.ok(a.hands.player.includes('info-4'));
  assert.ok(a.hands.dia.includes('dia-conf-3'));
  const after = bidBoth(a, 'info-4', 'dia-conf-3');
  assert.equal(cardById('info-4').value, cardById('dia-conf-3').value);
  assert.equal(after.initiative, 'player');

  const b = createGame({
    difficulty: 'difficile',
    seed: 99,
    noSecrecyStart: true,
    setup(st) {
      st.hands.player = ['info-4', ...st.hands.player.filter((id) => id !== 'info-4')].slice(0, 5);
      st.hands.dia = ['dia-conf-3', ...st.hands.dia.filter((id) => id !== 'dia-conf-3')].slice(0, 5);
    },
  });
  const afterB = bidBoth(b, 'info-4', 'dia-conf-3');
  assert.equal(afterB.initiative, 'player'); // première manche, égalité → Enquête, toutes difficultés
});

test('jouer pour la valeur tire les jetons du bon côté et verrouille à ±3', () => {
  let s = createGame({
    difficulty: 'normal',
    seed: 5,
    setup(st) {
      st.hands.player = ['roswell-debris', 'area-lift', 'info-4', 'proj-campus', 'area-other'];
      st.hands.dia = ['dia-cover', 'dia-trust', 'dia-conf-3', 'dia-natsec', 'dia-1843-aff'];
    },
  });
  s = skipElan(bidBoth(s, 'area-other', 'dia-cover')); // values 2 vs 1, player initiative
  assert.equal(s.phase, 'play');
  assert.equal(s.currentActor, 'player');
  // roswell-debris value 5, mais au plus 2 cases par piste
  s = applyMove(s, {
    type: 'play',
    cardId: 'roswell-debris',
    use: 'value',
    pulls: [{ trackId: 'dynamique', steps: 5 }],
  });
  assert.equal(s.tracks.dynamique.pos, 2);
  assert.equal(s.tracks.dynamique.locked, null);
  // verrouillage à +4
  const st = createGame({ difficulty: 'normal', seed: 1 });
  st.tracks.dynamique.pos = 3;
  pullTrack(st, 'player', 'dynamique', 2);
  assert.equal(st.tracks.dynamique.pos, 4);
  assert.equal(st.tracks.dynamique.locked, 'player');
  pullTrack(st, 'dia', 'dynamique', 2);
  assert.equal(st.tracks.dynamique.pos, 4);
  assert.equal(st.tracks.dynamique.locked, 'player');
});

test('jouer pour l’action (piste fixe) tire de 2', () => {
  let s = createGame({
    difficulty: 'normal',
    seed: 5,
    setup(st) {
      st.hands.player = ['area-propulsion', 'area-lift', 'info-4', 'proj-campus', 'area-other'];
      st.hands.dia = ['dia-cover', 'dia-trust', 'dia-conf-3', 'dia-natsec', 'dia-1843-aff'];
    },
  });
  s = skipElan(bidBoth(s, 'area-other', 'dia-cover'));
  s = applyMove(s, { type: 'play', cardId: 'area-propulsion', use: 'action', trackId: 'dynamique' });
  assert.equal(s.tracks.dynamique.pos, 2);
  assert.equal(s.tracks.dynamique.locked, null);
});

test('le Secret DIA tire vers les négatifs et peut caviarder (verrouiller à -3)', () => {
  let s = createGame({
    difficulty: 'normal',
    seed: 5,
    setup(st) {
      st.hands.player = ['area-other', 'area-lift', 'info-4', 'proj-campus', 'area-interface'];
      st.hands.dia = ['dia-1843-aff', 'dia-medical', 'dia-conf-3', 'dia-natsec', 'dia-cover'];
      st.initiative = 'dia';
    },
  });
  s = skipElan(bidBoth(s, 'area-other', 'dia-cover'));
  // after bid, initiative depends on values (2 vs 1) — player. We'll play and then DIA.
  if (s.currentActor === 'player') {
    s = applyMove(s, { type: 'play', cardId: 'area-lift', use: 'value', pulls: [] });
  }
  assert.equal(s.currentActor, 'dia');
  // pullStrong 3 on structure
  s = applyMove(s, { type: 'play', cardId: 'dia-1843-aff', use: 'action', trackId: 'structure' });
  assert.equal(s.tracks.structure.pos, -2);
  assert.equal(s.tracks.structure.locked, null);
  s.tracks.structure.pos = -3;
  pullTrack(s, 'dia', 'structure', 2);
  assert.equal(s.tracks.structure.pos, -4);
  assert.equal(s.tracks.structure.locked, 'dia');
});

test('monter le secret jusqu’à 5 donne la victoire au Secret DIA', () => {
  let s = createGame({ difficulty: 'normal', seed: 1 });
  s.secrecy = SECRECY_TO_WIN;
  s = checkEnd(s);
  assert.equal(s.winner, 'dia');
  assert.equal(s.endReason, 'secrecy');
  assert.ok(isOver(s));
});

test('3 pistes caviardées donnent la victoire au Secret DIA', () => {
  let s = createGame({ difficulty: 'normal', seed: 1 });
  s.tracks.dynamique = { pos: -4, locked: 'dia' };
  s.tracks.energie = { pos: -4, locked: 'dia' };
  s.tracks.structure = { pos: -4, locked: 'dia' };
  s = checkEnd(s);
  assert.equal(s.winner, 'dia');
  assert.equal(s.endReason, 'redact');
  assert.equal(lockedCount(s, 'dia'), 3);
});

test('3 liens sur des pistes distinctes donnent la victoire à l’Enquête', () => {
  let s = createGame({
    difficulty: 'normal',
    seed: 5,
    setup(st) {
      st.hands.player = ['info-4', 'info-7', 'info-5', 'info-8', 'area-other'];
      st.hands.dia = ['dia-cover', 'dia-trust', 'dia-conf-3', 'dia-natsec', 'dia-remain'];
      st.tracks.dynamique = { pos: 4, locked: 'player' };
      st.tracks.energie = { pos: 4, locked: 'player' };
      st.tracks.structure = { pos: 4, locked: 'player' };
      st.tracks.humain = { pos: 4, locked: 'player' };
    },
  });
  s = skipElan(bidBoth(s, 'area-other', 'dia-cover'));
  // player plays first, 2 plays this round — need 4 liens so two rounds. Set 3 liens already.
  s.informants['7'] = { placed: true, linkedTrack: 'energie' };
  s.informants['5'] = { placed: true, linkedTrack: 'structure' };
  s.liens = [
    { person: '7', track: 'energie' },
    { person: '5', track: 'structure' },
  ];
  assert.equal(s.currentActor, 'player');
  s = applyMove(s, { type: 'play', cardId: 'info-4', use: 'action', trackId: 'dynamique' });
  assert.equal(s.liens.length, 3);
  assert.equal(s.winner, 'player');
  assert.equal(s.endReason, 'liens');
  assert.ok(isOver(s));
});

test('on ne peut pas lier sans avoir verrouillé la piste (+4)', () => {
  let s = createGame({
    difficulty: 'normal',
    seed: 5,
    setup(st) {
      st.hands.player = ['info-4', 'info-7', 'info-5', 'info-8', 'area-other'];
      st.hands.dia = ['dia-cover', 'dia-trust', 'dia-conf-3', 'dia-natsec', 'dia-remain'];
    },
  });
  s = skipElan(bidBoth(s, 'area-other', 'dia-cover'));
  s = applyMove(s, { type: 'play', cardId: 'info-4', use: 'action', trackId: 'dynamique' });
  // place but no lien (track at 0)
  assert.equal(s.informants['4'].placed, true);
  assert.equal(s.informants['4'].linkedTrack, null);
  assert.equal(s.liens.length, 0);
});

test('debugForceEnd rend les deux fins accessibles', () => {
  const s = createGame({ difficulty: 'facile', seed: 1 });
  const w = debugForceEnd(s, 'player', 'liens');
  assert.equal(w.winner, 'player');
  assert.ok(isOver(w));
  const l = debugForceEnd(s, 'dia', 'secrecy');
  assert.equal(l.winner, 'dia');
  assert.ok(isOver(l));
});

test('une partie complète (IA vs heuristique) se termine des deux côtés selon la graine', () => {
  // Juste vérifier qu’on peut jouer jusqu’à la fin sans exception.
  function play(diff, seed) {
    let st = createGame({ difficulty: diff, seed });
    const rng = makeRng((seed ^ 12345) >>> 0);
    let n = 0;
    while (!isOver(st) && n < 400) {
      const actor = st.phase === 'bid' && !st.bid.player ? 'player' : st.currentActor;
      const mv = chooseMove(st, actor, rng);
      assert.ok(mv, `pas de coup ${st.phase} ${actor} r${st.round}`);
      st = applyMove(st, mv);
      n++;
    }
    return st;
  }
  const a = play('facile', 2026);
  const b = play('difficile', 7);
  assert.ok(isOver(a), 'facile doit finir');
  assert.ok(isOver(b), 'difficile doit finir');
  // au moins un gagnant défini
  assert.ok(a.winner === 'player' || a.winner === 'dia');
  assert.ok(b.winner === 'player' || b.winner === 'dia');
});

test('les cartes d’action du DIA de type secret montent bien la piste', () => {
  let s = createGame({
    difficulty: 'normal',
    seed: 5,
    setup(st) {
      st.hands.player = ['area-other', 'area-lift', 'info-4', 'proj-campus', 'area-interface'];
      st.hands.dia = ['dia-natsec', 'dia-trust', 'dia-conf-3', 'dia-cover', 'dia-remain'];
    },
  });
  s = skipElan(bidBoth(s, 'area-other', 'dia-remain'));
  if (s.currentActor === 'player') {
    s = applyMove(s, { type: 'play', cardId: 'area-lift', use: 'value', pulls: [] });
  }
  const before = s.secrecy;
  s = applyMove(s, { type: 'play', cardId: 'dia-natsec', use: 'action' });
  assert.equal(s.secrecy, before + 1);
});
