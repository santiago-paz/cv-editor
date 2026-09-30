import type { Block } from "./paginate";

/* Reads what the page-break walk needs off a laid-out CV: its top-level
   blocks and the room a page gives them.

   It uses nothing but the document it is handed, so the preview can run it on
   its iframe and a test can hand it to Chrome to run next to a real print. */

export interface FlowSpec {
  /** A selector for the element holding the sections, or null for <body>. */
  flow: string | null;
  /** Selectors for the cells that repeat as each page's top and bottom margin. */
  spacers: [string, string] | null;
  /** The @page margin, top and bottom, in mm. */
  marginTop: number;
  marginBottom: number;
}

export interface FlowMeasure {
  blocks: (Block & { text: string })[];
  /** Where page 1's copy starts and where the copy ends, in CSS px. */
  start: number;
  end: number;
  /** The height a page gives the copy, in CSS px. */
  page: number;
  /** The height of the bottom spacer, which ends every page. */
  padBottom: number;
  /** The document's own height. */
  content: number;
}

export function measureFlow(doc: Document, spec: FlowSpec): FlowMeasure {
  const pxPerMm = 96 / 25.4;
  const rect = (node: Element) => node.getBoundingClientRect();
  const docTop = rect(doc.documentElement).top;
  const topOf = (node: Element) => rect(node).top - docTop;

  const root = (spec.flow && doc.querySelector(spec.flow)) || doc.body;
  const nested = root !== doc.body;

  let page = (297 - spec.marginTop - spec.marginBottom) * pxPerMm;
  let padBottom = 0;
  if (spec.spacers) {
    const top = doc.querySelector(spec.spacers[0]);
    const bottom = doc.querySelector(spec.spacers[1]);
    padBottom = bottom ? rect(bottom).height : 0;
    page -= (top ? rect(top).height : 0) + padBottom;
  }

  const blocks = Array.from(root.children)
    .filter(node => (node as HTMLElement).offsetHeight > 0)
    .map(node => ({
      top: topOf(node),
      height: rect(node).height,
      heading: node.tagName === "H2",
      text: (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
    }));

  const content = doc.documentElement.scrollHeight;
  return {
    blocks,
    start: nested ? topOf(root) : 0,
    end: nested ? topOf(root) + rect(root).height : content,
    page,
    padBottom,
    content,
  };
}
