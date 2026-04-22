import * as vscode from "vscode";
import * as path from "path";
import { chatHandler } from "./chat/handler.js";
import { WelcomeViewProvider } from "./sidebar/WelcomeViewProvider.js";
import { detectProject } from "./sidebar/projectDetector.js";
import { writeLoopConfig, setProjectPhase } from "./sidebar/loopConfigGenerator.js";
import { setupAIMemory, resolveAIMemoryPath, getAIMemoryStatus } from "./aiMemory.js";
import { createAgentStatusBar, updateAgentStatusBar } from "./sidebar/agentActivity.js";
import { AgentActivityProvider } from "./sidebar/agentActivityTreeView.js";
import { initRunStore } from "./sidebar/scheduledTasks.js";

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
    provideFollowups() {
      return [
        { prompt: "/autopilot list", label: "List Autopilot Tasks", command: "autopilot" },
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

  // Refresh status bar periodically (every 5 minutes)
  const statusTimer = setInterval(() => {
    updateAgentStatusBar(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
  }, 5 * 60 * 1000);
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
      try {
        await vscode.commands.executeCommand("workbench.action.chat.open", {
          query: "/dream",
        });
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
        // Enforce safety settings during initialization
        await enforceSafetySettings();

        // Ensure AI-Memory is set up before initializing the workspace
        const memPath = resolveAIMemoryPath();
        if (!memPath) {
          const setup = await vscode.window.showInformationMessage(
            "Alex: Set up AI-Memory for cross-project knowledge sharing?",
            "Setup AI-Memory",
            "Skip",
          );
          if (setup === "Setup AI-Memory") {
            await setupAIMemory();
          }
        }
        await vscode.commands.executeCommand("workbench.action.chat.open", {
          query: "Initialize this workspace with Alex's cognitive architecture",
        });
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
        // Enforce safety settings during upgrade
        await enforceSafetySettings();

        // Check AI-Memory during upgrade — offer setup if not found
        const memPath = resolveAIMemoryPath();
        if (!memPath) {
          const setup = await vscode.window.showInformationMessage(
            "Alex: AI-Memory not found. Set it up for cross-project knowledge sharing?",
            "Setup AI-Memory",
            "Skip",
          );
          if (setup === "Setup AI-Memory") {
            await setupAIMemory();
          }
        }
        await vscode.commands.executeCommand("workbench.action.chat.open", {
          query: "Upgrade this workspace's cognitive architecture to the latest version",
        });
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
    "alex.convertDocxToMd": { muscle: "docx-to-md.cjs", label: "Markdown", srcExt: ".docx" },
  };

  for (const [cmdId, cfg] of Object.entries(converterMuscles)) {
    context.subscriptions.push(
      vscode.commands.registerCommand(cmdId, async (uri?: vscode.Uri) => {
        const fileUri = uri ?? vscode.window.activeTextEditor?.document.uri;
        if (!fileUri || fileUri.scheme !== "file") {
          vscode.window.showWarningMessage("Alex: Select a file to convert.");
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
}

export function deactivate(): void {
  // Cleanup handled by disposables in context.subscriptions
}
