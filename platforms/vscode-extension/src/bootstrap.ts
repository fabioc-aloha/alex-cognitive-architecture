import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { writeLoopConfig } from "./sidebar/loopConfigGenerator.js";
import { resolveAIMemoryPath, setupAIMemory } from "./aiMemory.js";

/**
 * Brain subdirectories managed by Alex.
 * Only these are cleaned and replaced during install/upgrade.
 * Other .github/ content (workflows, CODEOWNERS, etc.) is never touched.
 */
const BRAIN_SUBDIRS = [
  "instructions",
  "skills",
  "prompts",
  "agents",
  "muscles",
  "config",
  "hooks",
];

const BRAIN_ROOT_FILES = [
  "copilot-instructions.md",
  "ABOUT.md",
  "NORTH-STAR.md",
  "EXTERNAL-API-REGISTRY.md",
  "brain-version.json",
];
const BRAIN_DIR = "brain-files";
const TARGET_DIR = ".github";
// Authoritative version stamp since v8.3. Legacy `.alex-brain-version` is
// no longer written and is removed on upgrade if encountered.
const BRAIN_VERSION_FILE = ".github/brain-version.json";
const LEGACY_VERSION_FILE = ".github/.alex-brain-version";
const MASTER_PROTECTED_FILE = ".github/config/MASTER-ALEX-PROTECTED.json";
const WORKSPACE_SETTINGS_FILE = ".vscode/settings.json";

/**
 * Compare two semver-ish strings. Returns -1 | 0 | 1, or null if unparseable.
 * Lightweight parser (no deps). Matches compareSemver in brain-upgrade-core.cjs.
 */
function compareSemver(a: string, b: string): number | null {
  const parse = (v: string): [number, number, number] | null => {
    const m = v.trim().match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    if (!m) return null;
    return [Number(m[1]), Number(m[2] || 0), Number(m[3] || 0)];
  };
  const pa = parse(a);
  const pb = parse(b);
  if (!pa || !pb) return null;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

/**
 * Check if the project's brain-version.json declares an upgrade lock.
 * Mirrors isUpgradeLocked in brain-upgrade-core.cjs.
 */
function isUpgradeLocked(workspaceRoot: string): boolean {
  try {
    const raw = fs.readFileSync(path.join(workspaceRoot, BRAIN_VERSION_FILE), "utf-8");
    const cfg = JSON.parse(raw) as Record<string, unknown>;
    if (!cfg || typeof cfg !== "object") return false;
    if (cfg.upgradeLock === true) return true;
    if (cfg.lockUpgrade === true) return true;
    if (cfg.locked === true) return true;
    const lock = cfg.lock as { upgrades?: unknown } | undefined;
    if (lock && lock.upgrades === true) return true;
    return false;
  } catch {
    return false;
  }
}

function getBundledVersion(context: vscode.ExtensionContext): string {
  return context.extension.packageJSON.version as string;
}

function getInstalledVersion(workspaceRoot: string): string | undefined {
  // Primary: brain-version.json `version` field.
  try {
    const cfgRaw = fs.readFileSync(
      path.join(workspaceRoot, BRAIN_VERSION_FILE),
      "utf-8",
    );
    const cfg = JSON.parse(cfgRaw) as { version?: string };
    if (cfg && typeof cfg.version === "string" && cfg.version.length > 0) {
      return cfg.version.trim();
    }
  } catch {
    // fall through to legacy
  }
  // Legacy fallback: `.alex-brain-version` plain file.
  try {
    return fs.readFileSync(
      path.join(workspaceRoot, LEGACY_VERSION_FILE),
      "utf-8",
    ).trim();
  } catch {
    return undefined;
  }
}

/**
 * Recursively copy a directory, overwriting existing files.
 * Validates that resolved paths stay within the destination root.
 */
function copyDirSync(src: string, dest: string, destRoot?: string): void {
  const root = destRoot ?? dest;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.resolve(dest, entry.name);
    if (!destPath.startsWith(root + path.sep) && destPath !== root) {
      throw new Error(`Path traversal blocked: ${entry.name}`);
    }
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, root);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Check if the current workspace is protected from brain mutations.
 * Sources (any one triggers protection):
 *   - MASTER-ALEX-PROTECTED.json marker file (master kill switch)
 *   - alex.workspace.protectedMode = true in .vscode/settings.json
 *   - brain-version.json upgradeLock = true (heir opt-out)
 */
function isProtectedWorkspace(workspaceRoot: string): boolean {
  if (fs.existsSync(path.join(workspaceRoot, MASTER_PROTECTED_FILE))) return true;
  if (isUpgradeLocked(workspaceRoot)) return true;

  const settingsPath = path.join(workspaceRoot, WORKSPACE_SETTINGS_FILE);
  if (!fs.existsSync(settingsPath)) return false;
  try {
    const raw = fs.readFileSync(settingsPath, "utf-8");
    return /"alex\.workspace\.protectedMode"\s*:\s*true/i.test(raw);
  } catch {
    return false;
  }
}

/**
 * Deploy brain files from the VSIX bundle to the workspace.
 * Replaces managed subdirectories atomically; preserves non-brain
 * content in .github/ (workflows, CODEOWNERS, issue templates, etc.).
 *
 * @param context Extension context (for extensionUri)
 * @param force   Skip version check and always overwrite
 * @returns true if files were deployed
 */
export async function bootstrapBrainFiles(
  context: vscode.ExtensionContext,
  force = false,
): Promise<boolean> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
    return false;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  if (isProtectedWorkspace(workspaceRoot)) {
    vscode.window.showWarningMessage(
      "Alex: Protected mode — brain updates blocked in this workspace.",
    );
    return false;
  }

  const bundledVersion = getBundledVersion(context);
  const installedVersion = getInstalledVersion(workspaceRoot);
  const targetPath = path.join(workspaceRoot, TARGET_DIR);

  // Skip-if-up-to-date gate. Only suppresses when installed >= bundled.
  // `force` bypasses. Matches the semantics of brain-upgrade-core.cjs.
  let upToDate = false;
  if (installedVersion) {
    const cmp = compareSemver(installedVersion, bundledVersion);
    if (cmp !== null && cmp >= 0) upToDate = true;
  }

  const needsInstall = force || !fs.existsSync(targetPath) || !upToDate;

  if (!needsInstall) {
    vscode.window.showInformationMessage(
      `Alex: Brain is up to date (v${bundledVersion}).`,
    );
    return false;
  }

  const sourcePath = path.join(context.extensionUri.fsPath, BRAIN_DIR);
  if (!fs.existsSync(sourcePath)) {
    vscode.window.showWarningMessage(
      "Alex: Brain files not found in extension bundle.",
    );
    return false;
  }

  try {
    const githubDir = path.join(workspaceRoot, TARGET_DIR);
    fs.mkdirSync(githubDir, { recursive: true });

    // Backup existing brain dirs before overwriting (upgrade only, not fresh install)
    if (installedVersion) {
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const backupDir = path.join(workspaceRoot, `.github-backup-${ts}`);
      fs.mkdirSync(backupDir, { recursive: true });
      for (const subdir of BRAIN_SUBDIRS) {
        const existing = path.join(githubDir, subdir);
        if (fs.existsSync(existing)) {
          copyDirSync(existing, path.join(backupDir, subdir));
        }
      }
      for (const file of BRAIN_ROOT_FILES) {
        const existing = path.join(githubDir, file);
        if (fs.existsSync(existing)) {
          fs.copyFileSync(existing, path.join(backupDir, file));
        }
      }
    }

    // Capture heir-managed fields from the existing brain-version.json BEFORE
    // the fresh root files overwrite it. Mirrors preserveBrainVersionCustomization
    // in brain-upgrade-core.cjs.
    const preservedBv: Record<string, unknown> = {};
    try {
      const existingBvRaw = fs.readFileSync(path.join(githubDir, "brain-version.json"), "utf-8");
      const existingBv = JSON.parse(existingBvRaw) as Record<string, unknown>;
      for (const key of ["identity", "upgradeLock", "lockReason", "lockUpgrade", "locked", "lock"]) {
        if (Object.prototype.hasOwnProperty.call(existingBv, key)) {
          preservedBv[key] = existingBv[key];
        }
      }
    } catch {
      // No existing brain-version.json — fresh install; nothing to preserve.
    }

    // Save old copilot-instructions.md so Phase 2 reconciliation can merge
    // project identity back into the fresh template. Mirrors the CJS core.
    const oldCiPath = path.join(githubDir, "copilot-instructions.md");
    let oldCiContent: string | null = null;
    if (installedVersion && fs.existsSync(oldCiPath)) {
      try { oldCiContent = fs.readFileSync(oldCiPath, "utf-8"); } catch { /* best effort */ }
    }

    // Save old NORTH-STAR.md for Phase 2 LLM curation. NORTH-STAR is
    // semantic, not mechanical — the LLM decides whether to keep, merge, or
    // relocate the old copy (it may have been placed in the wrong directory).
    const oldNorthStarPath = path.join(githubDir, "NORTH-STAR.md");
    let oldNorthStarContent: string | null = null;
    if (installedVersion && fs.existsSync(oldNorthStarPath)) {
      try { oldNorthStarContent = fs.readFileSync(oldNorthStarPath, "utf-8"); } catch { /* best effort */ }
    }

    // Save old EXTERNAL-API-REGISTRY.md for Phase 2 LLM curation. Heirs
    // append project-specific API sections that must survive upgrades.
    const oldApiRegistryPath = path.join(githubDir, "EXTERNAL-API-REGISTRY.md");
    let oldApiRegistryContent: string | null = null;
    if (installedVersion && fs.existsSync(oldApiRegistryPath)) {
      try { oldApiRegistryContent = fs.readFileSync(oldApiRegistryPath, "utf-8"); } catch { /* best effort */ }
    }

    // Deploy each brain subdirectory atomically via staging
    for (const subdir of BRAIN_SUBDIRS) {
      const srcSub = path.join(sourcePath, subdir);
      if (!fs.existsSync(srcSub)) continue;

      const destSub = path.join(githubDir, subdir);
      // Collision-resistant staging suffix: timestamp + random nonce
      // protects against simultaneous bootstrap invocations.
      const stagingSub = destSub + `.staging-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

      copyDirSync(srcSub, stagingSub);

      if (fs.existsSync(destSub)) {
        fs.rmSync(destSub, { recursive: true, force: true });
      }
      fs.renameSync(stagingSub, destSub);
    }

    // Deploy root-level brain files
    for (const file of BRAIN_ROOT_FILES) {
      const srcFile = path.join(sourcePath, file);
      if (!fs.existsSync(srcFile)) continue;
      fs.copyFileSync(srcFile, path.join(githubDir, file));
    }

    // Stamp version into brain-version.json (authoritative). Re-apply the
    // preserved heir-managed fields so identity/lock survive the upgrade.
    // Remove legacy .alex-brain-version if present.
    const bvPath = path.join(workspaceRoot, BRAIN_VERSION_FILE);
    let bvConfig: Record<string, unknown> = {};
    try {
      bvConfig = JSON.parse(fs.readFileSync(bvPath, "utf-8")) as Record<string, unknown>;
    } catch {
      bvConfig = {};
    }
    // Apply preserved fields first, then stamp master-controlled fields last.
    Object.assign(bvConfig, preservedBv);
    bvConfig.version = bundledVersion;
    if (!bvConfig.architecture) bvConfig.architecture = "Alex Cognitive Architecture";
    bvConfig.lastSync = new Date().toISOString();
    fs.writeFileSync(bvPath, JSON.stringify(bvConfig, null, 2) + "\n", "utf-8");
    const legacyPath = path.join(workspaceRoot, LEGACY_VERSION_FILE);
    if (fs.existsSync(legacyPath)) {
      try { fs.unlinkSync(legacyPath); } catch { /* best effort */ }
    }

    // Save old CI as copilot-instructions.backup.md for Phase 2 reconciliation.
    if (oldCiContent !== null) {
      try {
        fs.writeFileSync(
          path.join(githubDir, "copilot-instructions.backup.md"),
          oldCiContent,
          "utf-8",
        );
      } catch { /* best effort */ }
    }

    // Save old NORTH-STAR as NORTH-STAR.backup.md for Phase 2 LLM curation.
    if (oldNorthStarContent !== null) {
      try {
        fs.writeFileSync(
          path.join(githubDir, "NORTH-STAR.backup.md"),
          oldNorthStarContent,
          "utf-8",
        );
      } catch { /* best effort */ }
    }

    // Save old EXTERNAL-API-REGISTRY as .backup.md for Phase 2 LLM curation.
    if (oldApiRegistryContent !== null) {
      try {
        fs.writeFileSync(
          path.join(githubDir, "EXTERNAL-API-REGISTRY.backup.md"),
          oldApiRegistryContent,
          "utf-8",
        );
      } catch { /* best effort */ }
    }

    // Generate project-specific loop config
    writeLoopConfig(workspaceRoot);

    const action = installedVersion ? "updated" : "installed";
    const settingsChoice = await vscode.window.showInformationMessage(
      `Alex: Brain ${action} to v${bundledVersion}. Configure recommended settings?`,
      "Optimize Settings",
      "Skip",
    );
    if (settingsChoice === "Optimize Settings") {
      vscode.commands.executeCommand("alex.optimizeSettings");
    }

    // Offer AI-Memory setup if not configured
    if (!resolveAIMemoryPath()) {
      const memChoice = await vscode.window.showInformationMessage(
        "Alex: Set up AI-Memory for cross-project knowledge sharing?",
        "Setup AI-Memory",
        "Skip",
      );
      if (memChoice === "Setup AI-Memory") {
        await setupAIMemory();
      }
    }

    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Alex: Brain install failed — ${msg}`);
    return false;
  }
}

/**
 * Check brain status for the current workspace.
 */
export function getBrainStatus(
  context: vscode.ExtensionContext,
): { installed: boolean; version?: string; bundledVersion: string; needsUpgrade: boolean } {
  const bundledVersion = getBundledVersion(context);
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return { installed: false, bundledVersion, needsUpgrade: false };
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const installedVersion = getInstalledVersion(workspaceRoot);
  const targetPath = path.join(workspaceRoot, TARGET_DIR);
  const installed = fs.existsSync(targetPath);

  // Needs upgrade only when installed version is strictly lower than bundled.
  // Equal or higher (someone running a newer brain on an older VSIX) is not
  // treated as "needs upgrade" — prevents accidental downgrades.
  let needsUpgrade = false;
  if (installed && installedVersion) {
    const cmp = compareSemver(installedVersion, bundledVersion);
    needsUpgrade = cmp !== null && cmp < 0;
  } else if (installed && !installedVersion) {
    // Legacy brain with no version stamp → treat as needs upgrade.
    needsUpgrade = true;
  }

  return {
    installed,
    version: installedVersion,
    bundledVersion,
    needsUpgrade,
  };
}

/**
 * Silently check for version mismatch on activation and prompt to upgrade.
 */
export async function checkAutoUpgrade(
  context: vscode.ExtensionContext,
): Promise<void> {
  const status = getBrainStatus(context);
  if (!status.needsUpgrade) return;

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot && isProtectedWorkspace(workspaceRoot)) return;

  const choice = await vscode.window.showInformationMessage(
    `Alex: Brain v${status.version} → v${status.bundledVersion} available.`,
    "Upgrade Now",
    "Later",
  );
  if (choice === "Upgrade Now") {
    await bootstrapBrainFiles(context, true);
  }
}
