import * as vscode from "vscode";
import { bootstrapBrainFiles, getBrainStatus } from "./bootstrap.js";
import { WelcomeViewProvider } from "./sidebar/WelcomeViewProvider.js";
import { sanitizeError } from "./shared/sanitize.js";
import { DOCS_URL, MASTER_PROTECTED_FILE } from "./shared/constants.js";
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

function activateInternal(context: vscode.ExtensionContext): void {
  // Auto-detect Master Alex workspace and enable protection
  detectProtectedMode();

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
        bootstrapBrainFiles(context, true);
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
      const updates: Array<{ key: string; value: unknown; label: string }> = [
        {
          key: "editor.inlineSuggest.enabled",
          value: true,
          label: "Enable inline suggestions",
        },
        {
          key: "github.copilot.chat.agent.thinkingTool",
          value: true,
          label: "Enable Copilot thinking tool",
        },
      ];

      const applied: string[] = [];
      for (const u of updates) {
        const current = config.get(u.key);
        if (current !== u.value) {
          await config.update(u.key, u.value, vscode.ConfigurationTarget.Global);
          applied.push(u.label);
        }
      }

      if (applied.length > 0) {
        vscode.window.showInformationMessage(
          `Alex: Applied ${applied.length} setting(s): ${applied.join(", ")}.`,
        );
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
