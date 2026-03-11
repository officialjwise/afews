/**
 * Encode/decode UUIDs to/from short, opaque, URL-safe strings.
 *
 * A UUID is 16 bytes → base64url produces a 22-character slug.
 * Example: "7fd10223-6d9c-453c-a15f-ab939b628729" → "f9ECI22cRTyhX6uTtigpKQ"
 *
 * This keeps UUIDs out of browser URLs, history, and bookmarks while
 * remaining fully reversible (no server lookup needed).
 */

/** UUID string → 22-char base64url slug */
export function encodeId(uuid: string): string {
  const hex = uuid.replace(/-/g, "");
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/** 22-char base64url slug → UUID string */
export function decodeId(slug: string): string {
  const b64 = slug.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob(padded);
  const hex = Array.from(raw, (c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
