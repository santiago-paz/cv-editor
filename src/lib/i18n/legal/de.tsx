import Link from "next/link";
import { KEEP } from "@/lib/keep";
import { OPERATOR } from "@/lib/operator";
import type { LegalText } from "./types";

/* The privacy and terms pages in German. They follow en.tsx section by section,
   with the same lists and links, so a person who switches language finds the same
   text. When en.tsx changes, change this file in step. The windows come from
   keep.ts and the operator from operator.ts, as in the English. The country is
   written out, because the pages follow Argentina's law and a test pins it. */

const de: LegalText = {
  back: "Zurück zum Editor",
  language: "Sprache",
  updated: date => `Zuletzt aktualisiert am ${date}`,

  privacy: {
    title: "Datenschutz",
    description: "Was der CV Editor speichert, wo und wie lange.",
    body: (
      <>
        <p>
          Du kannst den Editor ohne Konto nutzen, und deine Lebensläufe bleiben in deinem Browser. Wir speichern nie
          eine Kopie deines Lebenslaufs auf unserem Server.
        </p>

        <h2>Wer den Editor betreibt</h2>
        <p>
          {OPERATOR.name} betreibt den CV Editor von Argentinien aus und ist für die hier beschriebenen Daten
          verantwortlich. Schreib an <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.{" "}
          {OPERATOR.address
            ? `Postanschrift: ${OPERATOR.address}.`
            : "Für eine Postanschrift schreib an diese E-Mail-Adresse."}
        </p>

        <h2>Was in deinem Browser bleibt</h2>
        <p>
          Deine Lebensläufe, dein Foto und deine Einstellungen liegen im Speicher deines Browsers, auf diesem Gerät.
          Wenn du in den Einstellungen „Meine Lebensläufe beim Schließen dieses Tabs vergessen“ einschaltest, bleiben
          sie nur in diesem Tab, und beim Schließen werden sie gelöscht. Um eine Kopie an einem anderen Ort
          aufzubewahren, nutze in den Einstellungen „Sichern“.
        </p>
        <p>
          „Als PDF speichern“, die Hauptschaltfläche am Computer, erstellt die Datei in deinem Browser mit dessen
          eigenem Druckdialog. Dabei wird nichts gesendet.
        </p>

        <h2>Wann dein Lebenslauf unseren Server erreicht</h2>
        <ul>
          <li>
            Wenn du „PDF-Datei herunterladen“ wählst, sendet dein Browser den Lebenslauf an unseren Server. Der Server
            druckt ihn und schickt die Datei zurück. Er behält keine Kopie des Lebenslaufs oder des PDFs und führt
            kein Protokoll darüber. Auf einem Handy oder Tablet macht die Hauptschaltfläche genau das.
          </li>
          <li>
            Wenn du „Mit KI verbessern“ nutzt, sendet dein Browser den Text dieses Blocks, den Jobtitel oder die
            Überschrift darüber, den Zeitraum der Stelle und die Sprache des Lebenslaufs. Wir geben sie an die Claude
            API von Anthropic weiter, die den Vorschlag schreibt, und wir speichern den Text nicht. Laut den
            kommerziellen Nutzungsbedingungen von Anthropic trainiert Anthropic seine Modelle nicht mit diesen Daten.
            Anthropic löscht, was es erhält, innerhalb von 30 Tagen. Länger behält es die Daten nur, wenn seine
            Sicherheitsprüfungen sie als auffällig markieren oder das Gesetz dies verlangt. Dein Name, deine
            Kontaktdaten, dein Foto und der Rest deines Lebenslaufs werden nie gesendet. Bitte schreib keine Angaben
            zu Gesundheit, Religion, Politik oder Gewerkschaft in einen Block, den du sendest.
          </li>
        </ul>

        <h2>Konten</h2>
        <p>
          Ein Konto brauchst du nur für KI-Überarbeitungen, und du meldest dich mit Google an. Du musst mindestens 16
          Jahre alt sein. Wir speichern:
        </p>
        <ul>
          <li>
            deinen Namen und deine E-Mail-Adresse, so wie Google sie sendet, und die Google-Konto-ID, die sie
            verknüpft;
          </li>
          <li>
            eine Anmeldesitzung für jedes Gerät, damit du angemeldet bleibst. Sie enthält ein zufälliges Token und ein
            Ablaufdatum. Sie bleibt nach deiner letzten Nutzung noch {KEEP.sessionDays} Tage gültig;
          </li>
          <li>
            eine Zeile für jede KI-Überarbeitung: wann sie stattfand, wie viele Tokens sie verbraucht hat und ob du den
            Vorschlag verwendet hast. Nie den Text.
          </li>
        </ul>
        <p>
          Wir speichern keine IP-Adresse, keine Angaben zu deinem Browser, kein Google-Profilfoto und keine Tokens, die
          Google bei der Anmeldung ausgibt. „Konto löschen“ in den Einstellungen entfernt alles auf einmal. Um die
          Verbindung auch bei Google zu trennen, entferne den CV Editor unter{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">
            myaccount.google.com/permissions
            <span className="sr-only"> (öffnet in einem neuen Tab)</span>
          </a>
          .
        </p>

        <h2>Cookies</h2>
        <p>Bis du dich anmeldest, gibt es keine Cookies. Die Anmeldung setzt zwei Cookies und braucht beide:</p>
        <ul>
          <li>
            <code translate="no">__Secure-better-auth.session_token</code> hält dich angemeldet. Es bleibt{" "}
            {KEEP.sessionDays} Tage gültig und wird an jedem Tag erneuert, an dem du den Editor nutzt.
          </li>
          <li>
            <code translate="no">__Secure-better-auth.state</code> prüft, ob die Anmeldung von dir stammt. Es bleibt
            5 Minuten gültig.
          </li>
        </ul>
        <p>
          Deine Lebensläufe und Einstellungen liegen im Speicher deines Browsers, nicht in Cookies. Es gibt keine
          Werbung, keine Webanalyse und kein Tracking.
        </p>

        <h2>Besuche und Protokolle</h2>
        <p>
          Vercel, das die Website hostet, sieht die IP-Adresse jedes Besuchs. Vercel nutzt die Adresse, um die Website
          auszuliefern und um zu begrenzen, wie viele PDFs eine Adresse pro Minute anfordern kann. In der eigenen
          Datenschutzerklärung von Vercel steht, wie lange Vercel seine Protokolle aufbewahrt. Wir speichern keine
          IP-Adressen in unserer Datenbank.
        </p>

        <h2>Wer die Daten verarbeitet</h2>
        <ul>
          <li>Vercel hostet die Website und betreibt den Server, beides in den USA.</li>
          <li>Neon speichert Konten und die Anzahl der KI-Überarbeitungen in den USA.</li>
          <li>Anthropic schreibt die KI-Vorschläge in den USA.</li>
          <li>Google übernimmt die Anmeldung nach seiner eigenen Datenschutzerklärung.</li>
          <li>PayPal wickelt Spenden auf seiner eigenen Website ab, nur wenn du auf „Spenden“ klickst.</li>
        </ul>
        <p>
          Argentinien führt die USA nicht als Land mit angemessenem Datenschutz auf. Wenn du dich anmeldest, „PDF-Datei herunterladen“ wählst oder die KI nutzt, stimmst du zu, dass deine Daten dort verarbeitet werden. Wir nutzen Vercel,
          Neon und Anthropic nach ihren Bedingungen zur Datenverarbeitung.
        </p>

        <h2>Warum wir deine Daten nutzen</h2>
        <ul>
          <li>Um dein PDF zu erstellen und deine KI-Vorschläge zu schreiben, weil du sie anforderst.</li>
          <li>Um dein Konto zu führen, weil du es erstellst und dem zustimmst.</li>
          <li>
            Um KI-Überarbeitungen zu zählen, Limits durchzusetzen und Missbrauch zu stoppen, damit der kostenlose
            KI-Test im Budget bleibt.
          </li>
        </ul>
        <p>
          Wenn du in der EU oder im Vereinigten Königreich bist, ist die Rechtsgrundlage für die ersten beiden Punkte
          der Vertrag und für den dritten das berechtigte Interesse.
        </p>

        <h2>Wie lange wir Daten speichern</h2>
        <ul>
          <li>Lebensläufe und PDFs: Wir speichern sie nicht.</li>
          <li>KI-Text: Wir speichern ihn nicht. Anthropic löscht ihn innerhalb von 30 Tagen.</li>
          <li>
            Anmeldesitzungen: {KEEP.sessionDays} Tage nach deiner letzten Nutzung. Abgelaufene löschen wir automatisch.
          </li>
          <li>Zeilen zu KI-Überarbeitungen: {KEEP.rewriteMonths} Monate, dann löschen wir sie.</li>
          <li>
            Dein Konto: bis du es löschst. Wir löschen auch ein Konto, das seit {KEEP.idleAccountMonths} Monaten keine
            KI-Überarbeitung hatte.
          </li>
        </ul>
        <p>Wenn wir Daten löschen, können Kopien noch für kurze Zeit in Datenbanksicherungen bleiben.</p>

        <h2>Deine Rechte</h2>
        <p>
          Du kannst Auskunft darüber verlangen, was wir über dich gespeichert haben, und diese Daten berichtigen oder
          löschen lassen.
        </p>
        <ul>
          <li>
            Die Auskunft ist kostenlos. Du kannst sie einmal alle 6 Monate verlangen, und wir antworten innerhalb von 10
            Tagen.
          </li>
          <li>Wir berichtigen oder löschen deine Daten innerhalb von 5 Arbeitstagen nach deiner Anfrage.</li>
          <li>
            „Konto löschen“ in den Einstellungen löscht deine Kontodaten sofort. „Sichern“ in den Einstellungen
            speichert deine Lebensläufe in einer Datei.
          </li>
        </ul>
        <p>Schreib dafür an die oben genannte E-Mail-Adresse, und zwar von der Adresse, die dein Konto nutzt.</p>
        <p>Das Datenschutzgesetz Argentiniens, Ley&nbsp;25.326, verlangt von uns, diesen Hinweis abzudrucken:</p>
        <p lang="es">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
          lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA,
          en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y
          reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes
          en materia de protección de datos personales.
        </p>
        <p>
          Auf Deutsch gesagt: Du kannst kostenlos Auskunft über deine Daten verlangen, in Abständen von mindestens 6
          Monaten, es sei denn, du weist ein berechtigtes Interesse nach. Die Agencia de Acceso a la Información
          Pública, kurz AAIP, ist die Aufsichtsbehörde für die Ley&nbsp;25.326 und bearbeitet Beschwerden über Verstöße
          gegen die Datenschutzregeln.
        </p>

        <h2>Beschwerden</h2>
        <p>
          Wenn wir es nicht mit dir klären können, kannst du dich bei der AAIP beschweren, der Datenschutzbehörde
          Argentiniens, unter{" "}
          <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener">
            argentina.gob.ar/aaip
            <span className="sr-only"> (öffnet in einem neuen Tab)</span>
          </a>
          . Wenn du in der EU oder im Vereinigten Königreich lebst, kannst du dich auch bei deiner örtlichen
          Datenschutzbehörde beschweren.
        </p>

        <p>
          Die <Link href="/terms">Nutzungsbedingungen</Link> regeln, wie du den Editor nutzt.
        </p>
      </>
    ),
  },

  terms: {
    title: "Nutzungsbedingungen",
    description: "Die wenigen Regeln für die Nutzung des CV Editors.",
    body: (
      <>
        <ul>
          <li>
            {OPERATOR.name} betreibt den CV Editor von Argentinien aus. Du kannst ihn kostenlos nutzen, und du brauchst
            kein Konto.
          </li>
          <li>
            Was du schreibst, gehört dir. Wir beanspruchen keine Rechte an deinen Lebensläufen. Die Vorschläge der KI
            kannst du frei nutzen, sobald du sie in deinen Lebenslauf einfügst.
          </li>
          <li>
            Lies jeden KI-Vorschlag, bevor du ihn verwendest, weil er falsch sein kann. Achte darauf, dass dein
            Lebenslauf wahr bleibt.
          </li>
          <li>
            Die KI läuft auf Claude von Anthropic. Nutze sie, um deinen eigenen Lebenslauf zu verbessern, halte dich an
            die{" "}
            <a href="https://www.anthropic.com/legal/aup" target="_blank" rel="noopener">
              Nutzungsrichtlinie
              <span className="sr-only"> (öffnet in einem neuen Tab)</span>
            </a>{" "}
            von Anthropic und versuche nicht, ihre Limits zu umgehen. Wir können die KI jederzeit ändern oder
            abschalten. Es ist ein kostenloser Test.
          </li>
          <li>
            Du musst mindestens 16 Jahre alt sein, um ein Konto zu erstellen. Wir können ein Konto schließen, das die KI
            oder den PDF-Dienst missbraucht, zum Beispiel mit Skripten, die massenhaft Anfragen senden.
          </li>
          <li>Eine Spende ist ein Geschenk. Damit kaufst du keine Funktion und bekommst kein zusätzliches Recht.</li>
          <li>
            Der Editor wird so angeboten, wie er ist. Wir versuchen, ihn am Laufen zu halten, aber wir können nicht
            versprechen, dass er immer verfügbar oder fehlerfrei ist. Bewahre deshalb eine Sicherungskopie deiner
            Lebensläufe auf. Soweit das Gesetz es zulässt, haften wir nicht für Verluste, die daraus entstehen, dass du
            den Editor nutzt oder einem KI-Vorschlag vertraust.
          </li>
          <li>
            Für diese Bedingungen gilt das Recht Argentiniens. Verbraucherschutzrechte, die dir dort zustehen, wo du
            lebst, gelten weiterhin.
          </li>
          <li>
            Wir können diese Bedingungen oder den Editor ändern. Wenn eine Änderung wichtig ist, weist diese Seite
            darauf hin und zeigt ein neues Datum.
          </li>
        </ul>
        <p>
          Die Seite <Link href="/privacy">Datenschutz</Link> erklärt, was der Editor speichert und wo. Bei Fragen zu
          diesen Bedingungen schreib an <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
        </p>
      </>
    ),
  },
};

export default de;
