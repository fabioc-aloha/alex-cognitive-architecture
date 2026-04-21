/**
 * Loop config generator.
 *
 * Produces a project-specific loop-menu.json by combining the
 * universal Creative Loop core with project-type-specific groups
 * and injected project context (build/test commands, conventions).
 */

import * as fs from "fs";
import * as path from "path";
import { detectProject, type ProjectContext, type ProjectType } from "./projectDetector.js";

// ── Types ─────────────────────────────────────────────────────────

interface ButtonDef {
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

type ProjectPhase = "planning" | "active-development" | "testing" | "release" | "maintenance";

interface GroupDef {
  id: string;
  label: string;
  icon: string;
  desc: string;
  collapsed: boolean;
  phase?: ProjectPhase[];
  source?: "core" | "type" | "skill";
  buttons: ButtonDef[];
}

interface LoopConfig {
  $schema: string;
  $comment: string;
  version: string;
  projectType?: string;
  projectPhase?: ProjectPhase;
  groups: GroupDef[];
  projectContext?: Partial<ProjectContext>;
}

// ── Project-Type Templates ────────────────────────────────────────

/** Extra groups appended for VS Code extension projects. */
const VSCODE_EXTENSION_GROUPS: GroupDef[] = [
  {
    id: "extension-dev",
    label: "EXTENSION DEV",
    icon: "extensions",
    desc: "Package, publish, test, and debug the VS Code extension",
    collapsed: true,
    buttons: [
      {
        id: "ext-package",
        icon: "package",
        label: "Package VSIX",
        command: "openChat",
        prompt: "Package the VS Code extension into a .vsix file. Run the build first, then package with vsce. Report the file size.",
        hint: "chat",
        tooltip: "Build and package the extension"
      },
      {
        id: "ext-publish",
        icon: "cloud-upload",
        label: "Publish",
        command: "openChat",
        prompt: "Run the release preflight checks, then publish the extension to the VS Code Marketplace. Follow the release-management skill.",
        hint: "chat",
        tooltip: "Publish to VS Code Marketplace"
      },
      {
        id: "ext-test",
        icon: "beaker",
        label: "Extension Tests",
        command: "openChat",
        prompt: "Run all extension tests. Report pass/fail counts and any failures with root cause analysis.",
        hint: "chat",
        tooltip: "Run extension test suite"
      },
      {
        id: "ext-debug",
        icon: "debug-alt",
        label: "Debug Launch",
        command: "runCommand",
        file: "workbench.action.debug.start",
        hint: "command",
        tooltip: "Launch Extension Development Host"
      }
    ]
  }
];

const PYTHON_API_GROUPS: GroupDef[] = [
  {
    id: "api-dev",
    label: "API DEVELOPMENT",
    icon: "plug",
    desc: "Run, test, and document API endpoints",
    collapsed: true,
    buttons: [
      {
        id: "api-run",
        icon: "play",
        label: "Run Server",
        command: "openChat",
        prompt: "Start the API development server. Detect the framework (FastAPI/Flask/Django) and use the appropriate command.",
        hint: "chat",
        tooltip: "Start the development server"
      },
      {
        id: "api-test",
        icon: "beaker",
        label: "Test API",
        command: "openChat",
        prompt: "Run the API test suite with pytest. Report coverage, pass/fail counts, and any failures.",
        hint: "chat",
        tooltip: "Run API tests with coverage"
      },
      {
        id: "api-lint",
        icon: "warning",
        label: "Lint & Type",
        command: "openChat",
        prompt: "Run linting (ruff/flake8) and type checking (mypy/pyright) on the Python codebase. Fix any issues found.",
        hint: "chat",
        tooltip: "Run linter and type checker"
      },
      {
        id: "api-docs",
        icon: "book",
        label: "API Docs",
        command: "openChat",
        prompt: "Review and update the API documentation. Ensure OpenAPI/Swagger specs match the current endpoints.",
        hint: "chat",
        tooltip: "Update API documentation"
      }
    ]
  }
];

const DATA_PIPELINE_GROUPS: GroupDef[] = [
  {
    id: "pipeline-phases",
    label: "PIPELINE PHASES",
    icon: "server-process",
    desc: "Medallion architecture: ingest, transform, serve",
    collapsed: true,
    buttons: [
      {
        id: "bronze",
        icon: "database",
        label: "Bronze Layer",
        command: "openChat",
        prompt: "Help me work on the Bronze (raw ingestion) layer. Identify data sources, define schemas, implement extraction logic.",
        hint: "chat",
        tooltip: "Raw data ingestion patterns"
      },
      {
        id: "silver",
        icon: "filter",
        label: "Silver Layer",
        command: "openChat",
        prompt: "Help me work on the Silver (cleansed/conformed) layer. Apply data quality rules, standardize schemas, handle nulls and duplicates.",
        hint: "chat",
        tooltip: "Cleansing and conforming"
      },
      {
        id: "gold",
        icon: "star-full",
        label: "Gold Layer",
        command: "openChat",
        prompt: "Help me work on the Gold (business-ready) layer. Build aggregations, KPI calculations, and dimensional models.",
        hint: "chat",
        tooltip: "Business-ready aggregations"
      }
    ]
  },
  {
    id: "data-quality",
    label: "DATA QUALITY",
    icon: "verified",
    desc: "Profile, validate, and trace data lineage",
    collapsed: true,
    buttons: [
      {
        id: "profile",
        icon: "graph-line",
        label: "Profile Data",
        command: "openChat",
        prompt: "Profile the dataset: row counts, null rates, distributions, cardinality, outliers. Present findings in a summary table.",
        hint: "chat",
        tooltip: "Statistical data profiling"
      },
      {
        id: "validate",
        icon: "check",
        label: "Validate Schema",
        command: "openChat",
        prompt: "Validate data schemas against expectations. Check column types, constraints, referential integrity, and naming conventions.",
        hint: "chat",
        tooltip: "Schema validation checks"
      },
      {
        id: "lineage",
        icon: "git-merge",
        label: "Trace Lineage",
        command: "openChat",
        prompt: "Trace data lineage for the selected table or column. Map source-to-target transformations and document the flow.",
        hint: "chat",
        tooltip: "Data lineage documentation"
      }
    ]
  }
];

const STATIC_SITE_GROUPS: GroupDef[] = [
  {
    id: "site-dev",
    label: "SITE DEVELOPMENT",
    icon: "browser",
    desc: "Dev server, build, deploy, and performance audit",
    collapsed: true,
    buttons: [
      {
        id: "site-dev-server",
        icon: "play",
        label: "Dev Server",
        command: "openChat",
        prompt: "Start the development server for this static site. Detect the framework and use the appropriate dev command.",
        hint: "chat",
        tooltip: "Start local dev server"
      },
      {
        id: "site-build",
        icon: "package",
        label: "Build Site",
        command: "openChat",
        prompt: "Build the static site for production. Report any build warnings or errors.",
        hint: "chat",
        tooltip: "Production build"
      },
      {
        id: "site-deploy",
        icon: "cloud-upload",
        label: "Deploy",
        command: "openChat",
        prompt: "Deploy the site to the configured hosting platform. Run preflight checks first.",
        hint: "chat",
        tooltip: "Deploy to hosting"
      },
      {
        id: "site-perf",
        icon: "dashboard",
        label: "Performance",
        command: "openChat",
        prompt: "Audit site performance: bundle size, image optimization, lazy loading, caching headers, Core Web Vitals.",
        hint: "chat",
        tooltip: "Performance and accessibility audit"
      }
    ]
  }
];

const MONOREPO_GROUPS: GroupDef[] = [
  {
    id: "cross-package",
    label: "CROSS-PACKAGE",
    icon: "references",
    desc: "Shared types, dependency updates, and coordinated releases",
    collapsed: true,
    buttons: [
      {
        id: "deps-update",
        icon: "package",
        label: "Update Deps",
        command: "openChat",
        prompt: "Check for outdated dependencies across all packages. Propose coordinated updates that maintain compatibility.",
        hint: "chat",
        tooltip: "Cross-package dependency updates"
      },
      {
        id: "shared-types",
        icon: "symbol-interface",
        label: "Shared Types",
        command: "openChat",
        prompt: "Review shared type definitions across packages. Identify drift, inconsistencies, or missing exports.",
        hint: "chat",
        tooltip: "Audit shared type definitions"
      },
      {
        id: "release-all",
        icon: "rocket",
        label: "Release Train",
        command: "openChat",
        prompt: "Coordinate a release across all packages. Check version consistency, run all tests, update changelogs.",
        hint: "chat",
        tooltip: "Coordinated multi-package release"
      }
    ]
  }
];

/** Map project types to their extra groups. */
const TYPE_GROUPS: Record<ProjectType, GroupDef[]> = {
  "vscode-extension": VSCODE_EXTENSION_GROUPS,
  "python-api": PYTHON_API_GROUPS,
  "data-pipeline": DATA_PIPELINE_GROUPS,
  "static-site": STATIC_SITE_GROUPS,
  "monorepo": MONOREPO_GROUPS,
  "generic": [],
};

// ── Generator ─────────────────────────────────────────────────────

/**
 * Read existing loop-menu.json base groups (the universal core).
 * Falls back to empty array if the file doesn't exist yet.
 */
function readBaseGroups(configPath: string): GroupDef[] {
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8")) as LoopConfig;
    return Array.isArray(raw.groups) ? raw.groups : [];
  } catch {
    return [];
  }
}

/**
 * Generate a project-specific loop-menu.json.
 *
 * Strategy:
 * 1. Read existing base groups (Creative Loop, Build Helpers, etc.)
 * 2. Remove any previously-generated project-type groups
 * 3. Append groups for the detected project type
 * 4. Inject projectContext with detected commands/conventions
 *
 * @param workspaceRoot — workspace root directory
 * @param context — optional pre-detected context (skips detection)
 * @returns the generated config object
 */
export function generateLoopConfig(
  workspaceRoot: string,
  context?: ProjectContext,
): LoopConfig {
  const ctx = context ?? detectProject(workspaceRoot);
  const configPath = path.join(workspaceRoot, ".github", "config", "loop-menu.json");

  // Read base groups
  const baseGroups = readBaseGroups(configPath);

  // Collect all project-type group IDs to strip previous generations
  const allTypeGroupIds = new Set(
    Object.values(TYPE_GROUPS).flatMap((groups) => groups.map((g) => g.id)),
  );

  // Filter out previously-injected type groups, keep user/base groups
  const coreGroups = baseGroups.filter((g) => !allTypeGroupIds.has(g.id));

  // Append type-specific groups
  const typeGroups = TYPE_GROUPS[ctx.projectType] ?? [];
  const allGroups = [...coreGroups, ...typeGroups];

  // Build projectContext (omit undefined fields)
  const projectContext: Record<string, unknown> = {};
  if (ctx.buildCommand) projectContext.buildCommand = ctx.buildCommand;
  if (ctx.testCommand) projectContext.testCommand = ctx.testCommand;
  if (ctx.lintCommand) projectContext.lintCommand = ctx.lintCommand;
  if (ctx.releaseScript) projectContext.releaseScript = ctx.releaseScript;
  if (ctx.conventions.length > 0) projectContext.conventions = ctx.conventions;

  return {
    $schema: "./loop-config.schema.json",
    $comment: `Loop tab menu configuration — auto-generated for ${ctx.projectType} project. Prompts are loaded from .github/prompts/loop/{promptFile} at runtime.`,
    version: "1.0",
    projectType: ctx.projectType,
    projectPhase: "active-development",
    groups: allGroups,
    ...(Object.keys(projectContext).length > 0 ? { projectContext: projectContext as Partial<ProjectContext> } : {}),
  };
}

/**
 * Generate and write a project-specific loop-menu.json.
 *
 * @param workspaceRoot — workspace root directory
 * @param context — optional pre-detected context
 * @returns true if the file was written
 */
export function writeLoopConfig(
  workspaceRoot: string,
  context?: ProjectContext,
): boolean {
  const config = generateLoopConfig(workspaceRoot, context);
  const configDir = path.join(workspaceRoot, ".github", "config");
  const configPath = path.join(configDir, "loop-menu.json");

  try {
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Update the projectPhase in an existing loop-menu.json.
 * Preserves all other config fields.
 *
 * @param workspaceRoot — workspace root directory
 * @param phase — the new project phase
 * @returns true if the file was updated
 */
export function setProjectPhase(
  workspaceRoot: string,
  phase: ProjectPhase,
): boolean {
  const configPath = path.join(workspaceRoot, ".github", "config", "loop-menu.json");

  try {
    if (!fs.existsSync(configPath)) return false;
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as LoopConfig;
    config.projectPhase = phase;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}
