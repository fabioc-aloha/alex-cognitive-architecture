"use strict";var W=Object.create;var f=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var _=Object.getOwnPropertyNames;var O=Object.getPrototypeOf,U=Object.prototype.hasOwnProperty;var L=(e,t)=>{for(var o in t)f(e,o,{get:t[o],enumerable:!0})},y=(e,t,o,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of _(t))!U.call(e,a)&&a!==o&&f(e,a,{get:()=>t[a],enumerable:!(s=z(t,a))||s.enumerable});return e};var p=(e,t,o)=>(o=e!=null?W(O(e)):{},y(t||!e||!e.__esModule?f(o,"default",{value:e,enumerable:!0}):o,e)),j=e=>y(f({},"__esModule",{value:!0}),e);var J={};L(J,{activate:()=>H,deactivate:()=>X});module.exports=j(J);var n=p(require("vscode"));var l=p(require("vscode")),i=p(require("fs")),d=p(require("path"));var E="brain-files",x=".github",k=".github/.alex-brain-version",C="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki",B=".github/config/MASTER-ALEX-PROTECTED.json";function I(e){return e.extension.packageJSON.version}function A(e){let t=d.join(e,k);try{return i.readFileSync(t,"utf-8").trim()}catch{return}}function P(e,t,o){let s=o??t;i.mkdirSync(t,{recursive:!0});for(let a of i.readdirSync(e,{withFileTypes:!0})){let c=d.join(e,a.name),r=d.resolve(t,a.name);if(!r.startsWith(s+d.sep)&&r!==s)throw new Error(`Path traversal blocked: ${a.name}`);a.isDirectory()?P(c,r,s):i.copyFileSync(c,r)}}function R(e,t=!1){let o=l.workspace.workspaceFolders;if(!o||o.length===0)return l.window.showWarningMessage("Alex: Open a workspace folder first."),!1;let s=o[0].uri.fsPath,a=I(e),c=A(s),r=d.join(s,x);if(!(t||!i.existsSync(r)||c!==a))return l.window.showInformationMessage(`Alex: Brain is up to date (v${a}).`),!1;let g=d.join(e.extensionUri.fsPath,E);if(!i.existsSync(g))return l.window.showWarningMessage("Alex: Brain files not found in extension bundle."),!1;try{let u=r+`.staging-${Date.now()}`;P(g,u),i.existsSync(r)&&i.rmSync(r,{recursive:!0,force:!0}),i.renameSync(u,r);let b=d.join(s,k);i.writeFileSync(b,a,"utf-8");let F=c?"updated":"installed";return l.window.showInformationMessage(`Alex: Brain ${F} (v${a}).`),!0}catch(u){let b=u instanceof Error?u.message:String(u);return l.window.showErrorMessage(`Alex: Brain install failed \u2014 ${b}`),!1}}function h(e){let t=I(e),o=l.workspace.workspaceFolders;if(!o||o.length===0)return{installed:!1,bundledVersion:t};let s=o[0].uri.fsPath,a=A(s),c=d.join(s,x);return{installed:i.existsSync(c),version:a,bundledVersion:t}}var v=p(require("vscode"));function $(e){return(e instanceof Error?e.message:String(e)).replace(/[A-Z]:\\[\w\\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g,"[path]")}function S(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var m=class{constructor(t){this.extensionUri=t}extensionUri;static viewId="alex.welcomeView";view;brainStatus={installed:!1,bundledVersion:"unknown"};updateStatus(t){this.brainStatus=t,this.view&&(this.view.webview.html=this.getHtml(this.view.webview))}resolveWebviewView(t,o,s){this.view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this.extensionUri]},t.webview.html=this.getHtml(t.webview),t.webview.onDidReceiveMessage(a=>{switch(a.command){case"updateBrain":v.commands.executeCommand("alex.updateBrain");break;case"dream":v.commands.executeCommand("alex.dream");break;case"showStatus":v.commands.executeCommand("alex.showStatus");break;case"optimizeSettings":v.commands.executeCommand("alex.optimizeSettings");break;case"openDocs":v.commands.executeCommand("alex.openDocs");break}})}getHtml(t){let o=N(),{installed:s,version:a,bundledVersion:c}=this.brainStatus,r=s?"check":"warning",w=s?`Brain v${S(a??c)}`:"Brain not installed",g=s?"status-ok":"status-warn",u=s?"Update Brain":"Install Brain";return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${t.cspSource} 'nonce-${o}'; script-src 'nonce-${o}';">
  <style nonce="${o}">
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
  <div class="status-bar ${g}">
    <span class="dot">${r==="check"?"&#x2713;":"&#x26A0;"}</span>
    <span>${w}</span>
  </div>

  <h2>Actions</h2>
  <div class="actions">
    <button class="primary" data-command="updateBrain">${S(u)}</button>
    <button data-command="dream">Dream (Consolidate Knowledge)</button>
    <button data-command="showStatus">Show Status</button>
    <button data-command="optimizeSettings">Optimize Settings</button>
  </div>

  <h2>Resources</h2>
  <div class="links">
    <a href="#" data-command="openDocs">Documentation &amp; Wiki</a>
  </div>

  <script nonce="${o}">
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
</html>`}};function N(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t="";for(let o=0;o<32;o++)t+=e.charAt(Math.floor(Math.random()*e.length));return t}var M=p(require("fs")),V=p(require("path"));function H(e){try{q(e)}catch(t){n.window.showErrorMessage(`Alex: Activation failed \u2014 ${$(t)}`,"Reload Window").then(o=>{o==="Reload Window"&&n.commands.executeCommand("workbench.action.reloadWindow")})}}function q(e){Q();let t=new m(e.extensionUri);e.subscriptions.push(n.window.registerWebviewViewProvider(m.viewId,t)),D(e,t),e.subscriptions.push(n.commands.registerCommand("alex.updateBrain",async()=>{if(T()){n.window.showWarningMessage("Alex: Protected mode is enabled. Brain updates are blocked in this workspace.");return}await n.window.showInformationMessage("Install or update the Alex brain in this workspace?","Install","Cancel")==="Install"&&(R(e,!0),D(e,t))})),e.subscriptions.push(n.commands.registerCommand("alex.dream",async()=>{let s=n.window.createTerminal("Alex Dream");s.show(),s.sendText("echo 'Dream state: consolidating knowledge...'"),n.window.showInformationMessage("Alex: Dream session started. Check the terminal for output.")})),e.subscriptions.push(n.commands.registerCommand("alex.showStatus",()=>{let s=h(e),a=[{label:s.installed?"$(check) Brain Installed":"$(warning) Brain Not Installed",description:s.version?`v${s.version}`:"Run 'Install Brain' to set up"},{label:"$(package) Bundled Version",description:`v${s.bundledVersion}`},{label:"$(shield) Protected Mode",description:T()?"Enabled":"Disabled"}];n.window.showQuickPick(a,{title:"Alex \u2014 Brain Status",placeHolder:"Brain health overview"})})),e.subscriptions.push(n.commands.registerCommand("alex.optimizeSettings",async()=>{let s=n.workspace.getConfiguration(),a=[{key:"editor.inlineSuggest.enabled",value:!0,label:"Enable inline suggestions"},{key:"github.copilot.chat.agent.thinkingTool",value:!0,label:"Enable Copilot thinking tool"}],c=[];for(let r of a)s.get(r.key)!==r.value&&(await s.update(r.key,r.value,n.ConfigurationTarget.Global),c.push(r.label));c.length>0?n.window.showInformationMessage(`Alex: Applied ${c.length} setting(s): ${c.join(", ")}.`):n.window.showInformationMessage("Alex: Settings already optimized.")})),e.subscriptions.push(n.commands.registerCommand("alex.openDocs",()=>{n.env.openExternal(n.Uri.parse(C))}));let o=n.window.createStatusBarItem(n.StatusBarAlignment.Right,50);o.command="alex.showStatus",G(o,e),o.show(),e.subscriptions.push(o)}function D(e,t){t.updateStatus(h(e))}function G(e,t){let o=h(t);o.installed?(e.text="$(brain) Alex",e.tooltip=`Alex Brain v${o.version??o.bundledVersion}`):(e.text="$(brain) Alex (no brain)",e.tooltip="Click to install Alex brain files")}function Q(){let e=n.workspace.workspaceFolders;if(!e)return;let t=V.join(e[0].uri.fsPath,B);if(M.existsSync(t)){let o=n.workspace.getConfiguration("alex.workspace");o.get("protectedMode")||o.update("protectedMode",!0,n.ConfigurationTarget.Workspace)}}function T(){return n.workspace.getConfiguration("alex.workspace").get("protectedMode",!1)}function X(){}0&&(module.exports={activate,deactivate});
