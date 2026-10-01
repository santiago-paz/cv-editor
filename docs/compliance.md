# Compliance notes

This file says which rules the editor follows, where each one lives in the code, and
what is still open. It was written on 1 October 2026 for the person who runs the site
and for anyone who takes it over. It is a checklist, not legal advice.

## Which laws apply

- **Argentina.** The person who runs the site lives in Argentina, so Ley 25.326 is the
  main law. The AAIP (Agencia de Acceso a la Información Pública) oversees it. A bill
  to replace the law was filed on 16 July 2026 (expediente 3397-D-2026). It is not law yet.
- **EU and UK.** The GDPR applies to a site that aims its service at people there. This
  one is in English and aims at no EU market, so it is a grey area. The privacy page
  covers the basics anyway: legal basis, rights, and where to complain. Nobody has
  been named as an EU representative (GDPR article 27). That is a risk the operator
  accepts for now.
- **Consumer law (Ley 24.240).** It does not apply while the site is free. It starts to
  matter the day the site charges. Ask a lawyer first.
- **EU AI Act.** The transparency duties have applied since 2 August 2026. The button says
  "AI" and the output edits the user's own text, so no marking duty looks likely. Do not
  add features that score or rank candidates for employers. The Act treats those as
  high risk.
- **Accessibility law.** A free tool run by one person is very likely exempt.

## Where each duty lives

| Duty | Where |
| --- | --- |
| Name the person responsible, with an address (Ley 25.326, art. 6) | Privacy page, "Who runs this". `src/lib/operator.ts`. The address comes from `OPERATOR_ADDRESS`. |
| Say what is kept, why, for how long, and who gets it | `src/lib/i18n/legal/`, one file for each language. The English one is the reference, and `src/app/privacy/page.tsx` only shows them. |
| Print the AAIP notice about access rights | Privacy page, "Your rights" |
| Tell people before data leaves their browser | The note under the Next button in `Panel.tsx`, and the notes beside the Google buttons in `Account.tsx` and `Improve.tsx`. The person can close the Next note with its cross and it stays closed (`serversNote` in `src/lib/ui-prefs.ts`). The PDF menu in `DownloadMenu.tsx` still says that the file way sends the CV to the server. |
| Consent to processing in the United States | The same notes, and the privacy page. The privacy page and the terms stay one click away in Settings after the Next note is closed. |
| Keep less | `src/lib/server/auth-hooks.ts` blanks the IP address, the browser string, the Google photo link and Google's tokens |
| Delete on a schedule | `src/lib/keep.ts` holds the windows. `src/lib/server/retention.ts` deletes, at most once an hour, after a sign-in or an AI rewrite. A quiet site clears its old rows at the next visit. |
| Delete when asked | Settings, Delete account |
| Browser protections | `next.config.ts` sets the security headers and a Content Security Policy |
| Count visits without a cookie or an IP address | `<Analytics />` in `src/app/layout.tsx`, drawn only on the production deploy. Web Analytics must be switched on for the Vercel project. The privacy page says so under "Visits and logs". |
| Sessions last 7 days | `session.expiresIn` in `src/lib/server/auth.ts`, from `KEEP.sessionDays` |

The privacy page prints the windows from `keep.ts`, so the page and the code cannot drift.
When you change how data is kept, change the page in the same commit, in all four languages
(`tests/i18n.test.ts` checks that the sections, links and numbers match the English).

## Record of processing

| Activity | Data | Goes to | Basis | Kept |
| --- | --- | --- | --- | --- |
| Download a PDF file | The whole CV, with the photo if it is on | Vercel, United States | The person picks it, or uses the main button on a phone or tablet | Not kept |
| AI rewrite | One block of text, its title, dates and language | Anthropic, United States | The person asks for it and agrees at sign-in | We keep nothing. Anthropic deletes it within 30 days. |
| Account | Name, email, Google account ID | Neon, United States | The person makes it and agrees to it | Until deleted, or 12 months with no rewrite |
| Session | A random token and an expiry date | Neon | Needed to stay signed in | 7 days after last use |
| Rewrite count | Time, tokens, success, whether it was used | Neon | Legitimate interest: limits and budget | 12 months |
| Hosting logs | IP address, request path | Vercel | Legitimate interest: delivery and the PDF limit | Vercel's schedule |
| Visit count | Time, page, referrer, country, region, city, device type, browser and system. No IP address, cookie or name. | Vercel Web Analytics, United States | Legitimate interest: knowing how many people use the editor | Vercel shows 12 months on the Pro plan. It may keep the counts longer. |

Save as PDF, the main button on a computer, is not a row here. The browser makes the file on the person's device, and nothing is sent.

## Processors and contracts

- **Vercel.** The DPA is at vercel.com/legal/dpa. Vercel is certified under the EU-US Data
  Privacy Framework and also uses standard contractual clauses. The site runs on the Pro plan.
  Web Analytics is one of its services. Vercel's page on it says the data is anonymous, uses no
  third-party cookies and drops the visitor hash after 24 hours.
- **Neon.** The DPA is built into its terms and also sits at neon.com/dpa. The database is
  in the US East region.
- **Anthropic.** The DPA, with standard contractual clauses, is part of its commercial
  terms. Its API keeps inputs and outputs for up to 30 days. It does not train on them.
- **Google and PayPal.** Each is its own controller for what it does: sign-in, and donations.

Argentina does not list the United States as a country with adequate protection. The AAIP
accepts two ways to send data there: the express consent of the person, or its model
contract clauses (Disposición 60-E/2016 and Resolución 198/2023). A contract that differs
from the models has to be filed with the AAIP within 30 days of signing.

This site relies on consent. The sign-in notes, the note beside the PDF button and the privacy
page all say the data is processed in the United States, and the person goes ahead. So
nothing needs filing. If you ever rely on the providers' own contracts instead, file them.

## Requests from people

Check that the request comes from the email on the account before you answer.

- **Access.** Free once every six months. Answer within 10 days. The account holds a name,
  an email, a Google ID, a creation date and the rewrite rows. It never holds CV text.
  Read it in Neon's SQL editor:

  ```sql
  select u.name, u.email, u."createdAt",
         (select count(*) from ai_log l where l.user_id = u.id) as rewrites
    from "user" u
   where u.email = 'person@example.com';
  ```

- **Correction or deletion.** Act within 5 working days. The person can do it alone: Settings,
  Delete account. That needs a sign-in from the last day. If they cannot sign in, delete their
  one row in `"user"` by id after you have checked who asked. The sessions, the account and
  the rewrite rows go with it.

## If something goes wrong

1. Contain it. Set `AI_PAUSED=1`. Rotate `BETTER_AUTH_SECRET`, the Google client secret, the
   Anthropic key and the database password.
2. Find out what was exposed. The database holds no CVs, no passwords and no Google tokens.
   At most it holds names, emails, Google IDs and rewrite counts.
3. Tell the people affected, by email, and tell the AAIP. The current law sets no deadline.
   If people in the EU or UK are affected, follow the GDPR clock of 72 hours to be safe.
4. Write down what happened and what you changed.

## Before you run a copy

These duties belong to the operator, because the code cannot do them.

- [ ] Set `OPERATOR_ADDRESS` in your host's settings for all environments, then deploy. Article 6
  of Ley 25.326 asks the notice to give the address of the person responsible. Until you do,
  the privacy page says to write to the email for it.
- [ ] Register with the AAIP: first the person responsible, then the database. It is free and
  online (Trámites a Distancia, Clave Fiscal level 2 or higher). It no longer needs an annual
  renewal, but you must update it when the database changes. The sheet below has the answers.
  If you run a copy outside Argentina, check what your own data authority asks.
- [ ] In Google Auth Platform, open Branding and add the links to `/privacy` and `/terms`, a
  support email and the home page address.
- [ ] Save a copy of the Vercel, Neon and Anthropic DPAs.
- [ ] If you take donations, check that your PayPal account type allows them for a website, and
  ask a local accountant how to declare the income.
- [ ] After the first deploy, sign in once on the live site. Check the two cookies, and check
  that your session row has an empty IP address and browser string.
- [ ] The privacy page says visits are counted with Vercel Web Analytics. Turn it on for your
  Vercel project, on its Analytics tab or with `vercel project web-analytics enable`. Off Vercel
  nothing counts visits, so take that text out of the four files in `src/lib/i18n/legal/`.

## AAIP registration sheet

Check each answer against the form, because its fields may change. The first row names the
person who runs the original site, so use your own details there.

| Field | Answer |
| --- | --- |
| Responsable | Santiago Paz, persona humana |
| Nombre de la base | Usuarios del CV Editor |
| Finalidad | Gestión de cuentas de usuarios y control de los límites de uso de la reescritura con IA |
| Datos tratados | Nombre, correo electrónico, identificador de cuenta de Google, fecha y resultado de cada reescritura |
| Datos sensibles | Ninguno |
| Origen de los datos | El propio titular, al iniciar sesión con Google |
| Cesión a terceros | Ninguna |
| Transferencia internacional | Estados Unidos: Vercel (alojamiento), Neon (base de datos) y Anthropic (IA), como prestadores de servicios. Base: consentimiento expreso. |
| Medidas de seguridad | Conexión cifrada, acceso con credenciales, claves guardadas como variables sensibles, borrado programado |
| Plazo de conservación | Sesiones: 7 días. Reescrituras: 12 meses. Cuentas: hasta que el titular las borre, o 12 meses sin uso. |

## Sources

- AAIP: [obligations of those who hold databases](https://www.argentina.gob.ar/node/53779),
  [procedures](https://www.argentina.gob.ar/aaip/datospersonales/tramites) and
  [international transfers](https://www.argentina.gob.ar/transferencias-internacionales)
- [Anthropic API data retention](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)
- [Vercel security and compliance](https://vercel.com/docs/security/compliance)
- Vercel Web Analytics: [privacy](https://vercel.com/docs/analytics/privacy-policy) and
  [pricing](https://vercel.com/docs/analytics/limits-and-pricing)
- [Neon and GDPR](https://neon.com/blog/gdpr-compliance-and-neon)
