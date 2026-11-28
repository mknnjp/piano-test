import { createSVGElement } from './svg.js';

export interface StaffLayout {
  lineSpacing: number;
  staffTop: number;
  staffLeft: number;
  staffWidth: number;
}

export interface ClefOptions {
  symbol: string;
  x: number;
  y: number;
  fontSize?: number;
}

export const renderStaffLines = (svg: SVGSVGElement, layout: StaffLayout): void => {
  const { lineSpacing, staffTop, staffLeft, staffWidth } = layout;
  for (let i = 0; i < 5; i += 1) {
    const y = staffTop + i * lineSpacing;
    const line = createSVGElement('line', {
      x1: staffLeft,
      x2: staffLeft + staffWidth,
      y1: y,
      y2: y,
      stroke: '#111827',
      'stroke-width': '2'
    });
    svg.appendChild(line);
  }
};

export const positionToY = (
  position: number,
  layout: Pick<StaffLayout, 'lineSpacing' | 'staffTop'>
): number => {
  return layout.staffTop + (4 - position / 2) * layout.lineSpacing;
};

export const stepToY = (
  step: number,
  layout: Pick<StaffLayout, 'lineSpacing' | 'staffTop'>
): number => {
  return layout.staffTop + step * (layout.lineSpacing / 2);
};

export const renderClef = (svg: SVGSVGElement, options: ClefOptions): void => {
  const { symbol, x, y, fontSize = 48 } = options;
  const clef = createSVGElement('text', {
    x,
    y,
    'font-size': String(fontSize),
    fill: '#111827'
  });
  clef.textContent = symbol;
  svg.appendChild(clef);
};
