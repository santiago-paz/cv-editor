/* Another site's page could otherwise use a route through its visitors'
   browsers. A request without an Origin header is not from a browser page. */
export function foreign(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== (request.headers.get("x-forwarded-host") || request.headers.get("host"));
  } catch {
    return true;
  }
}
