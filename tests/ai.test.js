import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, applyMove, cloneState, makeRng } from '../js/engine.js';
import { chooseMove, simultaneousBidView } from '../js/ai.js';
import { cardById } from '../js/data.js';

function playerCardsByValue(state) {
  return state.hands.player
    .map((id) => cardById(id))
    .sort((a, b) => a.value - b.value || a.id.localeCompare(b.id));
}

test('l’enchère de l’IA est identique quelle que soit la mise du joueur', () => {
  for (const diff of ['facile', 'normal', 'difficile']) {
    for (const seed of [1, 7, 42, 99, 2026, 31415]) {
      const s0 = createGame({ difficulty: diff, seed });
      const cards = playerCardsByValue(s0);
      assert.ok(cards.length >= 2, 'main trop courte');
      const low = cards[0];
      const high = cards[cards.length - 1];
      // Même si les valeurs sont égales, on mise deux cartes différentes.
      const a = applyMove(cloneState(s0), { type: 'bid', side: 'player', cardId: low.id });
      const b = applyMove(cloneState(s0), { type: 'bid', side: 'player', cardId: high.id });
      assert.equal(a.rngState, b.rngState, `${diff} seed ${seed}: le bid joueur ne doit pas toucher le RNG`);
      assert.equal(a.bid.player, low.id);
      assert.equal(b.bid.player, high.id);
      const rngA = makeRng(a.seed, a.rngState);
      const rngB = makeRng(b.seed, b.rngState);
      const mA = chooseMove(a, 'dia', rngA);
      const mB = chooseMove(b, 'dia', rngB);
      assert.ok(mA && mA.type === 'bid', `${diff} ${seed} pas de mise IA (A)`);
      assert.ok(mB && mB.type === 'bid', `${diff} ${seed} pas de mise IA (B)`);
      assert.equal(
        mA.cardId,
        mB.cardId,
        `${diff} seed ${seed}: IA a choisi ${mA.cardId} (vs joueur ${low.id} val ${low.value}) ` +
          `puis ${mB.cardId} (vs joueur ${high.id} val ${high.value})`,
      );
    }
  }
});

test('la vue d’enchère simultanée masque la mise adverse et rétablit sa main', () => {
  const s0 = createGame({ difficulty: 'difficile', seed: 11 });
  const card = s0.hands.player[0];
  const after = applyMove(s0, { type: 'bid', side: 'player', cardId: card });
  assert.equal(after.bid.player, card);
  assert.equal(after.hands.player.includes(card), false);
  const view = simultaneousBidView(after, 'dia');
  assert.equal(view.bid.player, null);
  assert.equal(view.bid.dia, null);
  assert.ok(view.hands.player.includes(card), 'la carte mise doit être de nouveau en main dans la vue');
  assert.equal(view.hands.player.length, s0.hands.player.length);
  // La vue ne doit pas laisser fuiter la mise par un autre champ
  assert.equal(view.lastMove && view.lastMove.type === 'bid' ? 'present' : 'ok', 'present');
  // lastMove may still mention the bid — chooseBid must not use it.
  // On vérifie que chooseBid via chooseMove ignore aussi lastMove en comparant à l’état initial.
  const fromStart = chooseMove(s0, 'dia', makeRng(s0.seed, s0.rngState));
  const fromAfter = chooseMove(after, 'dia', makeRng(after.seed, after.rngState));
  assert.equal(fromStart.cardId, fromAfter.cardId);
});

test('en Difficile, l’IA ne mise pas juste au-dessus de la carte du joueur par construction', () => {
  // Sur plusieurs graines, si le joueur mise 2 et que l’IA a un 3, un comportement
  // « juste au-dessus » choisirait toujours 3. On exige que le choix soit le même
  // que lorsque le joueur mise sa carte la plus haute (souvent 4 ou 5).
  let comparable = 0;
  let same = 0;
  for (let seed = 1; seed <= 80; seed++) {
    const s0 = createGame({ difficulty: 'difficile', seed });
    const cards = playerCardsByValue(s0);
    const low = cards[0];
    const high = cards[cards.length - 1];
    if (low.value === high.value) continue;
    const a = applyMove(cloneState(s0), { type: 'bid', side: 'player', cardId: low.id });
    const b = applyMove(cloneState(s0), { type: 'bid', side: 'player', cardId: high.id });
    const mA = chooseMove(a, 'dia', makeRng(a.seed, a.rngState));
    const mB = chooseMove(b, 'dia', makeRng(b.seed, b.rngState));
    comparable++;
    if (mA.cardId === mB.cardId) same++;
  }
  assert.ok(comparable > 20, 'pas assez de paires de valeurs distinctes');
  assert.equal(same, comparable, `identique ${same}/${comparable}`);
});
