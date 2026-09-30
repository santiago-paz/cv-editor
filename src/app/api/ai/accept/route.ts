import { auth } from "@/lib/server/auth";
import { foreign } from "@/lib/server/origin";
import { accept } from "@/lib/server/usage";

/* POST { id } when a suggestion goes into the CV, so the test can count
   how often a rewrite is worth using. */

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (foreign(request)) return new Response(null, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response(null, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" && /^\d{1,18}$/.test(body.id) ? body.id : null;
  if (!id) return new Response(null, { status: 400 });
  try {
    await accept(session.user.id, id);
  } catch (error) {
    console.error("AI accept failed:", error instanceof Error ? error.message : error);
  }
  return new Response(null, { status: 204 });
}
