/**
 * Config-driven Loop tab menu loader.
 *
 * Reads group/button structure from .github/config/loop-menu.json,
 * merges skill partial configs from .github/skills/{name}/loop-config.partial.json,
 * filters by project phase, and resolves prompt text from .prompt.md files.
 */

import * as fs from "fs";
import * as path from "path";

// ── Types ─────────────────────────────────────────────────────────

interface ActionButton {
  id?: string;
  icon: string;
  label: string;
  command: string;
  prompt?: string;
  file?: string;
  hint?: "chat" | "link" | "command";
  tooltip?: string;
}

interface ActionGroup {
  id: string;
  label: string;
  desc?: string;
  accent?: string;
  icon?: string;
  collapsed?: boolean;
  buttons: ActionButton[];
}

type ProjectPhase = "planning" | "active-development" | "testing" | "release" | "maintenance";

interface LoopButtonConfig {
  id?: string;
  icon: string;
  label: string;
  command: string;
  promptFile?: string;
  prompt?: string;
  file?: string;
  hint?: "chat" | "link" | "command";
  tooltip?: string;
  phase?: ProjectPhase[];
}

interface LoopGroupConfig {
  id: string;
  label: string;
  desc?: string;
  accent?: string;
  icon?: string;
  collapsed?: boolean;
  phase?: ProjectPhase[];
  source?: "core" | "type" | "skill";
  buttons: LoopButtonConfig[];
}

interface LoopMenuConfig {
  groups: LoopGroupConfig[];
  projectPhase?: ProjectPhase;
  /**
   * Optional active-context badge (set via a future alex.setContext command).
   * Renders in the welcome view header to indicate which package/module the
   * user is currently focused on.
   */
  activePackage?: { name: string; path?: string } | null;
}

interface SkillPartialConfig {
  groups?: LoopGroupConfig[];
}

// ── Loader ────────────────────────────────────────────────────────

/** Strip YAML frontmatter (---...---) from prompt file content. */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

/**
 * Scan skill directories for loop-config.partial.json files.
 * Each partial file contains a { groups: [...] } structure that gets merged
 * into the main config. Invalid partials are silently skipped.
 */
function loadSkillPartials(extensionRoot: string): LoopGroupConfig[] {
  const skillsDir = path.join(extensionRoot, ".github", "skills");
  if (!fs.existsSync(skillsDir)) return [];

  const partialGroups: LoopGroupConfig[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const partialPath = path.join(skillsDir, entry.name, "loop-config.partial.json");
    if (!fs.existsSync(partialPath)) continue;

    try {
      const partial = JSON.parse(
        fs.readFileSync(partialPath, "utf-8"),
      ) as SkillPartialConfig;

      if (Array.isArray(partial.groups)) {
        for (const g of partial.groups) {
          // Tag source for downstream identification
          partialGroups.push({ ...g, source: "skill" });
        }
      }
    } catch {
      // Invalid partial — skip silently
    }
  }

  return partialGroups;
}

/**
 * Merge skill partial groups into the main groups list.
 *
 * Strategy:
 * - If a partial group ID matches an existing group, append its buttons
 *   to the existing group (extend, not override).
 * - If the group ID is new, append the entire group at the end.
 */
function mergeGroups(
  base: LoopGroupConfig[],
  partials: LoopGroupConfig[],
): LoopGroupConfig[] {
  const merged = base.map((g) => ({ ...g, buttons: [...g.buttons] }));

  for (const partial of partials) {
    const existing = merged.find((g) => g.id === partial.id);
    if (existing) {
      // Extend: append buttons that don't already exist
      const existingIds = new Set(
        existing.buttons.map((b) => b.id ?? b.label),
      );
      for (const btn of partial.buttons) {
        const btnId = btn.id ?? btn.label;
        if (!existingIds.has(btnId)) {
          existing.buttons.push(btn);
          existingIds.add(btnId);
        }
      }
    } else {
      // New group — append
      merged.push({ ...partial, buttons: [...partial.buttons] });
    }
  }

  return merged;
}

/**
 * Filter groups and buttons by project phase.
 *
 * - Groups with a `phase` array are only shown when the current phase matches.
 * - Buttons with a `phase` array are only shown when the current phase matches.
 * - Groups/buttons without a `phase` field are always shown.
 * - Groups matching the current phase are auto-expanded (collapsed = false).
 */
function filterByPhase(
  groups: LoopGroupConfig[],
  currentPhase?: ProjectPhase,
): LoopGroupConfig[] {
  if (!currentPhase) return groups;

  return groups
    .filter((g) => !g.phase || g.phase.includes(currentPhase))
    .map((g) => {
      const filteredButtons = g.buttons.filter(
        (b) => !b.phase || b.phase.includes(currentPhase),
      );
      // Auto-expand groups that match the current phase
      const isPhaseMatch = g.phase?.includes(currentPhase);
      return {
        ...g,
        buttons: filteredButtons,
        collapsed: isPhaseMatch ? false : g.collapsed,
      };
    })
    .filter((g) => g.buttons.length > 0);
}

/**
 * Resolve a button config into an ActionButton, loading prompt text
 * from .prompt.md files when referenced.
 */
function resolveButton(b: LoopButtonConfig, promptDir: string): ActionButton {
  const button: ActionButton = {
    id: b.id,
    icon: b.icon,
    label: b.label,
    command: b.command,
    hint: b.hint,
    tooltip: b.tooltip,
  };

  // Resolve prompt from file, fall back to inline prompt
  if (b.promptFile) {
    const promptPath = path.join(promptDir, b.promptFile);
    try {
      if (fs.existsSync(promptPath)) {
        button.prompt = stripFrontmatter(
          fs.readFileSync(promptPath, "utf-8"),
        );
      }
    } catch {
      // Silently skip — button just won't have a prompt
    }
  }

  if (!button.prompt && b.prompt) {
    button.prompt = b.prompt;
  }

  if (b.file) {
    button.file = b.file;
  }

  return button;
}

/**
 * Load loop menu groups from the config file, merge skill partials,
 * filter by project phase, and resolve prompt text from .prompt.md files.
 * Falls back to an empty array on any error.
 *
 * @param extensionRoot — absolute path to the workspace root directory
 */
/**
 * Read the active-package context from loop-menu.json. Returns null when
 * unset, when the file is missing, or on parse error. Used by the welcome
 * view to render an optional context badge in the header.
 */
export function loadActivePackage(
  workspaceRoot: string,
): { name: string; path?: string } | null {
  const configPath = path.join(
    workspaceRoot,
    ".github",
    "config",
    "loop-menu.json",
  );
  if (!fs.existsSync(configPath)) return null;
  try {
    const config = JSON.parse(
      fs.readFileSync(configPath, "utf-8"),
    ) as LoopMenuConfig;
    return config.activePackage ?? null;
  } catch {
    return null;
  }
}

export function loadLoopGroups(extensionRoot: string): ActionGroup[] {
  const configPath = path.join(
    extensionRoot,
    ".github",
    "config",
    "loop-menu.json",
  );

  if (!fs.existsSync(configPath)) {
    return [];
  }

  let config: LoopMenuConfig;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as LoopMenuConfig;
  } catch {
    return [];
  }

  if (!Array.isArray(config.groups)) {
    return [];
  }

  // Phase 3: Merge skill partials
  const skillPartials = loadSkillPartials(extensionRoot);
  const mergedGroups = mergeGroups(config.groups, skillPartials);
  // Phase 4: Filter by project phase
  const phaseFiltered = filterByPhase(mergedGroups, config.projectPhase);

  // Resolve prompts
  const promptDir = path.join(extensionRoot, ".github", "prompts", "loop");

  return phaseFiltered.map((g) => ({
    id: g.id,
    label: g.label,
    desc: g.desc,
    accent: g.accent,
    icon: g.icon,
    collapsed: g.collapsed,
    buttons: g.buttons.map((b) => resolveButton(b, promptDir)),
  }));
}
