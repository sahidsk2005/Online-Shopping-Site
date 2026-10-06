/**
 * Shared helpers for product images and user-entered links.
 */

/** Supabase Storage bucket that holds uploaded product photos. */
export const IMAGE_BUCKET = "product-images";

/** Inline SVG used whenever a product has no image (or the link is broken).
 *  It is embedded in the page, so it can never fail to load. */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450">',
      '<rect width="400" height="450" fill="#141518"/>',
      '<g fill="none" stroke="#3a3b41" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">',
      '<rect x="118" y="148" width="164" height="140" rx="16"/>',
      '<circle cx="168" cy="196" r="15"/>',
      '<path d="M128 278l52-54 40 40 30-28 32 32"/>',
      "</g>",
      '<text x="200" y="342" fill="#4b4c53" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle">No image</text>',
      "</svg>"
    ].join("")
  );

const DIRECT_IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i;
const HAS_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

/** Google Drive share links: /file/d/<id>/view, ?id=<id>, open?id=<id> … */
function googleDriveId(value: string) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/i,
    /drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([^&#]+)/i,
    /drive\.google\.com\/thumbnail\?(?:[^#]*&)?id=([^&#]+)/i,
    /lh3\.googleusercontent\.com\/d\/([^/?#]+)/i
  ];
  for (const re of patterns) {
    const match = value.match(re);
    if (match) return match[1];
  }
  return null;
}

/**
 * Turns the links people usually paste (Google Drive "share" links, Dropbox
 * preview links, URLs without https://) into something an <img> can load.
 */
export function normalizeImageUrl(raw: string): string {
  let value = (raw || "").trim();
  if (!value) return "";
  if (value.startsWith("data:")) return value;
  if (!HAS_SCHEME_RE.test(value) && !value.startsWith("//")) value = `https://${value}`;
  if (value.startsWith("//")) value = `https:${value}`;

  const driveId = googleDriveId(value);
  // Drive "uc?export=view" links are blocked for many accounts; the thumbnail
  // endpoint serves the picture itself as long as the file is shared publicly.
  if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;

  if (/dropbox\.com/i.test(value)) {
    return value.replace(/([?&])dl=0/i, "$1raw=1").replace(/([?&])dl=[^&]*/i, "$1raw=1");
  }
  return value;
}

/** True when the value looks like a file path on the phone/computer (not a public link). */
export function looksLikeLocalFilePath(raw: string): boolean {
  const value = (raw || "").trim();
  return /^[a-z]:[\\/]/i.test(value) || value.startsWith("file://") || value.startsWith("/Users/") || /^\\\\/.test(value);
}

/** Best-effort check for "this is probably a direct image link". */
export function looksLikeDirectImageLink(raw: string): boolean {
  const value = (raw || "").trim();
  if (!value) return false;
  if (value.startsWith("data:")) return true;
  return DIRECT_IMAGE_RE.test(value) || /googleusercontent\.com|supabase\.co\/storage|cloudinary\.com|images\.unsplash\.com|imgur\.com/i.test(value);
}

/**
 * Normalizes a link the shop owner typed for "Buy now".
 * Keeps special schemes intact (upi:, whatsapp:, mailto:, tel:) and adds
 * https:// to plain domains such as "amazon.in/dp/xyz".
 */
export function externalUrl(raw: string): string {
  const value = (raw || "").trim();
  if (!value) return "";
  if (value.startsWith("//")) return `https:${value}`;
  return HAS_SCHEME_RE.test(value) ? value : `https://${value}`;
}

/** Makes an error message from Supabase easier to act on. */
export function friendlyDbError(message: string): string {
  if (/bucket not found/i.test(message))
    return 'Storage bucket "product-images" does not exist yet. In Supabase open SQL Editor and run the updated supabase/schema.sql — it creates the bucket and its permissions.';
  if (/column .* does not exist/i.test(message))
    return `${message} — your Supabase table is missing a column. Run the updated supabase/schema.sql in Supabase → SQL Editor, then reload this page.`;
  if (/row-level security|permission denied|violates row-level security/i.test(message))
    return `${message} — saving is blocked. Sign in with your admin account and make sure the policies from supabase/schema.sql exist.`;
  if (/failed to fetch|networkerror|load failed/i.test(message))
    return `${message} — the browser could not reach Supabase. Check your internet connection and NEXT_PUBLIC_SUPABASE_URL.`;
  return message;
}
