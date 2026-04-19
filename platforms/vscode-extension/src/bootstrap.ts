import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { BRAIN_DIR, TARGET_DIR, VERSION_FILE } from "./shared/constants.js";
import { writeLoopConfig } from "./sidebar/loopConfigGenerator.js";

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

/** Root-level brain files deployed alongside subdirectories. */
const BRAIN_ROOT_FILES = ["copilot-instructions.md"];

/**
 * Get the version string from the bundled brain files.
 * Uses the extension version as the brain version stamp.
 */
function getBundledVersion(context: vscode.ExtensionContext): string {
  return context.extension.packageJSON.version as string;
}

/**
 * Read the installed brain version from the workspace, if any.
 */
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
 * Install .github brain files into the workspace (user-initiated).
 * Deploys brain subdirectories individually to preserve non-brain
 * content in .github/ (workflows, CODEOWNERS, issue templates, etc.).
 *
 * @param context Extension context (for extensionUri)
 * @param force   Skip version check and always overwrite
 * @returns true if files were copied
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
    // Deploy brain subdirectories individually.
    // Each managed subdirectory is replaced atomically; non-brain
    // content in .github/ (workflows, CODEOWNERS, etc.) is preserved.
    const githubDir = path.join(workspaceRoot, TARGET_DIR);
    fs.mkdirSync(githubDir, { recursive: true });

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

      const destFile = path.join(githubDir, file);
      fs.copyFileSync(srcFile, destFile);
    }

    // Stamp version
    const versionPath = path.join(workspaceRoot, VERSION_FILE);
    fs.writeFileSync(versionPath, bundledVersion, "utf-8");

    // Generate project-specific loop config
    writeLoopConfig(workspaceRoot);

    const action = installedVersion ? "updated" : "installed";
    const settingsChoice = await vscode.window.showInformationMessage(
      `Alex: Brain ${action} (v${bundledVersion}). Configure recommended settings?`,
      "Optimize Settings",
      "Skip",
    );
    if (settingsChoice === "Optimize Settings") {
      vscode.commands.executeCommand("alex.optimizeSettings");
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Alex: Brain install failed — ${msg}`);
    return false;
  }
}

/**
 * Check brain health for the current workspace.
 * Returns version info and basic file counts.
 */
export function getBrainStatus(
  context: vscode.ExtensionContext,
): { installed: boolean; version?: string; bundledVersion: string } {
  const bundledVersion = getBundledVersion(context);
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return { installed: false, bundledVersion };
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const installedVersion = getInstalledVersion(workspaceRoot);
  const targetPath = path.join(workspaceRoot, TARGET_DIR);

  return {
    installed: fs.existsSync(targetPath),
    version: installedVersion,
    bundledVersion,
  };
}
