import { LIMITS, rewriteRequest, type RewriteReply } from "@/lib/ai";
import { auth } from "@/lib/server/auth";
import { foreign } from "@/lib/server/origin";
import { rewrite } from "@/lib/server/rewrite";
import { DAILY_BUDGET, record, spentToday, used } from "@/lib/server/usage";

/* POST one block of a CV -> the model's rewrite of it.

   Signed-in accounts only, within their limits and the site's daily budget.
   The text goes to the model and back. Nothing of it is stored or logged. */

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY = 20_000;

function fail(status: number, error: string): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  if (foreign(request)) return fail(403, "This server only rewrites text for its own editor.");
  if (process.env.AI_PAUSED === "1") return fail(503, "AI rewrites are paused for now. Try again later.");

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return fail(401, "Sign in to use AI rewrites.");

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return fail(413, "That block is too long to rewrite. Try a shorter one.");
    body = JSON.parse(text);
  } catch {
    return fail(400, "The request was not valid JSON.");
  }
  const input = rewriteRequest.safeParse(body);
  if (!input.success) return fail(400, "That block is empty or too long to rewrite.");

  try {
    const count = await used(session.user.id);
    if (count.day >= LIMITS.day) return fail(429, `You've used today's ${LIMITS.day} rewrites. You get more tomorrow.`);
    if (count.month >= LIMITS.month) return fail(429, `You've used this month's ${LIMITS.month} rewrites.`);
    if ((await spentToday()) >= DAILY_BUDGET) {
      return fail(503, "AI rewrites are resting until tomorrow. The free test has a daily budget.");
    }

    const result = await rewrite(input.data);
    const id = await record(session.user.id, result.tokens, result.ok);
    if (!result.ok) return fail(result.status, result.error);

    const reply: RewriteReply = {
      id,
      items: result.items,
      tips: result.tips,
      left: { day: LIMITS.day - count.day - 1, month: LIMITS.month - count.month - 1 },
    };
    return Response.json(reply, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("AI rewrite failed:", error instanceof Error ? error.message : error);
    return fail(500, "The rewrite failed. Try again in a minute.");
  }
}
