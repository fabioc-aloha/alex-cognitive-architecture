import * as vscode from "vscode";
import { escapeHtml } from "../shared/sanitize.js";

interface BrainStatus {
  installed: boolean;
  version?: string;
  bundledVersion: string;
}

export class WelcomeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "alex.welcomeView";

  private view?: vscode.WebviewView;
  private brainStatus: BrainStatus = {
    installed: false,
    bundledVersion: "unknown",
  };

  constructor(private readonly extensionUri: vscode.Uri) {}

  /** Update brain status and refresh the webview. */
  public updateStatus(status: BrainStatus): void {
    this.brainStatus = status;
    if (this.view) {
      this.view.webview.html = this.getHtml(this.view.webview);
    }
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((msg: { command: string }) => {
      switch (msg.command) {
        case "updateBrain":
          vscode.commands.executeCommand("alex.updateBrain");
          break;
        case "dream":
          vscode.commands.executeCommand("alex.dream");
          break;
        case "showStatus":
          vscode.commands.executeCommand("alex.showStatus");
          break;
        case "optimizeSettings":
          vscode.commands.executeCommand("alex.optimizeSettings");
          break;
        case "openDocs":
          vscode.commands.executeCommand("alex.openDocs");
          break;
      }
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = getNonce();
    const { installed, version, bundledVersion } = this.brainStatus;

    const statusIcon = installed ? "check" : "warning";
    const statusText = installed
      ? `Brain v${escapeHtml(version ?? bundledVersion)}`
      : "Brain not installed";
    const statusClass = installed ? "status-ok" : "status-warn";

    const updateLabel = installed ? "Update Brain" : "Install Brain";

    return /* html */ `<!DOCTYPE html>
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
</html>`;
  }
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
