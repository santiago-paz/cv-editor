/* Where Chrome will break the pages, worked out from the preview.

   Page breaks are not drawn at flat intervals. They follow the same rules the
   templates give Chrome: an .entry never splits, so a block that cannot finish
   on a page moves to the next one whole, and an <h2> travels with the block
   under it. Cutting at flat intervals reads a page as emptier than it is,
   and misses a heading left alone at the foot of a page. */

export interface Block {
  /** Offsets from the top of the document, in CSS pixels. */
  top: number;
  height: number;
  heading: boolean;
}

export interface Cut {
  /** Where the next page starts, from the top of the document. */
  at: number;
  /** Paper left empty at the foot of the page, because a block moved on. */
  dead: number;
  /** The index of the last block on the page, or -1. */
  last: number;
}

export interface Pagination {
  cuts: Cut[];
  count: number;
  /** How full the last page is, 0 to 1. */
  lastFill: number;
}

/**
 * @param blocks  the flow's top-level blocks, in order
 * @param start   where page 1's copy starts
 * @param end     where the copy ends
 * @param page    the height a page gives the copy
 */
export function paginate(blocks: Block[], start: number, end: number, page: number): Pagination {
  const cuts: Cut[] = [];
  let pageTop = start;
  if (!(page > 0)) return { cuts, count: 1, lastFill: 0 };

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.top + block.height - pageTop <= page) continue;

    let cutIndex = i;
    let at = block.top;
    if (i > 0 && blocks[i - 1].heading) {
      cutIndex = i - 1;
      at = blocks[i - 1].top;
    }
    /* A single block taller than a page has to split somewhere; let it. */
    if (at <= pageTop) {
      cutIndex = i + 1;
      at = pageTop + page;
    }

    cuts.push({ at, dead: Math.max(0, page - (at - pageTop)), last: cutIndex - 1 });
    pageTop = at;

    /* A block taller than a page still overflows the new one. Look at it
       again: pageTop moved down, so this ends. */
    if (block.top + block.height - pageTop > page) i--;
  }

  return {
    cuts,
    count: cuts.length + 1,
    lastFill: Math.max(0, Math.min(1, (end - pageTop) / page)),
  };
}
