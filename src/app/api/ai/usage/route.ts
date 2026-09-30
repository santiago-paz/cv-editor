import { LIMITS } from "@/lib/ai";
import { auth } from "@/lib/server/auth";
import { used } from "@/lib/server/usage";

/* GET -> how many rewrites the signed-in account has left. */

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Not signed in." }, { status: 401 });
  try {
    const count = await used(session.user.id);
    return Response.json(
      { left: { day: Math.max(0, LIMITS.day - count.day), month: Math.max(0, LIMITS.month - count.month) } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("AI usage failed:", error instanceof Error ? error.message : error);
    return Response.json({ error: "Could not read your usage." }, { status: 500 });
  }
}
