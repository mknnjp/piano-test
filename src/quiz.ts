import { createSVGElement } from './lib/svg.js';
import { renderStaffLines, positionToY, renderClef, type StaffLayout } from './lib/staff.js';
import { NOTE_POOL, STAFF_CONFIG } from './lib/notes.js';
import { pickRandomNote, checkAnswer, type QuizNote } from './lib/quiz-logic.js';

interface QuizState {
  currentNote: QuizNote | null;
  questionCount: number;
}

const state: QuizState = {
  currentNote: null,
  questionCount: 0
};

const getElement = <T extends Element>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`要素が見つかりません: #${id}`);
  }
  return element as unknown as T;
};

const staffElement = getElement<SVGSVGElement>('staff');
const questionIndex = getElement<HTMLDivElement>('question-index');
const clefLabel = getElement<HTMLDivElement>('clef-label');
const status = getElement<HTMLDivElement>('status');
const answerButtons = getElement<HTMLElement>('answer-buttons');
const nextButton = getElement<HTMLButtonElement>('next-button');

const STAFF_LAYOUT: StaffLayout = {
  lineSpacing: 16,
  staffTop: 50,
  staffLeft: 50,
  staffWidth: 260
};

const renderNote = (note: QuizNote): void => {
  staffElement.innerHTML = '';
  renderStaffLines(staffElement, STAFF_LAYOUT);

  const config = STAFF_CONFIG[note.clef];
  const notePosition = config.positionMap[note.spelled];
  const y = positionToY(notePosition, STAFF_LAYOUT);

  renderClef(staffElement, {
    symbol: config.clef,
    x: 10,
    y: STAFF_LAYOUT.staffTop + STAFF_LAYOUT.lineSpacing * 3
  });

  const noteHead = createSVGElement('ellipse', {
    cx: STAFF_LAYOUT.staffLeft + STAFF_LAYOUT.staffWidth / 2,
    cy: y,
    rx: 10,
    ry: 7,
    fill: '#111827'
  });
  staffElement.appendChild(noteHead);

  const stemDirection = notePosition >= 4 ? -1 : 1;
  const stem = createSVGElement('line', {
    x1: STAFF_LAYOUT.staffLeft + STAFF_LAYOUT.staffWidth / 2 + 9,
    x2: STAFF_LAYOUT.staffLeft + STAFF_LAYOUT.staffWidth / 2 + 9,
    y1: y,
    y2: y + stemDirection * 36,
    stroke: '#111827',
    'stroke-width': '2'
  });
  staffElement.appendChild(stem);

  if (note.accidental) {
    const accidental = createSVGElement('text', {
      x: STAFF_LAYOUT.staffLeft + STAFF_LAYOUT.staffWidth / 2 - 30,
      y: y + 5,
      'font-size': '24',
      fill: '#111827'
    });
    accidental.textContent = note.accidental;
    staffElement.appendChild(accidental);
  }
};

const createButtons = (): void => {
  answerButtons.innerHTML = '';
  NOTE_POOL.forEach((note) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = note.label;
    button.dataset.spelled = note.spelled;
    button.addEventListener('click', () => handleAnswer(note.spelled));
    answerButtons.appendChild(button);
  });
};

const setButtonsDisabled = (disabled: boolean): void => {
  answerButtons.querySelectorAll('button').forEach((button) => {
    button.disabled = disabled;
  });
};

type StatusType = 'correct' | 'incorrect';

const updateStatus = (message: string, type: StatusType | null): void => {
  status.textContent = message;
  status.className = 'status';
  if (type) {
    status.classList.add(type);
  }
};

const handleAnswer = (spelled: string): void => {
  if (!state.currentNote) {
    return;
  }
  setButtonsDisabled(true);
  const isCorrect = checkAnswer(spelled, state.currentNote);
  updateStatus(
    isCorrect
      ? '正解！'
      : `不正解です。正しい答えは「${state.currentNote.spelled}」です。`,
    isCorrect ? 'correct' : 'incorrect'
  );
};

const nextQuestion = (): void => {
  state.questionCount += 1;
  state.currentNote = pickRandomNote();
  questionIndex.textContent = `第${state.questionCount}問`;
  clefLabel.textContent = `${STAFF_CONFIG[state.currentNote.clef].name}（${state.currentNote.clef === 'treble' ? '右手' : '左手'}）`;
  updateStatus('', null);
  setButtonsDisabled(false);
  renderNote(state.currentNote);
};

createButtons();
nextButton.addEventListener('click', nextQuestion);
nextQuestion();
