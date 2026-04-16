import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { BRAIN_DIR, TARGET_DIR, VERSION_FILE } from "./shared/constants.js";

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
 * Uses atomic staging: copy → swap to avoid partial writes.
 *
 * @param context Extension context (for extensionUri)
 * @param force   Skip version check and always overwrite
 * @returns true if files were copied
 */
export function bootstrapBrainFiles(
  context: vscode.ExtensionContext,
  force = false,
): boolean {
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
    // Atomic staging: copy to temp dir, then rename
    const stagingPath = targetPath + `.staging-${Date.now()}`;
    copyDirSync(sourcePath, stagingPath);

    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
    fs.renameSync(stagingPath, targetPath);

    // Stamp version
    const versionPath = path.join(workspaceRoot, VERSION_FILE);
    fs.writeFileSync(versionPath, bundledVersion, "utf-8");

    const action = installedVersion ? "updated" : "installed";
    vscode.window.showInformationMessage(
      `Alex: Brain ${action} (v${bundledVersion}).`,
    );
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
