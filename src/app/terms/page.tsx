import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/icons";

export const metadata: Metadata = {
  title: "Terms · CV Editor",
  description: "The few rules for using the CV Editor.",
};

export default function Terms() {
  return (
    <main className="doc">
      <div className="doc-inner">
        <Link href="/" className="mark">
          <Mark /> CV Editor
        </Link>
        <h1>Terms</h1>
        <p className="updated">Last updated 1 October 2026</p>

        <ul>
          <li>The editor is free to use, and you don&apos;t need an account.</li>
          <li>What you write is yours. We claim no rights to your CVs.</li>
          <li>AI suggestions can be wrong. Read each one before you use it, and keep your CV true.</li>
          <li>Use the AI to improve your own CV, and don&apos;t try to get around its limits.</li>
          <li>
            The editor comes as it is. We try to keep it working, but we can&apos;t promise it will always be there or
            free of mistakes, so keep a backup of your CVs.
          </li>
          <li>We may change these terms or the editor. If a change matters, this page will say so.</li>
        </ul>
        <p>
          <Link href="/privacy">Privacy</Link> explains what the editor keeps and where.
        </p>
      </div>
    </main>
  );
}
