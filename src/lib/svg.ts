export type SVGAttributes = Record<string, string | number>;

export const createSVGElement = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: SVGAttributes = {}
): SVGElementTagNameMap[K] => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
};
