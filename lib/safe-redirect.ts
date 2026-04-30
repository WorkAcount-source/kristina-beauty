/**
 * Returns a safe, same-origin redirect path or the provided fallback.
 *
 * Mitigates open-redirect (CWE-601) by rejecting:
 *   - absolute URLs (`https://evil.com`, `//evil.com`)
 *   - protocol-relative URLs (`\\\\evil.com`, `/\\evil.com`)
 *   - non-string / empty inputs
 *
 * Only paths beginning with a single `/` followed by a non-slash, non-backslash
 * character are accepted. The result is always a relative path.
 */
export function safeRedirect(input: unknown, fallback: string = "/"): string {
  if (typeof input !== "string" || input.length === 0) return fallback;
  // Disallow absolute, protocol-relative or backslash-prefixed paths
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//") || input.startsWith("/\\")) return fallback;
  // Disallow control characters
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(input)) return fallback;
  return input;
}
