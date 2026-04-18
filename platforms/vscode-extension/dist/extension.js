"use strict";var O=Object.create;var b=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var L=Object.getOwnPropertyNames;var N=Object.getPrototypeOf,H=Object.prototype.hasOwnProperty;var q=(e,t)=>{for(var o in t)b(e,o,{get:t[o],enumerable:!0})},C=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of L(t))!H.call(e,a)&&a!==o&&b(e,a,{get:()=>t[a],enumerable:!(n=U(t,a))||n.enumerable});return e};var p=(e,t,o)=>(o=e!=null?O(N(e)):{},C(t||!e||!e.__esModule?b(o,"default",{value:e,enumerable:!0}):o,e)),G=e=>C(b({},"__esModule",{value:!0}),e);var oe={};q(oe,{activate:()=>K,deactivate:()=>te});module.exports=G(oe);var s=p(require("vscode"));var u=p(require("vscode")),i=p(require("fs")),r=p(require("path"));var A="brain-files",x=".github",I=".github/.alex-brain-version",R="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki",D=".github/config/MASTER-ALEX-PROTECTED.json";var Q=["instructions","skills","prompts","agents","muscles","config","hooks"],X=["copilot-instructions.md"];function P(e){return e.extension.packageJSON.version}function $(e){let t=r.join(e,I);try{return i.readFileSync(t,"utf-8").trim()}catch{return}}function T(e,t,o){let n=o??t;i.mkdirSync(t,{recursive:!0});for(let a of i.readdirSync(e,{withFileTypes:!0})){let c=r.join(e,a.name),d=r.resolve(t,a.name);if(!d.startsWith(n+r.sep)&&d!==n)throw new Error(`Path traversal blocked: ${a.name}`);a.isDirectory()?T(c,d,n):i.copyFileSync(c,d)}}function F(e,t=!1){let o=u.workspace.workspaceFolders;if(!o||o.length===0)return u.window.showWarningMessage("Alex: Open a workspace folder first."),!1;let n=o[0].uri.fsPath,a=P(e),c=$(n),d=r.join(n,x);if(!(t||!i.existsSync(d)||c!==a))return u.window.showInformationMessage(`Alex: Brain is up to date (v${a}).`),!1;let g=r.join(e.extensionUri.fsPath,A);if(!i.existsSync(g))return u.window.showWarningMessage("Alex: Brain files not found in extension bundle."),!1;try{let l=r.join(n,x);i.mkdirSync(l,{recursive:!0});for(let f of Q){let h=r.join(g,f);if(!i.existsSync(h))continue;let v=r.join(l,f),E=v+`.staging-${Date.now()}`;T(h,E),i.existsSync(v)&&i.rmSync(v,{recursive:!0,force:!0}),i.renameSync(E,v)}for(let f of X){let h=r.join(g,f);if(!i.existsSync(h))continue;let v=r.join(l,f);i.copyFileSync(h,v)}let y=r.join(n,I);i.writeFileSync(y,a,"utf-8");let z=c?"updated":"installed";return u.window.showInformationMessage(`Alex: Brain ${z} (v${a}).`),!0}catch(l){let y=l instanceof Error?l.message:String(l);return u.window.showErrorMessage(`Alex: Brain install failed \u2014 ${y}`),!1}}function k(e){let t=P(e),o=u.workspace.workspaceFolders;if(!o||o.length===0)return{installed:!1,bundledVersion:t};let n=o[0].uri.fsPath,a=$(n),c=r.join(n,x);return{installed:i.existsSync(c),version:a,bundledVersion:t}}var m=p(require("vscode"));function M(e){return(e instanceof Error?e.message:String(e)).replace(/[A-Z]:\\[\w\\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g,"[path]")}function B(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var w=class{constructor(t){this.extensionUri=t}extensionUri;static viewId="alex.welcomeView";view;brainStatus={installed:!1,bundledVersion:"unknown"};updateStatus(t){this.brainStatus=t,this.view&&(this.view.webview.html=this.getHtml(this.view.webview))}resolveWebviewView(t,o,n){this.view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this.extensionUri]},t.webview.html=this.getHtml(t.webview),t.webview.onDidReceiveMessage(a=>{switch(a.command){case"updateBrain":m.commands.executeCommand("alex.updateBrain");break;case"dream":m.commands.executeCommand("alex.dream");break;case"showStatus":m.commands.executeCommand("alex.showStatus");break;case"optimizeSettings":m.commands.executeCommand("alex.optimizeSettings");break;case"openDocs":m.commands.executeCommand("alex.openDocs");break}})}getHtml(t){let o=J(),{installed:n,version:a,bundledVersion:c}=this.brainStatus,d=n?"check":"warning",S=n?`Brain v${B(a??c)}`:"Brain not installed",g=n?"status-ok":"status-warn",l=n?"Update Brain":"Install Brain";return`<!DOCTYPE html>
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
    <span class="dot">${d==="check"?"&#x2713;":"&#x26A0;"}</span>
    <span>${S}</span>
  </div>

  <h2>Actions</h2>
  <div class="actions">
    <button class="primary" data-command="updateBrain">${B(l)}</button>
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
</html>`}};function J(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t="";for(let o=0;o<32;o++)t+=e.charAt(Math.floor(Math.random()*e.length));return t}var _=p(require("fs")),j=p(require("path"));function K(e){try{Y(e)}catch(t){s.window.showErrorMessage(`Alex: Activation failed \u2014 ${M(t)}`,"Reload Window").then(o=>{o==="Reload Window"&&s.commands.executeCommand("workbench.action.reloadWindow")})}}function Y(e){ee();let t=new w(e.extensionUri);e.subscriptions.push(s.window.registerWebviewViewProvider(w.viewId,t)),V(e,t),e.subscriptions.push(s.commands.registerCommand("alex.updateBrain",async()=>{if(W()){s.window.showWarningMessage("Alex: Protected mode is enabled. Brain updates are blocked in this workspace.");return}await s.window.showInformationMessage("Install or update the Alex brain in this workspace?","Install","Cancel")==="Install"&&(F(e,!0),V(e,t))})),e.subscriptions.push(s.commands.registerCommand("alex.dream",async()=>{let n=s.window.createTerminal("Alex Dream");n.show(),n.sendText("echo 'Dream state: consolidating knowledge...'"),s.window.showInformationMessage("Alex: Dream session started. Check the terminal for output.")})),e.subscriptions.push(s.commands.registerCommand("alex.showStatus",()=>{let n=k(e),a=[{label:n.installed?"$(check) Brain Installed":"$(warning) Brain Not Installed",description:n.version?`v${n.version}`:"Run 'Install Brain' to set up"},{label:"$(package) Bundled Version",description:`v${n.bundledVersion}`},{label:"$(shield) Protected Mode",description:W()?"Enabled":"Disabled"}];s.window.showQuickPick(a,{title:"Alex \u2014 Brain Status",placeHolder:"Brain health overview"})})),e.subscriptions.push(s.commands.registerCommand("alex.optimizeSettings",async()=>{let n=s.workspace.getConfiguration(),a=[{key:"editor.inlineSuggest.enabled",value:!0,label:"Enable inline suggestions"},{key:"github.copilot.chat.agent.thinkingTool",value:!0,label:"Enable Copilot thinking tool"}],c=[];for(let d of a)n.get(d.key)!==d.value&&(await n.update(d.key,d.value,s.ConfigurationTarget.Global),c.push(d.label));c.length>0?s.window.showInformationMessage(`Alex: Applied ${c.length} setting(s): ${c.join(", ")}.`):s.window.showInformationMessage("Alex: Settings already optimized.")})),e.subscriptions.push(s.commands.registerCommand("alex.openDocs",()=>{s.env.openExternal(s.Uri.parse(R))}));let o=s.window.createStatusBarItem(s.StatusBarAlignment.Right,50);o.command="alex.showStatus",Z(o,e),o.show(),e.subscriptions.push(o)}function V(e,t){t.updateStatus(k(e))}function Z(e,t){let o=k(t);o.installed?(e.text="$(brain) Alex",e.tooltip=`Alex Brain v${o.version??o.bundledVersion}`):(e.text="$(brain) Alex (no brain)",e.tooltip="Click to install Alex brain files")}function ee(){let e=s.workspace.workspaceFolders;if(!e)return;let t=j.join(e[0].uri.fsPath,D);if(_.existsSync(t)){let o=s.workspace.getConfiguration("alex.workspace");o.get("protectedMode")||o.update("protectedMode",!0,s.ConfigurationTarget.Workspace)}}function W(){return s.workspace.getConfiguration("alex.workspace").get("protectedMode",!1)}function te(){}0&&(module.exports={activate,deactivate});
