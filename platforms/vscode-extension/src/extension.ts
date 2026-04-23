import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { chatHandler } from "./chat/handler.js";
import { WelcomeViewProvider } from "./sidebar/WelcomeViewProvider.js";
import { detectProject } from "./sidebar/projectDetector.js";
import { writeLoopConfig, setProjectPhase } from "./sidebar/loopConfigGenerator.js";
import { setupAIMemory, resolveAIMemoryPath, getAIMemoryStatus } from "./aiMemory.js";
import { createAgentStatusBar, updateAgentStatusBar } from "./sidebar/agentActivity.js";
import { AgentActivityProvider } from "./sidebar/agentActivityTreeView.js";
import { initRunStore } from "./sidebar/scheduledTasks.js";
import { bootstrapBrainFiles, checkAutoUpgrade, getBrainStatus } from "./bootstrap.js";
import { muscleAndPrompt, runMuscle, runMuscleInTerminal } from "./muscleRunner.js";
import { statusBarRefreshInterval } from "./settings.js";

/**
 * Sanitize error messages for user display — strips file system paths
 * that could leak internal directory structure.
 */
function sanitizeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return raw
    .replace(/[A-Z]:\\[\w\\.\-\s]+/gi, "[path]")
    .replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g, "[path]");
}

/**
 * Enforce safety-critical VS Code settings.
 * Copilot Memory (chat memory) is disabled because it auto-loads /memories/
 * files into every LLM prompt — creating uncontrolled PII exposure via cloud sync.
 * Alex uses AI-Memory (OneDrive) and .github/instructions/ instead.
 */
async function enforceSafetySettings(): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  const key = "github.copilot.chat.copilotMemory.enabled";
  if (config.get(key) !== false) {
    await config.update(key, false, vscode.ConfigurationTarget.Global);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  // Enforce safety settings on every activation
  enforceSafetySettings();

  // Initialize persistent run store for scheduled task tracking
  initRunStore(context.workspaceState);

  // Chat participant
  const participant = vscode.chat.createChatParticipant(
    "alex.chat",
    chatHandler,
  );
  participant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    "assets",
    "icon.png",
  );
  participant.followupProvider = {
    provideFollowups(_result, _context) {
      return [
        { prompt: "Run brain health check", label: "Brain Health Check" },
      ];
    },
  };
  context.subscriptions.push(participant);

  // Sidebar welcome panel
  const welcomeProvider = new WelcomeViewProvider(
    context.extensionUri,
    context.globalState,
  );
  context.subscriptions.push(welcomeProvider);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      WelcomeViewProvider.viewId,
      welcomeProvider,
    ),
  );

  // Status bar — agent activity badge (AP6)
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  createAgentStatusBar(context);
  updateAgentStatusBar(workspaceRoot);

  // Refresh status bar periodically
  const statusTimer = setInterval(() => {
    updateAgentStatusBar(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
  }, statusBarRefreshInterval());
  context.subscriptions.push({ dispose: () => clearInterval(statusTimer) });

  // Agent Activity TreeView (CL1)
  const agentActivityProvider = new AgentActivityProvider(workspaceRoot);
  context.subscriptions.push(
    vscode.window.createTreeView("alex.agentActivity", {
      treeDataProvider: agentActivityProvider,
    }),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.refreshAgentActivity", () => {
      agentActivityProvider.refresh();
    }),
  );

  // Auto-refresh TreeView when metrics state file changes
  if (workspaceRoot) {
    const metricsPattern = new vscode.RelativePattern(workspaceRoot, ".agent-metrics-state.json");
    const metricsWatcher = vscode.workspace.createFileSystemWatcher(metricsPattern);
    metricsWatcher.onDidChange(() => agentActivityProvider.refresh());
    metricsWatcher.onDidCreate(() => agentActivityProvider.refresh());
    context.subscriptions.push(metricsWatcher);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.refreshWelcome", () => {
      welcomeProvider.refresh();
    }),
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.openChat", () => {
      vscode.commands.executeCommand("workbench.action.chat.open");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.dream", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      try {
        // Muscle first: run brain-qa to generate health grid
        await muscleAndPrompt(
          wsRoot,
          "brain-qa.cjs",
          [],
          "Alex: Brain QA",
          "Review the brain health grid at .github/quality/brain-health-grid.md and fix the top priority issues",
        );
      } catch (err) {
        vscode.window.showErrorMessage(
          `Dream protocol failed: ${sanitizeError(err)}`,
        );
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.initialize", async () => {
      try {
        await enforceSafetySettings();
        const choice = await vscode.window.showInformationMessage(
          "Install the Alex brain in this workspace?",
          "Install",
          "Cancel",
        );
        if (choice === "Install") {
          const installed = await bootstrapBrainFiles(context, true);
          if (installed) {
            await enforceSafetySettings();
            welcomeProvider.refresh();
          }
        }
      } catch (err) {
        vscode.window.showErrorMessage(
          `Initialize failed: ${sanitizeError(err)}`,
        );
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.upgrade", async () => {
      try {
        await enforceSafetySettings();
        const status = getBrainStatus(context);
        if (!status.needsUpgrade && status.installed) {
          vscode.window.showInformationMessage(
            `Alex: Brain is already up to date (v${status.bundledVersion}).`,
          );
          return;
        }
        const from = status.version ?? "not installed";
        const choice = await vscode.window.showInformationMessage(
          `Upgrade Alex brain from v${from} to v${status.bundledVersion}? A backup will be created.`,
          "Upgrade",
          "Cancel",
        );
        if (choice !== "Upgrade") return;
        const installed = await bootstrapBrainFiles(context, true);
        if (installed) {
          await enforceSafetySettings();
          welcomeProvider.refresh();
        }
      } catch (err) {
        vscode.window.showErrorMessage(
          `Upgrade failed: ${sanitizeError(err)}`,
        );
      }
    }),
  );

  // AI-Memory setup (standalone command)
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.setupAIMemory", async () => {
      try {
        await setupAIMemory();
        welcomeProvider.refresh();
      } catch (err) {
        vscode.window.showErrorMessage(
          `AI-Memory setup failed: ${sanitizeError(err)}`,
        );
      }
    }),
  );

  // Generate project-specific loop config
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.generateLoopConfig", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      try {
        const ctx = detectProject(wsRoot);
        const ok = writeLoopConfig(wsRoot, ctx);
        if (ok) {
          vscode.window.showInformationMessage(
            `Alex: Loop config generated for ${ctx.projectType} project (${ctx.conventions.length} conventions detected).`,
          );
        } else {
          vscode.window.showErrorMessage("Alex: Failed to write loop config.");
        }
      } catch (err) {
        vscode.window.showErrorMessage(
          `Alex: Loop config generation failed — ${sanitizeError(err)}`,
        );
      }
    }),
  );

  // Set project lifecycle phase
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.setProjectPhase", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      const phases = [
        { label: "Planning", description: "Ideation, research, and design", value: "planning" },
        { label: "Active Development", description: "Building features and writing code", value: "active-development" },
        { label: "Testing", description: "QA, integration tests, and validation", value: "testing" },
        { label: "Release", description: "Packaging, publishing, and deployment", value: "release" },
        { label: "Maintenance", description: "Bug fixes, upgrades, and monitoring", value: "maintenance" },
      ] as const;
      const picked = await vscode.window.showQuickPick(
        phases.map((p) => ({ label: p.label, description: p.description, value: p.value })),
        { placeHolder: "Select the current project phase" },
      );
      if (!picked) return;
      const ok = setProjectPhase(wsRoot, picked.value);
      if (ok) {
        welcomeProvider.refresh();
        vscode.window.showInformationMessage(
          `Alex: Project phase set to "${picked.label}".`,
        );
      } else {
        vscode.window.showErrorMessage(
          "Alex: Failed to update project phase. Generate a loop config first.",
        );
      }
    }),
  );

  // File converter commands — run muscle scripts via terminal
  const converterMuscles: Record<string, { muscle: string; label: string; srcExt: string }> = {
    "alex.convertMdToHtml": { muscle: "md-to-html.cjs", label: "HTML", srcExt: ".md" },
    "alex.convertMdToWord": { muscle: "md-to-word.cjs", label: "Word", srcExt: ".md" },
    "alex.convertMdToEml": { muscle: "md-to-eml.cjs", label: "Email", srcExt: ".md" },
    "alex.convertMdToPdf": { muscle: "md-to-pdf.cjs", label: "PDF", srcExt: ".md" },
    "alex.convertMdToPptx": { muscle: "md-to-pptx.cjs", label: "PowerPoint", srcExt: ".md" },
    "alex.convertMdToEpub": { muscle: "md-to-epub.cjs", label: "EPUB", srcExt: ".md" },
    "alex.convertMdToLatex": { muscle: "md-to-latex.cjs", label: "LaTeX", srcExt: ".md" },
    "alex.convertMdToTxt": { muscle: "md-to-txt.cjs", label: "Plain Text", srcExt: ".md" },
    "alex.convertDocxToMd": { muscle: "docx-to-md.cjs", label: "Markdown", srcExt: ".docx" },
    "alex.convertHtmlToMd": { muscle: "html-to-md.cjs", label: "Markdown", srcExt: ".html" },
    "alex.convertPptxToMd": { muscle: "pptx-to-md.cjs", label: "Markdown", srcExt: ".pptx" },
  };

  for (const [cmdId, cfg] of Object.entries(converterMuscles)) {
    context.subscriptions.push(
      vscode.commands.registerCommand(cmdId, async (uri?: vscode.Uri) => {
        const fileUri = uri ?? vscode.window.activeTextEditor?.document.uri;
        if (!fileUri || fileUri.scheme !== "file") {
          vscode.window.showWarningMessage("Alex: Select a file to convert.");
          return;
        }
        if (!fileUri.fsPath.endsWith(cfg.srcExt)) {
          vscode.window.showWarningMessage(
            `Alex: This converter requires a ${cfg.srcExt} file.`,
          );
          return;
        }
        const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!wsRoot) {
          vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
          return;
        }
        const musclePath = path.join(wsRoot, ".github", "muscles", cfg.muscle);
        const filePath = fileUri.fsPath;
        const terminal = vscode.window.createTerminal(`Alex: Convert → ${cfg.label}`);
        terminal.show();
        terminal.sendText(`node "${musclePath}" "${filePath}"`);
      }),
    );
  }

  // ── Muscle-backed commands ──────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.brainQA", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      await muscleAndPrompt(wsRoot, "brain-qa.cjs", [], "Alex: Brain QA");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.validateSkills", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      await muscleAndPrompt(
        wsRoot,
        "validate-skills.cjs",
        [],
        "Alex: Validate Skills",
        "Review the skill validation results and fix any issues found",
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.markdownLint", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const fileUri = vscode.window.activeTextEditor?.document.uri;
      if (!wsRoot || !fileUri || fileUri.scheme !== "file") {
        vscode.window.showWarningMessage("Alex: Open a markdown file first.");
        return;
      }
      await muscleAndPrompt(
        wsRoot,
        "markdown-lint.cjs",
        [fileUri.fsPath],
        "Alex: Markdown Lint",
        "Fix the markdown lint issues found in the current file",
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.tokenCostReport", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      await muscleAndPrompt(
        wsRoot,
        "token-cost-report.cjs",
        [],
        "Alex: Token Cost Report",
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.newSkill", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      const name = await vscode.window.showInputBox({
        prompt: "Skill name (kebab-case, e.g., my-new-skill)",
        placeHolder: "my-new-skill",
        validateInput: (v) =>
          /^[a-z][a-z0-9-]*$/.test(v) ? null : "Use kebab-case (lowercase, hyphens)",
      });
      if (!name) return;
      const desc = await vscode.window.showInputBox({
        prompt: "Skill description",
        placeHolder: "What does this skill do?",
      });
      const args = [name];
      if (desc) args.push("--description", desc);
      await muscleAndPrompt(
        wsRoot,
        "new-skill.cjs",
        args,
        "Alex: New Skill",
        `Customize the new skill ${name} — fill in the SKILL.md with real content and create the matching instruction file`,
      );
    }),
  );

  // TM1: Create Custom Agent
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.createCustomAgent", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      const name = await vscode.window.showInputBox({
        prompt: "Agent name (e.g., Code Reviewer, Data Analyst)",
        placeHolder: "My Custom Agent",
        validateInput: (v) =>
          v.trim().length > 0 ? null : "Agent name cannot be empty",
      });
      if (!name) return;
      const desc = await vscode.window.showInputBox({
        prompt: "Agent description (one sentence)",
        placeHolder: "What does this agent specialize in?",
      });
      if (desc === undefined) return;

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const filename = `${slug}.agent.md`;
      const agentsDir = path.join(wsRoot, ".github", "agents");
      const filePath = path.join(agentsDir, filename);

      if (fs.existsSync(filePath)) {
        vscode.window.showWarningMessage(`Agent file already exists: .github/agents/${filename}`);
        await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(filePath));
        return;
      }

      const template = [
        "---",
        `description: "${desc.replace(/"/g, "'") || name + " - custom agent"}"`,
        `name: "${name}"`,
        'model: ["Claude Sonnet 4", "GPT-4o"]',
        "tools:",
        '  ["search", "codebase", "problems", "usages", "runSubagent", "fetch", "agent"]',
        "user-invocable: true",
        "---",
        "",
        `# ${name}`,
        "",
        `You are **Alex** in **${name}** mode.`,
        "",
        "## Purpose",
        "",
        desc || "Describe this agent's purpose and expertise.",
        "",
        "## Instructions",
        "",
        "1. Follow the project's existing conventions",
        "2. Verify your work before declaring done",
        "3. Ask for clarification when requirements are ambiguous",
        "",
        "## Relevant Skills",
        "",
        "<!-- List skills this agent should load, e.g.:",
        "- `.github/skills/api-design/SKILL.md`",
        "-->",
        "",
      ].join("\n");

      fs.mkdirSync(agentsDir, { recursive: true });
      fs.writeFileSync(filePath, template, "utf-8");
      await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(filePath));
      vscode.window.showInformationMessage(
        `Alex: Custom agent "${name}" created at .github/agents/${filename}`,
      );
    }),
  );

  // TM6: Set active package context for monorepo
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.setContext", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }

      // Discover packages from common monorepo patterns
      const packages: { label: string; description: string; dir: string }[] = [];

      // npm/yarn workspaces
      const pkgPath = path.join(wsRoot, "package.json");
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
          const workspaces: string[] = Array.isArray(pkg.workspaces)
            ? pkg.workspaces
            : (pkg.workspaces?.packages ?? []);
          for (const pattern of workspaces) {
            // Resolve simple glob patterns like "packages/*"
            const base = pattern.replace(/\/\*$/, "");
            const baseDir = path.join(wsRoot, base);
            if (fs.existsSync(baseDir)) {
              for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
                if (!entry.isDirectory()) continue;
                const childPkg = path.join(baseDir, entry.name, "package.json");
                if (fs.existsSync(childPkg)) {
                  try {
                    const child = JSON.parse(fs.readFileSync(childPkg, "utf-8"));
                    packages.push({
                      label: child.name ?? entry.name,
                      description: path.relative(wsRoot, path.join(baseDir, entry.name)),
                      dir: path.join(baseDir, entry.name),
                    });
                  } catch { /* skip invalid package.json */ }
                }
              }
            }
          }
        } catch { /* skip */ }
      }

      // pnpm-workspace.yaml
      const pnpmWs = path.join(wsRoot, "pnpm-workspace.yaml");
      if (packages.length === 0 && fs.existsSync(pnpmWs)) {
        try {
          const content = fs.readFileSync(pnpmWs, "utf-8");
          const matches = content.match(/- ['"](.*?)['"]/g) ?? [];
          for (const m of matches) {
            const pattern = m.replace(/- ['"](.*)['"]/,  "$1").replace(/\/\*$/, "");
            const baseDir = path.join(wsRoot, pattern);
            if (fs.existsSync(baseDir)) {
              for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
                if (!entry.isDirectory()) continue;
                packages.push({
                  label: entry.name,
                  description: path.relative(wsRoot, path.join(baseDir, entry.name)),
                  dir: path.join(baseDir, entry.name),
                });
              }
            }
          }
        } catch { /* skip */ }
      }

      // Also add known directories (platforms/, packages/, apps/)
      if (packages.length === 0) {
        for (const subdir of ["platforms", "packages", "apps", "libs"]) {
          const dir = path.join(wsRoot, subdir);
          if (fs.existsSync(dir)) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
              if (!entry.isDirectory()) continue;
              packages.push({
                label: entry.name,
                description: `${subdir}/${entry.name}`,
                dir: path.join(dir, entry.name),
              });
            }
          }
        }
      }

      // Add root as option
      packages.unshift({
        label: "(root)",
        description: "Workspace root",
        dir: wsRoot,
      });

      const picked = await vscode.window.showQuickPick(packages, {
        placeHolder: "Select the active package context",
        title: "Set Active Package",
      });
      if (!picked) return;

      // Write the active context to loop-menu.json
      const configPath = path.join(wsRoot, ".github", "config", "loop-menu.json");
      try {
        let config: Record<string, unknown> = {};
        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        }
        config.activePackage = picked.label === "(root)" ? null : picked.description;
        config.activePackageName = picked.label === "(root)" ? null : picked.label;
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
        welcomeProvider.refresh();
        vscode.window.showInformationMessage(
          picked.label === "(root)"
            ? "Alex: Active context set to workspace root."
            : `Alex: Active context set to "${picked.label}" (${picked.description}).`,
        );
      } catch (err) {
        vscode.window.showErrorMessage(
          `Alex: Failed to update context — ${sanitizeError(err)}`,
        );
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("alex.insightPipeline", async () => {
      const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!wsRoot) {
        vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
        return;
      }
      await muscleAndPrompt(
        wsRoot,
        "insight-pipeline.cjs",
        [],
        "Alex: Insight Pipeline",
        "Review the extracted insights and promote the most valuable ones to global knowledge",
      );
    }),
  );

  // File watcher: hot-reload sidebar when loop config or prompts change
  const loopConfigWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      vscode.workspace.workspaceFolders?.[0] ?? "",
      ".github/config/loop-menu.json",
    ),
  );
  const loopPromptWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      vscode.workspace.workspaceFolders?.[0] ?? "",
      ".github/prompts/loop/*.prompt.md",
    ),
  );
  const skillPartialWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      vscode.workspace.workspaceFolders?.[0] ?? "",
      ".github/skills/*/loop-config.partial.json",
    ),
  );
  const refreshOnChange = () => welcomeProvider.refresh();
  context.subscriptions.push(
    loopConfigWatcher,
    loopConfigWatcher.onDidChange(refreshOnChange),
    loopConfigWatcher.onDidCreate(refreshOnChange),
    loopConfigWatcher.onDidDelete(refreshOnChange),
    loopPromptWatcher,
    loopPromptWatcher.onDidChange(refreshOnChange),
    loopPromptWatcher.onDidCreate(refreshOnChange),
    loopPromptWatcher.onDidDelete(refreshOnChange),
    skillPartialWatcher,
    skillPartialWatcher.onDidChange(refreshOnChange),
    skillPartialWatcher.onDidCreate(refreshOnChange),
    skillPartialWatcher.onDidDelete(refreshOnChange),
  );

  // Auto-upgrade: check if bundled brain is newer than installed
  checkAutoUpgrade(context).then(() => {
    welcomeProvider.refresh();
  });
}

export function deactivate(): void {
  // Cleanup handled by disposables in context.subscriptions
}
