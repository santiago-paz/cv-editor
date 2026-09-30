import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/icons";

export const metadata: Metadata = {
  title: "Privacy · CV Editor",
  description: "What the CV Editor keeps, where, and for how long.",
};

export default function Privacy() {
  return (
    <main className="doc">
      <div className="doc-inner">
        <Link href="/" className="mark">
          <Mark /> CV Editor
        </Link>
        <h1>Privacy</h1>
        <p className="updated">Last updated 1 October 2026</p>

        <p>
          You can use the editor without an account, and your CVs stay in your browser. We never keep a copy of
          your CV on our server.
        </p>

        <h2>What stays in your browser</h2>
        <p>
          Your CVs, your photo and your settings are saved in your browser&apos;s storage, on this device. If you turn
          on &quot;Forget my CVs when I close this tab&quot; in Settings, they stay in that tab only, and closing it
          deletes them. To keep a copy somewhere else, use Back up in Settings.
        </p>

        <h2>When your CV reaches our server</h2>
        <ul>
          <li>
            When you download a PDF, your browser sends the CV to our server. The server prints it and sends the file
            back. It keeps no copy of the CV or the PDF, and no log of either.
          </li>
          <li>
            When you use &quot;Improve with AI&quot;, your browser sends that block&apos;s text, the job title or
            headline above it, the job&apos;s dates and the CV&apos;s language. We pass them to Anthropic&apos;s Claude
            API, which writes the suggestion, and we don&apos;t store the text. Anthropic&apos;s commercial terms say
            it does not train its models on this data. Your name, contact details, photo and the rest of your CV are
            never sent.
          </li>
        </ul>

        <h2>Accounts</h2>
        <p>You only need an account for AI rewrites, and you sign in with Google. We keep:</p>
        <ul>
          <li>your name and email address, as Google sends them, and the Google account ID that links them;</li>
          <li>your sign-in sessions, so you stay signed in;</li>
          <li>
            one row for each AI rewrite: when it happened, how many tokens it used, and whether you used the
            suggestion. Never the text.
          </li>
        </ul>
        <p>Delete account, in Settings, removes all of it at once.</p>

        <h2>Cookies</h2>
        <p>Signing in sets cookies that keep you signed in. There are no ads, no analytics cookies and no tracking.</p>

        <h2>Who handles the data</h2>
        <ul>
          <li>Vercel hosts the site and runs the server, in the United States.</li>
          <li>Neon stores accounts and rewrite counts, in the United States.</li>
          <li>Google handles sign-in.</li>
          <li>Anthropic writes the AI suggestions.</li>
          <li>PayPal handles donations, on its own site, only if you click Donate.</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Santiago Paz runs the CV Editor. Write to{" "}
          <a href="mailto:santiago.paz.1992@gmail.com">santiago.paz.1992@gmail.com</a> to ask what we hold about you,
          or about anything on this page.
        </p>
      </div>
    </main>
  );
}
