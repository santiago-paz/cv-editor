// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitize } from "@/lib/sanitize";
import { sanitizeServer } from "@/lib/server/sanitize";

/* The browser's sanitizer and the server's must agree, or the preview and
   the PDF would print different text. Every case runs through both. */

const cases: [string, string, string][] = [
  ["keeps bold, italics and links", 'a <strong>b</strong> <em>c</em> <a href="https://x.example">d</a>', 'a <strong>b</strong> <em>c</em> <a href="https://x.example">d</a>'],
  ["renames b and i", "<b>bold</b> and <i>italic</i>", "<strong>bold</strong> and <em>italic</em>"],
  ["unwraps what it does not allow, keeping the words", '<div><span style="color:red">red</span> <u>under</u></div>', "red under"],
  ["drops scripts with their content", "a<script>alert(1)</script>b", "ab"],
  ["drops event handlers", '<strong onclick="alert(1)">x</strong>', "<strong>x</strong>"],
  ["unwraps a javascript: link", '<a href="javascript:alert(1)">x</a>', "x"],
  ["keeps mailto and tel links", '<a href="mailto:a@b.example">m</a> <a href="tel:+491">t</a>', '<a href="mailto:a@b.example">m</a> <a href="tel:+491">t</a>'],
  ["turns non-breaking spaces into plain ones", "a&nbsp;b c", "a b c"],
  ["drops a trailing line break", "text<br>", "text"],
  ["keeps a line break inside", "one<br>two", "one<br>two"],
  ["drops images", '<img src="https://x.example/p.png" onerror="alert(1)">x', "x"],
];

describe("sanitize", () => {
  for (const [what, input, output] of cases) {
    it(`browser: ${what}`, () => expect(sanitize(input)).toBe(output));
    it(`server: ${what}`, () => expect(sanitizeServer(input)).toBe(output));
  }
});
