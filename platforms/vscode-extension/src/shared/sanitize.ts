/**
 * Sanitize error messages for user display.
 * Strips file system paths that could leak internal directory structure.
 */
export function sanitizeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return raw
    .replace(/[A-Z]:\\[\w\\.\-\s]+/gi, "[path]")
    .replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g, "[path]");
}

/**
 * Escape HTML special characters for safe webview rendering.
 * Covers the 5 critical characters: & < > " '
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
