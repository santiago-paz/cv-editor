import Link from "next/link";
import { KEEP } from "@/lib/keep";
import { OPERATOR } from "@/lib/operator";
import type { LegalText } from "./types";

/* The privacy and terms pages in English, which is the text the others follow.
   When this changes, change the other languages in step (es.tsx, de.tsx,
   pt.tsx), and the date in index.ts. The windows come from keep.ts and the
   operator from operator.ts, as they always did, so a number here cannot drift
   from the code that enforces it. */

const en: LegalText = {
  back: "Back to the editor",
  language: "Language",
  updated: date => `Last updated ${date}`,

  privacy: {
    title: "Privacy",
    description: "What the CV Editor keeps, where, and for how long.",
    body: (
      <>
        <p>
          You can use the editor without an account, and your CVs stay in your browser. We never keep a copy of
          your CV on our server.
        </p>

        <h2>Who runs this</h2>
        <p>
          {OPERATOR.name} runs the CV Editor from {OPERATOR.country} and is responsible for the data on this page. Write
          to <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.{" "}
          {OPERATOR.address ? `Postal address: ${OPERATOR.address}.` : "For a postal address, write to that email."}
        </p>

        <h2>What stays in your browser</h2>
        <p>
          Your CVs, your photo and your settings are saved in your browser&apos;s storage, on this device. If you turn
          on &quot;Forget my CVs when I close this tab&quot; in Settings, they stay in that tab only, and closing it
          deletes them. To keep a copy somewhere else, use Back up in Settings.
        </p>
        <p>
          Save as PDF, the main button on a computer, makes the file in your browser with its own print dialog. It
          sends nothing.
        </p>

        <h2>When your CV reaches our server</h2>
        <ul>
          <li>
            When you choose Download a PDF file, your browser sends the CV to our server. The server prints it and
            sends the file back. It keeps no copy of the CV or the PDF, and no log of either. On a phone or tablet,
            the main button does this.
          </li>
          <li>
            When you use &quot;Improve with AI&quot;, your browser sends that block&apos;s text, the job title or
            headline above it, the job&apos;s dates and the CV&apos;s language. We pass them to Anthropic&apos;s Claude
            API, which writes the suggestion, and we don&apos;t store the text. Anthropic&apos;s commercial terms say
            it does not train its models on this data. It deletes what it receives within 30 days, and keeps it longer
            only if its safety checks flag it or the law requires. Your name, contact details, photo and the rest of
            your CV are never sent. Please don&apos;t put health, religion, politics or union details in a block you
            send.
          </li>
        </ul>

        <h2>Accounts</h2>
        <p>
          You only need an account for AI rewrites, and you sign in with Google. You must be 16 or older. We keep:
        </p>
        <ul>
          <li>your name and email address, as Google sends them, and the Google account ID that links them;</li>
          <li>
            a sign-in session for each device, so you stay signed in. It holds a random token and an expiry date. It
            lasts {KEEP.sessionDays} days after you last use it;
          </li>
          <li>
            one row for each AI rewrite: when it happened, how many tokens it used, and whether you used the
            suggestion. Never the text.
          </li>
        </ul>
        <p>
          We don&apos;t keep your IP address, your browser details, your Google profile photo or the tokens Google
          issues when you sign in. Delete account, in Settings, removes all of it at once. To cut Google&apos;s link
          too, remove CV Editor at{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">
            myaccount.google.com/permissions
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>

        <h2>Cookies</h2>
        <p>There are no cookies until you sign in. Signing in sets two, and it needs both:</p>
        <ul>
          <li>
            <code translate="no">__Secure-better-auth.session_token</code> keeps you signed in. It lasts {KEEP.sessionDays} days and
            renews each day you use the editor.
          </li>
          <li>
            <code translate="no">__Secure-better-auth.state</code> checks that the sign-in came from you. It lasts 5 minutes.
          </li>
        </ul>
        <p>
          Your CVs and settings sit in your browser&apos;s storage, not in cookies. There are no ads, and we don&apos;t
          track you across sites. The visit count described below sets no cookie either.
        </p>

        <h2>Visits and logs</h2>
        <p>
          Vercel, which hosts the site, sees the IP address of each visit. It uses the address to deliver the site and
          to limit how many PDFs one address can ask for each minute. Vercel&apos;s own privacy notice says how long it
          keeps its logs. We don&apos;t store IP addresses in our database.
        </p>
        <p>
          We also count visits, with Vercel Web Analytics. It sets no cookie, and the counts hold no IP address and no
          name. For each visit it records the time, the page, the site you came from, your country, region and city,
          your device type, and your browser and system. To tell visitors apart, it uses a code made from the request.
          Vercel deletes that code after 24 hours, and after that nothing links one visit to the next. We see only
          totals, such as visits per page or per country, to learn how many people use the editor.
        </p>

        <h2>Who handles the data</h2>
        <ul>
          <li>Vercel hosts the site, runs the server and counts visits, in the United States.</li>
          <li>Neon stores accounts and rewrite counts, in the United States.</li>
          <li>Anthropic writes the AI suggestions, in the United States.</li>
          <li>Google handles sign-in, under its own privacy policy.</li>
          <li>PayPal handles donations, on its own site, only if you click Donate.</li>
        </ul>
        <p>
          Argentina does not list the United States as a country with adequate data protection. When you sign in, choose Download a PDF file or use the AI, you agree that your data is processed there. We use Vercel, Neon and
          Anthropic under their data processing terms.
        </p>

        <h2>Why we use your data</h2>
        <ul>
          <li>To make your PDF and write your AI suggestions, because you ask for them.</li>
          <li>To keep your account, because you make it and agree to it.</li>
          <li>To count rewrites, apply the limits and stop abuse, so the free AI test stays within its budget.</li>
          <li>To count visits, so we know how many people use the editor.</li>
        </ul>
        <p>If you are in the EU or the UK, the legal basis is contract for the first two and legitimate interest for the last two.</p>

        <h2>How long we keep it</h2>
        <ul>
          <li>CVs and PDFs: we don&apos;t keep them.</li>
          <li>AI text: we don&apos;t keep it. Anthropic deletes it within 30 days.</li>
          <li>Sign-in sessions: {KEEP.sessionDays} days after you last use them. We delete expired ones automatically.</li>
          <li>AI rewrite rows: {KEEP.rewriteMonths} months, then we delete them.</li>
          <li>
            Your account: until you delete it. We also delete an account that has had no AI rewrite for{" "}
            {KEEP.idleAccountMonths} months.
          </li>
          <li>Visit counts: Vercel shows us the last 12 months.</li>
        </ul>
        <p>When we delete data, copies can stay in database backups for a short time.</p>

        <h2>Your rights</h2>
        <p>You can ask what we hold about you, have it corrected, or have it deleted.</p>
        <ul>
          <li>Access is free. You can ask once every 6 months, and we answer within 10 days.</li>
          <li>We correct or delete your data within 5 working days of your request.</li>
          <li>
            Delete account, in Settings, deletes your account data at once. Back up, in Settings, saves your CVs to a
            file.
          </li>
        </ul>
        <p>To ask, write to the email above from the address your account uses.</p>
        <p>Argentina&apos;s data protection law, Ley&nbsp;25.326, asks us to print this notice:</p>
        <p lang="es">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
          lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA,
          en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y
          reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes
          en materia de protección de datos personales.
        </p>
        <p>
          In English: you can ask for access to your data for free at intervals of at least 6 months, unless you show
          a legitimate interest. The Agencia de Acceso a la Información Pública, the AAIP, oversees Ley&nbsp;25.326 and
          handles complaints about breaches of the data protection rules.
        </p>

        <h2>Complaints</h2>
        <p>
          If we can&apos;t settle it with you, you can complain to the AAIP, Argentina&apos;s data protection
          authority, at{" "}
          <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener">
            argentina.gob.ar/aaip
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          . If you live in the EU or the UK, you can also complain to your local data protection authority.
        </p>

        <p>
          The <Link href="/terms">Terms</Link> set the rules for using the editor.
        </p>
      </>
    ),
  },

  terms: {
    title: "Terms",
    description: "The few rules for using the CV Editor.",
    body: (
      <>
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
      </>
    ),
  },
};

export default en;
