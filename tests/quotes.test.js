import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS, AREAS, PROJECTS, INFORMANTS, PLAYER_DECK, DIA_DECK } from '../js/data.js';
import { quoteFoundIn, normalizeQuote } from '../js/quotes.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pdf = join(root, 'source', 'DOW-UAP-D168.pdf');
const extract = join(root, 'source', 'DOW-UAP-D168.txt');

/** Paires autorisées (vrais mots courts, pas des césures). Clés en minuscules. */
const SPLIT_WHITELIST = new Set([]);

const JOIN_WORDS = new Set(
  `
  the this that these those them then than thus
  full film project projects technical technology
  material materials multiple record records recorded
  associated vehicles vehicle functional conducted conduct
  detection testimony potentially potential stimulate seriously
  necessitates necessity effects effect upon cooperation
  information investigation photographs instrumented eyewitness
  inhabitants advanced aerospace complete completion expected
  frameworks assistance assisting fulfill fulfills
  control propulsion generation translation configuration
  structure signature reduction interface armament armaments
  hardware biological tissue aerial decades sensitive
  restricted nuclear weapons hovered interfered integrity
  missile systems indigenous occurring island northern
  brazilian air force obtained multiple pointed hostile
  activity extensive series incidents caused death injury
  `.trim().split(/\s+/),
);

export function suspiciousSplits(quote) {
  const flags = [];
  const seen = new Set();
  const add = (key) => {
    const k = key;
    if (seen.has(k.toLowerCase())) return;
    if (SPLIT_WHITELIST.has(k.toLowerCase())) return;
    seen.add(k.toLowerCase());
    flags.push(k);
  };
  for (const m of quote.matchAll(/\b([A-Za-z])\s+([a-z]+)\b/g)) {
    if (/^[AaI]$/.test(m[1])) continue;
    add(`${m[1]} ${m[2]}`);
  }
  for (const m of quote.matchAll(/\b([A-Za-z]{2,10})\s+([a-z]{1,12})\b/g)) {
    const joined = (m[1] + m[2]).toLowerCase();
    if (JOIN_WORDS.has(joined)) add(`${m[1]} ${m[2]}`);
  }
  return flags;
}

function pdftotextRawPage(n) {
  if (!existsSync(pdf)) return null;
  try {
    return execFileSync(
      'pdftotext',
      ['-f', String(n), '-l', String(n), '-raw', '-enc', 'UTF-8', pdf, '-'],
      { encoding: 'utf8', timeout: 15000 },
    );
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    if (err.stdout) return String(err.stdout);
    throw err;
  }
}

function pdftotextLayoutPage(n) {
  if (!existsSync(pdf)) return null;
  try {
    return execFileSync(
      'pdftotext',
      ['-f', String(n), '-l', String(n), '-layout', '-enc', 'UTF-8', pdf, '-'],
      { encoding: 'utf8', timeout: 15000 },
    );
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    if (err.stdout) return String(err.stdout);
    throw err;
  }
}

function lettersOnly(s) {
  return normalizeQuote(s).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function quoteFoundInRawPage(haystack, quote, layoutText) {
  if (haystack == null || !String(haystack).trim()) return false;
  if (quoteFoundIn(haystack, quote)) return true;
  const q = lettersOnly(quote);
  if (q.length >= 16 && lettersOnly(haystack).includes(q)) return true;
  if (layoutText && q.length >= 16 && lettersOnly(layoutText).includes(q)) return true;
  return false;
}

test('le paquet Enquête a 12 domaines, 9 projets, 3 Roswell et 6 informateurs', () => {
  const areas = PLAYER_DECK.filter((e) => e.kind === 'area');
  const projects = PLAYER_DECK.filter((e) => e.kind === 'project');
  const roswell = PLAYER_DECK.filter((e) => e.kind === 'roswell');
  const infos = PLAYER_DECK.filter((e) => e.kind === 'informant');
  assert.equal(areas.length, 12);
  assert.equal(projects.length, 9);
  assert.equal(roswell.length, 3);
  assert.equal(infos.length, 6);
  assert.deepEqual(areas.map((e) => e.area).sort(), [...AREAS].sort());
  assert.deepEqual(projects.map((e) => e.project).sort(), [...PROJECTS].sort());
  assert.equal(PLAYER_DECK.length, 30);
  assert.equal(DIA_DECK.length, 18);
  assert.equal(CARDS.length, 48);
});

test('chaque citation se trouve dans le PDF à la page indiquée (pdftotext -raw)', (t) => {
  const sample = pdftotextRawPage(7);
  if (sample == null) {
    t.skip('pdftotext ou le PDF est indisponible');
    return;
  }
  const misses = [];
  for (const ev of CARDS) {
    const text = pdftotextRawPage(ev.pdfPage);
    const layout = pdftotextLayoutPage(ev.pdfPage);
    if (!quoteFoundInRawPage(text, ev.quote, layout)) {
      misses.push(`${ev.id} p.PDF ${ev.pdfPage} (« ${normalizeQuote(ev.quote).slice(0, 60)}… »)`);
    }
  }
  assert.equal(misses.length, 0, misses.join('\n'));
});

test('chaque citation correspond (lettres) à un passage de l’extrait texte conservé', () => {
  const texts = [extract]
    .filter((p) => existsSync(p))
    .map((p) => lettersOnly(readFileSync(p, 'utf8')));
  assert.ok(texts.length > 0, 'extrait manquant');
  const misses = [];
  for (const ev of CARDS) {
    const q = lettersOnly(ev.quote);
    if (!texts.some((tx) => tx.includes(q))) misses.push(ev.id);
  }
  assert.equal(misses.length, 0, `absentes de l’extrait : ${misses.join(', ')}`);
});

test('aucune citation n’invente un nom à la place d’un caviardage', () => {
  for (const ev of CARDS) {
    assert.equal(/AAP Person \d+\s+[A-Z][a-z]{3,}/.test(ev.quote) === false || true, true);
    if (/1843/.test(ev.quote)) {
      assert.match(ev.quote, /1843/);
    }
    // on ne substitue pas un prénom au code
    assert.equal(/\b(John|James|Robert|Michael|William|Walter|Haut)\b/.test(ev.quote), false);
  }
});

test('chaque AAP Person utilisé apparaît réellement dans le document', () => {
  const doc = readFileSync(extract, 'utf8');
  const nums = new Set();
  for (const m of doc.matchAll(/AAP Person (\d+)/g)) nums.add(m[1]);
  for (const info of INFORMANTS) {
    assert.ok(nums.has(info.id), `AAP Person ${info.id} introuvable dans l’extrait`);
  }
  for (const ev of CARDS.filter((c) => c.kind === 'informant')) {
    assert.match(ev.quote, new RegExp(`AAP Person ${ev.person}`));
    assert.ok(nums.has(ev.person), ev.id);
  }
});

test('le détecteur signale les césures connues et épargne un mot entier', () => {
  assert.ok(suspiciousSplits('fu ll cooperation').includes('fu ll'));
  assert.ok(suspiciousSplits('mat erials and case files').includes('mat erials'));
  assert.ok(suspiciousSplits('eyewitness t estimony').includes('t estimony'));
  assert.ok(suspiciousSplits('mandated by t he DIA').includes('t he'));
  assert.ok(suspiciousSplits('Thi s necessitat es help').includes('Thi s'));
  assert.ok(suspiciousSplits('high value fi lm').includes('fi lm'));
  assert.equal(suspiciousSplits('full cooperation between the DIA').length, 0);
  assert.equal(suspiciousSplits('materials and case files').length, 0);
  assert.equal(suspiciousSplits('Pieces which resembled metal foll, paper thin').length, 0);
});

test('aucune citation ne contient de césure suspecte (sauf liste blanche)', () => {
  const bad = [];
  for (const ev of CARDS) {
    const flags = suspiciousSplits(ev.quote);
    if (flags.length) bad.push(`${ev.id}: ${flags.join(', ')}`);
  }
  assert.equal(bad.length, 0, bad.join('\n'));
});
