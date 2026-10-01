/* Marks the words of an AI suggestion that the original did not have, so the
   person sees at a glance what changed. The marks are for display only: put
   them on a suggestion that is already clean, and never store the result.

   This is a count of words, not a true diff. A word that is there in both
   stays plain, however far it moved. That is enough to show the new ones. */

/** A word: letters and digits, with ' + # inside, and . or - between two
    characters ("Next.js", "end-to-end", "C++"). A full stop that ends a
    sentence is not part of the word. */
const WORD = /[\p{L}\p{N}](?:[\p{L}\p{N}'’+#]|[.-](?=[\p{L}\p{N}]))*/gu;

/** The pieces of markup in an HTML string that are not text. */
const NOT_TEXT = /(<[^>]*>|&(?:#\d+|#x[0-9a-f]+|\w+);)/i;

/** Above this share of new words the whole line was rewritten, and marking
    all of it would say nothing. */
const REWRITTEN = 0.7;

const key = (word: string) => word.toLowerCase();

/** `html` is the suggestion. `original` is the plain text it replaces. */
export function markNew(html: string, original: string): string {
  const left = new Map<string, number>();
  for (const word of original.match(WORD) ?? []) left.set(key(word), (left.get(key(word)) ?? 0) + 1);

  let total = 0;
  let fresh = 0;
  const marked = html
    .split(NOT_TEXT)
    .map((part, index) => {
      if (index % 2 === 1) return part; // a tag or an entity
      return part.replace(WORD, word => {
        total++;
        const count = left.get(key(word)) ?? 0;
        if (count > 0) {
          left.set(key(word), count - 1);
          return word;
        }
        fresh++;
        return `<mark>${word}</mark>`;
      });
    })
    .join("");

  if (!fresh || fresh / total > REWRITTEN) return html;
  // Words that are new next to each other read as one stroke.
  return marked.replace(/<\/mark>(\s+)<mark>/g, "$1");
}

/** True when the suggestion says what the original says, to the word. */
export function sameWords(html: string, original: string): boolean {
  const words = (text: string) => (text.match(WORD) ?? []).map(key).join(" ");
  return words(html.replace(/<[^>]*>/g, " ")) === words(original);
}
