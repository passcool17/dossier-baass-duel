import { runAll } from '../js/sim.js';

const n = Number(process.argv[2]) || 200;
const seed = Number(process.argv[3]) || 2026;
const r = runAll(n, seed);
for (const d of ['facile', 'normal', 'difficile']) {
  const s = r[d];
  console.log(
    `${d}: ${(s.playerRate * 100).toFixed(1)} % Enquête (${s.player}/${s.n}), DIA ${s.dia}, inachevé ${s.unfinished}`,
    JSON.stringify(s.reasons),
  );
}
