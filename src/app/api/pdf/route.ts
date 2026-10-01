import { isPhotoUri, readCv } from "@/lib/cv/schema";
import { refusal, type PdfCode } from "@/lib/errors";
import { ChromeMissing } from "@/lib/server/chrome";
import { foreign } from "@/lib/server/origin";
import { makePdf } from "@/lib/server/pdf";

/* POST { cv, photo } -> application/pdf.

   The CV comes from the browser's localStorage and goes back as a file. The
   server keeps nothing: no copy of the CV, no copy of the PDF, no log of
   either. */

export const runtime = "nodejs";
export const maxDuration = 60;

/** A CV with a photo is about 150 KB. This leaves room and no more. */
const MAX_BODY = 2_500_000;

function fail(status: number, code: PdfCode, error: string): Response {
  return Response.json(refusal(code, error), { status, headers: { "Cache-Control": "no-store" } });
}

/** attachment; filename="Alex_Moreno_CV.pdf", with a UTF-8 copy for names
    outside ASCII. */
function disposition(name: string): string {
  const ascii = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function POST(request: Request): Promise<Response> {
  if (foreign(request)) return fail(403, "foreign", "This server only prints CVs for its own editor.");
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) {
    return fail(413, "tooLarge", "That CV is too large to print. Try a smaller photo.");
  }

  let payload: { cv?: unknown; photo?: unknown };
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return fail(413, "tooLarge", "That CV is too large to print. Try a smaller photo.");
    payload = JSON.parse(text);
  } catch {
    return fail(400, "badJson", "The request was not valid JSON.");
  }

  const cv = readCv(payload?.cv);
  if (!cv) return fail(400, "noCv", "The request holds no CV.");
  if (payload.photo != null && !isPhotoUri(payload.photo)) {
    return fail(400, "badPhoto", "The photo must be a JPEG, PNG or WebP image under 1 MB.");
  }

  try {
    const pdf = await makePdf(cv, (payload.photo as string | null | undefined) ?? null);
    return new Response(Buffer.from(pdf.bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition(pdf.name),
        "Cache-Control": "no-store",
        "X-Pages": String(pdf.pages),
      },
    });
  } catch (error) {
    if (error instanceof ChromeMissing) return fail(503, "noChrome", error.message);
    console.error("PDF failed:", error instanceof Error ? error.message : error);
    return fail(500, "failed", "The PDF could not be made. Try again, or print the preview instead.");
  }
}
