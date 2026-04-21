import * as vscode from "vscode";
import { bootstrapBrainFiles, getBrainStatus } from "./bootstrap.js";
import { WelcomeViewProvider } from "./sidebar/WelcomeViewProvider.js";
import { sanitizeError } from "./shared/sanitize.js";
import { DOCS_URL, MASTER_PROTECTED_FILE } from "./shared/constants.js";
import { setupAIMemory } from "./aiMemory.js";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext): void {
  try {
    activateInternal(context);
  } catch (err) {
    vscode.window
      .showErrorMessage(
        `Alex: Activation failed — ${sanitizeError(err)}`,
        "Reload Window",
      )
      .then((choice) => {
        if (choice === "Reload Window") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  }
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

function activateInternal(context: vscode.ExtensionContext): void {
  // Auto-detect Master Alex workspace and enable protection
  detectProtectedMode();

  // Enforce safety settings on every activation
  enforceSafetySettings();

  // --- Sidebar ---
  const welcomeProvider = new WelcomeViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      WelcomeViewProvider.viewId,
      welcomeProvider,
    ),
  );

  // Initial status refresh
  refreshSidebar(context, welcomeProvider);

  // --- Commands ---

  // Install / Update Brain
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.updateBrain", async () => {
      if (isProtected()) {
        vscode.window.showWarningMessage(
          "Alex: Protected mode is enabled. Brain updates are blocked in this workspace.",
        );
        return;
      }
      const choice = await vscode.window.showInformationMessage(
        "Install or update the Alex brain in this workspace?",
        "Install",
        "Cancel",
      );
      if (choice === "Install") {
        await bootstrapBrainFiles(context, true);
        await enforceSafetySettings();
        refreshSidebar(context, welcomeProvider);
      }
    }),
  );

  // Dream (Knowledge Consolidation)
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.dream", async () => {
      const terminal = vscode.window.createTerminal("Alex Dream");
      terminal.show();
      terminal.sendText("echo 'Dream state: consolidating knowledge...'");
      // Future: invoke dream-cli.ts or brain-qa.cjs
      vscode.window.showInformationMessage(
        "Alex: Dream session started. Check the terminal for output.",
      );
    }),
  );

  // Show Status
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.showStatus", () => {
      const status = getBrainStatus(context);
      const items: vscode.QuickPickItem[] = [
        {
          label: status.installed ? "$(check) Brain Installed" : "$(warning) Brain Not Installed",
          description: status.version
            ? `v${status.version}`
            : "Run 'Install Brain' to set up",
        },
        {
          label: "$(package) Bundled Version",
          description: `v${status.bundledVersion}`,
        },
        {
          label: "$(shield) Protected Mode",
          description: isProtected() ? "Enabled" : "Disabled",
        },
      ];
      vscode.window.showQuickPick(items, {
        title: "Alex — Brain Status",
        placeHolder: "Brain health overview",
      });
    }),
  );

  // Optimize Settings
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.optimizeSettings", async () => {
      const config = vscode.workspace.getConfiguration();

      // Settings that default to OFF and must be enabled for full Alex functionality.
      // Verified against VS Code Copilot Settings Reference (April 2026).
      const essentialUpdates: Array<{ key: string; value: unknown; label: string }> = [
        {
          key: "chat.useCustomAgentHooks",
          value: true,
          label: "Custom agent hooks",
        },
        {
          key: "github.copilot.chat.copilotMemory.enabled",
          value: false,
          label: "Copilot Memory disabled (PII safety — use AI-Memory instead)",
        },
        {
          key: "chat.customAgentInSubagent.enabled",
          value: true,
          label: "Custom agents in subagents",
        },
        {
          key: "chat.useNestedAgentsMdFiles",
          value: true,
          label: "Nested agent files",
        },
        {
          key: "chat.includeReferencedInstructions",
          value: true,
          label: "Referenced instructions",
        },
        {
          key: "github.copilot.chat.agent.thinkingTool",
          value: true,
          label: "Agent thinking tool",
        },
        {
          key: "chat.plugins.enabled",
          value: true,
          label: "Agent plugins",
        },
      ];

      const recommendedUpdates: Array<{ key: string; value: unknown; label: string }> = [
        {
          key: "chat.agent.maxRequests",
          value: 100,
          label: "Max agent requests → 100",
        },
        {
          key: "chat.notifyWindowOnConfirmation",
          value: "always",
          label: "OS notifications for confirmations",
        },
        {
          key: "chat.agentsControl.enabled",
          value: true,
          label: "Agent session status indicator",
        },
        {
          key: "chat.requestQueuing.defaultAction",
          value: "queue",
          label: "Request queuing → queue",
        },
        {
          key: "github.copilot.chat.localeOverride",
          value: "en",
          label: "Locale → English",
        },
      ];

      // Apply essential settings without asking
      const applied: string[] = [];
      for (const u of essentialUpdates) {
        const current = config.get(u.key);
        if (current !== u.value) {
          await config.update(u.key, u.value, vscode.ConfigurationTarget.Global);
          applied.push(u.label);
        }
      }

      // Ask before applying recommended settings
      const needsRecommended = recommendedUpdates.filter(
        (u) => config.get(u.key) !== u.value,
      );
      if (needsRecommended.length > 0) {
        const choice = await vscode.window.showInformationMessage(
          `Also apply ${needsRecommended.length} recommended setting(s)?`,
          "Yes",
          "Skip",
        );
        if (choice === "Yes") {
          for (const u of needsRecommended) {
            await config.update(u.key, u.value, vscode.ConfigurationTarget.Global);
            applied.push(u.label);
          }
        }
      }

      if (applied.length > 0) {
        vscode.window.showInformationMessage(
          `Alex: Applied ${applied.length} setting(s).`,
        );
        refreshSidebar(context, welcomeProvider);
      } else {
        vscode.window.showInformationMessage("Alex: Settings already optimized.");
      }
    }),
  );

  // Open Documentation
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.openDocs", () => {
      vscode.env.openExternal(vscode.Uri.parse(DOCS_URL));
    }),
  );

  // AI-Memory setup
  context.subscriptions.push(
    vscode.commands.registerCommand("alex.setupAIMemory", async () => {
      try {
        await setupAIMemory();
      } catch (err) {
        vscode.window.showErrorMessage(
          `AI-Memory setup failed: ${sanitizeError(err)}`,
        );
      }
    }),
  );

  // --- Status Bar ---
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    50,
  );
  statusBarItem.command = "alex.showStatus";
  updateStatusBar(statusBarItem, context);
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

function refreshSidebar(
  context: vscode.ExtensionContext,
  provider: WelcomeViewProvider,
): void {
  provider.updateStatus(getBrainStatus(context));
}

function updateStatusBar(
  item: vscode.StatusBarItem,
  context: vscode.ExtensionContext,
): void {
  const status = getBrainStatus(context);
  if (status.installed) {
    item.text = "$(brain) Alex";
    item.tooltip = `Alex Brain v${status.version ?? status.bundledVersion}`;
  } else {
    item.text = "$(brain) Alex (no brain)";
    item.tooltip = "Click to install Alex brain files";
  }
}

/**
 * Detect if this is the Master Alex workspace (source of truth).
 * If MASTER-ALEX-PROTECTED.json exists, auto-enable protection.
 */
function detectProtectedMode(): void {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) return;

  const protectedFile = path.join(folders[0].uri.fsPath, MASTER_PROTECTED_FILE);
  if (fs.existsSync(protectedFile)) {
    const config = vscode.workspace.getConfiguration("alex.workspace");
    if (!config.get<boolean>("protectedMode")) {
      config.update("protectedMode", true, vscode.ConfigurationTarget.Workspace);
    }
  }
}

function isProtected(): boolean {
  return vscode.workspace
    .getConfiguration("alex.workspace")
    .get<boolean>("protectedMode", false);
}

export function deactivate(): void {
  // Cleanup handled by disposables
}
