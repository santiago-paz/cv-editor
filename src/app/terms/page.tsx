import type { Metadata } from "next";
import Link from "next/link";
import { Doc } from "@/components/Doc";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = {
  title: "Terms · CV Editor",
  description: "The few rules for using the CV Editor.",
};

export default function Terms() {
  return (
    <Doc title="Terms" updated="1 October 2026">
      <ul>
        <li>
          {OPERATOR.name} runs the CV Editor from {OPERATOR.country}. It is free to use, and you don&apos;t need an
          account.
        </li>
        <li>
          What you write is yours. We claim no rights to your CVs. The AI&apos;s suggestions are yours to use once you
          put them in your CV.
        </li>
        <li>Read each AI suggestion before you use it, because it can be wrong. Keep your CV true.</li>
        <li>
          The AI runs on Anthropic&apos;s Claude. Use it to improve your own CV, follow Anthropic&apos;s{" "}
          <a href="https://www.anthropic.com/legal/aup" target="_blank" rel="noopener">
            usage policy
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          , and don&apos;t try to get around its limits. We can change or stop the AI at any time. It is a free test.
        </li>
        <li>
          You must be 16 or older to make an account. We can close an account that abuses the AI or the PDF service,
          for example with scripts that send requests in bulk.
        </li>
        <li>A donation is a gift. It buys no feature and gives no extra right.</li>
        <li>
          The editor comes as it is. We try to keep it working, but we can&apos;t promise it will always be there or
          free of mistakes, so keep a backup of your CVs. As far as the law allows, we are not liable for losses that
          come from using the editor or from trusting an AI suggestion.
        </li>
        <li>
          These terms follow the laws of Argentina. Any rights that protect you as a consumer where you live still
          apply.
        </li>
        <li>We may change these terms or the editor. If a change matters, this page will say so and show a new date.</li>
      </ul>
      <p>
        <Link href="/privacy">Privacy</Link> explains what the editor keeps and where. For questions about these terms,
        write to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
      </p>
    </Doc>
  );
}
