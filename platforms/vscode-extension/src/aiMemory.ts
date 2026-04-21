/**
 * AI-Memory discovery, scaffolding, and management.
 *
 * Cross-platform path resolution (OneDrive, fallback) and folder
 * structure creation for the shared AI-Memory knowledge store.
 */
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ── Path discovery ────────────────────────────────────────────────

/**
 * Scan common locations for an existing AI-Memory folder.
 * Returns all candidate paths that actually exist on disk.
 */
export function discoverAIMemoryPaths(): string[] {
  const found: string[] = [];
  const home = os.homedir();

  // Windows: ~/OneDrive - CompanyName/AI-Memory
  try {
    for (const entry of fs.readdirSync(home)) {
      if (/^OneDrive/i.test(entry)) {
        const candidate = path.join(home, entry, "AI-Memory");
        if (fs.existsSync(candidate)) found.push(candidate);
      }
    }
  } catch {
    /* ignore permission errors */
  }

  // macOS: ~/Library/CloudStorage/OneDrive-*/AI-Memory
  const cloudStorage = path.join(home, "Library", "CloudStorage");
  try {
    if (fs.existsSync(cloudStorage)) {
      for (const entry of fs.readdirSync(cloudStorage)) {
        if (/^OneDrive/i.test(entry)) {
          const candidate = path.join(cloudStorage, entry, "AI-Memory");
          if (fs.existsSync(candidate)) found.push(candidate);
        }
      }
    }
  } catch {
    /* ignore */
  }

  // Generic fallbacks
  for (const fallback of [
    path.join(home, "AI-Memory"),
    path.join(home, ".alex", "AI-Memory"),
  ]) {
    if (fs.existsSync(fallback)) found.push(fallback);
  }

  return found;
}

/**
 * Build a list of candidate paths where AI-Memory *could* be created,
 * even if the folder doesn't exist yet.
 */
function suggestAIMemoryCandidates(): string[] {
  const candidates: string[] = [];
  const home = os.homedir();

  // OneDrive folders (best — cloud-synced)
  try {
    for (const entry of fs.readdirSync(home)) {
      if (/^OneDrive/i.test(entry)) {
        candidates.push(path.join(home, entry, "AI-Memory"));
      }
    }
  } catch {
    /* ignore */
  }

  // macOS CloudStorage
  const cloudStorage = path.join(home, "Library", "CloudStorage");
  try {
    if (fs.existsSync(cloudStorage)) {
      for (const entry of fs.readdirSync(cloudStorage)) {
        if (/^OneDrive/i.test(entry)) {
          candidates.push(path.join(cloudStorage, entry, "AI-Memory"));
        }
      }
    }
  } catch {
    /* ignore */
  }

  // Fallbacks
  candidates.push(path.join(home, "AI-Memory"));
  candidates.push(path.join(home, ".alex", "AI-Memory"));

  return candidates;
}

// ── Resolve path (setting > existing > null) ──────────────────────

/**
 * Resolve the AI-Memory path. Priority:
 * 1. User setting `alex.aiMemory.path` (if set and directory exists)
 * 2. First discovered existing path
 * 3. null (not found)
 */
export function resolveAIMemoryPath(): string | null {
  const configured = vscode.workspace
    .getConfiguration("alex.aiMemory")
    .get<string>("path");

  if (configured && fs.existsSync(configured)) {
    return configured;
  }

  const existing = discoverAIMemoryPaths();
  return existing.length > 0 ? existing[0] : null;
}

// ── Scaffolding ───────────────────────────────────────────────────

/** Directories created inside AI-Memory. */
const SCAFFOLD_DIRS = [
  ".github",
  "announcements",
  "feedback",
  "insights",
  "knowledge",
  "patterns",
];

/** Template files created only when missing. */
const SCAFFOLD_FILES: Record<string, string | (() => string)> = {
  "global-knowledge.md": `# Global Knowledge

Cross-project patterns, insights, and reusable solutions.

## Patterns

## Insights

## Anti-Patterns
`,
  "notes.md": `# Session Notes

Quick notes, reminders, and observations.

## Quick Notes

## Reminders

## Observations
`,
  "learning-goals.md": `# Learning Goals

Active learning objectives and progress tracking.

## Active Goals

## Completed
`,
  "user-profile.json": () => JSON.stringify(
    {
      name: "",
      role: "",
      preferences: {
        communication: "direct",
        codeStyle: "",
        learningStyle: "",
      },
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
  "project-registry.json": () => JSON.stringify(
    {
      version: 1,
      projects: [],
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
  "index.json": () => JSON.stringify(
    {
      version: 1,
      files: [],
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
};

/**
 * Ensure the AI-Memory folder structure exists at the given path.
 * Creates directories and template files only when missing —
 * never overwrites existing content.
 *
 * @returns List of paths that were newly created.
 */
export function ensureAIMemoryStructure(basePath: string): string[] {
  const created: string[] = [];

  // Base directory
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
    created.push(basePath);
  }

  // Subdirectories
  for (const dir of SCAFFOLD_DIRS) {
    const dirPath = path.join(basePath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      created.push(dirPath);
    }
  }

  // Template files (never overwrite)
  for (const [file, contentOrFn] of Object.entries(SCAFFOLD_FILES)) {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) {
      const content = typeof contentOrFn === "function" ? contentOrFn() : contentOrFn;
      fs.writeFileSync(filePath, content, "utf-8");
      created.push(filePath);
    }
  }

  return created;
}

// ── Status check ──────────────────────────────────────────────────

export interface AIMemoryStatus {
  found: boolean;
  path: string | null;
  fileCount: number;
  hasProfile: boolean;
  hasRegistry: boolean;
  hasKnowledge: boolean;
}

/**
 * Get the current AI-Memory status.
 */
export function getAIMemoryStatus(): AIMemoryStatus {
  const memPath = resolveAIMemoryPath();
  if (!memPath) {
    return {
      found: false,
      path: null,
      fileCount: 0,
      hasProfile: false,
      hasRegistry: false,
      hasKnowledge: false,
    };
  }

  let fileCount = 0;
  try {
    const entries = fs.readdirSync(memPath);
    fileCount = entries.filter(
      (e) => !e.startsWith(".") && fs.statSync(path.join(memPath, e)).isFile(),
    ).length;
  } catch {
    /* ignore */
  }

  return {
    found: true,
    path: memPath,
    fileCount,
    hasProfile: fs.existsSync(path.join(memPath, "user-profile.json")),
    hasRegistry: fs.existsSync(path.join(memPath, "project-registry.json")),
    hasKnowledge: fs.existsSync(path.join(memPath, "global-knowledge.md")),
  };
}

// ── Interactive setup ─────────────────────────────────────────────

/**
 * Interactive AI-Memory setup via VS Code QuickPick.
 * Discovers existing paths, suggests candidates, or lets user browse.
 * Returns the chosen path or undefined if cancelled.
 */
export async function promptForAIMemoryLocation(): Promise<string | undefined> {
  // Check for configured override
  const configured = vscode.workspace
    .getConfiguration("alex.aiMemory")
    .get<string>("path");
  if (configured && fs.existsSync(configured)) {
    const use = await vscode.window.showInformationMessage(
      `AI-Memory already configured at: ${configured}`,
      "Use This",
      "Change Location",
    );
    if (use === "Use This") return configured;
    if (!use) return undefined;
  }

  // Discover existing + suggest candidates
  const existing = discoverAIMemoryPaths();
  const candidates = suggestAIMemoryCandidates();

  // Build QuickPick items
  const items: vscode.QuickPickItem[] = [];

  for (const p of existing) {
    items.push({
      label: "$(check) " + p,
      description: "Found — existing AI-Memory",
      detail: p,
    });
  }

  // Add candidates that don't already exist
  for (const p of candidates) {
    if (!existing.includes(p)) {
      const isOneDrive = /OneDrive/i.test(p);
      items.push({
        label: (isOneDrive ? "$(cloud) " : "$(folder) ") + p,
        description: isOneDrive
          ? "OneDrive — recommended (cloud-synced)"
          : "Local fallback",
        detail: p,
      });
    }
  }

  items.push({
    label: "$(folder-opened) Browse...",
    description: "Choose a custom location",
    detail: "__browse__",
  });

  const pick = await vscode.window.showQuickPick(items, {
    title: "AI-Memory Location",
    placeHolder: "Where should Alex store shared knowledge?",
    ignoreFocusOut: true,
  });

  if (!pick) return undefined;

  let chosenPath: string;

  if (pick.detail === "__browse__") {
    const uris = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: "Select AI-Memory Folder",
      title: "Choose AI-Memory Location",
    });
    if (!uris || uris.length === 0) return undefined;
    chosenPath = uris[0].fsPath;
    // Ensure the path ends with AI-Memory
    if (!path.basename(chosenPath).toLowerCase().includes("ai-memory")) {
      chosenPath = path.join(chosenPath, "AI-Memory");
    }
  } else {
    chosenPath = pick.detail!;
  }

  return chosenPath;
}

/**
 * Full interactive setup flow:
 * 1. Prompt user for location
 * 2. Scaffold the directory structure
 * 3. Save the path to settings
 * 4. Report results
 *
 * @returns The AI-Memory path, or undefined if cancelled.
 */
export async function setupAIMemory(): Promise<string | undefined> {
  const chosenPath = await promptForAIMemoryLocation();
  if (!chosenPath) return undefined;

  try {
    const created = ensureAIMemoryStructure(chosenPath);

    // Save to user settings
    await vscode.workspace
      .getConfiguration("alex.aiMemory")
      .update("path", chosenPath, vscode.ConfigurationTarget.Global);

    if (created.length > 0) {
      vscode.window.showInformationMessage(
        `AI-Memory initialized at ${chosenPath} (${created.length} items created).`,
      );
    } else {
      vscode.window.showInformationMessage(
        `AI-Memory linked to ${chosenPath} (already complete).`,
      );
    }

    return chosenPath;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`AI-Memory setup failed: ${msg}`);
    return undefined;
  }
}
