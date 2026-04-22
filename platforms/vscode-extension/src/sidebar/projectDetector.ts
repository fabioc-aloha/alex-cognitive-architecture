/**
 * Project type detection and context extraction.
 *
 * Scans workspace files to determine project type, build commands,
 * test commands, and technology stack. Used by the loop config
 * generator to produce project-specific sidebar menus.
 */

import * as fs from "fs";
import * as path from "path";

// ── Types ─────────────────────────────────────────────────────────

export type ProjectType =
  | "vscode-extension"
  | "python-api"
  | "data-pipeline"
  | "static-site"
  | "monorepo"
  | "generic";

export interface ProjectContext {
  projectType: ProjectType;
  buildCommand?: string;
  testCommand?: string;
  lintCommand?: string;
  releaseScript?: string;
  conventions: string[];
}

// ── Detection ─────────────────────────────────────────────────────

function fileExists(root: string, ...segments: string[]): boolean {
  return fs.existsSync(path.join(root, ...segments));
}

function readJsonSafe(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function detectConventions(root: string, pkg: Record<string, unknown> | null): string[] {
  const conventions: string[] = [];

  // Languages
  if (pkg || fileExists(root, "tsconfig.json")) conventions.push("TypeScript");
  if (fileExists(root, "requirements.txt") || fileExists(root, "pyproject.toml") || fileExists(root, "setup.py")) conventions.push("Python");
  if (fileExists(root, "go.mod")) conventions.push("Go");
  if (fileExists(root, "Cargo.toml")) conventions.push("Rust");
  if (fileExists(root, "pom.xml") || fileExists(root, "build.gradle")) conventions.push("Java");

  // Frameworks
  const deps = { ...((pkg?.dependencies ?? {}) as Record<string, string>), ...((pkg?.devDependencies ?? {}) as Record<string, string>) };
  if (deps["react"] || deps["react-dom"]) conventions.push("React");
  if (deps["next"]) conventions.push("Next.js");
  if (deps["vue"]) conventions.push("Vue");
  if (deps["vitepress"]) conventions.push("VitePress");
  if (deps["express"]) conventions.push("Express");
  if (deps["fastify"]) conventions.push("Fastify");
  if (deps["@azure/functions"]) conventions.push("Azure Functions");

  // Build tools
  if (deps["esbuild"]) conventions.push("esbuild");
  if (deps["webpack"]) conventions.push("webpack");
  if (deps["vite"] && !deps["vitepress"]) conventions.push("Vite");

  // Test frameworks
  if (deps["vitest"]) conventions.push("Vitest");
  if (deps["jest"]) conventions.push("Jest");
  if (deps["mocha"]) conventions.push("Mocha");

  // Linting
  if (deps["eslint"] || fileExists(root, ".eslintrc.json") || fileExists(root, "eslint.config.js") || fileExists(root, "eslint.config.mjs")) conventions.push("ESLint");
  if (deps["prettier"] || fileExists(root, ".prettierrc")) conventions.push("Prettier");

  // Python-specific
  if (fileExists(root, "pyproject.toml")) {
    try {
      const pyproject = fs.readFileSync(path.join(root, "pyproject.toml"), "utf-8");
      if (pyproject.includes("fastapi")) conventions.push("FastAPI");
      if (pyproject.includes("flask")) conventions.push("Flask");
      if (pyproject.includes("django")) conventions.push("Django");
      if (pyproject.includes("pytest")) conventions.push("pytest");
      if (pyproject.includes("ruff")) conventions.push("Ruff");
      if (pyproject.includes("mypy")) conventions.push("mypy");
    } catch { /* skip */ }
  }

  // Docker
  if (fileExists(root, "Dockerfile") || fileExists(root, "docker-compose.yml") || fileExists(root, "docker-compose.yaml")) {
    conventions.push("Docker");
  }

  return [...new Set(conventions)];
}

function extractCommands(root: string, pkg: Record<string, unknown> | null): Pick<ProjectContext, "buildCommand" | "testCommand" | "lintCommand" | "releaseScript"> {
  const result: Pick<ProjectContext, "buildCommand" | "testCommand" | "lintCommand" | "releaseScript"> = {};
  const scripts = (pkg?.scripts ?? {}) as Record<string, string>;

  // Node.js scripts
  if (scripts["build"]) result.buildCommand = "npm run build";
  if (scripts["build:prod"]) result.buildCommand = "npm run build:prod";
  if (scripts["test"]) result.testCommand = "npm test";
  if (scripts["lint"]) result.lintCommand = "npm run lint";

  // Python fallbacks
  if (!result.buildCommand && fileExists(root, "setup.py")) result.buildCommand = "python setup.py build";
  if (!result.testCommand && fileExists(root, "pyproject.toml")) result.testCommand = "pytest";

  // Go fallbacks
  if (!result.buildCommand && fileExists(root, "go.mod")) result.buildCommand = "go build ./...";
  if (!result.testCommand && fileExists(root, "go.mod")) result.testCommand = "go test ./...";

  // Release scripts
  const releasePatterns = ["scripts/release-vscode.cjs", "scripts/release-full.cjs", "scripts/release.cjs", "scripts/release.sh", "scripts/release.ps1"];
  for (const p of releasePatterns) {
    if (fileExists(root, p)) {
      result.releaseScript = p;
      break;
    }
  }

  return result;
}

/**
 * Detect project type from workspace root.
 *
 * Detection priority (first match wins):
 * 1. VS Code extension — package.json has engines.vscode
 * 2. Monorepo — package.json has workspaces or lerna.json exists
 * 3. Static site — VitePress/Next.js/Gatsby config found
 * 4. Python API — FastAPI/Flask/Django detected
 * 5. Data pipeline — Synapse/Fabric/dbt artifacts
 * 6. Generic — fallback
 */
export function detectProject(workspaceRoot: string): ProjectContext {
  const pkgPath = path.join(workspaceRoot, "package.json");
  const pkg = readJsonSafe(pkgPath);
  const conventions = detectConventions(workspaceRoot, pkg);
  const commands = extractCommands(workspaceRoot, pkg);

  let projectType: ProjectType = "generic";

  // 1. VS Code extension
  if (pkg) {
    const engines = pkg.engines as Record<string, string> | undefined;
    if (engines?.vscode) {
      projectType = "vscode-extension";
      return { projectType, ...commands, conventions };
    }
  }

  // Also check nested extension packages (monorepo with extension)
  if (fileExists(workspaceRoot, "platforms", "vscode-extension", "package.json")) {
    const nestedPkg = readJsonSafe(path.join(workspaceRoot, "platforms", "vscode-extension", "package.json"));
    const engines = (nestedPkg?.engines ?? {}) as Record<string, string>;
    if (engines.vscode) {
      projectType = "vscode-extension";
      return { projectType, ...commands, conventions };
    }
  }

  // 2. Monorepo
  if (pkg) {
    if (pkg.workspaces || fileExists(workspaceRoot, "lerna.json") || fileExists(workspaceRoot, "pnpm-workspace.yaml")) {
      projectType = "monorepo";
      return { projectType, ...commands, conventions };
    }
  }

  // 3. Static site
  if (
    fileExists(workspaceRoot, ".vitepress", "config.ts") ||
    fileExists(workspaceRoot, ".vitepress", "config.mts") ||
    fileExists(workspaceRoot, "next.config.js") ||
    fileExists(workspaceRoot, "next.config.mjs") ||
    fileExists(workspaceRoot, "gatsby-config.js") ||
    fileExists(workspaceRoot, "astro.config.mjs")
  ) {
    projectType = "static-site";
    return { projectType, ...commands, conventions };
  }

  // 4. Python API
  if (conventions.includes("FastAPI") || conventions.includes("Flask") || conventions.includes("Django")) {
    projectType = "python-api";
    return { projectType, ...commands, conventions };
  }

  // 5. Data pipeline
  if (
    fileExists(workspaceRoot, "dbt_project.yml") ||
    fileExists(workspaceRoot, "notebook") ||
    fileExists(workspaceRoot, "synapse") ||
    fileExists(workspaceRoot, ".pbixproj")
  ) {
    projectType = "data-pipeline";
    return { projectType, ...commands, conventions };
  }

  return { projectType, ...commands, conventions };
}
