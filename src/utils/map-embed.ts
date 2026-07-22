const GOOGLE_MAPS_EMBED_ORIGIN = "https://www.google.com/maps/embed";

/** Build the classic no-API-key embed URL for a Google Maps place id ("cid"). */
function embedForCid(cid: string): string {
  return `${GOOGLE_MAPS_EMBED_ORIGIN}?origin=mfe&pb=!1m3!3m2!1m1!4s${encodeURIComponent(cid)}`;
}

/** Build the classic no-API-key embed URL for a free-text search query. */
function embedForQuery(query: string): string {
  return `${GOOGLE_MAPS_EMBED_ORIGIN}?origin=mfe&pb=!1m2!2m1!1s${encodeURIComponent(query)}`;
}

/**
 * Convert a Google Maps link — or a plain address/area string — into a
 * safely embeddable iframe URL, else null.
 *
 * Admins paste whatever the Google Maps "Share" button gives them, which is
 * almost never the real `/maps/embed?pb=...` iframe URL. A bare share link
 * (`maps.google.com/?cid=...`) or a `/maps/place/...` link renders a normal
 * Maps webapp page that sends `X-Frame-Options: sameorigin`, silently
 * blanking the iframe instead of embedding. Confirmed by following the
 * redirect Google's own `output=embed` shim resolves to: it always lands on
 * `/maps/embed?...&pb=!1m3!3m2!1m1!4s<cid>` (for a place id) or
 * `/maps/embed?...&pb=!1m2!2m1!1s<query>` (for a text query) — so we build
 * that URL ourselves instead of trusting whatever was pasted.
 *
 * Only a *.google.com host is ever trusted as a source of a real link; a
 * bare `endsWith("google.com")` would wrongly accept a lookalike host like
 * "evil-google.com", so the dot-prefixed suffix is required. Anything that
 * isn't a URL at all (a typed area/address) is treated as a search query —
 * Google Maps geocodes free text fine, and there's no injection risk since
 * it's always URL-encoded into a query param on a fixed google.com host.
 */
export function toMapEmbedUrl(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (!/^https?:\/\//i.test(raw)) {
    return embedForQuery(raw);
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    const isGoogleMap = host === "google.com" || host.endsWith(".google.com");
    if (!isGoogleMap) return null;

    if (url.pathname.includes("/embed")) return url.toString();

    const cid = url.searchParams.get("cid");
    if (cid) return embedForCid(cid);

    const q = url.searchParams.get("q");
    if (q) return embedForQuery(q);

    const place = url.pathname.match(/\/maps\/place\/([^/]+)/)?.[1];
    if (place) return embedForQuery(decodeURIComponent(place).replace(/\+/g, " "));

    return null;
  } catch {
    return null;
  }
}
