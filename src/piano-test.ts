import { createSVGElement, type SVGAttributes } from './lib/svg.js';
import { WHOLE_D, SHARP_D, FLAT_D } from './lib/glyphs.js';
import {
  CLEFS, NOTES, WHITE_SEMI, BLACK_KEYS, MODES, KEY_SEMI,
  SHARP_ORDER, FLAT_ORDER, SHARP_POS, FLAT_POS, SHARP_STEP, FLAT_STEP, MAX_KEY,
  type Clef, type Mode,
} from './lib/notes2.js';
import { symOf } from './lib/accidentals.js';
import { pointsFor } from './lib/scoring.js';
import {
  SP, BOTTOM, U, GLYPH_MID, ROUND, NOTE_X, STAFF_W,
  posOf, yOf, type Question,
} from './lib/staff2.js';
import {
  targetSemi, freqOf, fullName, qName, qLabel, semiName, fmtSec,
} from './lib/pitch.js';
import { makeQueue } from './lib/quiz2-logic.js';

// ---------- DOM helpers ----------
function $<T extends Element = HTMLElement>(sel: string): T {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`要素が見つかりません: ${sel}`);
  return el;
}

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: SVGAttributes = {},
  parent?: Element
): SVGElementTagNameMap[K] {
  const n = createSVGElement(tag, attrs);
  if (parent) parent.appendChild(n);
  return n;
}

const staffEl = $<SVGSVGElement>('#staff');
const msgEl = $<HTMLElement>('#msg');
const keysEl = $<HTMLElement>('#keys');
const answersEl = $<HTMLOListElement>('#answers');
const resultEl = $<HTMLElement>('#result');
const timerEl = $<HTMLElement>('#timer');
const actionBtn = $<HTMLButtonElement>('#action');
const soundBtn = $<HTMLButtonElement>('#sound');
const hintEl = $<HTMLElement>('#hint');
const modeBtns = [...document.querySelectorAll<HTMLButtonElement>('.mode')];
const accBtns = [...document.querySelectorAll<HTMLButtonElement>('.acc-toggle')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const show = (node: Element, on: boolean) => node.toggleAttribute('hidden', !on);

// ---------- store ----------
const store = {
  get(k: string): string | null {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k: string, v: string): void {
    try { localStorage.setItem(k, v); } catch { /* ignore */ }
  },
};

// ---------- 譜面 ----------
interface SigItem {
  letter: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

// notes: [{ n, x }] / key: 調号。戻り値の sig は調号の各記号の位置
function drawStaff(
  svg: SVGSVGElement,
  width: number,
  clef: Clef,
  notes: { n: number; x: number }[],
  key = 0
): { g: SVGGElement; sig: { items: SigItem[]; end: number } } {
  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 34 ${width} 176`);
  const g = el('g', {}, svg);
  for (let i = 0; i < 5; i++) {
    const y = BOTTOM - i * SP;
    el('line', { x1: 6, x2: width - 6, y1: y, y2: y, stroke: 'var(--line)', 'stroke-width': 1.6 }, g);
  }
  el('path', { d: CLEFS[clef].d, fill: 'var(--ink)', transform: `translate(10 ${BOTTOM}) scale(${U} ${-U})` }, g);
  const sig = drawKeySig(g, clef, key);
  for (const n of notes) drawNote(g, posOf({ clef, n: n.n }), n.x);
  return { g, sig };
}

function drawKeySig(g: SVGGElement, clef: Clef, key: number): { items: SigItem[]; end: number } {
  const items: SigItem[] = [];
  const c = CLEFS[clef];
  if (!key) return { items, end: c.sigX };
  const sharp = key > 0;
  const order = sharp ? SHARP_ORDER : FLAT_ORDER;
  const posList = sharp ? SHARP_POS : FLAT_POS;
  const stepX = sharp ? SHARP_STEP : FLAT_STEP;
  const glyphW = sharp ? 18 : 16;
  for (let i = 0; i < Math.abs(key); i++) {
    const y = yOf(posList[i] + c.sigShift);
    const x = c.sigX + i * stepX;
    el('path', { d: sharp ? SHARP_D : FLAT_D, fill: 'var(--ink)', transform: `translate(${x} ${y + GLYPH_MID * U}) scale(${U} ${-U})` }, g);
    // 赤丸用の中心と大きさ（♭は下のふくらみが線・間に乗り、上に棒がのびる）
    items.push({ letter: order[i], cx: x + 4 + glyphW / 2, cy: sharp ? y : y - 11, rx: 13, ry: sharp ? 27 : 25 });
  }
  return { items, end: c.sigX + Math.abs(key) * stepX + 6 };
}

function drawNote(g: SVGGElement, pos: number, x: number): void {
  const ledger: number[] = [];
  for (let p = -2; p >= pos; p -= 2) ledger.push(p);   // 下の加線
  for (let p = 10; p <= pos; p += 2) ledger.push(p);   // 上の加線
  for (const p of ledger) {
    const ly = yOf(p);
    el('line', { x1: x - 25, x2: x + 25, y1: ly, y2: ly, stroke: 'var(--line)', 'stroke-width': 2 }, g);
  }
  const y = yOf(pos);
  el('path', { d: WHOLE_D, fill: 'var(--ink)', transform: `translate(${x - 257 * U} ${y + GLYPH_MID * U}) scale(${U} ${-U})` }, g);
}

// ---------- 赤ペン ----------
interface PenOptions {
  color?: string;
  width?: number;
  dur?: number;
  delay?: number;
}

function pen(parent: Element, d: string, opt: PenOptions = {}): SVGPathElement {
  const p = el('path', {
    d, fill: 'none', stroke: opt.color || 'var(--red)', 'stroke-width': opt.width || 3.2,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  }, parent);
  if (!reduceMotion.matches && p.getTotalLength) {
    const len = p.getTotalLength();
    p.style.strokeDasharray = String(len);
    p.style.strokeDashoffset = String(len);
    p.animate([{ strokeDashoffset: String(len) }, { strokeDashoffset: '0' }],
      { duration: opt.dur || 260, delay: opt.delay || 0, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
  }
  return p;
}

// 手で描いたような、少しはみ出す丸
function handLoop(cx: number, cy: number, rx: number, ry: number): string {
  const N = 56;
  const start = -Math.PI * (0.55 + Math.random() * 0.15);
  const sweep = Math.PI * 2 * 1.1;
  const ph1 = Math.random() * 6.28, ph2 = Math.random() * 6.28;
  const tilt = (-11 + Math.random() * 6) * Math.PI / 180;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  let d = '';
  for (let j = 0; j <= N; j++) {
    const t = j / N, a = start + sweep * t;
    const k = 1 + 0.04 * Math.sin(2 * a + ph1) + 0.025 * Math.sin(3 * a + ph2) + Math.max(0, t - 0.82) * 0.45;
    const px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k;
    d += (j ? ' L' : 'M') + (cx + px * ct - py * st).toFixed(1) + ' ' + (cy + px * st + py * ct).toFixed(1);
  }
  return d;
}

function checkMark(cx: number, cy: number, s = 1): string {
  return `M${cx - 15 * s} ${cy - 1 * s} Q${cx - 9 * s} ${cy + 5 * s} ${cx - 4 * s} ${cy + 15 * s} ` +
    `Q${cx + 6 * s} ${cy - 8 * s} ${cx + 25 * s} ${cy - 27 * s}`;
}

// ---------- 音 ----------
let soundOn = store.get('onpu-sound') !== 'off';
let actx: AudioContext | null = null;

function tone(freq: number, delay = 0): void {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime + delay + 0.01;
    const out = actx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.3, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    const lp = actx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.max(freq * 7, 1200), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.6, 500), t + 0.9);
    for (const [mul, type, gain] of [[1, 'triangle', 1], [2, 'sine', 0.32], [3, 'sine', 0.12], [4, 'sine', 0.05]] as const) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq * mul; g.gain.value = gain;
      o.connect(g).connect(lp);
      o.start(t); o.stop(t + 1.6);
    }
    lp.connect(out).connect(actx.destination);
  } catch { /* ignore */ }
}

function renderSound(): void {
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  soundBtn.textContent = soundOn ? '音：オン' : '音：オフ';
}
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  store.set('onpu-sound', soundOn ? 'on' : 'off');
  renderSound();
});

// ---------- 鍵盤 ----------
const keyBySemi: Record<number, HTMLButtonElement> = {};
NOTES.forEach((n, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'key';
  b.textContent = n.name;
  b.setAttribute('aria-label', fullName(i));
  b.addEventListener('click', () => answer(WHITE_SEMI[i]));
  keysEl.appendChild(b);
  keyBySemi[WHITE_SEMI[i]] = b;
});
for (const bk of BLACK_KEYS) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'black';
  b.style.left = `calc(100% * ${bk.after} / 8)`;
  b.addEventListener('click', () => answer(bk.semi));
  keysEl.appendChild(b);
  keyBySemi[bk.semi] = b;
}

// 黒鍵：♯と♭モードのときだけ答えに使う。名前は調号に合わせて♯か♭で表示
function setBlackKeys(enabled: boolean, key: number): void {
  for (const bk of BLACK_KEYS) {
    const b = keyBySemi[bk.semi];
    b.disabled = !enabled;
    b.tabIndex = enabled ? 0 : -1;
    b.toggleAttribute('aria-hidden', !enabled);
    b.replaceChildren();
    if (!enabled) { b.removeAttribute('aria-label'); continue; }
    const [base, sym] = key < 0 ? bk.flat : bk.sharp;
    const s1 = document.createElement('span');
    s1.textContent = base;
    const s2 = document.createElement('span');
    s2.className = 'sym';
    s2.textContent = sym;
    b.append(s1, s2);
    b.setAttribute('aria-label', base + sym);
  }
}

// ---------- 進行 ----------
let mode: Mode = MODES.includes(store.get('onpu-mode') as Mode) ? (store.get('onpu-mode') as Mode) : 'treble';
let sharpOn = store.get('onpu-sharp') === 'on';
let flatOn = store.get('onpu-flat') === 'on';
if (store.get('onpu-mode') === 'acc') {   // 前の版の「♯と♭」タブ → まぜる＋♯♭両方
  mode = 'mix'; sharpOn = flatOn = true;
  store.set('onpu-mode', mode); store.set('onpu-sharp', 'on'); store.set('onpu-flat', 'on');
}
const accOn = () => sharpOn || flatOn;

type State = 'ready' | 'question' | 'feedback' | 'result';
let state: State = 'ready';
let queue: Question[] = [];
let qi = 0;
interface Result extends Question {
  chosen: number;
  ok: boolean;
  ms: number;
  pts: number;
}
let results: Result[] = [];
let qStart = 0;
let totalMs = 0;
let tickId: ReturnType<typeof setInterval> | undefined;
let advanceId: ReturnType<typeof setTimeout> | undefined;
let sigItems: SigItem[] = [];

function renderModes(): void {
  for (const b of modeBtns) b.setAttribute('aria-checked', String(b.dataset.mode === mode));
  for (const b of accBtns) b.setAttribute('aria-pressed', String(b.dataset.acc === 'sharp' ? sharpOn : flatOn));
  hintEl.textContent = accOn()
    ? '白鍵 A S D F G H J K・黒鍵 W E T Y U で回答、Enter でスタート'
    : 'A S D F G H J K で回答、Enter でスタート';
}
for (const b of modeBtns) {
  b.addEventListener('click', () => {
    mode = b.dataset.mode as Mode;
    store.set('onpu-mode', mode);
    renderModes();
    showReady();
  });
}
for (const b of accBtns) {
  b.addEventListener('click', () => {
    if (b.dataset.acc === 'sharp') sharpOn = !sharpOn;
    else flatOn = !flatOn;
    store.set('onpu-sharp', sharpOn ? 'on' : 'off');
    store.set('onpu-flat', flatOn ? 'on' : 'off');
    renderModes();
    showReady();
  });
}

function renderAnswers(): void {
  answersEl.replaceChildren();
  for (let i = 0; i < ROUND; i++) {
    const li = document.createElement('li');
    li.setAttribute('aria-label', `第${i + 1}問`);
    el('svg', { viewBox: '0 0 30 30', 'aria-hidden': 'true' }, li);
    answersEl.appendChild(li);
  }
}

function renderTimer(): void {
  const ms = totalMs + (state === 'question' ? performance.now() - qStart : 0);
  timerEl.textContent = fmtSec(ms);
}
function stopTick(): void { clearInterval(tickId); tickId = undefined; }

function showReady(): void {
  clearTimeout(advanceId);
  stopTick();
  state = 'ready';
  queue = makeQueue(mode, { sharpOn, flatOn });
  qi = 0;
  results = [];
  totalMs = 0;
  renderAnswers();
  renderTimer();
  show(resultEl, false);
  show(keysEl, false);
  show(staffEl, true);
  show(msgEl, true);
  show(actionBtn, true);
  actionBtn.textContent = 'スタート';
  drawStaff(staffEl, STAFF_W, queue[0].clef, [], queue[0].key);
  staffEl.setAttribute('aria-label', '五線譜');
  msgEl.textContent = accOn()
    ? '記号の横の♯・♭（調号）がつく音に注意。黒い鍵盤も使います'
    : '全10問。1問100点で、速く答えるほど点が高くなります';
}

function start(): void {
  show(actionBtn, false);
  show(keysEl, true);
  show(resultEl, false);
  show(staffEl, true);
  show(msgEl, true);
  showQuestion();
  stopTick();
  tickId = setInterval(renderTimer, 100);
}

function showQuestion(): void {
  for (const b of Object.values(keyBySemi)) {
    b.classList.remove('picked-wrong', 'is-answer', 'down');
    b.querySelector('.ring')?.remove();
  }
  [...answersEl.children].forEach((li, i) => li.classList.toggle('now', i === qi));
  const q = queue[qi];
  setBlackKeys(accOn(), q.key);
  sigItems = drawStaff(staffEl, STAFF_W, q.clef, [{ n: q.n, x: NOTE_X }], q.key).sig.items;
  const keyDesc = q.key ? `、調号は${symOf(q.key)}が${Math.abs(q.key)}つ` : '';
  staffEl.setAttribute('aria-label', `第${qi + 1}問、${CLEFS[q.clef].name}${keyDesc}の音符`);
  msgEl.textContent = 'この音は？';
  state = 'question';
  qStart = performance.now();
}

function setMsg(lead: string, name: string, extra: string): void {
  msgEl.replaceChildren(document.createTextNode(lead));
  if (name) {
    const s = document.createElement('span');
    s.className = 'name';
    s.textContent = name;
    msgEl.appendChild(s);
  }
  if (extra) {
    const s = document.createElement('span');
    s.className = 'pts';
    s.textContent = extra;
    msgEl.appendChild(s);
  }
}

function answer(semi: number): void {
  if (state !== 'question') return;
  if (!accOn() && !WHITE_SEMI.includes(semi)) return;
  const ms = performance.now() - qStart;
  totalMs += ms;
  state = 'feedback';
  renderTimer();

  const q = queue[qi];
  const target = targetSemi(q);
  const ok = semi === target;
  const pts = pointsFor(ok, ms / 1000);
  results.push({ ...q, chosen: semi, ok, ms, pts });

  const btn = keyBySemi[semi];
  btn.classList.add('down');
  setTimeout(() => btn.classList.remove('down'), 140);
  tone(freqOf(q.clef, semi));

  const g = staffEl.querySelector('g')!;
  const y = yOf(posOf(q));
  const box = answersEl.children[qi].querySelector('svg')!;

  if (ok) {
    pen(g, handLoop(NOTE_X, y, 31, 23));
    pen(box, handLoop(15, 15, 9.5, 9.5), { width: 2.2 });
    setMsg('正解', qName(q), `${fmtSec(ms)}　${pts}点`);
    advanceId = setTimeout(next, 850);
    return;
  }

  pen(g, checkMark(NOTE_X, y));
  const t = el('text', {
    x: NOTE_X + 44, y: y + 9, fill: 'var(--red)',
    'font-family': 'Klee One, Hiragino Maru Gothic ProN, sans-serif', 'font-weight': 600, 'font-size': 26,
  }, g);
  t.textContent = qLabel(q);
  if (!reduceMotion.matches) t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 200, fill: 'backwards' });
  pen(box, checkMark(15, 16, 0.5), { width: 2.2 });

  // この音にかかっている調号の記号に赤丸
  if (q.acc) {
    const s = sigItems.find((it) => it.letter === NOTES[q.n].letter);
    if (s) pen(g, handLoop(s.cx, s.cy, s.rx, s.ry), { width: 2.6, delay: 250 });
  }

  btn.classList.add('picked-wrong');
  const right = keyBySemi[target];
  right.classList.add('is-answer');
  const black = right.classList.contains('black');
  const ring = el('svg', { class: 'ring', viewBox: black ? '0 0 40 48' : '0 0 56 44', 'aria-hidden': 'true' }, right);
  pen(ring, black ? handLoop(20, 26, 15, 21) : handLoop(28, 27, 21, 15),
    { width: 2.6, delay: 180, color: black ? '#FF6B72' : undefined });
  tone(freqOf(q.clef, target), 0.45);

  const base = WHITE_SEMI[q.n];
  let lead = '正しくは';
  let extra = '';
  if (q.acc) extra = `調号の${symOf(q.acc)}がつく音`;
  if (q.acc && semi === base) lead = 'おしい。正しくは';
  else if (!q.acc && q.key && Math.abs(semi - base) === 1) { lead = 'おしい。正しくは'; extra = '調号はつかない音'; }
  else if ((semi === 0 && target === 12) || (semi === 12 && target === 0)) lead = 'おしい。正しくは';
  setMsg(lead, qName(q), extra);
  advanceId = setTimeout(next, q.key ? 2300 : 1900);
}

function next(): void {
  qi++;
  if (qi >= ROUND) showResult();
  else showQuestion();
}

// 見直し用の音名（赤：正しい答え、灰色に斜線：選んだ答え）
function drawReviewLabels(g: SVGGElement, x: number, ly: number, q: Question, chosen: number): void {
  const a = el('text', {
    x, y: ly, 'text-anchor': 'middle', fill: 'var(--red)',
    'font-family': 'Klee One, Hiragino Maru Gothic ProN, sans-serif', 'font-weight': 600, 'font-size': 20
  }, g);
  a.textContent = qLabel(q);
  const b = el('text', { x, y: ly + 25, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 16 }, g);
  b.textContent = semiName(chosen, q.key);
  const w = (b as SVGTextElement).getComputedTextLength() / 2 + 4;
  el('line', { x1: x - w, x2: x + w, y1: ly + 26, y2: ly + 12, stroke: 'var(--red)', 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: .85 }, g);
}

function showResult(): void {
  state = 'result';
  stopTick();
  renderTimer();
  [...answersEl.children].forEach((li) => li.classList.remove('now'));
  const correct = results.filter((r) => r.ok).length;
  const score = results.reduce((s, r) => s + r.pts, 0);
  const misses = results.filter((r) => !r.ok);

  // 自己ベストは「記号 × 調号の組み合わせ」ごと
  const bestKey = `onpu-best-${mode}${sharpOn ? '-sharp' : ''}${flatOn ? '-flat' : ''}`;
  const prevRaw = store.get(bestKey);
  const prev = prevRaw === null ? null : Number(prevRaw);
  const isNewBest = prev === null || score > prev;
  if (isNewBest) store.set(bestKey, String(score));

  show(keysEl, false);
  show(staffEl, false);
  show(msgEl, false);
  show(resultEl, true);
  show(actionBtn, true);
  actionBtn.textContent = 'もう一度';
  resultEl.replaceChildren();

  const p = (cls: string, text: string): HTMLParagraphElement => {
    const n = document.createElement('p');
    n.className = cls;
    n.textContent = text;
    resultEl.appendChild(n);
    return n;
  };
  const scoreEl = p('score', String(score));
  const unit = document.createElement('small');
  unit.textContent = '点';
  scoreEl.appendChild(unit);
  p('sub', `${ROUND}問中 ${correct}問正解、合計 ${fmtSec(totalMs)}`);
  if (prev !== null) {
    if (isNewBest) p('best new', `自己ベスト更新（これまで ${prev}点）`);
    else p('best', `自己ベスト ${prev}点`);
  }

  if (misses.length) {
    p('review-label', 'まちがえた音（赤が正しい答え）');
    if (accOn()) {
      // 調号が問題ごとにちがうので、1問ずつ小さな譜面にする
      const grid = document.createElement('div');
      grid.className = 'review-grid';
      resultEl.appendChild(grid);
      const x = CLEFS.bass.sigX + MAX_KEY * SHARP_STEP + 40;  // 調号がいちばん長いときに合わせる
      const width = x + 44;
      const ly = yOf(-2) + 42;                                  // いちばん低い音（加線のド）の下
      for (const m of misses) {
        const svg = el('svg', { role: 'img' }, grid);
        svg.setAttribute('aria-label', `${CLEFS[m.clef].name}、正しくは${qName(m)}、答えは${semiName(m.chosen, m.key)}`);
        const { g } = drawStaff(svg, width, m.clef, [{ n: m.n, x }], m.key);
        svg.setAttribute('viewBox', `0 34 ${width} ${ly + 30 - 34}`);
        drawReviewLabels(g, x, ly, m, m.chosen);
      }
    } else {
      for (const clef of ['treble', 'bass'] as const) {
        const list = misses.filter((m) => m.clef === clef);
        if (!list.length) continue;
        const gap = 62, x0 = 122;
        const width = Math.max(360, x0 + 6 + list.length * gap);
        const svg = el('svg', { class: 'review', role: 'img' }, resultEl);
        svg.setAttribute('aria-label', `${CLEFS[clef].name}でまちがえた音：` + list.map(qName).join('、'));
        const { g } = drawStaff(svg, width, clef, list.map((m, i) => ({ n: m.n, x: x0 + i * gap })));
        // 音名は、いちばん低い音符（または第1線）のすぐ下にそろえる
        const ly = Math.max(BOTTOM, ...list.map((m) => yOf(posOf(m)))) + 42;
        svg.setAttribute('viewBox', `0 34 ${width} ${ly + 30 - 34}`);
        list.forEach((m, i) => drawReviewLabels(g, x0 + i * gap, ly, m, m.chosen));
      }
    }
  }
  actionBtn.focus({ preventScroll: true });
}

actionBtn.addEventListener('click', () => {
  if (state === 'result') showReady();
  if (state === 'ready') start();
});

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  if (state === 'question') {
    let semi = KEY_SEMI[e.key.toLowerCase()];
    if (semi === undefined && /^[1-8]$/.test(e.key)) semi = WHITE_SEMI[Number(e.key) - 1];
    if (semi !== undefined) { e.preventDefault(); answer(semi); }
    return;
  }
  if ((state === 'ready' || state === 'result') && (e.key === 'Enter' || e.key === ' ')) {
    const a = document.activeElement;
    // ボタンにフォーカスがあるときはそのボタンに任せる（ただし選択中のモードのタブならスタート）
    if (a && a.tagName === 'BUTTON' && !(a.classList.contains('mode') && (a as HTMLButtonElement).dataset.mode === mode)) return;
    e.preventDefault();
    actionBtn.click();
  }
});

renderSound();
renderModes();
setBlackKeys(false, 0);
showReady();
