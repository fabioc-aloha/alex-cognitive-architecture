import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
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

const BRAIN_ROOT_FILES = ["copilot-instructions.md"];
const BRAIN_DIR = "brain-files";
const TARGET_DIR = ".github";
const VERSION_FILE = ".github/.alex-brain-version";
const MASTER_PROTECTED_FILE = ".github/config/MASTER-ALEX-PROTECTED.json";

function getBundledVersion(context: vscode.ExtensionContext): string {
  return context.extension.packageJSON.version as string;
}

function getInstalledVersion(workspaceRoot: string): string | undefined {
  const versionPath = path.join(workspaceRoot, VERSION_FILE);
  try {
    return fs.readFileSync(versionPath, "utf-8").trim();
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
 * Check if the current workspace is Master Alex (protected).
 */
function isProtectedWorkspace(workspaceRoot: string): boolean {
  return fs.existsSync(path.join(workspaceRoot, MASTER_PROTECTED_FILE));
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

  const needsInstall =
    force || !fs.existsSync(targetPath) || installedVersion !== bundledVersion;

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

    // Deploy each brain subdirectory atomically via staging
    for (const subdir of BRAIN_SUBDIRS) {
      const srcSub = path.join(sourcePath, subdir);
      if (!fs.existsSync(srcSub)) continue;

      const destSub = path.join(githubDir, subdir);
      const stagingSub = destSub + `.staging-${Date.now()}`;

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

    // Stamp version
    const versionPath = path.join(workspaceRoot, VERSION_FILE);
    fs.writeFileSync(versionPath, bundledVersion, "utf-8");

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

  return {
    installed,
    version: installedVersion,
    bundledVersion,
    needsUpgrade: installed && installedVersion !== bundledVersion,
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
