/** Interface tactile. Tout le texte visible est en français. */

import {
  DISCLAIMER,
  DISCLAIMER_SHORT,
  CREDIT,
  DOCUMENT_META,
  TRACKS,
  INFORMANTS,
  LIENS_TO_WIN,
  SECRECY_TO_WIN,
  REDACT_TO_WIN,
  MAX_ROUNDS,
  TRACK_MIN,
  TRACK_MAX,
  VERSION,
  cardById,
  trackById,
} from './data.js';
import {
  createGame,
  applyMove,
  legalMoves,
  isOver,
  debugForceEnd,
  makeRng,
  unlockedTracks,
} from './engine.js';
import { chooseMove } from './ai.js';
import { saveGame, loadGame, clearGame, loadSettings, saveSettings } from './save.js';
import { unlockAudio, play, isMuted, setMuted, isUnlocked } from './audio.js';

const $app = () => document.getElementById('app');

let screen = 'home'; // home | rules | credits | game | end
let game = null;
let ui = resetUi();
let settings = { muted: false };
let aiTimer = null;
let aiBusy = false;

function resetUi() {
  return {
    selected: null,
    sheet: null, // cardId
    mode: null, // value | target | target2 | elan | secrecy-choice
    alloc: {},
    remain: 0,
    pendingCard: null,
    pendingMove: null,
    trackPicks: [],
    tutorialStep: 0,
    toast: '',
  };
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function reducedMotion() {
  return globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function gesture() {
  unlockAudio();
  if (settings.muted !== isMuted()) setMuted(settings.muted);
}

function setMute(v) {
  settings.muted = setMuted(v);
  saveSettings(settings);
}

function cellsForTrack(tr) {
  // positions TRACK_MIN..TRACK_MAX inclusive = 9 cells if ±4
  const parts = [];
  for (let p = TRACK_MIN; p <= TRACK_MAX; p++) {
    const kind = p < 0 ? 'neg' : p > 0 ? 'pos' : 'zero';
    const here = tr.pos === p;
    let tok = '';
    if (here) {
      const cls =
        tr.locked === 'player' ? 'token locked-p' : tr.locked === 'dia' ? 'token locked-d' : tr.pos < 0 ? 'token dia-tok' : 'token';
      tok = `<span class="${cls}" aria-hidden="true"></span>`;
    }
    parts.push(`<span class="cell ${kind}" data-pos="${p}">${tok}</span>`);
  }
  return parts.join('');
}

function meters(state) {
  const secDots = Array.from({ length: SECRECY_TO_WIN }, (_, i) => `<i class="${i < state.secrecy ? 'on-dia' : ''}"></i>`).join('');
  const lienDots = Array.from({ length: LIENS_TO_WIN }, (_, i) => `<i class="${i < state.liens.length ? 'on-player' : ''}"></i>`).join('');
  const init = state.initiative === 'player' ? 'Enquête' : state.initiative === 'dia' ? 'Secret DIA' : '—';
  const actor =
    state.phase === 'bid'
      ? state.bid.player
        ? 'Secret DIA mise…'
        : 'à toi d’enchérir'
      : state.currentActor === 'player'
        ? 'à toi'
        : 'Secret DIA';
  return `
    <div class="status">
      <div class="meter" aria-label="Secret ${state.secrecy} sur ${SECRECY_TO_WIN}">
        <div class="lbl"><span>Secret DIA</span><span>${state.secrecy}/${SECRECY_TO_WIN}</span></div>
        <div class="dots">${secDots}</div>
      </div>
      <div class="meter" aria-label="Liens ${state.liens.length} sur ${LIENS_TO_WIN}">
        <div class="lbl"><span>Liens Enquête</span><span>${state.liens.length}/${LIENS_TO_WIN}</span></div>
        <div class="dots">${lienDots}</div>
      </div>
      <div class="round-line">
        <span>Manche ${state.round}/${MAX_ROUNDS}</span>
        <span>Initiative : ${esc(init)}</span>
        <span>${esc(actor)}</span>
      </div>
    </div>`;
}

function tracksHtml(state, pickable) {
  const picks = new Set(pickable || []);
  return `<div class="tracks" role="list">
    ${TRACKS.map((t) => {
      const tr = state.tracks[t.id];
      const lock = tr.locked === 'player' ? 'tenue' : tr.locked === 'dia' ? 'caviardée' : `${tr.pos > 0 ? '+' : ''}${tr.pos}`;
      const can = picks.has(t.id);
      return `<button type="button" class="track ${can ? 'pickable' : ''}" data-act="track" data-id="${t.id}" role="listitem"
        ${can ? '' : ''}
        aria-label="${esc(t.name)} : ${lock}. ${esc(t.hint)}">
        <span class="tname"><strong>${esc(t.name)}</strong></span>
        <span class="cells">${cellsForTrack(tr)}</span>
      </button>`;
    }).join('')}
  </div>`;
}

function informantsHtml(state) {
  return `<div class="informants" aria-label="Informateurs, mécanique de fiction">
    ${INFORMANTS.map((p) => {
      const inf = state.informants[p.id];
      const linked = inf.linkedTrack ? trackById(inf.linkedTrack) : null;
      const cls = inf.linkedTrack ? 'linked' : inf.placed ? 'placed' : '';
      const sub = linked ? `lié : ${linked.short}` : inf.placed ? 'placé' : '—';
      return `<div class="info-chip ${cls}"><strong>AAP Person ${esc(p.id)}</strong><span>${esc(sub)}</span></div>`;
    }).join('')}
  </div>`;
}

function cardMini(id, selected) {
  const c = cardById(id);
  if (!c) return '';
  const dia = c.side === 'dia';
  return `<button type="button" class="card-mini ${dia ? 'dia-card' : ''} ${selected === id ? 'selected' : ''}"
      data-act="card" data-id="${esc(id)}" aria-label="${esc(c.title)}, valeur ${c.value}. ${esc(c.actionText)}">
    <span class="val" aria-hidden="true">${c.value}</span>
    <span class="ctitle">${esc(c.title)}</span>
    ${dia ? '<span class="redact-bar" aria-hidden="true"></span>' : ''}
    <span class="cact">${esc(c.actionText)}</span>
    <span class="cpage">p. ${c.pdfPage}</span>
  </button>`;
}

function sheetHtml(cardId, opts = {}) {
  const c = cardById(cardId);
  if (!c) return '';
  const dia = c.side === 'dia';
  const bid = opts.bid;
  const actions = bid
    ? `<div class="sheet-actions">
        <button type="button" class="primary span2" data-act="confirm-bid" data-id="${esc(cardId)}">Enchérir (valeur ${c.value})</button>
        <button type="button" class="ghost span2" data-act="close-sheet">Annuler</button>
      </div>`
    : `<div class="sheet-actions">
        <button type="button" class="primary" data-act="choose-action" data-id="${esc(cardId)}">Action</button>
        <button type="button" class="primary" data-act="choose-value" data-id="${esc(cardId)}">Valeur ${c.value}</button>
        <button type="button" class="ghost span2" data-act="close-sheet">Annuler</button>
      </div>`;
  return `<div class="sheet-back" data-act="close-sheet">
    <div class="sheet ${dia ? 'dia-sheet' : ''}" role="dialog" aria-modal="true" aria-labelledby="sheet-title" data-stop="1">
      <h2 id="sheet-title">${esc(c.title)}</h2>
      <p class="meta">Valeur ${c.value} · Page ${c.pdfPage} du PDF · ${esc(c.kind === 'informant' ? 'Informateur' : c.kind === 'redaction' || c.kind === 'secrecy' ? 'Secret DIA' : 'Preuve')}</p>
      <blockquote class="quote">« ${esc(c.quote)} » <cite>— p. ${c.pdfPage}</cite></blockquote>
      <p class="summary">${esc(c.summary)}</p>
      ${c.fiction ? `<p class="fiction-note">${esc(c.fiction)}</p>` : ''}
      <p class="summary"><strong>Action (fiction) :</strong> ${esc(c.actionText)}</p>
      ${actions}
    </div>
  </div>`;
}

function promptFor(state) {
  if (ui.mode === 'value') {
    return `<div class="prompt">Répartis jusqu’à ${ui.remain} case(s) (max. 2 par piste). Tape une piste.</div>`;
  }
  if (ui.mode === 'target' || ui.mode === 'target2') {
    return `<div class="prompt">${ui.mode === 'target2' ? 'Choisis une deuxième piste.' : 'Choisis une piste.'}</div>`;
  }
  if (ui.mode === 'elan') {
    return `<div class="prompt">Élan : tape une piste (1 case) ou passe.</div>`;
  }
  if (ui.mode === 'link') {
    return `<div class="prompt">Choisis une piste verrouillée (+4) encore libre, ou place seulement.</div>`;
  }
  if (state.phase === 'bid' && !state.bid.player) {
    return `<div class="prompt">Enchère d’initiative — joue une carte pour sa VALEUR (pas son action).</div>`;
  }
  if (state.phase === 'bid' && state.bid.player && !state.bid.dia) {
    return `<div class="prompt dia-turn">Le Secret DIA pose sa mise…</div>`;
  }
  if (state.phase === 'elan' && state.currentActor === 'player') {
    return `<div class="prompt">Tu as l’initiative. Élan : une piste, ou passe.</div>`;
  }
  if (state.phase === 'play' && state.currentActor === 'player') {
    return `<div class="prompt">Joue une carte : tape-la, puis choisis Action ou Valeur. (${state.playsLeft.player} jeu${state.playsLeft.player > 1 ? 'x' : ''})</div>`;
  }
  if (state.currentActor === 'dia' || (state.phase === 'elan' && state.currentActor === 'dia')) {
    return `<div class="prompt dia-turn">Le Secret DIA joue…</div>`;
  }
  return '';
}

function topbar(title, extra = '') {
  const mute = isMuted() ? 'Son coupé' : 'Couper le son';
  const icon = isMuted() ? '🔇' : '🔊';
  return `<header class="topbar">
    <h1>${esc(title)}</h1>
    ${extra}
    <button type="button" class="icon-btn" data-act="mute" aria-label="${mute}" aria-pressed="${isMuted()}">${icon}</button>
  </header>`;
}

function homeHtml() {
  const saved = loadGame();
  const canContinue = saved && saved.phase && saved.phase !== 'gameover';
  return `<div class="screen">
    ${topbar('Dossier BAASS : Duel')}
    <div class="screen-scroll">
      <div class="home-hero">
        <img class="mark" src="./icon-512.png" width="88" height="88" alt="" fetchpriority="high">
        <h1>Dossier BAASS : Duel</h1>
        <p class="sub">L’Enquête contre le Secret DIA</p>
      </div>
      <p class="disclaimer" role="note"><strong>${esc(DISCLAIMER_SHORT)}</strong> ${esc(DISCLAIMER)}</p>
      <div class="home-actions">
        ${canContinue ? `<button type="button" class="primary" data-act="continue">Continuer la partie</button>` : ''}
        <p style="margin:0.4rem 0 0;font-size:0.8rem;color:var(--paper-3);text-align:center;">Nouvelle partie — difficulté</p>
        <div class="row">
          <button type="button" data-act="start" data-diff="facile">Facile</button>
          <button type="button" class="primary" data-act="start" data-diff="normal">Normal</button>
          <button type="button" data-act="start" data-diff="difficile">Difficile</button>
        </div>
        <button type="button" data-act="tutorial">Tutoriel</button>
        <button type="button" class="ghost" data-act="rules">Règles</button>
        <button type="button" class="ghost" data-act="credits">Crédits</button>
      </div>
      <p class="credit-mini">${esc(CREDIT)}</p>
    </div>
  </div>`;
}

function rulesHtml() {
  return `<div class="screen">
    ${topbar('Règles')}
    <div class="screen-scroll rules">
      <p class="disclaimer"><strong>${esc(DISCLAIMER_SHORT)}</strong> ${esc(DISCLAIMER)}</p>
      <h2>But</h2>
      <p>Tu es <strong>l’Enquête</strong>. Forme <strong>${LIENS_TO_WIN} liens</strong> : chaque lien relie un informateur « AAP Person N » (désignation du document, aucun nom deviné) à une piste que tu as <strong>verrouillée à +${TRACK_MAX}</strong>. Chaque informateur et chaque piste ne servent qu’à un lien.</p>
      <p>L’IA est le <strong>Secret DIA</strong>. Elle gagne si le <strong>secret atteint ${SECRECY_TO_WIN}</strong>, si elle <strong>caviarde ${REDACT_TO_WIN} pistes</strong> (jeton à ${TRACK_MIN}), ou si les ${MAX_ROUNDS} manches s’achèvent sans ta victoire.</p>
      <h2>Pistes (tire-à-la-corde)</h2>
      <p>Cinq pistes, de ${TRACK_MIN} (Secret) à +${TRACK_MAX} (Enquête), départ à 0. Un jeton à l’extrémité est verrouillé.</p>
      <ul>
        ${TRACKS.map((t) => `<li><strong>${esc(t.name)}</strong> — ${esc(t.hint)}</li>`).join('')}
      </ul>
      <h2>Manche</h2>
      <ol>
        <li><strong>Enchère d’initiative.</strong> Chaque camp joue une carte pour sa valeur. La plus haute joue en premier et gagne un élan (1 case). À égalité, on conserve l’initiative (l’Enquête au premier tour).</li>
        <li><strong>Deux cartes</strong> chacun, en alternance, pour l’<strong>action</strong> ou pour la <strong>valeur</strong> (répartir autant de cases, au plus 2 par piste).</li>
        <li>On pioche jusqu’à 5 cartes.</li>
      </ol>
      <h2>Citations</h2>
      <p>Chaque carte cite un passage <strong>mot pour mot</strong> du plan BAASS (${esc(DOCUMENT_META.date)}, contrat ${esc(DOCUMENT_META.contract)}), avec le numéro de page. Les codes 1843(a) et « AAP Person N » restent tels quels. Les actions, enchères et liens sont une <strong>fiction de jeu</strong>.</p>
      <h2>Inspiration</h2>
      <p>${esc(CREDIT)}</p>
      <p style="margin-top:1rem"><button type="button" class="primary" data-act="home">Retour</button></p>
    </div>
  </div>`;
}

function creditsHtml() {
  return `<div class="screen">
    ${topbar('Crédits')}
    <div class="screen-scroll rules">
      <p>${esc(CREDIT)}</p>
      <h2>Document</h2>
      <p>${esc(DOCUMENT_META.title)}, ${esc(DOCUMENT_META.date)}, contrat ${esc(DOCUMENT_META.contract)}. ${esc(DOCUMENT_META.org)}, commandité par ${esc(DOCUMENT_META.sponsor)}. Fichier ${esc(DOCUMENT_META.file)}, ${DOCUMENT_META.pages} pages. Extraits verbatim pour le jeu et les tests. Ce plan n’est pas une preuve de physique nouvelle ni d’engin extraterrestre.</p>
      <h2>Graphismes et sons</h2>
      <p>Originaux, procéduraux (SVG, CSS, Web Audio). Aucun individu réel n’est dessiné. Les informateurs sont des désignations caviardées du document.</p>
      <p>Version ${esc(VERSION)}.</p>
      <p style="margin-top:1rem"><button type="button" class="primary" data-act="home">Retour</button></p>
    </div>
  </div>`;
}

function tutorialBox() {
  if (!game || !game.tutorial) return '';
  const steps = [
    'Bienvenue. Tu es l’Enquête, face au Secret DIA. Ceci est un <strong>jeu</strong> inspiré de mécaniques de cartes : le document de 2008 est un <strong>plan de recherche, pas une preuve</strong>.',
    'Le plateau a cinq pistes, un <strong>tire-à-la-corde</strong>. Le jeton part au centre (0). Tu tires vers la droite (+), le Secret DIA vers la gauche (−). À +4 ou −4, la piste est verrouillée.',
    'Chaque manche commence par une <strong>enchère d’initiative</strong>. Tape une carte, puis « Enchérir ». Seule la <strong>valeur</strong> compte ici, pas l’action.',
    'Le gagnant joue en premier et peut prendre un <strong>élan</strong> : 1 case sur une piste, ou passer.',
    'À ton tour, tape une carte puis choisis <strong>Action</strong> (l’effet écrit) ou <strong>Valeur</strong> (répartir des cases, au plus 2 par piste). Essaie une action maintenant.',
    'Le Secret DIA joue aussi. Ses cartes sont des <strong>barres de caviardage</strong> ou du secret — toujours adossées à une vraie citation, mais l’effet est une fiction.',
    'Pour gagner, verrouille trois pistes à +4, puis relie-y trois informateurs « AAP Person N » (désignations du document). Le Secret DIA gagne par secret, par trois pistes caviardées, ou à la fin des 8 manches.',
  ];
  const i = Math.min(ui.tutorialStep, steps.length - 1);
  const last = ui.tutorialStep >= steps.length - 1;
  return `<div class="tutor" role="status">
    <p>${steps[i]}</p>
    <div class="row">
      ${last
        ? `<button type="button" class="primary" data-act="end-tutorial">J’ai compris, jouer</button>
           <button type="button" class="ghost" data-act="home">Quitter</button>`
        : `<button type="button" class="primary" data-act="tutor-next">Suivant</button>
           <button type="button" class="ghost" data-act="end-tutorial">Passer</button>`}
    </div>
  </div>`;
}

function gameHtml() {
  const state = game;
  const pickable =
    ui.mode === 'value' || ui.mode === 'target' || ui.mode === 'target2' || ui.mode === 'elan' ||
    (state.phase === 'elan' && state.currentActor === 'player' && !ui.sheet)
      ? unlockedTracks(state)
      : ui.mode === 'link'
        ? TRACKS.map((t) => t.id).filter((id) => state.tracks[id].locked === 'player' && !state.liens.some((l) => l.track === id))
        : [];
  const lastLog = (state.log || []).slice(-2).join(' ');
  const elanSkip =
    ui.mode === 'elan' || (state.phase === 'elan' && state.currentActor === 'player')
      ? `<button type="button" class="ghost" data-act="elan-skip" style="margin:0 0.65rem 0.3rem;align-self:center;">Passer l’élan</button>`
      : '';
  const valueOk =
    ui.mode === 'value'
      ? `<button type="button" class="primary" data-act="confirm-value" style="margin:0 0.65rem 0.3rem;">Confirmer la valeur (${Object.values(ui.alloc).reduce((a, b) => a + b, 0)} joué${Object.values(ui.alloc).reduce((a, b) => a + b, 0) > 1 ? 's' : ''})</button>`
      : '';
  const linkOnly =
    ui.mode === 'link'
      ? `<button type="button" class="ghost" data-act="link-only" style="margin:0 0.65rem 0.3rem;">Placer seulement</button>`
      : '';
  return `<div class="screen" style="position:relative">
    ${topbar('Dossier BAASS : Duel', `<button type="button" class="icon-btn" data-act="menu" aria-label="Menu">☰</button>`)}
    <div class="banner-disc">${esc(DISCLAIMER_SHORT)} — ${esc(DISCLAIMER)}</div>
    ${meters(state)}
    ${tracksHtml(state, pickable)}
    ${informantsHtml(state)}
    <div class="log" role="status">${esc(lastLog)}</div>
    ${promptFor(state)}
    ${elanSkip}${valueOk}${linkOnly}
    ${tutorialBox()}
    <div class="hand-wrap" aria-label="Ta main">
      ${state.hands.player.map((id) => cardMini(id, ui.selected || ui.sheet)).join('')}
    </div>
    ${ui.sheet ? sheetHtml(ui.sheet, { bid: state.phase === 'bid' && !state.bid.player }) : ''}
    ${ui.mode === 'secrecy-choice' ? secrecyChoiceHtml() : ''}
    ${ui.menuOpen ? menuHtml() : ''}
  </div>`;
}

function secrecyChoiceHtml() {
  return `<div class="sheet-back" data-act="close-sheet">
    <div class="sheet" role="dialog" aria-modal="true" data-stop="1">
      <h2>Choisir l’effet</h2>
      <p class="summary">Cette carte permet de monter le secret ou de tirer une piste.</p>
      <div class="sheet-actions">
        <button type="button" class="primary" data-act="sec-choose" data-choose="secrecy">Monter le secret</button>
        <button type="button" class="primary" data-act="sec-choose" data-choose="pull">Tirer une piste</button>
        <button type="button" class="ghost span2" data-act="close-sheet">Annuler</button>
      </div>
    </div>
  </div>`;
}

function menuHtml() {
  return `<div class="sheet-back" data-act="close-menu">
    <div class="sheet" role="dialog" aria-modal="true" data-stop="1">
      <h2>Menu</h2>
      <div class="sheet-actions" style="grid-template-columns:1fr">
        <button type="button" class="ghost" data-act="rules">Règles</button>
        <button type="button" class="ghost" data-act="home">Quitter vers l’accueil</button>
        <button type="button" class="danger" data-act="resign">Abandonner (défaite)</button>
        <button type="button" class="primary" data-act="close-menu">Reprendre</button>
      </div>
    </div>
  </div>`;
}

function endHtml() {
  const win = game && game.winner === 'player';
  const reasons = {
    liens: 'Tu as formé la chaîne de divulgation (3 liens).',
    secrecy: 'Le secret a atteint son maximum.',
    redact: 'Trois pistes ont été entièrement caviardées.',
    'time-secret': 'Les huit manches sont écoulées : le dossier est classé.',
    'time-liens': 'Fin des manches, l’Enquête l’emporte de justesse.',
  };
  const reason = (game && reasons[game.endReason]) || '';
  return `<div class="screen">
    ${topbar('Dossier BAASS : Duel')}
    <div class="screen-scroll end-screen ${win ? 'win' : 'lose'}">
      <h1>${win ? 'Divulgation' : 'Dossier enterré'}</h1>
      ${win ? '' : `<div class="end-stamp">CLASSÉ</div>`}
      <p>${esc(reason)}</p>
      <p class="disclaimer"><strong>${esc(DISCLAIMER_SHORT)}</strong> ${esc(DISCLAIMER)}</p>
      ${game ? `<p>Liens ${game.liens.length}/${LIENS_TO_WIN} · Secret ${game.secrecy}/${SECRECY_TO_WIN} · Manche ${game.round}</p>` : ''}
      <div class="home-actions" style="max-width:20rem;margin:1rem auto">
        <button type="button" class="primary" data-act="again">Rejouer</button>
        <button type="button" class="ghost" data-act="home">Accueil</button>
      </div>
    </div>
  </div>`;
}

export function render() {
  const root = $app();
  if (!root) return;
  let html = '';
  if (screen === 'home') html = homeHtml();
  else if (screen === 'rules') html = rulesHtml();
  else if (screen === 'credits') html = creditsHtml();
  else if (screen === 'end') html = endHtml();
  else html = gameHtml();
  root.innerHTML = html;
}

function persist() {
  if (game && game.phase !== 'gameover') saveGame(game);
  else clearGame();
}

function afterMove(sfx) {
  if (sfx) play(sfx);
  if (game && isOver(game)) {
    clearGame();
    screen = 'end';
    play(game.winner === 'player' ? 'win' : 'lose');
    render();
    return;
  }
  persist();
  render();
  scheduleAI();
}

function scheduleAI() {
  if (!game || isOver(game) || aiBusy) return;
  const need =
    (game.phase === 'bid' && game.bid.player && !game.bid.dia) ||
    (game.phase === 'elan' && game.currentActor === 'dia') ||
    (game.phase === 'play' && game.currentActor === 'dia');
  if (!need) return;
  aiBusy = true;
  const delay = reducedMotion() ? 80 : 700;
  aiTimer = setTimeout(() => {
    aiBusy = false;
    if (!game || isOver(game)) return;
    const still =
      (game.phase === 'bid' && game.bid.player && !game.bid.dia) ||
      (game.phase === 'elan' && game.currentActor === 'dia') ||
      (game.phase === 'play' && game.currentActor === 'dia');
    if (!still) return;
    const rng = makeRng(game.seed, game.rngState);
    const mv = chooseMove(game, 'dia', rng);
    if (!mv) return;
    const beforeTracks = JSON.stringify(game.tracks);
    const beforeSec = game.secrecy;
    try {
      game = applyMove(game, mv);
    } catch (err) {
      console.warn('IA coup refusé', err);
      render();
      return;
    }
    let sfx = 'ai';
    if (game.secrecy > beforeSec) sfx = 'secret';
    else if (JSON.stringify(game.tracks) !== beforeTracks) sfx = 'redact';
    afterMove(sfx);
  }, delay);
}

function startGame(diff, tutorial = false) {
  clearGame();
  ui = resetUi();
  ui.tutorialStep = tutorial ? 0 : 99;
  const stacked = tutorial
    ? {
        player: ['area-propulsion', 'roswell-debris', 'info-4', 'area-lift', 'proj-campus'],
        dia: ['dia-conf-10', 'dia-natsec', 'dia-restricted', 'dia-cover', 'dia-1843-aff'],
      }
    : undefined;
  game = createGame({ difficulty: diff || 'normal', tutorial, stacked, seed: tutorial ? 17 : undefined });
  screen = 'game';
  persist();
  render();
}

function openSheet(id) {
  ui.sheet = id;
  ui.selected = id;
  play('tap');
  render();
  const dialog = document.querySelector('.sheet');
  const btn = dialog && dialog.querySelector('button');
  if (btn) btn.focus();
}

function closeSheet() {
  ui.sheet = null;
  render();
}

function playAction(cardId, extra = {}) {
  const c = cardById(cardId);
  const kind = c.action.kind;
  if (kind === 'pullFixed') {
    applyPlayer({ type: 'play', cardId, use: 'action', trackId: c.action.track, ...extra }, 'pull');
    return;
  }
  if (kind === 'secrecy') {
    applyPlayer({ type: 'play', cardId, use: 'action' }, 'secret');
    return;
  }
  if (kind === 'secrecyOrPull') {
    ui.pendingCard = cardId;
    ui.sheet = null;
    ui.mode = 'secrecy-choice';
    render();
    return;
  }
  if (kind === 'secrecyIfLocked') {
    const locked = TRACKS.some((t) => game.tracks[t.id].locked === 'dia');
    if (locked) {
      applyPlayer({ type: 'play', cardId, use: 'action' }, 'secret');
    } else {
      ui.pendingCard = cardId;
      ui.pendingMove = { type: 'play', cardId, use: 'action' };
      ui.sheet = null;
      ui.mode = 'target';
      render();
    }
    return;
  }
  if (kind === 'pullAny' || kind === 'pullStrong') {
    ui.pendingCard = cardId;
    ui.pendingMove = { type: 'play', cardId, use: 'action' };
    ui.sheet = null;
    ui.mode = 'target';
    render();
    return;
  }
  if (kind === 'pullTwoTracks') {
    ui.pendingCard = cardId;
    ui.pendingMove = { type: 'play', cardId, use: 'action' };
    ui.sheet = null;
    ui.mode = 'target';
    ui.trackPicks = [];
    render();
    return;
  }
  if (kind === 'placeAndLink') {
    ui.pendingCard = cardId;
    ui.pendingMove = { type: 'play', cardId, use: 'action' };
    ui.sheet = null;
    ui.mode = 'link';
    render();
    return;
  }
  applyPlayer({ type: 'play', cardId, use: 'action', ...extra }, 'tap');
}

function applyPlayer(move, sfx) {
  try {
    const beforeLiens = game.liens.length;
    const beforeLock = TRACKS.filter((t) => game.tracks[t.id].locked).length;
    game = applyMove(game, move);
    ui = { ...resetUi(), tutorialStep: ui.tutorialStep };
    if (game.tutorial && ui.tutorialStep < 6) {
      /* the box remains */
    }
    let sound = sfx || 'tap';
    if (game.liens.length > beforeLiens) sound = 'lien';
    else if (TRACKS.filter((t) => game.tracks[t.id].locked).length > beforeLock) sound = 'lock';
    afterMove(sound);
  } catch (err) {
    ui.toast = err.message;
    ui.mode = null;
    ui.sheet = null;
    render();
  }
}

function onClick(ev) {
  const t = ev.target.closest('[data-act]');
  if (!t) {
    if (ev.target.closest('[data-stop]')) ev.stopPropagation();
    return;
  }
  if (ev.target.closest('.sheet') && t.dataset.act === 'close-sheet' && ev.currentTarget !== t) {
    // click inside sheet shouldn't close via bubbling from back — handled by back itself
  }
  const act = t.dataset.act;
  gesture();

  if (act === 'mute') {
    setMute(!isMuted());
    render();
    return;
  }
  if (act === 'home') {
    screen = 'home';
    ui.menuOpen = false;
    if (game && game.phase === 'gameover') {
      game = null;
      clearGame();
    }
    render();
    return;
  }
  if (act === 'rules') {
    ui.menuOpen = false;
    screen = 'rules';
    render();
    return;
  }
  if (act === 'credits') {
    screen = 'credits';
    render();
    return;
  }
  if (act === 'start') {
    startGame(t.dataset.diff, false);
    return;
  }
  if (act === 'tutorial') {
    startGame('facile', true);
    return;
  }
  if (act === 'continue') {
    const s = loadGame();
    if (s) {
      game = s;
      ui = resetUi();
      screen = isOver(s) ? 'end' : 'game';
      render();
      scheduleAI();
    }
    return;
  }
  if (act === 'again') {
    const d = (game && game.difficulty) || 'normal';
    startGame(d, false);
    return;
  }
  if (act === 'tutor-next') {
    ui.tutorialStep += 1;
    play('tap');
    render();
    return;
  }
  if (act === 'end-tutorial') {
    if (game) game.tutorial = false;
    ui.tutorialStep = 99;
    persist();
    render();
    return;
  }
  if (act === 'menu') {
    ui.menuOpen = true;
    render();
    return;
  }
  if (act === 'close-menu') {
    ui.menuOpen = false;
    render();
    return;
  }
  if (act === 'resign') {
    if (game) {
      game = debugForceEnd(game, 'dia', 'secrecy');
      clearGame();
      screen = 'end';
      play('lose');
      render();
    }
    return;
  }
  if (act === 'close-sheet') {
    if (ev.target.classList.contains('sheet-back') || t.dataset.act === 'close-sheet') {
      if (ev.target.closest('.sheet') && ev.target.closest('.sheet') !== ev.target && ev.target !== t && !ev.target.classList.contains('sheet-back')) {
        return;
      }
    }
    // Don't close when clicking a button inside that's not close
    if (ev.target.closest('.sheet') && ev.target !== t && ev.target.closest('[data-act]') !== t) return;
    ui.sheet = null;
    ui.mode = ui.mode === 'secrecy-choice' ? null : ui.mode;
    if (ui.mode === 'secrecy-choice') ui.mode = null;
    render();
    return;
  }
  if (act === 'card') {
    if (!game || isOver(game)) return;
    if (game.currentActor !== 'player' && !(game.phase === 'bid' && !game.bid.player)) return;
    if (ui.mode === 'value' || ui.mode === 'target' || ui.mode === 'elan' || ui.mode === 'link') return;
    if (game.phase === 'play' && game.currentActor !== 'player') return;
    if (game.phase === 'elan') return;
    openSheet(t.dataset.id);
    return;
  }
  if (act === 'confirm-bid') {
    applyPlayer({ type: 'bid', side: 'player', cardId: t.dataset.id }, 'bid');
    return;
  }
  if (act === 'choose-action') {
    if (game.phase !== 'play' || game.currentActor !== 'player') return;
    playAction(t.dataset.id);
    return;
  }
  if (act === 'choose-value') {
    if (game.phase !== 'play' || game.currentActor !== 'player') return;
    const c = cardById(t.dataset.id);
    ui.pendingCard = t.dataset.id;
    ui.sheet = null;
    ui.mode = 'value';
    ui.alloc = {};
    ui.remain = c.value;
    play('tap');
    render();
    return;
  }
  if (act === 'confirm-value') {
    const pulls = Object.entries(ui.alloc)
      .filter(([, n]) => n > 0)
      .map(([trackId, steps]) => ({ trackId, steps }));
    applyPlayer({ type: 'play', cardId: ui.pendingCard, use: 'value', pulls }, 'pull');
    return;
  }
  if (act === 'elan-skip') {
    applyPlayer({ type: 'elan', side: 'player', skip: true }, 'tap');
    return;
  }
  if (act === 'link-only') {
    applyPlayer({ type: 'play', cardId: ui.pendingCard, use: 'action' }, 'tap');
    return;
  }
  if (act === 'sec-choose') {
    if (t.dataset.choose === 'secrecy') {
      applyPlayer({ type: 'play', cardId: ui.pendingCard, use: 'action', choose: 'secrecy' }, 'secret');
    } else {
      ui.mode = 'target';
      ui.pendingMove = { type: 'play', cardId: ui.pendingCard, use: 'action', choose: 'pull' };
      render();
    }
    return;
  }
  if (act === 'track') {
    const id = t.dataset.id;
    if (game && game.phase === 'elan' && game.currentActor === 'player' && !ui.mode) {
      applyPlayer({ type: 'elan', side: 'player', trackId: id }, 'pull');
      return;
    }
    if (ui.mode === 'elan') {
      applyPlayer({ type: 'elan', side: 'player', trackId: id }, 'pull');
      return;
    }
    if (ui.mode === 'value') {
      const used = ui.alloc[id] || 0;
      if (ui.remain > 0 && used < 2 && !game.tracks[id].locked) {
        ui.alloc[id] = used + 1;
        ui.remain -= 1;
        play('pull');
        render();
      }
      return;
    }
    if (ui.mode === 'link') {
      applyPlayer({ type: 'play', cardId: ui.pendingCard, use: 'action', trackId: id }, 'lien');
      return;
    }
    if (ui.mode === 'target') {
      const c = cardById(ui.pendingCard);
      if (c && c.action.kind === 'pullTwoTracks') {
        ui.trackPicks = [id];
        ui.mode = 'target2';
        play('tap');
        render();
        return;
      }
      const mv = { ...(ui.pendingMove || { type: 'play', cardId: ui.pendingCard, use: 'action' }), trackId: id };
      applyPlayer(mv, 'pull');
      return;
    }
    if (ui.mode === 'target2') {
      const a = ui.trackPicks[0];
      if (a === id) return;
      applyPlayer(
        { ...(ui.pendingMove || { type: 'play', cardId: ui.pendingCard, use: 'action' }), trackId: a, trackId2: id },
        'pull',
      );
      return;
    }
    return;
  }
}

function orientation() {
  const el = document.getElementById('turn-phone');
  if (!el) return;
  const land = window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
  el.hidden = !land;
}

export function boot() {
  settings = loadSettings();
  setMuted(settings.muted);
  const params = new URLSearchParams(location.search);
  const debug = params.get('debug');

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ui.sheet = null;
      ui.menuOpen = false;
      if (ui.mode && ui.mode !== 'elan') {
        ui.mode = null;
        ui.pendingCard = null;
      }
      render();
    }
  });
  window.addEventListener('resize', orientation);

  if (debug === 'win' || debug === 'lose') {
    game = createGame({ difficulty: 'normal', seed: 1 });
    game = debugForceEnd(game, debug === 'win' ? 'player' : 'dia', debug === 'win' ? 'liens' : 'secrecy');
    screen = 'end';
    render();
    orientation();
    return;
  }

  const saved = loadGame();
  if (saved && params.get('fresh') !== '1') {
    // stay on home so Continuer is visible; don't auto-jump
  }
  screen = 'home';
  render();
  orientation();
}
