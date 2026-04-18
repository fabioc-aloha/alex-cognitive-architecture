"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode3 = __toESM(require("vscode"));

// src/bootstrap.ts
var vscode = __toESM(require("vscode"));
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));

// src/shared/constants.ts
var BRAIN_DIR = "brain-files";
var TARGET_DIR = ".github";
var VERSION_FILE = ".github/.alex-brain-version";
var DOCS_URL = "https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki";
var MASTER_PROTECTED_FILE = ".github/config/MASTER-ALEX-PROTECTED.json";

// src/bootstrap.ts
var BRAIN_SUBDIRS = [
  "instructions",
  "skills",
  "prompts",
  "agents",
  "muscles",
  "config",
  "hooks"
];
var BRAIN_ROOT_FILES = ["copilot-instructions.md"];
function getBundledVersion(context) {
  return context.extension.packageJSON.version;
}
function getInstalledVersion(workspaceRoot) {
  const versionPath = path.join(workspaceRoot, VERSION_FILE);
  try {
    return fs.readFileSync(versionPath, "utf-8").trim();
  } catch {
    return void 0;
  }
}
function copyDirSync(src, dest, destRoot) {
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
async function bootstrapBrainFiles(context, force = false) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage("Alex: Open a workspace folder first.");
    return false;
  }
  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const bundledVersion = getBundledVersion(context);
  const installedVersion = getInstalledVersion(workspaceRoot);
  const targetPath = path.join(workspaceRoot, TARGET_DIR);
  const needsInstall = force || !fs.existsSync(targetPath) || installedVersion !== bundledVersion;
  if (!needsInstall) {
    vscode.window.showInformationMessage(
      `Alex: Brain is up to date (v${bundledVersion}).`
    );
    return false;
  }
  const sourcePath = path.join(context.extensionUri.fsPath, BRAIN_DIR);
  if (!fs.existsSync(sourcePath)) {
    vscode.window.showWarningMessage(
      "Alex: Brain files not found in extension bundle."
    );
    return false;
  }
  try {
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
    for (const file of BRAIN_ROOT_FILES) {
      const srcFile = path.join(sourcePath, file);
      if (!fs.existsSync(srcFile)) continue;
      const destFile = path.join(githubDir, file);
      fs.copyFileSync(srcFile, destFile);
    }
    const versionPath = path.join(workspaceRoot, VERSION_FILE);
    fs.writeFileSync(versionPath, bundledVersion, "utf-8");
    const action = installedVersion ? "updated" : "installed";
    const settingsChoice = await vscode.window.showInformationMessage(
      `Alex: Brain ${action} (v${bundledVersion}). Configure recommended settings?`,
      "Optimize Settings",
      "Skip"
    );
    if (settingsChoice === "Optimize Settings") {
      vscode.commands.executeCommand("alex.optimizeSettings");
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Alex: Brain install failed \u2014 ${msg}`);
    return false;
  }
}
function getBrainStatus(context) {
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
    bundledVersion
  };
}

// src/sidebar/WelcomeViewProvider.ts
var vscode2 = __toESM(require("vscode"));

// src/shared/sanitize.ts
function sanitizeError(err) {
  const raw = err instanceof Error ? err.message : String(err);
  return raw.replace(/[A-Z]:\\[\w\\.\-\s]+/gi, "[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g, "[path]");
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// src/sidebar/WelcomeViewProvider.ts
var ESSENTIAL_SETTINGS = [
  { key: "chat.useCustomAgentHooks", label: "Custom agent hooks" },
  { key: "github.copilot.chat.copilotMemory.enabled", label: "Copilot Memory" },
  { key: "chat.customAgentInSubagent.enabled", label: "Custom agents in subagents" },
  { key: "chat.useNestedAgentsMdFiles", label: "Nested agent files" },
  { key: "chat.includeReferencedInstructions", label: "Referenced instructions" },
  { key: "github.copilot.chat.agent.thinkingTool", label: "Agent thinking tool" },
  { key: "chat.plugins.enabled", label: "Agent plugins" }
];
function checkEssentialSettings() {
  const config = vscode2.workspace.getConfiguration();
  const missing = [];
  for (const s of ESSENTIAL_SETTINGS) {
    if (config.get(s.key) !== true) {
      missing.push(s.label);
    }
  }
  return {
    configured: ESSENTIAL_SETTINGS.length - missing.length,
    total: ESSENTIAL_SETTINGS.length,
    missing
  };
}
var WelcomeViewProvider = class {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
  }
  extensionUri;
  static viewId = "alex.welcomeView";
  view;
  brainStatus = {
    installed: false,
    bundledVersion: "unknown"
  };
  settingsStatus = { configured: 0, total: 7, missing: [] };
  /** Update brain status and refresh the webview. */
  updateStatus(status) {
    this.brainStatus = status;
    this.settingsStatus = checkEssentialSettings();
    if (this.view) {
      this.view.webview.html = this.getHtml(this.view.webview);
    }
  }
  resolveWebviewView(webviewView, _context, _token) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };
    this.settingsStatus = checkEssentialSettings();
    webviewView.webview.html = this.getHtml(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((msg) => {
      switch (msg.command) {
        case "updateBrain":
          vscode2.commands.executeCommand("alex.updateBrain");
          break;
        case "dream":
          vscode2.commands.executeCommand("alex.dream");
          break;
        case "showStatus":
          vscode2.commands.executeCommand("alex.showStatus");
          break;
        case "optimizeSettings":
          vscode2.commands.executeCommand("alex.optimizeSettings");
          break;
        case "openDocs":
          vscode2.commands.executeCommand("alex.openDocs");
          break;
      }
    });
  }
  getHtml(webview) {
    const nonce = getNonce();
    const { installed, version, bundledVersion } = this.brainStatus;
    const statusIcon = installed ? "check" : "warning";
    const statusText = installed ? `Brain v${escapeHtml(version ?? bundledVersion)}` : "Brain not installed";
    const statusClass = installed ? "status-ok" : "status-warn";
    const updateLabel = installed ? "Update Brain" : "Install Brain";
    const { configured, total, missing } = this.settingsStatus;
    const allConfigured = missing.length === 0;
    const settingsIcon = allConfigured ? "&#x2713;" : "&#x26A0;";
    const settingsClass = allConfigured ? "status-ok" : "status-warn";
    const settingsSummary = allConfigured ? `All ${total} essential settings configured` : `${configured}/${total} essential settings configured`;
    const missingListHtml = missing.map((m) => `<li>${escapeHtml(m)}</li>`).join("\n        ");
    return (
      /* html */
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <style nonce="${nonce}">
    :root {
      --section-gap: 12px;
    }
    body {
      padding: 0 12px 12px;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
    }
    h2 {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: var(--section-gap) 0 8px;
      color: var(--vscode-foreground);
    }
    .status-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      border-radius: 4px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border, transparent);
      margin-bottom: var(--section-gap);
    }
    .status-ok .dot { color: var(--vscode-testing-iconPassed, #73c991); }
    .status-warn .dot { color: var(--vscode-testing-iconFailed, #f48771); }
    .dot { font-size: 16px; }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    button {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 6px 10px;
      border: none;
      border-radius: 4px;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      cursor: pointer;
      text-align: left;
    }
    button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    button.primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    button.primary:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .links {
      margin-top: var(--section-gap);
    }
    .links a {
      display: block;
      padding: 4px 0;
      color: var(--vscode-textLink-foreground);
      text-decoration: none;
    }
    .links a:hover {
      text-decoration: underline;
    }
    .setup-checklist {
      margin: 4px 0 8px;
      padding: 0 0 0 18px;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }
    .setup-checklist li {
      padding: 1px 0;
    }
  </style>
</head>
<body>
  <div class="status-bar ${statusClass}">
    <span class="dot">${statusIcon === "check" ? "&#x2713;" : "&#x26A0;"}</span>
    <span>${statusText}</span>
  </div>

  <h2>Actions</h2>
  <div class="actions">
    <button class="primary" data-command="updateBrain">${escapeHtml(updateLabel)}</button>
    <button data-command="dream">Dream (Consolidate Knowledge)</button>
    <button data-command="showStatus">Show Status</button>
    <button data-command="optimizeSettings">Optimize Settings</button>
  </div>

  <h2>Setup</h2>
  <div class="status-bar ${settingsClass}">
    <span class="dot">${settingsIcon}</span>
    <span>${settingsSummary}</span>
  </div>
  ${!allConfigured ? `<ul class="setup-checklist">${missingListHtml}</ul>
  <div class="actions">
    <button class="primary" data-command="optimizeSettings">Fix Settings</button>
  </div>` : ""}

  <h2>Resources</h2>
  <div class="links">
    <a href="#" data-command="openDocs">Documentation &amp; Wiki</a>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('[data-command]');
      if (target) {
        e.preventDefault();
        vscode.postMessage({ command: target.dataset.command });
      }
    });
  </script>
</body>
</html>`
    );
  }
};
function getNonce() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

// src/extension.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
function activate(context) {
  try {
    activateInternal(context);
  } catch (err) {
    vscode3.window.showErrorMessage(
      `Alex: Activation failed \u2014 ${sanitizeError(err)}`,
      "Reload Window"
    ).then((choice) => {
      if (choice === "Reload Window") {
        vscode3.commands.executeCommand("workbench.action.reloadWindow");
      }
    });
  }
}
function activateInternal(context) {
  detectProtectedMode();
  const welcomeProvider = new WelcomeViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode3.window.registerWebviewViewProvider(
      WelcomeViewProvider.viewId,
      welcomeProvider
    )
  );
  refreshSidebar(context, welcomeProvider);
  context.subscriptions.push(
    vscode3.commands.registerCommand("alex.updateBrain", async () => {
      if (isProtected()) {
        vscode3.window.showWarningMessage(
          "Alex: Protected mode is enabled. Brain updates are blocked in this workspace."
        );
        return;
      }
      const choice = await vscode3.window.showInformationMessage(
        "Install or update the Alex brain in this workspace?",
        "Install",
        "Cancel"
      );
      if (choice === "Install") {
        await bootstrapBrainFiles(context, true);
        refreshSidebar(context, welcomeProvider);
      }
    })
  );
  context.subscriptions.push(
    vscode3.commands.registerCommand("alex.dream", async () => {
      const terminal = vscode3.window.createTerminal("Alex Dream");
      terminal.show();
      terminal.sendText("echo 'Dream state: consolidating knowledge...'");
      vscode3.window.showInformationMessage(
        "Alex: Dream session started. Check the terminal for output."
      );
    })
  );
  context.subscriptions.push(
    vscode3.commands.registerCommand("alex.showStatus", () => {
      const status = getBrainStatus(context);
      const items = [
        {
          label: status.installed ? "$(check) Brain Installed" : "$(warning) Brain Not Installed",
          description: status.version ? `v${status.version}` : "Run 'Install Brain' to set up"
        },
        {
          label: "$(package) Bundled Version",
          description: `v${status.bundledVersion}`
        },
        {
          label: "$(shield) Protected Mode",
          description: isProtected() ? "Enabled" : "Disabled"
        }
      ];
      vscode3.window.showQuickPick(items, {
        title: "Alex \u2014 Brain Status",
        placeHolder: "Brain health overview"
      });
    })
  );
  context.subscriptions.push(
    vscode3.commands.registerCommand("alex.optimizeSettings", async () => {
      const config = vscode3.workspace.getConfiguration();
      const essentialUpdates = [
        {
          key: "chat.useCustomAgentHooks",
          value: true,
          label: "Custom agent hooks"
        },
        {
          key: "github.copilot.chat.copilotMemory.enabled",
          value: true,
          label: "Copilot Memory"
        },
        {
          key: "chat.customAgentInSubagent.enabled",
          value: true,
          label: "Custom agents in subagents"
        },
        {
          key: "chat.useNestedAgentsMdFiles",
          value: true,
          label: "Nested agent files"
        },
        {
          key: "chat.includeReferencedInstructions",
          value: true,
          label: "Referenced instructions"
        },
        {
          key: "github.copilot.chat.agent.thinkingTool",
          value: true,
          label: "Agent thinking tool"
        },
        {
          key: "chat.plugins.enabled",
          value: true,
          label: "Agent plugins"
        }
      ];
      const recommendedUpdates = [
        {
          key: "chat.agent.maxRequests",
          value: 100,
          label: "Max agent requests \u2192 100"
        },
        {
          key: "chat.notifyWindowOnConfirmation",
          value: "always",
          label: "OS notifications for confirmations"
        },
        {
          key: "chat.agentsControl.enabled",
          value: true,
          label: "Agent session status indicator"
        },
        {
          key: "chat.requestQueuing.defaultAction",
          value: "queue",
          label: "Request queuing \u2192 queue"
        },
        {
          key: "github.copilot.chat.localeOverride",
          value: "en",
          label: "Locale \u2192 English"
        }
      ];
      const applied = [];
      for (const u of essentialUpdates) {
        const current = config.get(u.key);
        if (current !== u.value) {
          await config.update(u.key, u.value, vscode3.ConfigurationTarget.Global);
          applied.push(u.label);
        }
      }
      const needsRecommended = recommendedUpdates.filter(
        (u) => config.get(u.key) !== u.value
      );
      if (needsRecommended.length > 0) {
        const choice = await vscode3.window.showInformationMessage(
          `Also apply ${needsRecommended.length} recommended setting(s)?`,
          "Yes",
          "Skip"
        );
        if (choice === "Yes") {
          for (const u of needsRecommended) {
            await config.update(u.key, u.value, vscode3.ConfigurationTarget.Global);
            applied.push(u.label);
          }
        }
      }
      if (applied.length > 0) {
        vscode3.window.showInformationMessage(
          `Alex: Applied ${applied.length} setting(s).`
        );
        refreshSidebar(context, welcomeProvider);
      } else {
        vscode3.window.showInformationMessage("Alex: Settings already optimized.");
      }
    })
  );
  context.subscriptions.push(
    vscode3.commands.registerCommand("alex.openDocs", () => {
      vscode3.env.openExternal(vscode3.Uri.parse(DOCS_URL));
    })
  );
  const statusBarItem = vscode3.window.createStatusBarItem(
    vscode3.StatusBarAlignment.Right,
    50
  );
  statusBarItem.command = "alex.showStatus";
  updateStatusBar(statusBarItem, context);
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}
function refreshSidebar(context, provider) {
  provider.updateStatus(getBrainStatus(context));
}
function updateStatusBar(item, context) {
  const status = getBrainStatus(context);
  if (status.installed) {
    item.text = "$(brain) Alex";
    item.tooltip = `Alex Brain v${status.version ?? status.bundledVersion}`;
  } else {
    item.text = "$(brain) Alex (no brain)";
    item.tooltip = "Click to install Alex brain files";
  }
}
function detectProtectedMode() {
  const folders = vscode3.workspace.workspaceFolders;
  if (!folders) return;
  const protectedFile = path2.join(folders[0].uri.fsPath, MASTER_PROTECTED_FILE);
  if (fs2.existsSync(protectedFile)) {
    const config = vscode3.workspace.getConfiguration("alex.workspace");
    if (!config.get("protectedMode")) {
      config.update("protectedMode", true, vscode3.ConfigurationTarget.Workspace);
    }
  }
}
function isProtected() {
  return vscode3.workspace.getConfiguration("alex.workspace").get("protectedMode", false);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
