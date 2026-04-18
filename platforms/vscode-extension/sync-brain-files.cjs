/**
 * Sync heir/.github/ brain files into brain-files/ for VSIX packaging.
 * Run via: npm run prepackage
 *
 * Source: heir/.github/ (two levels up from this extension)
 * Destination: brain-files/ (inside this extension directory)
 *
 * Excludes session-specific, personal data, and generated files.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "..", "..", ".github");
const DEST = path.resolve(__dirname, "brain-files");

/** Directories to skip entirely */
const EXCLUDE_DIRS = new Set([
  "episodic",
  "node_modules",
  ".git",
]);

/** Individual files to skip (relative to .github/) */
const EXCLUDE_FILES = new Set([
  "config/session-metrics.json",
  "config/session-tool-log.json",
  "config/assignment-log.json",
  "config/correlation-vector.json",
  "config/MASTER-ALEX-PROTECTED.json",
]);

function copyDir(src, dest, relBase) {
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const rel = path.join(relBase, entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      count += copyDir(srcPath, destPath, rel);
    } else {
      if (EXCLUDE_FILES.has(rel)) continue;
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

// Verify source exists
if (!fs.existsSync(SRC)) {
  console.error(`ERROR: Brain source not found at ${SRC}`);
  console.error("Run heir-sync first to populate heir/.github/");
  process.exit(1);
}

// Clean destination
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true });
}

const copied = copyDir(SRC, DEST, "");
console.log(`brain-files/ synced: ${copied} files`);

// Copy heir root metadata into extension directory for VSIX
const HEIR_ROOT = path.resolve(__dirname, "..", "..");

const heirChangelog = path.join(HEIR_ROOT, "CHANGELOG.md");
if (fs.existsSync(heirChangelog)) {
  fs.copyFileSync(heirChangelog, path.join(__dirname, "CHANGELOG.md"));
  console.log("CHANGELOG.md copied from heir root");
}

const heirLicense = path.join(HEIR_ROOT, "LICENSE.md");
if (fs.existsSync(heirLicense)) {
  fs.copyFileSync(heirLicense, path.join(__dirname, "LICENSE.md"));
  console.log("LICENSE.md copied from heir root");
}
