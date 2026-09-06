/** Browser requests must originate from the served host or the explicitly configured site origin. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    return (
      parsed.origin === new URL(request.url).origin ||
      parsed.host === request.headers.get("host") ||
      (Boolean(configured) && parsed.origin === new URL(configured!).origin)
    );
  } catch {
    return false;
  }
}
