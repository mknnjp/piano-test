import { createSVGElement } from './lib/svg.js';
import { renderStaffLines, stepToY, renderClef, type StaffLayout } from './lib/staff.js';
import { staffData, type StaffDataEntry, type StaffNote } from './lib/notes.js';

const STAFF_LAYOUT: StaffLayout = {
  lineSpacing: 18,
  staffTop: 40,
  staffLeft: 40,
  staffWidth: 200
};

const LABEL_OFFSET = 24;

const getElement = <T extends Element>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`要素が見つかりません: #${id}`);
  }
  return element as unknown as T;
};

const renderNotes = (svg: SVGSVGElement, config: StaffDataEntry): void => {
  const noteX = STAFF_LAYOUT.staffLeft + 110;
  const labelXRight = STAFF_LAYOUT.staffLeft + STAFF_LAYOUT.staffWidth + LABEL_OFFSET;
  const labelXLeft = STAFF_LAYOUT.staffLeft - LABEL_OFFSET;

  config.notes.forEach((note) => {
    const y = stepToY(note.step, STAFF_LAYOUT);
    const head = createSVGElement('ellipse', {
      cx: noteX,
      cy: y,
      rx: 9,
      ry: 6.5,
      fill: '#111827'
    });
    svg.appendChild(head);

    const isLineNote = note.step % 2 === 0;
    const labelX = isLineNote ? labelXLeft : labelXRight;
    const label = createSVGElement('text', {
      x: labelX,
      y: y + 4,
      'font-size': '12',
      fill: '#1f2937',
      'text-anchor': isLineNote ? 'end' : 'start'
    });
    label.textContent = `${note.name} / ${note.label}`;
    svg.appendChild(label);
  });
};

const renderList = (listElement: HTMLElement, notes: readonly StaffNote[]): void => {
  listElement.innerHTML = '';
  notes.forEach((note) => {
    const row = document.createElement('div');
    row.className = 'note-item';
    row.innerHTML = `<span>${note.name}</span><span>${note.label}</span>`;
    listElement.appendChild(row);
  });
};

staffData.forEach((config) => {
  const svg = getElement<SVGSVGElement>(config.id);
  const list = getElement<HTMLElement>(config.listId);
  renderStaffLines(svg, STAFF_LAYOUT);
  renderClef(svg, {
    symbol: config.clefSymbol,
    x: 8,
    y: STAFF_LAYOUT.staffTop + STAFF_LAYOUT.lineSpacing * 3
  });
  renderNotes(svg, config);
  renderList(list, config.notes);
});
