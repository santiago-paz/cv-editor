# Plan: accounts, cloud save and AI rewrite

Draft, 30 September 2026. The decisions below were made the same day.

## Decided

- AI needs an account from day one. Signed-out people still see the "Improve" button, and it asks them to sign in.
- Sign-in uses an email link or Google. There are no passwords.
- The AI runs on Claude Haiku 4.5, if it passes the 20-bullet check, with a budget of $20 a month.
- The test runs for 8 weeks from the day Phase 1 ships.
- No company. The cheapest, simplest option wins at every step. If the site ever charges, Paddle is the seller and you sell as an individual.
- A Donate link to PayPal ships now, before accounts, to see if people use it. It goes to paypal.me/santiagopaz1992, and `NEXT_PUBLIC_DONATE_URL` can replace it.
- The made-up sample CV stays. A "Made by Santiago Paz" line at the foot of the CV list gives the credit instead.
- A switch lets a person forget their CVs when they close the tab.

## In short

- The editor stays free and needs no sign-up. CVs stay in the browser's localStorage, as they do now.
- A free account adds two things: saving chosen CVs to our server, and an "Improve" button that rewrites a description with AI.
- Accounts and AI cost nothing during the 8-week test, with hard limits. A paid plan comes later, and only if the numbers ask for it.
- The AI runs on a paid model with a $20 monthly cap, not on a free tier. Some free tiers use what you send them to improve their models, and that would break the privacy promise.
- The PDF download stays free in every tier.
- Build order: measuring and a rate limit, then accounts with the AI button, then cloud save, then maybe payments.

## Three things the plan rests on

### 1. Keep localStorage, not sessionStorage

The first idea was session storage. The editor uses localStorage today (`src/lib/storage.ts`), and it should stay that way. The browser empties sessionStorage when the tab closes, so anyone who closes the tab would lose their CV. localStorage keeps it on the device until the person deletes it or clears the browser's data. Neither one sends the CV to our server, so the promise holds either way.

sessionStorage only helps on a shared computer, so it's an opt-in switch: "Forget my CVs when I close this tab."

### 2. Make the promise match the code

Our server prints the PDF. The browser sends it the whole CV, photo included, at `POST /api/pdf`. The server keeps nothing: no copy of the CV or the PDF, and no log of either (`src/app/api/pdf/route.ts`).

So "your CV never leaves your device" would be false, but "we never store your CV unless you ask us to" is true. The site copy should say the true thing. For example:

- "No sign-up. Your CVs stay in this browser."
- "We print your PDF on our server and keep no copy."
- "Want your CVs on every device? Make a free account and pick which ones to save."

The browser's own print dialog already takes over when the server fails (`printCv` in `src/lib/download.ts`), and it sends nothing anywhere. It could also sit in a menu for people who want that route every time.

### 3. A free AI tier would break the promise

Some free AI tiers keep the right to learn from what you send. Google's terms for the free Gemini API quota say Google uses what you send to improve its products, and that human reviewers may read it. Users in the EEA, the UK and Switzerland get the paid-tier rules even on the free quota, but the rest of the world doesn't. A CV holds names, employers and dates. Sending it to a model that may learn from it goes against the reason people would pick this editor.

A small paid model costs very little at this scale: about $3 per 1,000 rewrites on Claude Haiku 4.5 (see "Which model" below). So the AI is free for the user, paid by us, and capped each month. Before picking any provider, check two things in its paid terms: that it doesn't train on your data, and how long it keeps it. Anthropic's commercial terms, for example, say it "may not train models on Customer Content from Services".

## What each tier gets

| | No account | Free account (test period) | Paid (later, if at all) |
| --- | --- | --- | --- |
| Write, edit and copy CVs | Yes, no limit | Yes | Yes |
| Where each CV lives | This browser | The person's choice, per CV: this browser or the account | Same |
| PDF download | Yes, free, no watermark | Yes | Yes |
| Backup file | Yes | Yes | Yes |
| AI rewrite | The button asks you to sign in | Yes, with a monthly limit | Higher limit |

Two rules hold in every tier:

1. The PDF stays free, with no watermark. Many CV builders let people write for free and then ask for money at the download step. A free PDF sets this editor apart.
2. Nobody sees a sign-up prompt until they click something that needs an account. There are no pop-ups and no nagging.

## Why people would pick this editor

"No sign-up" is a good hook, but it's easy to copy. It holds up better next to two things the editor already does well. First, the preview is the PDF: both come from one renderer with the same fonts, and `tests/pagination.test.ts` checks the page breaks against Chrome's. Second, the PDF is free. So the pitch is: no sign-up, a free PDF, and what you see is what prints.

## Build order

Accounts come first, because the AI limit and cloud save both need to know who the user is. The AI button comes before cloud save. It's the smaller job (one route and one button), and it's probably the stronger reason to sign up. Cloud save needs sync, conflict handling and a way to move local CVs in.

The times below are rough guesses for one developer.

### Phase 0: get ready to measure (1 to 2 days)

- Add a rate limit to `/api/pdf`. The README already asks for one, because each request opens a Chrome page. Vercel's firewall gives the Hobby plan one rate-limit rule per project. Point it at `/api/pdf` now and widen it to `/api/ai/` in Phase 1.
- Set up the Postgres database now (Neon, from the Vercel Marketplace), since Phase 1 needs it anyway.
- Turn on Vercel Web Analytics for page views. It uses no third-party cookies and tells visitors apart by a hash of the request, which it drops after 24 hours. On the Hobby plan it counts page views but not custom events.
- Count everything else on the server, where the requests already arrive: PDFs made, sign-ups, AI rewrites asked for and accepted, CVs moved to an account. A table of daily counters is enough. It stores counts, never CV text or user ids.
- Say on the privacy page that the site counts page views and these events.

### Phase 1: accounts and the AI button (about a week)

- Sign-in by email link or Google, with no passwords.
- `POST /api/ai/rewrite`, plus an "Improve" button on each job, project, list and text section, and on the summary.
- The limits under "Limits for the test".
- A privacy page and terms of use.

The 8-week test starts when this phase ships.

### Phase 2: save CVs to an account (1 to 2 weeks)

- A choice on each CV: "This browser" or "My account".
- Sync with a version check, a prompt for conflicts, and a way to move local CVs in.
- Deleting an account removes everything at once.

### Phase 3: charge, if the numbers say so

Build nothing here until a rule under "What to measure" says to. Then take the cheapest step that works, in this order.

1. A "support this project" button, through PayPal or Ko-fi. This one shipped early, on 30 September 2026, as a Donate link to PayPal. Donors get nothing extra, so it stays a donation, not a sale. The money lands in PayPal and no company is needed. Vercel doesn't count donations as commercial use, so the site stays on the free Hobby plan. Donations may still count as income where you live.
2. A paid plan through Paddle, only if people clearly want more AI than the free limit gives. Paddle is the seller of record, so it handles the sales tax and VAT on every sale. No company is needed: individuals and sole traders skip Paddle's business check. It costs 5% plus 50 cents per sale, with no monthly fee. Paddle pays once a month, by bank wire or Payoneer, once the balance passes $100. It doesn't pay out to PayPal.

Taking payments means moving to Vercel Pro, at $20 a month. So a paid plan has to bring in more than about $40 a month to cover Pro and the AI budget. At $5 a month per user, Paddle keeps 75 cents, so that takes about 10 paying users.

The other routes cost more or don't work:

- Stripe pays out to a bank account, not to PayPal. It also doesn't open accounts in every country. Argentina and Uruguay, for example, aren't on its list.
- A US company through Stripe Atlas costs $500 to set up, then $100 a year for the registered agent and $400 a year in Delaware tax. A foreign-owned US LLC must also file IRS Form 5472 every year, even with no income, and a missed form costs $25,000. That's far too much for a side project.
- PayPal alone as the checkout makes you the seller, so the sales tax and VAT rules of every buyer's country fall on you.

Two more notes:

- People need a CV in bursts: they look for work for a few months, then stop. A monthly plan loses them when the search ends, so offer a one-time pass (three months, say) next to it.
- Ask an accountant where you live how to declare the income. That usually means registering as self-employed, not forming a company.

## How the AI rewrite works

### What the person sees

Each job, project, list and text section, and the summary, gets an "Improve" button. One click rewrites that block. The suggestion appears next to the original, bullet by bullet. The person can take all of it, take single bullets, or dismiss it. Nothing changes until they click, and Undo works as it does for any other edit.

### Why it needs an account

Letting signed-out people try it a few times, with IP limits, would cost little money, because the $20 cap stops the spend. The risks are elsewhere. Bots can use up the day's budget, so real users find the AI paused. IP limits are weak, because many people share one address (offices, universities, phone networks) and bots switch addresses cheaply. And the numbers get noisy, because bot clicks look like interest. An account is a much better limit than an IP. A rule under "What to measure" says when to look at this again.

### What gets sent

The block's text, the title above it and the CV's language. Never the name, contact details, photo or other sections.

### What the model is told

- Keep every fact. Add no number, tool, result or claim the person didn't write.
- Answer in the input's language. A Spanish CV stays in Spanish.
- Keep the number of bullets. Start each with a strong verb, cut filler, and keep each to one or two lines.
- Keep bold, italics and links where they were.
- When a number would make a bullet stronger, don't make one up. Return a short tip next to the suggestion instead, such as "Add how many users this served."

Ask for JSON with a fixed shape, so each bullet maps back to its place and the tips come apart from the text.

### The route

`src/app/api/ai/rewrite/route.ts` does this, in order:

1. Refuse requests from other sites, with the same Origin check `/api/pdf` uses.
2. Check the session, the person's limits and the IP's count for the day.
3. Cap the input size.
4. Call the model. Keep that call in one small module, such as `src/lib/server/ai.ts`, so a change of model or provider touches one file.
5. Clean the reply with `sanitizeServer`. The browser cleans it again when the person accepts it, so AI text is cleaned twice, like all rich text (see CLAUDE.md). Add tests that feed in hostile model output, such as a `<script>` tag or a `javascript:` link.
6. Record usage and token counts. Log no text.

### Limits for the test

The budget is $20 a month, and these limits keep it there. The numbers are starting guesses:

- Per account: 10 rewrites a day and 30 a month.
- Per IP: the one firewall rule stops bursts on `/api/pdf` and `/api/ai/`, for example 20 requests a minute. The app also counts rewrites per IP per day, up to 40 across all accounts, so one person can't farm accounts from one address. It stores a salted hash of the IP, not the IP, and drops the counts after a day.
- For the whole site: $20 a month is about 65 cents a day, or about 200 rewrites. When the site reaches the day's cap, the button says AI is paused until tomorrow.
- Per call: cap the input at about 3,000 characters and the output at 800 tokens. Then one rewrite costs at most about half a cent, so even the worst case gets about 3,500 rewrites out of $20.
- A $20 monthly spend limit in Anthropic's console, as a backstop.

### Which model

The choice is Claude Haiku 4.5. One rewrite reads about 1,000 tokens (the rules plus the text) and writes about 400. At Anthropic's list prices:

| Model | Per million tokens, in / out | One rewrite | 1,000 rewrites |
| --- | --- | --- | --- |
| Claude Haiku 4.5 | $1 / $5 | $0.003 | $3 |
| Claude Sonnet 5.5 | $2 / $10 | $0.006 | $6 |
| Claude Opus 5.5 | $4 / $20 | $0.012 and up | $12 and up |

Opus 5.5 always thinks before it answers, and thinking is billed as output, so its real cost is higher than the table shows. At 30 rewrites a month, the heaviest user costs about 9 cents a month on Haiku 4.5.

Before launch, run the same 20 real bullets, half of them in Spanish, through Haiku 4.5. If you wouldn't put its output on your own CV, try Sonnet 5.5. It costs twice as much, so the same $20 buys half as many rewrites.

## How accounts and cloud save work

### Sign-in

Email link or Google, with no passwords, so there are no password hashes to leak and no reset flow to build. Use Better Auth: it's on the list in the Next.js auth guide, it runs inside the app, and it keeps users in our own database. Email links need a sending service, such as Resend or Postmark.

### Database

Postgres on Neon. Photos will be the largest thing in it. If they grow, move them to blob storage.

| Table | What it holds |
| --- | --- |
| Better Auth's tables | Users, sessions, sign-in methods |
| `cvs` | User id, CV id, the CV as JSON, a version number, created and updated times |
| `photos` | User id and the photo, only when the person saves it |
| `ai_usage` | User id, day, rewrites, tokens in and out |
| `ip_usage` | Salted IP hash, day, rewrites. Dropped after a day |
| `daily_counts` | Day, event name, count. No user id |

CV ids today only need to be unique inside one browser (`uid()` in `src/lib/cv/defaults.ts`). Key the `cvs` rows by user and CV id, and give a CV a new id if an upload collides.

### Where each CV lives

The CV list marks account CVs. Each CV's menu offers "Save to my account" or "Keep in this browser only", and the second one deletes the server copy after a confirm. On a first sign-in, the person sees their local CVs with checkboxes: "Which of these should we save to your account?" Nothing is checked by default. New CVs go where the person put the last one.

### Sync

- For account CVs, the server copy wins. The browser keeps a copy too, so the editor opens fast and works offline.
- A save goes up a second or two after the last edit, with the version the browser last saw. The server then bumps the version.
- If the server has a newer version, the save stops and the editor asks: "This CV changed on another device. Keep this one, load the other, or keep both?" Restore already picks the newer `updatedAt` (in `Editor.tsx`). This adds a question for when both copies changed.
- Offline, the list says "Not saved to your account yet" and retries.
- A local copy is never dropped until the server confirms the save.

### The photo

One photo serves every CV today. Save it to the account only when the person says yes to a separate question, because a face is more personal than a job list.

### Signing out and deleting

Signing out removes account CVs from that browser and leaves the local ones. Deleting the account removes the CVs, the photo, the usage rows and the user right away, with no grace period. The Back up button keeps working for every CV, so people can always take their data with them.

### Security

- Check the session next to the data, in a data access layer with a `verifySession()` function. The Next.js auth guide in `node_modules/next/dist/docs/` shows the pattern. In Next.js 16, `middleware.ts` is now `proxy.ts`, and it's for quick redirects, not for guarding data.
- Every query filters by the user id from the session, never by one sent in the request.
- Each saved CV goes through `readCv` and `sanitizeServer` before it's stored, with a size cap.
- Every route that changes data uses the Origin check from `/api/pdf`.
- Writes get a rate limit.

## Privacy checklist

- A privacy page in plain words. It says what stays in the browser, what reaches the server and when, and who handles it: Vercel for hosting, Neon for the database, the email service and the AI provider. For each, it says how long the data stays. It also says the site keeps a salted hash of each IP for one day, for the rate limits.
- Terms of use before accounts go live.
- A delete-account button that works at once.
- No CV text in logs, analytics or error reports. If you add an error tracker, turn off its capture of request bodies.
- The privacy law that applies depends on where you live and where your users are. If either is in the EU, the GDPR applies. Get a short legal review before taking payments.

## What to measure, and what each number decides

Each week:

1. Visitors (from Vercel Web Analytics) and PDFs made.
2. Clicks on "Improve" while signed out, and how many of those people then make an account.
3. AI suggestions accepted, in whole or in part, against those dismissed.
4. Accounts that save at least one CV to the account.
5. Account holders who come back in a later week.
6. AI cost per active account.
7. Donations, from PayPal.

Write the rules down before launch, so the numbers make the call. Starting guesses:

- If under 5% of signed-out "Improve" clicks turn into accounts, look again at a few tries without an account: 3 per IP a day, from a separate $3 slice of the budget, behind a bot check such as Cloudflare Turnstile.
- If under half of AI suggestions get accepted, fix the prompt before anything else.
- If more than 1 in 5 AI users hit the monthly limit, add the donation button, then consider the Paddle plan.
- If donations cover the AI budget, skip the paid plan.
- If few accounts save a CV to the account, cloud save isn't what people would pay for. Charge for AI, and keep cloud save free.

## Risks

- Bots could make accounts to use the free AI. The limits per account and per IP, the site-wide daily cap and the console's spend limit keep the cost at $20 a month at most. If it happens, add Cloudflare Turnstile to sign-up.
- The promise could wear down. Once accounts exist, there's pressure to push signed-out people toward them. The two rules above hold: a free PDF, and no sign-up prompt until someone clicks an account feature.
- A sync bug could lose work. Test the conflict cases before launch, keep the local copy until the server confirms, and keep Back up.
- The AI could invent facts, and a made-up number on a CV can cost someone a job. The prompt forbids it, the side-by-side view shows every change, and nothing lands without a click.
- PDF costs grow with traffic. Each PDF opens a Chrome page, and a cold start took 3.6 seconds on the live site. Watch function time in Vercel as traffic grows.

## Later, maybe

Encrypt account CVs in the browser with a key only the person holds. Then we couldn't read even a stored CV, which fits the promise best. But a lost key means lost CVs, and the PDF and AI steps still need the plain text for a moment. It's not for the test.

## Still open

- The price, if Phase 3 ever happens.

## Sources

- [Gemini API terms](https://ai.google.dev/gemini-api/terms), the section on unpaid services (last modified 2026-04-28)
- [Anthropic commercial terms](https://www.anthropic.com/legal/commercial-terms), section B
- [Claude prices](https://platform.claude.com/docs/en/about-claude/pricing)
- [Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines): Hobby is for non-commercial use, and donations don't count as commercial
- [Vercel Pro plan](https://vercel.com/docs/plans/pro-plan)
- [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting): limits per plan
- [Vercel Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing) and [privacy](https://vercel.com/docs/analytics/privacy-policy)
- [Paddle pricing](https://www.paddle.com/pricing), [seller countries](https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle), [payouts](https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid) and [business verification](https://www.paddle.com/help/start/account-verification/what-is-business-verification)
- [Stripe supported countries](https://stripe.com/global), [Stripe payouts](https://docs.stripe.com/payouts) and [Stripe Atlas](https://stripe.com/atlas)
- [IRS instructions for Form 5472](https://www.irs.gov/instructions/i5472) and [Delaware LLC annual tax](https://corp.delaware.gov/alt-entitytaxinstructions/)
- Next.js 16 docs in this repo: `node_modules/next/dist/docs/01-app/02-guides/authentication.md` and `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md`
