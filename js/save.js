import { SAVE_KEY, SETTINGS_KEY } from './data.js';
import { serialize, deserialize } from './engine.js';

export function saveGame(state, storage = globalThis.localStorage) {
  if (!storage) return false;
  try {
    storage.setItem(SAVE_KEY, serialize(state));
    return true;
  } catch {
    return false;
  }
}

export function loadGame(storage = globalThis.localStorage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = deserialize(raw);
    if (!state || typeof state !== 'object' || !state.phase) return null;
    return state;
  } catch {
    return null;
  }
}

export function clearGame(storage = globalThis.localStorage) {
  if (!storage) return;
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadSettings(storage = globalThis.localStorage) {
  const defaults = { muted: false };
  if (!storage) return defaults;
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings, storage = globalThis.localStorage) {
  if (!storage) return;
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
