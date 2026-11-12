import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, applyMove, serialize, deserialize } from '../js/engine.js';
import { saveGame, loadGame, clearGame, loadSettings, saveSettings } from '../js/save.js';

function mem() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

test('sauvegarde et rechargement reprennent la même partie', () => {
  const storage = mem();
  let s = createGame({ difficulty: 'normal', seed: 42 });
  const card = s.hands.player[0];
  s = applyMove(s, { type: 'bid', side: 'player', cardId: card });
  assert.equal(saveGame(s, storage), true);
  const loaded = loadGame(storage);
  assert.ok(loaded);
  assert.equal(deserialize(serialize(s)).bid.player, card);
  assert.equal(loaded.bid.player, card);
  assert.equal(loaded.seed, 42);
  assert.deepEqual(loaded.tracks, s.tracks);
  clearGame(storage);
  assert.equal(loadGame(storage), null);
});

test('réglages muet', () => {
  const storage = mem();
  assert.equal(loadSettings(storage).muted, false);
  saveSettings({ muted: true }, storage);
  assert.equal(loadSettings(storage).muted, true);
});
