"use strict";var kt=Object.create;var ee=Object.defineProperty;var xt=Object.getOwnPropertyDescriptor;var St=Object.getOwnPropertyNames;var At=Object.getPrototypeOf,Ct=Object.prototype.hasOwnProperty;var Pt=(e,t)=>{for(var n in t)ee(e,n,{get:t[n],enumerable:!0})},$e=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of St(t))!Ct.call(e,s)&&s!==n&&ee(e,s,{get:()=>t[s],enumerable:!(o=xt(t,s))||o.enumerable});return e};var m=(e,t,n)=>(n=e!=null?kt(At(e)):{},$e(t||!e||!e.__esModule?ee(n,"default",{value:e,enumerable:!0}):n,e)),Tt=e=>$e(ee({},"__esModule",{value:!0}),e);var En={};Pt(En,{activate:()=>Rn,deactivate:()=>jn});module.exports=Tt(En);var c=m(require("vscode"));var be=m(require("vscode")),se=m(require("path")),ie=m(require("fs"));var f=m(require("fs")),k=m(require("path")),T=m(require("vscode"));function S(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function b(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;").replace(/\\/g,"&#92;")}function $t(e){let t=e.split(/\s+/);if(t.length!==5)return e;let[n,o,s,a,i]=t,r=`${o.padStart(2,"0")}:${n.padStart(2,"0")} UTC`;return s.startsWith("*/")&&a==="*"&&i==="*"?`Every ${s.slice(2)} days at ${r}`:o.startsWith("*/")?`Every ${o.slice(2)} hours`:s==="*"&&a==="*"&&i==="*"&&!o.includes("/")&&!o.includes(",")?`Daily at ${r}`:s==="*"&&a==="*"&&i!=="*"?`${{0:"Sun",1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat"}[i]??i} at ${r}`:e}function It(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);if(n<1)return"just now";if(n<60)return`${n}m ago`;let o=Math.floor(n/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}function q(e){let t=k.join(e,".git","config");if(f.existsSync(t))try{let n=f.readFileSync(t,"utf-8"),o=n.match(/url\s*=\s*https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)/);if(o)return`https://github.com/${o[1]}`;let s=n.match(/url\s*=\s*git@github\.com:([^/\s]+\/[^/\s.]+)/);return s?`https://github.com/${s[1]}`:void 0}catch{return}}var Dt=k.join(".github","config",".scheduled-tasks-state.json");function Ie(e){return k.join(e,Dt)}function he(e){try{return JSON.parse(f.readFileSync(Ie(e),"utf-8"))}catch{return{}}}function De(e,t){let n=he(e);n[t]={lastRun:new Date().toISOString()};let o=Ie(e),s=k.dirname(o);f.existsSync(s)||f.mkdirSync(s,{recursive:!0}),f.writeFileSync(o,JSON.stringify(n,null,2)+`
`,"utf-8")}var ne=null,Re="alex.scheduledRuns";function je(e){ne=e}function me(){return ne?.get(Re)??{}}function Ee(e){ne&&ne.update(Re,e)}function Fe(e){return me()[e]}function Me(e){let t=me();delete t[e],Ee(t)}function te(e,t){let n=me();n[e]=t,Ee(n)}function Rt(e,t,n){if(!e.dependsOn||e.dependsOn.length===0)return{satisfied:!0,blocking:[]};let o=he(n),s=[];for(let a of e.dependsOn){if(!t.find(p=>p.id===a)){s.push(`${a} (not found)`);continue}let r=Fe(a);if(r){r.status==="failure"||r.status==="error"||r.status==="cancelled"?s.push(`${a} (${r.status})`):r.status!=="completed"&&s.push(`${a} (${r.status})`);continue}o[a]?.lastRun||s.push(`${a} (never run)`)}return{satisfied:s.length===0,blocking:s}}function Oe(e){let t=new Map(e.map(i=>[i.id,i])),n=new Set,o=new Set,s=[];function a(i){if(n.has(i)||o.has(i))return;o.add(i);let r=t.get(i);if(r?.dependsOn)for(let p of r.dependsOn)t.has(p)&&a(p);o.delete(i),n.add(i),r&&s.push(r)}for(let i of e)a(i.id);for(let i of e)n.has(i.id)||s.push(i);return s}function jt(e){let t=e.match(/github\.com\/([^/]+)\/([^/]+)/);if(t)return{owner:t[1],repo:t[2]}}async function oe(e,t,n){let o=jt(e);if(!o)throw new Error("Cannot parse GitHub owner/repo from URL");let{owner:s,repo:a}=o,i=`scheduled-${t}.yml`,u={Authorization:`Bearer ${(await T.authentication.getSession("github",["repo"],{createIfNone:!0})).accessToken}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"alex-cognitive-architecture"};te(t,{status:"queued"}),n({status:"queued"});let d=new Date().toISOString(),l=`https://api.github.com/repos/${s}/${a}/actions/workflows/${i}/dispatches`,v=await fetch(l,{method:"POST",headers:{...u,"Content-Type":"application/json"},body:JSON.stringify({ref:"main"})});if(!v.ok){let R=await v.text(),ge={status:"error"};throw te(t,ge),n(ge),new Error(`Dispatch failed (${v.status}): ${R}`)}let D=`https://api.github.com/repos/${s}/${a}/actions/workflows/${i}/runs?per_page=1&created=>${d.slice(0,19)}Z`,W=0,L=120,fe=5e3,X=async()=>{if(W++,W>L){let R={status:"error"};te(t,R),n(R);return}try{let R=await fetch(D,{headers:u});if(!R.ok)return E();let F=(await R.json()).workflow_runs?.[0];if(!F)return E();let Te={status:F.status==="completed"?F.conclusion==="success"?"completed":F.conclusion??"failure":F.status??"in_progress",runUrl:F.html_url,conclusion:F.conclusion??void 0};if(te(t,Te),n(Te),F.status!=="completed")return E()}catch{return E()}},Z=!1,z=[],E=()=>{Z||z.push(setTimeout(()=>void X(),fe))};return z.push(setTimeout(()=>void X(),3e3)),{dispose:()=>{Z=!0,z.forEach(clearTimeout)}}}function N(e){let t=k.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(t))return[];try{return JSON.parse(f.readFileSync(t,"utf-8")).tasks??[]}catch{return[]}}function Le(e,t){let n=k.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(n))return null;try{let o=JSON.parse(f.readFileSync(n,"utf-8")),s=o.tasks?.find(a=>a.id===t);return s?(s.enabled=!s.enabled,f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),s.enabled?Be(e,s):We(e,s.id),o.tasks):null}catch{return null}}function Ge(e,t){let n=k.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(n))return null;try{let o=JSON.parse(f.readFileSync(n,"utf-8")),s=o.tasks?.findIndex(a=>a.id===t);return s===void 0||s<0?null:(o.tasks.splice(s,1),f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),We(e,t),o.tasks)}catch{return null}}function ve(e,t){let n=k.join(e,".github","workflows",`scheduled-${t}.yml`);return f.existsSync(n)}function Ne(e){return k.join(e,".github","workflows")}function He(e,t){return k.join(Ne(e),`scheduled-${t}.yml`)}function G(e){return e.replace(/[\\"`$!#&|;(){}<>]/g,"")}function Ue(e){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e))throw new Error(`Invalid task ID: "${e}". Must be lowercase alphanumeric with hyphens.`);return e}function _e(e){if(!/^[0-9*\/,\- ]+$/.test(e))throw new Error(`Invalid cron expression: "${e}".`);return e}function Et(e){let t=G(e.name),n=Ue(e.id),o=_e(e.schedule);return`# Auto-generated \u2014 do not edit manually
name: "Scheduled: ${t}"

on:
  schedule:
    - cron: "${o}"
  workflow_dispatch: {}

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  create-copilot-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Check for duplicate open issues
        id: check
        env:
          GH_TOKEN: \${{ github.token }}
        run: |
          OPEN=$(gh issue list --label automated,${n} --state open --json number --jq 'length')
          echo "open=$OPEN" >> $GITHUB_OUTPUT

      - name: Create issue for Copilot
        if: steps.check.outputs.open == '0'
        env:
          GH_TOKEN: \${{ github.token }}
          TASK_NAME: "${t}"
          PROMPT_FILE: "${G(e.promptFile??"")}"
        run: |
          gh issue create \\
            --title "$TASK_NAME: $(date -u +%Y-%m-%d-%H%M)" \\
            --body-file "$PROMPT_FILE" \\
            --label automated,${n} \\
            --assignee copilot
`}function Ft(e){let t=G(e.name),n=G(e.description),o=e.muscle?G(e.muscle):"",s=e.muscleArgs?` ${e.muscleArgs.map(G).join(" ")}`:"",a=Ue(e.id),i=_e(e.schedule);return`# Auto-generated \u2014 do not edit manually
name: "Scheduled: ${t}"

on:
  schedule:
    - cron: "${i}"
  workflow_dispatch: {}

permissions:
  contents: write
  pull-requests: write

jobs:
  run-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 22

      - name: Run ${a}
        run: node ${o}${s}

      - name: Create PR if changes exist
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          TASK_NAME: "${t}"
          TASK_DESC: "${n}"
        run: |
          git diff --quiet && exit 0
          BRANCH="auto/${a}-$(date -u +%s)"
          git checkout -b "$BRANCH"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "chore(scheduled): ${a} $(date -u +%Y-%m-%d)"
          git push origin "$BRANCH"
          gh pr create \\
            --title "Scheduled: $TASK_NAME $(date -u +%Y-%m-%d)" \\
            --body "## Automated Task: $TASK_NAME\\n\\n$TASK_DESC\\n\\n---\\n\\n*Generated by scheduled-${a}.yml*" \\
            --label automated \\
            --base main
`}function Be(e,t){let n;if(t.mode==="agent"&&t.promptFile)n=Et(t);else if(t.mode==="direct"&&t.muscle)n=Ft(t);else return!1;let o=Ne(e);return f.existsSync(o)||f.mkdirSync(o,{recursive:!0}),f.writeFileSync(He(e,t.id),n,"utf-8"),!0}function We(e,t){let n=He(e,t);f.existsSync(n)&&f.unlinkSync(n)}function ze(e,t,n){let o;if(e.length===0)o=`
    <div class="schedule-empty">
      <span class="codicon codicon-rocket"></span>
      <p><strong>Automate your workflow</strong></p>
      <p class="schedule-hint">Schedule AI agents to run tasks on your behalf \u2014<br>code reviews, audits, reports, and more.</p>
      <button class="action-btn primary" data-command="addTask" style="margin-top:16px">
        <span class="codicon codicon-add"></span>
        <span class="btn-label">Create Your First Task</span>
      </button>
      <button class="action-btn" data-command="openExternal" data-file="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Autopilot" style="margin-top:4px">
        <span class="codicon codicon-book"></span>
        <span class="btn-label">Learn more</span>
      </button>
    </div>`;else{let s=n?he(n):{};o=`
    <div class="schedule-tasks">
      ${e.map(i=>{let r=i.mode==="agent"?"hubot":"terminal",p=i.mode==="agent"?"Agent":"Script",u=$t(i.schedule),d=n?ve(n,i.id):!1,l=Fe(i.id),v;l&&(l.status==="queued"||l.status==="in_progress")?v='<span class="schedule-pill schedule-pill-running"><span class="codicon codicon-loading codicon-modifier-spin"></span> Running</span>':l&&l.status==="completed"?v='<span class="schedule-pill schedule-pill-success"><span class="codicon codicon-check"></span> Passed</span>':l&&(l.status==="failure"||l.status==="cancelled"||l.status==="error")?v='<span class="schedule-pill schedule-pill-fail"><span class="codicon codicon-error"></span> Failed</span>':v=i.enabled?'<span class="schedule-pill schedule-pill-on">Active</span>':'<span class="schedule-pill schedule-pill-off">Paused</span>';let D=l&&(l.status==="queued"||l.status==="in_progress"),W=i.mode==="agent"&&i.promptFile?D?'<button class="schedule-action-btn schedule-action-running" disabled title="Running\u2026"><span class="codicon codicon-loading codicon-modifier-spin"></span></button>':`<button class="schedule-action-btn schedule-action-run" data-command="runTask" data-file="${b(i.id)}" title="${d?"Run on GitHub Actions":"Run now in Copilot Chat"}">\u{1F680}</button>`:"",L=l?.runUrl?`<button class="schedule-action-btn" data-command="openExternal" data-file="${b(l.runUrl)}" title="View run on GitHub"><span class="codicon codicon-link-external"></span></button>`:"",fe=i.mode==="agent"&&i.promptFile?`<button class="schedule-action-btn" data-command="openPromptFile" data-file="${b(i.promptFile)}" title="Edit prompt">\u270E</button>`:"",X=`<button class="schedule-action-btn ${i.enabled?"schedule-action-pause":"schedule-action-resume"}" data-command="toggleTask" data-file="${b(i.id)}" title="${i.enabled?"Pause":"Resume"}">${i.enabled?"\u23F8":"\u25B6"}</button>`,Z=`<button class="schedule-action-btn schedule-action-danger" data-command="deleteTask" data-file="${b(i.id)}" title="Delete">\u{1F5D1}</button>`,z=s[i.id]?.lastRun?`<span class="schedule-last-run" title="Last run: ${b(s[i.id].lastRun)}"><span class="codicon codicon-history"></span> ${It(s[i.id].lastRun)}</span>`:"",E="";if(i.dependsOn&&i.dependsOn.length>0&&n){let R=Rt(i,e,n);R.satisfied?E='<div class="schedule-task-deps schedule-deps-ok"><span class="codicon codicon-pass"></span> Dependencies met</div>':E=`<div class="schedule-task-deps schedule-deps-blocked"><span class="codicon codicon-lock"></span> Blocked by: ${S(R.blocking.join(", "))}</div>`}return`
      <div class="schedule-task ${i.enabled?"enabled":"disabled"}" data-task-id="${b(i.id)}">
        <div class="schedule-task-header">
          <span class="schedule-mode" title="${p}"><span class="codicon codicon-${r}"></span></span>
          <span class="schedule-task-name" title="${b(i.name)}">${S(i.name)}</span>
          ${v}
        </div>
        <div class="schedule-task-meta">
          <span class="schedule-schedule"><span class="codicon codicon-clock"></span> ${S(u)}</span>
          ${z}
        </div>
        <div class="schedule-task-desc">${S(i.description)}</div>
        ${E}
        <div class="schedule-task-actions">
          ${W}
          ${L}
          ${fe}
          ${X}
          ${Z}
        </div>
      </div>`}).join("")}
    </div>
    <div class="schedule-actions">
      <button class="action-btn primary" data-command="addTask">
        <span class="codicon codicon-add"></span>
        <span class="btn-label">Add Task</span>
      </button>
      <button class="action-btn" data-command="openScheduleConfig">
        <span class="codicon codicon-edit"></span>
        <span class="btn-label">Edit Config</span>
      </button>
    </div>`}return o+=`
  <div class="schedule-divider"></div>
  <div class="schedule-actions">`,t&&(o+=`
      <button class="action-btn" data-command="openExternal" data-file="${b(t)}/actions">
        <span class="codicon codicon-github-action"></span>
        <span class="btn-label">GitHub Actions</span>
      </button>`),o+=`
      <button class="action-btn" data-command="openExternal" data-file="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Autopilot">
        <span class="codicon codicon-book"></span>
        <span class="btn-label">Documentation</span>
      </button>
    </div>`,o}function Mt(e,t){let n=k.join(e,".github","config","scheduled-tasks.json");try{let o;if(f.existsSync(n))o=JSON.parse(f.readFileSync(n,"utf-8"));else{let s=k.dirname(n);f.existsSync(s)||f.mkdirSync(s,{recursive:!0}),o={version:"1.0.0",tasks:[]}}return o.tasks.some(s=>s.id===t.id)?(T.window.showWarningMessage(`Task "${t.id}" already exists.`),!1):(o.tasks.push(t),f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0)}catch{return!1}}var Ot=[{label:"Every 3 hours",cron:"0 */3 * * *",description:"8 times/day"},{label:"Every 6 hours",cron:"0 */6 * * *",description:"4 times/day"},{label:"Every 12 hours",cron:"0 */12 * * *",description:"Twice daily"},{label:"Daily at 8 AM",cron:"0 8 * * *",description:"Once daily (UTC)"},{label:"Daily at noon",cron:"0 12 * * *",description:"Once daily (UTC)"},{label:"Weekly Monday",cron:"0 8 * * 1",description:"Every Monday 8 AM UTC"},{label:"Weekly Friday",cron:"0 16 * * 5",description:"Every Friday 4 PM UTC"},{label:"Custom cron...",cron:"",description:"Enter POSIX cron expression"}];async function qe(e){let t=await T.window.showInputBox({title:"Add Scheduled Task (1/5)",prompt:"Task name",placeHolder:"e.g. Weekly Code Review",validateInput:d=>d.trim()?void 0:"Name is required"});if(!t)return!1;let n=await T.window.showInputBox({title:"Add Scheduled Task (2/5)",prompt:"Brief description",placeHolder:"What does this automation do?",validateInput:d=>d.trim()?void 0:"Description is required"});if(!n)return!1;let o=await T.window.showQuickPick([{label:"$(hubot) Cloud Agent",description:"Creates a GitHub issue assigned to Copilot",detail:"Best for creative tasks: writing, analysis, reviews",mode:"agent"},{label:"$(terminal) Direct",description:"Runs a script in GitHub Actions",detail:"Best for mechanical tasks: audits, builds, syncs",mode:"direct"}],{title:"Add Scheduled Task (3/5)",placeHolder:"Execution mode"});if(!o)return!1;let s=await T.window.showQuickPick(Ot.map(d=>({label:d.label,description:d.description,cron:d.cron})),{title:"Add Scheduled Task (4/5)",placeHolder:"Schedule frequency"});if(!s)return!1;let a=s.cron;if(!a){let d=await T.window.showInputBox({title:"Custom Cron Expression",prompt:"POSIX cron: minute hour day-of-month month day-of-week",placeHolder:"0 */4 * * *",validateInput:l=>l.trim().split(/\s+/).length===5?void 0:"Must be 5 space-separated fields"});if(!d)return!1;a=d.trim()}let i=k.join(e,".github","skills"),r;if(f.existsSync(i)){let d=f.readdirSync(i,{withFileTypes:!0}).filter(l=>l.isDirectory()).map(l=>({label:l.name}));if(d.length>0){let l=await T.window.showQuickPick([{label:"(none)",description:"No specific skill"},...d],{title:"Add Scheduled Task (5/5)",placeHolder:"Associate a skill (optional)"});l&&l.label!=="(none)"&&(r=l.label)}}let p=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");if(!p)return T.window.showErrorMessage("Task name must contain at least one letter or digit."),!1;let u={id:p,name:t,description:n,mode:o.mode,schedule:a,enabled:!1,...r?{skill:r}:{},...o.mode==="agent"?{promptFile:`.github/config/scheduled-tasks/${p}.md`}:{}};if(Mt(e,u)){if(o.mode==="agent"&&u.promptFile){let d=k.join(e,u.promptFile),l=k.dirname(d);if(f.existsSync(l)||f.mkdirSync(l,{recursive:!0}),!f.existsSync(d)){let v=[`# ${t}`,"","## Task","",`${n}`,"","## Instructions","","1. Read relevant context from the repository","2. Perform the task","3. Create a PR with your changes","","## Quality Standards","","- Follow existing project conventions","- Include meaningful commit messages","- Ensure all tests pass before submitting",""].join(`
`);f.writeFileSync(d,v,"utf-8")}}return u.enabled&&Be(e,u),T.window.showInformationMessage(`Task "${t}" added (disabled). Enable it from the Autopilot tab to activate.`),!0}return!1}var Ve=`
    /* Autopilot tab \u2014 uses design tokens from parent */
    .schedule-empty {
      text-align: center;
      padding: var(--spacing-xl, 24px) var(--spacing-lg, 16px);
      color: var(--vscode-foreground);
    }
    .schedule-empty .codicon {
      font-size: 40px;
      display: block;
      margin-bottom: var(--spacing-md, 12px);
      color: var(--accent, #6366f1);
      opacity: 0.85;
    }
    .schedule-empty p {
      margin: var(--spacing-xs, 4px) 0;
    }
    .schedule-empty strong {
      font-size: var(--font-xl, 14px);
    }
    .schedule-hint {
      font-size: var(--font-md, 12px);
      margin-top: var(--spacing-sm, 8px);
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
    }
    .schedule-tasks {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm, 8px);
      margin-bottom: var(--spacing-md, 12px);
    }
    .schedule-task {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.15));
      border-radius: var(--radius-md, 6px);
      padding: var(--spacing-md, 12px);
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .schedule-task:hover {
      background: var(--vscode-list-hoverBackground);
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    }
    .schedule-task.enabled {
      border-left: 3px solid var(--accent, #6366f1);
    }
    .schedule-task.disabled {
      opacity: 0.5;
      border-left: 3px solid transparent;
    }
    .schedule-task.disabled:hover {
      opacity: 0.7;
    }
    .schedule-task-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      min-height: 24px;
    }
    .schedule-mode {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      flex-shrink: 0;
    }
    .schedule-task.enabled .schedule-mode {
      color: var(--accent, #6366f1);
    }
    .schedule-task-name {
      flex: 1;
      font-weight: 600;
      font-size: var(--font-lg, 13px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .schedule-warn {
      color: var(--vscode-editorWarning-foreground);
      font-size: var(--font-md, 12px);
      flex-shrink: 0;
    }
    /* Status pill */
    .schedule-pill {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 9px;
      flex-shrink: 0;
    }
    .schedule-pill-on {
      background: var(--accent-subtle, rgba(99, 102, 241, 0.15));
      color: var(--accent, #6366f1);
    }
    .schedule-pill-off {
      background: rgba(128, 128, 128, 0.12);
      color: var(--vscode-descriptionForeground);
    }
    .schedule-pill-running {
      background: rgba(59, 130, 246, 0.15);
      color: var(--vscode-notificationsInfoIcon-foreground, #3b82f6);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .schedule-pill-running .codicon {
      font-size: 10px;
    }
    .schedule-pill-success {
      background: rgba(34, 197, 94, 0.15);
      color: var(--vscode-testing-iconPassed, #22c55e);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .schedule-pill-success .codicon {
      font-size: 10px;
    }
    .schedule-pill-fail {
      background: rgba(239, 68, 68, 0.15);
      color: var(--vscode-errorForeground, #ef4444);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .schedule-pill-fail .codicon {
      font-size: 10px;
    }
    .schedule-action-running {
      opacity: 0.5;
      cursor: default;
    }
    /* Action button row at bottom of card */
    .schedule-task-actions {
      display: flex;
      gap: var(--spacing-xs, 4px);
      margin-top: var(--spacing-sm, 8px);
      padding-top: var(--spacing-sm, 8px);
      border-top: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.1));
    }
    .schedule-action-btn {
      background: var(--vscode-button-secondaryBackground, rgba(128,128,128,0.15));
      border: 1px solid var(--vscode-panel-border, rgba(128,128,128,0.2));
      color: var(--vscode-foreground);
      cursor: pointer;
      height: 26px;
      padding: 0 8px;
      border-radius: var(--radius-sm, 4px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.12s, background 0.12s, transform 0.1s;
      opacity: 0.7;
      font-size: 12px;
      line-height: 1;
    }
    .schedule-action-btn:hover {
      opacity: 1;
      background: var(--vscode-toolbar-hoverBackground);
    }
    .schedule-action-btn:focus-visible {
      outline: var(--focus-ring, 2px solid var(--accent, #6366f1));
      outline-offset: var(--focus-ring-offset, 2px);
      opacity: 1;
    }
    .schedule-action-btn:active {
      transform: scale(0.96);
    }
    .schedule-action-danger:hover {
      color: var(--vscode-errorForeground) !important;
    }
    .schedule-action-run:hover {
      color: var(--vscode-testing-iconPassed, #73c991) !important;
      background: rgba(115, 201, 145, 0.1) !important;
    }
    .schedule-action-resume:hover {
      color: var(--vscode-testing-iconPassed, #73c991) !important;
    }
    .schedule-action-pause:hover {
      color: var(--vscode-editorWarning-foreground) !important;
    }
    /* Meta line: schedule + last run */
    .schedule-task-meta {
      margin-top: var(--spacing-xs, 4px);
      margin-left: 22px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px 12px;
    }
    .schedule-schedule {
      font-size: var(--font-sm, 11px);
      color: var(--vscode-descriptionForeground);
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
    }
    .schedule-schedule .codicon {
      font-size: 11px;
      opacity: 0.7;
    }
    .schedule-last-run {
      font-size: var(--font-sm, 11px);
      color: var(--vscode-descriptionForeground);
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      opacity: 0.75;
    }
    .schedule-last-run .codicon {
      font-size: 11px;
      opacity: 0.7;
    }
    .schedule-task-desc {
      font-size: var(--font-sm, 11px);
      color: var(--vscode-descriptionForeground);
      margin-top: var(--spacing-xs, 4px);
      margin-left: 22px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    /* Dependency indicators */
    .schedule-task-deps {
      font-size: var(--font-sm, 11px);
      margin-top: var(--spacing-xs, 4px);
      margin-left: 22px;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
    }
    .schedule-deps-blocked {
      color: var(--vscode-editorWarning-foreground, #cca700);
    }
    .schedule-deps-blocked .codicon {
      font-size: 11px;
    }
    .schedule-deps-ok {
      color: var(--vscode-testing-iconPassed, #22c55e);
      opacity: 0.75;
    }
    .schedule-deps-ok .codicon {
      font-size: 11px;
    }
    .schedule-actions {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px) var(--spacing-sm, 8px);
    }
    .schedule-actions .action-btn {
      width: 100%;
    }
    .schedule-divider {
      border-top: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.15));
      margin: var(--spacing-sm, 8px) 0 var(--spacing-xs, 4px);
    }
`;var Je=async(e,t,n,o)=>e.command==="autopilot"?Lt(e,n):e.command==="cloud"?Gt(e,n,o):{};async function Lt(e,t){let n=be.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!n)return t.markdown("Open a workspace folder to use Autopilot."),{};let o=N(n),s=e.prompt.trim().toLowerCase();if(s==="list"||s===""){t.markdown(`## Autopilot Tasks

`);let a=Oe(o);for(let i of a){let r=i.mode==="agent"?"\u{1F916}":"\u2699\uFE0F",p=i.enabled?"Active":"Paused",u=i.dependsOn?.length?` \u2190 depends on: ${i.dependsOn.join(", ")}`:"";t.markdown(`- ${r} **${i.name}** \u2014 ${p}${u}
`)}return t.markdown(`
*${o.length} tasks configured. Use \`/autopilot status\` for run history.*`),{}}if(s==="status"){t.markdown(`## Autopilot Status

`);let a=o.filter(r=>r.enabled),i=o.filter(r=>!r.enabled);t.markdown(`**${a.length}** active \xB7 **${i.length}** paused

`);for(let r of a)t.markdown(`- **${r.name}** \u2014 \`${r.schedule}\`
`);return{}}if(s.startsWith("run ")){let a=s.slice(4).trim(),i=o.find(r=>r.id===a);if(!i)return t.markdown(`Task \`${a}\` not found. Use \`/autopilot list\` to see available tasks.`),{};if(i.mode==="agent"&&i.promptFile){let r=se.join(n,i.promptFile),p=se.resolve(r);if(!p.toLowerCase().startsWith(n.toLowerCase()))return t.markdown("Invalid prompt file path."),{};if(ie.existsSync(p)){let u=ie.readFileSync(p,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();t.markdown(`Running **${i.name}**...

${u}`)}else t.markdown(`Prompt file not found: \`${i.promptFile}\``)}else t.markdown(`Task **${i.name}** uses direct mode (script: \`${i.muscle??"n/a"}\`). Run it from the Autopilot tab or GitHub Actions.`);return{}}return t.markdown(`## Autopilot Commands

`),t.markdown("- `/autopilot list` \u2014 Show all configured tasks\n"),t.markdown("- `/autopilot status` \u2014 Show active tasks and schedules\n"),t.markdown("- `/autopilot run <task-id>` \u2014 Run a specific task\n"),{}}async function Gt(e,t,n){let o=be.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!o)return t.markdown("Open a workspace folder to use cloud dispatch."),{};let s=N(o),a=e.prompt.trim().toLowerCase();if(a===""||a==="help")return t.markdown(`## Cloud Dispatch

`),t.markdown(`Dispatch Autopilot tasks to GitHub Actions for cloud execution.

`),t.markdown("- `/cloud list` \u2014 Show cloud-eligible tasks\n"),t.markdown("- `/cloud run <task-id>` \u2014 Dispatch a task to GitHub Actions\n"),{};if(a==="list"){let i=s.filter(r=>r.enabled&&r.mode==="agent");if(i.length===0)return t.markdown("No cloud-eligible tasks found. Enable agent-mode tasks in scheduled-tasks.json."),{};t.markdown(`## Cloud-Eligible Tasks

`);for(let r of i)t.markdown(`- **${r.id}** \u2014 ${r.name}
`);return t.markdown("\n*Use `/cloud run <task-id>` to dispatch.*"),{}}if(a.startsWith("run ")){let i=a.slice(4).trim(),r=s.find(u=>u.id===i);if(!r)return t.markdown(`Task \`${i}\` not found. Use \`/cloud list\` to see eligible tasks.`),{};if(!r.enabled)return t.markdown(`Task **${r.name}** is paused. Enable it first.`),{};let p=q(o);if(!p)return t.markdown("Could not determine GitHub repo URL from workspace."),{};t.markdown(`Dispatching **${r.name}** to GitHub Actions...

`);try{let u=await oe(p,r.id,()=>{});n.onCancellationRequested(()=>u.dispose()),t.markdown("Workflow dispatched. Check the Autopilot tab or GitHub Actions for progress.")}catch(u){let d=u instanceof Error?u.message:String(u);t.markdown(`Dispatch failed: ${d}`)}return{}}return t.markdown("Unknown cloud command. Use `/cloud help` for usage."),{}}var g=m(require("vscode")),ft=m(require("crypto")),O=m(require("fs")),A=m(require("path"));var M=m(require("fs")),$=m(require("path")),re=require("child_process");function ae(e,t){return Math.abs(t.getTime()-e.getTime())/(1e3*60*60*24)}function Nt(e){let t=new Date,n=e.lastDreamDate?ae(e.lastDreamDate,t):1/0;return e.dreamNeeded&&n>14||e.syncStale&&n>3?"critical":e.dreamNeeded||n>7||e.syncStale?"attention":"healthy"}function Ht(e){let t=$.join(e,".github","quality","dream-report.json");try{let n=M.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function Ut(e){let t=$.join(e,".github",".sync-manifest.json");try{let n=M.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function _t(){try{let e=$.resolve(__dirname,"..","package.json");return JSON.parse(M.readFileSync(e,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}}function Bt(e){let t=Ut(e);if(!t)return!1;let n=_t();if(t.brainVersion!==n)return!0;let o=new Date(t.lastSync);return!!(isNaN(o.getTime())||ae(o,new Date)>7)}function Wt(e){try{let t=(0,re.execSync)("git diff --cached --name-only",{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),n=(0,re.execSync)("git diff --name-only",{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),o=t?t.split(`
`).length:0,s=n?n.split(`
`).length:0,a=o+s;if(a===0)return{fileCount:0,days:0};let i=0;try{let r=(0,re.execSync)("git log -1 --format=%ci",{cwd:e,encoding:"utf-8",timeout:5e3}).trim();r&&(i=Math.floor(ae(new Date(r),new Date)))}catch{}return{fileCount:a,days:i}}catch{return{fileCount:0,days:0}}}function zt(e){let t=$.join(e,".github"),n=s=>{try{return M.readdirSync(s,{withFileTypes:!0}).filter(a=>a.isDirectory()).length}catch{return 0}},o=(s,a,i=!1)=>{try{if(!i)return M.readdirSync(s).filter(u=>u.endsWith(a)).length;let r=0,p=u=>{for(let d of M.readdirSync(u,{withFileTypes:!0}))d.isDirectory()?p($.join(u,d.name)):d.name.endsWith(a)&&r++};return p(s),r}catch{return 0}};return{skills:n($.join(t,"skills")),instructions:o($.join(t,"instructions"),".instructions.md"),prompts:o($.join(t,"prompts"),".prompt.md",!0),agents:o($.join(t,"agents"),".agent.md")}}function Ye(e){let t=Ht(e),n=zt(e),o=t?new Date(t.timestamp):null,s=t?t.brokenRefs.length>0||t.trifectaIssues.length>20:!0,a=Wt(e),i={status:"healthy",skillCount:n.skills,instructionCount:n.instructions,promptCount:n.prompts,agentCount:n.agents,lastDreamDate:o,dreamNeeded:s,syncStale:Bt(e),uncommittedFileCount:a.fileCount,uncommittedDays:a.days};return i.status=Nt(i),i}function qt(e,t){let n=(t.getTime()-e.getTime())/864e5,o=Math.LN2/7;return Math.exp(-o*n)}function Vt(e,t=new Date){let n=new Date(e.lastUsed),o=qt(n,t);return Math.sqrt(e.count)*o}function Ke(e,t,n=new Date){return e.actions.find(s=>s.id===t)?{...e,actions:e.actions.map(s=>s.id===t?{...s,count:s.count+1,lastUsed:n.toISOString()}:s)}:{...e,actions:[...e.actions,{id:t,count:1,lastUsed:n.toISOString()}]}}function Qe(e,t,n=new Date){let o=new Map;for(let i of t.actions){let r=Vt(i,n);r>=.1&&o.set(i.id,r)}let s=e.filter(i=>o.has(i)),a=e.filter(i=>!o.has(i));return s.sort((i,r)=>(o.get(r)??0)-(o.get(i)??0)),[...s,...a]}function Xe(){return{version:1,actions:[]}}var Jt=["Two minds, one vision","Better together than alone","Your ideas, amplified","Where human meets machine","The sum of us","Let's build something meaningful","From thought to reality","Creating what neither could alone","Turning possibility into code","What will we make today?","Exploring the edge of possible","Learning never looked like this","Growing smarter, together","Every question opens a door","Uncharted territory, good company","I see what you're building","Your vision, our journey","Thinking alongside you","Understanding before answering"],Yt=["Still here, still building","Every pause is a chance to reflect","The best work takes time","Progress isn't always visible","Let's pick up where we left off","Good things are worth the wait","One conversation at a time"],Kt=["Fresh starts are powerful","We'll figure this out","The first step is showing up","Building begins with connection","Ready when you are","Together, we'll find the way"],Qt=["Two minds, ready to build","Let's see what we can create","The beginning of something","Your partner in possibility"],Xt=["A new day to create","Fresh ideas await","What will we build today?"],Zt=["Wrapping up what we started","Good work deserves reflection","Tomorrow we build on today"];function en(e=new Date){let t=e.getHours();return t<12?"morning":t<18?"afternoon":"evening"}function Ze(e=new Date){let t=new Date(e.getFullYear(),0,0),n=e.getTime()-t.getTime(),o=1e3*60*60*24;return Math.floor(n/o)}function ce(e,t=new Date){let n=Ze(t);return e[n%e.length]}function tn(e){switch(e){case"healthy":return Jt;case"attention":return Yt;case"critical":return Kt;default:return Qt}}function et(e,t,n){let o=n.join(e,".github","config","taglines.json");if(!t.existsSync(o))return null;try{let s=t.readFileSync(o,"utf-8"),a=JSON.parse(s);return!a.taglines?.project||a.taglines.project.length===0?null:a}catch{return null}}function nn(e){let t=[];for(let n of Object.keys(e.taglines)){let o=e.taglines[n];Array.isArray(o)&&t.push(...o)}return t}function tt(e={}){let{status:t="unknown",config:n,useTimeOfDay:o=!0,date:s=new Date}=e,a=Ze(s);if(n&&t==="healthy"){let r=n.rotation?.projectWeight??50,p=Math.floor(r);if(a%100<p){let d=nn(n);if(d.length>0)return ce(d,s)}}if(o&&t==="healthy"&&a%10===0){let r=en(s);if(r==="morning")return ce(Xt,s);if(r==="evening")return ce(Zt,s)}let i=tn(t);return ce(i,s)}var I=m(require("fs")),H=m(require("path"));function on(e){let t=e.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);return t?e.slice(t[0].length).trim():e.trim()}function sn(e){let t=H.join(e,".github","skills");if(!I.existsSync(t))return[];let n=[],o;try{o=I.readdirSync(t,{withFileTypes:!0})}catch{return[]}for(let s of o){if(!s.isDirectory())continue;let a=H.join(t,s.name,"loop-config.partial.json");if(I.existsSync(a))try{let i=JSON.parse(I.readFileSync(a,"utf-8"));if(Array.isArray(i.groups))for(let r of i.groups)n.push({...r,source:"skill"})}catch{}}return n}function an(e,t){let n=e.map(o=>({...o,buttons:[...o.buttons]}));for(let o of t){let s=n.find(a=>a.id===o.id);if(s){let a=new Set(s.buttons.map(i=>i.id??i.label));for(let i of o.buttons){let r=i.id??i.label;a.has(r)||(s.buttons.push(i),a.add(r))}}else n.push({...o,buttons:[...o.buttons]})}return n}function rn(e,t){return t?e.filter(n=>!n.phase||n.phase.includes(t)).map(n=>{let o=n.buttons.filter(a=>!a.phase||a.phase.includes(t)),s=n.phase?.includes(t);return{...n,buttons:o,collapsed:s?!1:n.collapsed}}).filter(n=>n.buttons.length>0):e}function cn(e,t){let n={id:e.id,icon:e.icon,label:e.label,command:e.command,hint:e.hint,tooltip:e.tooltip};if(e.promptFile){let o=H.join(t,e.promptFile);try{I.existsSync(o)&&(n.prompt=on(I.readFileSync(o,"utf-8")))}catch{}}return!n.prompt&&e.prompt&&(n.prompt=e.prompt),e.file&&(n.file=e.file),n}function nt(e){let t=H.join(e,".github","config","loop-menu.json");if(!I.existsSync(t))return[];let n;try{n=JSON.parse(I.readFileSync(t,"utf-8"))}catch{return[]}if(!Array.isArray(n.groups))return[];let o=sn(e),s=an(n.groups,o),a=rn(s,n.projectPhase),i=H.join(e,".github","prompts","loop");return a.map(r=>({id:r.id,label:r.label,desc:r.desc,accent:r.accent,icon:r.icon,collapsed:r.collapsed,buttons:r.buttons.map(p=>cn(p,i))}))}var le=m(require("vscode")),rt=require("child_process");var U={recentAgentPRs:[],pendingReviews:[],totalPending:0,lastFetched:null,error:null};function ot(e,t){return new Promise(n=>{let o=e.split(/\s+/);(0,rt.execFile)("gh",o,{cwd:t,timeout:15e3,maxBuffer:1024*1024},(s,a)=>{if(s){n(null);return}n(a.trim())})})}function st(e){if(!e)return[];try{return JSON.parse(e).map(n=>({number:n.number,title:n.title,url:n.url,state:n.state,author:n.author?.login??"unknown",createdAt:n.createdAt,updatedAt:n.updatedAt,isDraft:n.isDraft??!1,reviewDecision:n.reviewDecision??"",labels:(n.labels??[]).map(o=>o.name)}))}catch{return[]}}var it="number,title,url,state,author,createdAt,updatedAt,isDraft,reviewDecision,labels";var ye=!1;async function we(e,t){if(!ye){ye=!0;try{let[n,o]=await Promise.all([ot(`pr list --author app/copilot-swe-agent --state all --limit 10 --json ${it}`,e),ot(`pr list --search review-requested:@me --state open --limit 10 --json ${it}`,e)]),s=st(n),a=st(o);U={recentAgentPRs:s,pendingReviews:a,totalPending:a.length,lastFetched:new Date,error:null}}catch(n){U={...U,error:n instanceof Error?n.message:String(n)}}ye=!1,t?.()}}function ln(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/36e5);if(n<1)return"just now";if(n<24)return`${n}h ago`;let o=Math.floor(n/24);return o===1?"yesterday":`${o}d ago`}function dn(e){return e.state==="merged"?"git-merge":e.state==="closed"?"close":e.isDraft?"git-pull-request-draft":"git-pull-request"}function pn(e){return e.state==="merged"?"var(--vscode-charts-purple, #a371f7)":e.state==="closed"?"var(--vscode-errorForeground, #f85149)":"var(--vscode-charts-green, #3fb950)"}function ct(e){let t=U;if(t.error||!t.recentAgentPRs.length&&!t.pendingReviews.length)return`
    <div class="agent-activity">
      <div class="agent-activity-empty">
        <span class="codicon codicon-info"></span>
        ${t.error?"GitHub CLI not available or not authenticated.":"No agent PRs found. Agent activity will appear here."}
      </div>
    </div>`;let n='<div class="agent-activity">';if(t.pendingReviews.length>0){n+=`
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-eye"></span>
        <strong>Pending Reviews</strong>
        <span class="agent-badge">${t.pendingReviews.length}</span>
      </div>`;for(let o of t.pendingReviews)n+=at(o);n+="</div>"}if(t.recentAgentPRs.length>0){n+=`
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-hubot"></span>
        <strong>Recent Agent Sessions</strong>
      </div>`;for(let o of t.recentAgentPRs.slice(0,5))n+=at(o);n+="</div>"}return n+="</div>",n}function at(e){let t=dn(e),n=pn(e);return`
  <div class="agent-pr-row" data-command="openExternal" data-file="${b(e.url)}" role="button" tabindex="0">
    <span class="codicon codicon-${b(t)}" style="color:${b(n)};"></span>
    <div class="agent-pr-info">
      <span class="agent-pr-title">${S(e.title)}</span>
      <span class="agent-pr-meta">#${e.number} \xB7 ${S(ln(e.createdAt))} \xB7 ${S(e.author)}</span>
    </div>
  </div>`}var w=null;function lt(e){return w=le.window.createStatusBarItem(le.StatusBarAlignment.Right,50),w.command="alex.openChat",w.name="Alex Agent Activity",e.subscriptions.push(w),w}function ke(e){if(!w)return;if(!e){w.text="$(brain) Alex",w.tooltip="Alex Cognitive Architecture",w.show();return}let t=U.pendingReviews;t.length>0?(w.text=`$(brain) Alex $(bell-dot) ${t.length}`,w.tooltip=`${t.length} PR${t.length===1?"":"s"} awaiting review`):(w.text="$(brain) Alex",w.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"),w.show(),we(e,()=>{let n=U.pendingReviews;w&&(n.length>0?(w.text=`$(brain) Alex $(bell-dot) ${n.length}`,w.tooltip=`${n.length} PR${n.length===1?"":"s"} awaiting review`):(w.text="$(brain) Alex",w.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"))})}var dt=`
  .agent-activity { margin: 8px 0; }
  .agent-activity-empty {
    padding: 12px;
    text-align: center;
    color: var(--vscode-descriptionForeground);
    font-size: 11px;
  }
  .agent-activity-empty .codicon { margin-right: 4px; }
  .agent-section { margin-bottom: 12px; }
  .agent-section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
  }
  .agent-badge {
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border-radius: 8px;
    padding: 0 6px;
    font-size: 10px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }
  .agent-pr-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 4px;
  }
  .agent-pr-row:hover { background: var(--vscode-list-hoverBackground); }
  .agent-pr-row .codicon { margin-top: 2px; flex-shrink: 0; }
  .agent-pr-info { display: flex; flex-direction: column; min-width: 0; }
  .agent-pr-title {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .agent-pr-meta {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
  }
`;var un="alex.welcomeView",fn=A.resolve(__dirname,"..","package.json"),gt=(()=>{try{return JSON.parse(O.readFileSync(fn,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}})(),xe="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki",gn=[{id:"workspace",label:"WORKSPACE",icon:"folder",desc:"Initialize and upgrade your cognitive architecture",collapsed:!1,buttons:[{icon:"sync",label:"Initialize Workspace",command:"initialize",tooltip:"Install Alex brain files in this workspace",hint:"command"},{icon:"arrow-up",label:"Upgrade Architecture",command:"upgrade",tooltip:"Update to the latest brain architecture",hint:"command"},{icon:"cloud",label:"Setup AI-Memory",command:"setupAIMemory",tooltip:"Find or create the shared AI-Memory knowledge store",hint:"command"}]},{id:"brain-status",label:"BRAIN STATUS",icon:"symbol-structure",desc:"Cognitive architecture health and maintenance",collapsed:!1,buttons:[{icon:"symbol-event",label:"Run Dream Protocol",command:"dream",tooltip:"Autonomous architecture maintenance",hint:"command"},{icon:"heart",label:"Meditate",command:"openChat",prompt:"Run a meditation session \u2014 consolidate knowledge, review recent changes, and strengthen architecture",tooltip:"Knowledge consolidation session",hint:"chat"},{icon:"graph",label:"Self-Actualize",command:"openChat",prompt:"Run a self-actualization assessment \u2014 evaluate architecture completeness, identify growth areas, and plan improvements",tooltip:"Deep self-assessment and growth",hint:"chat"}]},{id:"user-memory",label:"USER MEMORY",icon:"notebook",desc:"Access your persistent memory locations",collapsed:!0,buttons:[{icon:"notebook",label:"Memories",command:"openMemories",tooltip:"Open VS Code user memories folder",hint:"command"},{icon:"edit",label:"User Prompts",command:"openPrompts",tooltip:"Reusable prompt templates",hint:"command"},{icon:"server",label:"MCP Config",command:"openMcpConfig",tooltip:"Model Context Protocol servers",hint:"command"},{icon:"cloud",label:"Copilot Memory (GitHub)",command:"openExternal",file:"https://github.com/settings/copilot",tooltip:"Manage cloud-synced Copilot memory",hint:"link"}]},{id:"environment",label:"ENVIRONMENT",icon:"settings-gear",desc:"Extension settings",collapsed:!0,buttons:[{icon:"settings-gear",label:"Open Extension Settings",command:"openSettings",tooltip:"Configure Alex extension behavior",hint:"command"}]},{id:"learn",label:"LEARN",icon:"book",desc:"Documentation and support resources",collapsed:!0,buttons:[{icon:"book",label:"Documentation",command:"openExternal",file:`${xe}`,tooltip:"Full documentation on GitHub Wiki",hint:"link"},{icon:"comment-discussion",label:"User Stories",command:"openExternal",file:`${xe}/blog/README`,tooltip:"Real-world examples of working with Alex",hint:"link"},{icon:"mortar-board",label:"Tutorials",command:"openExternal",file:`${xe}/tutorials/README`,tooltip:"Step-by-step guides for common tasks",hint:"link"},{icon:"lightbulb",label:"LearnAI Playbooks",command:"openExternal",file:"https://learnai.correax.com/",tooltip:"80 AI playbooks for professional disciplines",hint:"link"},{icon:"bug",label:"Report an Issue",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/issues",tooltip:"Found a bug? Let us know",hint:"link"}]},{id:"about",label:"ABOUT",icon:"info",collapsed:!0,buttons:[{icon:"info",label:`v${gt}`,command:"noop"},{icon:"person",label:"Publisher: fabioc-aloha",command:"openExternal",file:"https://github.com/fabioc-aloha",hint:"link"},{icon:"law",label:"PolyForm Noncommercial 1.0.0",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md",hint:"link"}]}],hn=["https://github.com/","https://marketplace.visualstudio.com/","https://learnai.correax.com/"],pt="alex.quickActionFrecency",V=class{constructor(t,n){this.extensionUri=t;this.globalState=n;this.workspaceRoot=g.workspace.workspaceFolders?.[0]?.uri.fsPath??"",this.frecencyData=n.get(pt)??Xe()}static viewId=un;view;workspaceRoot;frecencyData;disposables=[];dispose(){for(let t of this.disposables)t.dispose();this.disposables.length=0}recordActionUse(t){this.frecencyData=Ke(this.frecencyData,t),this.globalState.update(pt,this.frecencyData)}loopGroupsCache=null;getLoopGroups(){return this.loopGroupsCache||(this.loopGroupsCache=this.workspaceRoot?nt(this.workspaceRoot):[]),this.loopGroupsCache}renderGroupsWithFrecency(t){let n=t.map(o=>{if(o.id==="creative-loop")return o;let s=o.buttons.map(r=>r.id??r.label.toLowerCase().replace(/\s+/g,"-")),i=Qe(s,this.frecencyData).map(r=>o.buttons.find(p=>(p.id??p.label.toLowerCase().replace(/\s+/g,"-"))===r)).filter(r=>r!==void 0);return{...o,buttons:i}});return ut(n)}refresh(){this.loopGroupsCache=null,this.view&&(this.view.webview.html=this.getHtml(this.view.webview))}resolveWebviewView(t,n,o){this.view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this.extensionUri]},t.webview.html=this.getHtml(t.webview),this.workspaceRoot&&we(this.workspaceRoot,()=>this.refresh()),t.webview.onDidReceiveMessage(s=>this.handleMessage(s)),t.onDidChangeVisibility(()=>{t.visible&&this.refresh()})}async handleMessage(t){switch(t.actionId&&this.recordActionUse(t.actionId),t.command){case"openChat":if(t.prompt){let n=t.prompt.endsWith(": ");await g.commands.executeCommand("workbench.action.chat.open",{query:t.prompt,isPartialQuery:n})}else await g.commands.executeCommand("workbench.action.chat.open");break;case"initialize":await g.commands.executeCommand("alex.initialize");break;case"upgrade":await g.commands.executeCommand("alex.upgrade");break;case"setupAIMemory":await g.commands.executeCommand("alex.setupAIMemory");break;case"dream":await g.commands.executeCommand("alex.dream");break;case"openSettings":await g.commands.executeCommand("workbench.action.openSettings","alex");break;case"openMemories":{let n=process.env.APPDATA||process.env.HOME;if(n){let o=g.Uri.file(A.join(n,"Code","User","globalStorage","github.copilot-chat","memory-tool","memories"));try{await g.commands.executeCommand("revealFileInOS",o)}catch{await g.commands.executeCommand("vscode.openFolder",o,{forceNewWindow:!1})}}}break;case"openPrompts":{let n=process.env.APPDATA||process.env.HOME;if(n){let o=g.Uri.file(A.join(n,"Code","User","prompts"));try{await g.commands.executeCommand("revealFileInOS",o)}catch{await g.commands.executeCommand("vscode.openFolder",o,{forceNewWindow:!1})}}}break;case"openMcpConfig":{let n=process.env.APPDATA||process.env.HOME;if(n){let o=g.Uri.file(A.join(n,"Code","User","mcp.json"));await g.commands.executeCommand("vscode.open",o)}}break;case"openExternal":if(t.file){let n=String(t.file);hn.some(o=>n.startsWith(o))&&await g.env.openExternal(g.Uri.parse(n))}break;case"refresh":this.refresh();break;case"toggleTask":if(this.workspaceRoot&&t.file){let n=Le(this.workspaceRoot,t.file);if(n){this.refresh();let o=n.find(s=>s.id===t.file);if(o){let s=o.enabled?"enabled":"disabled",a=o.enabled?"Workflow created.":"Workflow removed.";g.window.showInformationMessage(`Task "${o.name}" ${s}. ${a} Commit & push to activate on GitHub.`)}}}break;case"addTask":this.workspaceRoot&&await qe(this.workspaceRoot)&&this.refresh();break;case"deleteTask":this.workspaceRoot&&t.file&&await g.window.showWarningMessage(`Delete task "${t.file}"?`,{modal:!0},"Delete")==="Delete"&&Ge(this.workspaceRoot,t.file)!==null&&(this.refresh(),g.window.showInformationMessage(`Task "${t.file}" deleted. Commit & push to remove the workflow from GitHub.`));break;case"openPromptFile":if(this.workspaceRoot&&t.file){let n=A.resolve(this.workspaceRoot,t.file);if(!n.toLowerCase().startsWith(this.workspaceRoot.toLowerCase()+A.sep)&&n.toLowerCase()!==this.workspaceRoot.toLowerCase())break;O.existsSync(n)?await g.commands.executeCommand("vscode.open",g.Uri.file(n)):g.window.showWarningMessage(`Prompt file not found: ${t.file}`)}break;case"runTask":if(this.workspaceRoot&&t.file){let n=q(this.workspaceRoot),o=ve(this.workspaceRoot,t.file);if(De(this.workspaceRoot,t.file),this.refresh(),n&&o)try{let s=await oe(n,t.file,a=>{this.refresh()});this.disposables.push(s),g.window.showInformationMessage(`Workflow dispatched for "${t.file}". Monitoring execution\u2026`)}catch(s){let a=s instanceof Error?s.message:String(s);g.window.showErrorMessage(`Failed to dispatch workflow: ${a}`)}else{let a=N(this.workspaceRoot).find(i=>i.id===t.file);if(a?.promptFile){let i=A.resolve(this.workspaceRoot,a.promptFile),r=this.workspaceRoot.toLowerCase()+A.sep;if(!i.toLowerCase().startsWith(r))break;if(O.existsSync(i)){let p=O.readFileSync(i,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();await g.commands.executeCommand("workbench.action.chat.open",{query:p,isPartialQuery:!1})}else g.window.showWarningMessage(`Prompt file not found: ${a.promptFile}`)}}}break;case"clearRunStatus":t.file&&(Me(t.file),this.refresh());break;case"openScheduleConfig":if(this.workspaceRoot){let n=A.join(this.workspaceRoot,".github","config","scheduled-tasks.json");O.existsSync(n)&&await g.commands.executeCommand("vscode.open",g.Uri.file(n))}break;case"noop":break;case"switchTab":break}}getHtml(t){let n=mn(),o=t.asWebviewUri(g.Uri.joinPath(this.extensionUri,"node_modules","@vscode","codicons","dist","codicon.css")),a=(this.workspaceRoot?Ye(this.workspaceRoot):null)?.status??"unknown",i=this.workspaceRoot?et(this.workspaceRoot,O,A):null,r=tt({status:a,config:i});return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${t.cspSource}; style-src ${t.cspSource} 'nonce-${n}'; font-src ${t.cspSource}; script-src 'nonce-${n}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${o}" rel="stylesheet">
  <style nonce="${n}">
    /* \u2550\u2550\u2550 Design Tokens \u2550\u2550\u2550 */
    :root {
      /* Spacing scale (8px base) */
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 12px;
      --spacing-lg: 16px;
      --spacing-xl: 24px;
      
      /* Touch targets (WCAG 2.1 AA 2.5.5) */
      --touch-target: 44px;
      --touch-target-sm: 36px;
      
      /* Typography */
      --font-xs: 10px;
      --font-sm: 11px;
      --font-md: 12px;
      --font-lg: 13px;
      --font-xl: 14px;
      
      /* Brand colors */
      --accent: #6366f1;
      --accent-light: #818cf8;
      --accent-subtle: color-mix(in srgb, var(--accent) 15%, transparent);
      
      /* Component tokens */
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      --section-gap: var(--spacing-sm);
      --btn-radius: var(--radius-md);
      
      /* Focus ring */
      --focus-ring: 2px solid var(--accent);
      --focus-ring-offset: 2px;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: var(--spacing-sm) var(--spacing-md);
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--accent) 40%, transparent) transparent;
      line-height: 1.5;
    }

    /* Header \u2014 branded banner (always dark, matches Alex banner SVGs) */
    .header {
      position: relative;
      background: #0f172a;
      border-left: 4px solid var(--accent);
      padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
      margin: calc(-1 * var(--spacing-sm)) calc(-1 * var(--spacing-md)) var(--spacing-sm);
      overflow: hidden;
    }
    .header-neural {
      position: absolute;
      right: 8px;
      top: 6px;
      width: 100px;
      height: 55px;
      pointer-events: none;
    }
    .header-ghost {
      position: absolute;
      right: -4px;
      bottom: -8px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 72px;
      font-weight: 800;
      color: #f1f5f9;
      opacity: 0.06;
      pointer-events: none;
      line-height: 1;
      user-select: none;
    }
    .header-series {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 7.5px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .header h1 {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 2px;
      line-height: 1.1;
    }
    .header .tagline {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      line-height: 1.35;
    }
    .header .version {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 9px;
      color: #64748b;
      margin-top: 3px;
    }



    /* Tabs \u2014 44px touch target (WCAG 2.1 AA 2.5.5) */
    .tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid color-mix(in srgb, var(--accent) 25%, var(--vscode-panel-border));
      margin-bottom: var(--section-gap);
    }
    .tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      min-height: var(--touch-target);
      padding: var(--spacing-md) var(--spacing-sm);
      font-size: var(--font-sm);
      font-weight: 500;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      border: none;
      border-bottom: 2px solid transparent;
      background: none;
      transition: color 0.15s, border-color 0.15s, background 0.12s;
    }
    .tab .codicon { font-size: 15px; opacity: 0.6; transition: opacity 0.12s; }
    .tab:hover { color: var(--vscode-foreground); background: var(--vscode-list-hoverBackground); }
    .tab:hover .codicon { opacity: 1; }
    .tab:focus-visible {
      outline: var(--focus-ring);
      outline-offset: -2px;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    }
    .tab.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      font-weight: 600;
      background: var(--accent-subtle);
    }
    .tab.active .codicon { opacity: 1; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* Action groups \u2014 collapsible sections */
    .group {
      margin-bottom: var(--spacing-sm);
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .group-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-foreground);
      min-height: var(--touch-target);
      padding: var(--spacing-md) var(--spacing-lg);
      margin: 0;
      cursor: pointer;
      background: var(--accent-subtle);
      border-bottom: 1px solid transparent;
      transition: background 0.15s, border-color 0.15s;
      user-select: none;
    }
    .group-header:hover {
      background: color-mix(in srgb, var(--accent) 18%, transparent);
    }
    .group-header:focus-visible {
      outline: var(--focus-ring);
      outline-offset: -2px;
    }
    .group-header .codicon {
      font-size: 14px;
      opacity: 0.8;
      transition: color 0.15s;
    }
    .group.expanded .group-header .codicon:first-child {
      color: var(--accent);
    }
    .group-header .chevron {
      margin-left: auto;
      font-size: 13px;
      opacity: 0.5;
      transition: transform 0.2s ease-out;
    }
    .group.expanded .group-header {
      border-bottom-color: var(--vscode-panel-border);
    }
    .group.expanded .group-header .chevron {
      transform: rotate(90deg);
    }
    .group-desc {
      font-size: var(--font-sm);
      color: var(--vscode-descriptionForeground);
      padding: 0 var(--spacing-lg);
      margin: 0;
      line-height: 1.45;
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      transition: opacity 0.15s, max-height 0.2s, padding 0.15s;
    }
    .group.expanded .group-desc {
      opacity: 0.85;
      max-height: 60px;
      padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-xs);
    }
    .group-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.25s ease-out;
    }
    .group.expanded .group-content {
      max-height: 2000px;
    }
    .group-buttons {
      padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-sm);
    }

    /* Buttons \u2014 44px touch target (WCAG 2.1 AA 2.5.5) */
    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      width: 100%;
      min-height: var(--touch-target);
      padding: var(--spacing-sm) var(--spacing-md);
      margin-bottom: 2px;
      font-size: var(--font-md);
      color: var(--vscode-foreground);
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      transition: background 0.12s ease, box-shadow 0.15s ease, transform 0.1s;
      position: relative;
    }
    .action-btn:hover {
      background: var(--vscode-list-hoverBackground);
      padding-left: calc(var(--spacing-md) + 2px);
      border-left: 2px solid color-mix(in srgb, var(--accent) 50%, transparent);
    }
    .action-btn:focus-visible {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
      box-shadow: 0 0 0 4px var(--accent-subtle);
    }
    .action-btn:active {
      transform: scale(0.99);
    }
    .action-btn .codicon {
      font-size: 15px;
      opacity: 0.7;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
      transition: opacity 0.12s;
    }
    .action-btn:hover .codicon {
      opacity: 1;
    }
    .action-btn .btn-label {
      flex: 1;
      min-width: 0;
    }
    .action-btn.primary {
      background: var(--accent);
      color: #fff;
      font-weight: 600;
      justify-content: center;
      text-align: center;
      min-height: 48px;
      padding: var(--spacing-md) var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      border-radius: var(--radius-md);
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    .action-btn.primary .codicon {
      width: auto;
      opacity: 1;
    }
    .action-btn.primary:hover {
      background: var(--accent-light);
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
      padding-left: var(--spacing-lg);
      border-left: none;
    }

    /* Hint badges \u2014 show button behavior (chat/link/command) */
    .hint-badge {
      font-size: var(--font-sm);
      opacity: 0.35;
      flex-shrink: 0;
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      transition: opacity 0.12s, background 0.12s;
    }
    .hint-badge .codicon {
      font-size: 12px;
    }
    .action-btn:hover .hint-badge {
      opacity: 0.8;
      background: var(--vscode-toolbar-hoverBackground);
    }

    /* Tooltips \u2014 positioned to avoid overflow */
    .action-btn[data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-sm);
      font-weight: normal;
      color: var(--vscode-editorWidget-foreground);
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-editorWidget-border);
      border-radius: var(--radius-sm);
      white-space: nowrap;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      animation: tooltip-fade 0.15s ease-out;
    }
    @keyframes tooltip-fade {
      from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
      to { opacity: 1; transform: translateY(-50%) translateX(0); }
    }
    ${Ve}
    ${dt}
  </style>
</head>
<body>
  <!-- Header \u2014 branded banner -->
  <div class="header">
    <svg class="header-neural" viewBox="0 0 120 65" aria-hidden="true">
      <line x1="25" y1="10" x2="65" y2="30" stroke="#6366f1" stroke-width="1.5" opacity="0.30"/>
      <line x1="65" y1="30" x2="45" y2="55" stroke="#818cf8" stroke-width="1.5" opacity="0.22"/>
      <line x1="25" y1="10" x2="100" y2="8" stroke="#6366f1" stroke-width="1.5" opacity="0.22"/>
      <line x1="100" y1="8" x2="65" y2="30" stroke="#818cf8" stroke-width="1.5" opacity="0.18"/>
      <line x1="65" y1="30" x2="105" y2="48" stroke="#6366f1" stroke-width="1.5" opacity="0.18"/>
      <line x1="45" y1="55" x2="105" y2="48" stroke="#818cf8" stroke-width="1.5" opacity="0.15"/>
      <circle cx="25" cy="10" r="4.5" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0.40"/>
      <circle cx="65" cy="30" r="6" fill="none" stroke="#818cf8" stroke-width="1.5" opacity="0.35"/>
      <circle cx="100" cy="8" r="3.5" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0.30"/>
      <circle cx="45" cy="55" r="4.5" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0.30"/>
      <circle cx="105" cy="48" r="3" fill="none" stroke="#818cf8" stroke-width="1.5" opacity="0.25"/>
    </svg>
    <div class="header-ghost">ALEX</div>
    <div class="header-series">Alex Cognitive Architecture</div>
    <h1>Alex</h1>
    <div class="tagline">${S(r)}</div>
    <div class="version">v${gt}</div>
  </div>

  <!-- Tabs -->
  <div class="tabs" role="tablist">
    <button class="tab active" role="tab" id="tab-btn-loop" data-tab="loop" aria-selected="true" aria-controls="tab-loop">
      <span class="codicon codicon-sync"></span> Loop
    </button>
    <button class="tab" role="tab" id="tab-btn-autopilot" data-tab="autopilot" aria-selected="false" aria-controls="tab-autopilot">
      <span class="codicon codicon-radio-tower"></span> Autopilot
    </button>
    <button class="tab" role="tab" id="tab-btn-setup" data-tab="setup" aria-selected="false" aria-controls="tab-setup">
      <span class="codicon codicon-gear"></span> Setup
    </button>
  </div>

  <!-- Loop Tab -->
  <div id="tab-loop" class="tab-panel active" role="tabpanel" aria-labelledby="tab-btn-loop">
    <!-- Chat CTA -->
    ${ht({icon:"comment-discussion",label:"Chat with Alex",command:"openChat",hint:"chat"},!0)}

    ${this.renderGroupsWithFrecency(this.getLoopGroups())}
  </div>

  <!-- Setup Tab -->
  <div id="tab-setup" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-setup">
    ${ut(gn)}
  </div>

  <!-- Autopilot Tab -->
  <div id="tab-autopilot" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-autopilot">
    ${this.workspaceRoot?ct(this.workspaceRoot):""}
    ${ze(this.workspaceRoot?N(this.workspaceRoot):[],this.workspaceRoot?q(this.workspaceRoot):void 0,this.workspaceRoot)}
  </div>

  <script nonce="${n}">
    const vscode = acquireVsCodeApi();

    // Tab switching with state persistence
    const savedTab = vscode.getState()?.activeTab || 'loop';
    if (savedTab !== 'loop') {
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      const activeTab = document.querySelector('.tab[data-tab="' + savedTab + '"]');
      if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
      }
      const activePanel = document.getElementById('tab-' + savedTab);
      if (activePanel) activePanel.classList.add('active');
    }

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
        vscode.setState({ activeTab: tab.dataset.tab });
      });
    });

    // Collapsible groups \u2014 persist state
    const savedGroupState = vscode.getState()?.collapsedGroups || {};
    document.querySelectorAll('.group').forEach(group => {
      const groupId = group.dataset.groupId;
      if (groupId && savedGroupState[groupId] === false) {
        group.classList.remove('expanded');
      } else if (groupId && savedGroupState[groupId] === true) {
        group.classList.add('expanded');
      }
    });

    document.querySelectorAll('.group-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.group');
        if (!group) return;
        const isExpanded = group.classList.toggle('expanded');
        header.setAttribute('aria-expanded', isExpanded.toString());

        // Persist collapsed state
        const groupId = group.dataset.groupId;
        if (groupId) {
          const state = vscode.getState() || {};
          const collapsedGroups = state.collapsedGroups || {};
          collapsedGroups[groupId] = isExpanded;
          vscode.setState({ ...state, collapsedGroups });
        }
      });

      // Keyboard support
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });

    // Button clicks \u2014 event delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-command]');
      if (!btn) return;
      const command = btn.dataset.command;
      const prompt = btn.dataset.prompt;
      const file = btn.dataset.file;
      const actionId = btn.dataset.actionId;
      vscode.postMessage({ command, prompt, file, actionId });
    });


  </script>
</body>
</html>`}};function mn(){return ft.randomBytes(16).toString("hex")}function ut(e){return e.map(t=>{let n=t.collapsed===!1?"expanded":"",o=t.icon?`<span class="codicon codicon-${b(t.icon)}"></span>`:"";return`
    <div class="group ${n}" data-group-id="${b(t.id)}">
      <div class="group-header" role="button" tabindex="0" aria-expanded="${t.collapsed===!1}">
        ${o}
        <span>${S(t.label)}</span>
        <span class="codicon codicon-chevron-right chevron" aria-hidden="true"></span>
      </div>
      ${t.desc?`<div class="group-desc">${S(t.desc)}</div>`:""}
      <div class="group-content">
        <div class="group-buttons">
          ${t.buttons.map(s=>ht(s)).join("")}
        </div>
      </div>
    </div>`}).join("")}function ht(e,t=!1){let n=t?"action-btn primary":"action-btn",o=e.id??e.label.toLowerCase().replace(/\s+/g,"-"),s=[`data-command="${b(e.command)}"`,`data-action-id="${b(o)}"`,e.prompt?`data-prompt="${b(e.prompt)}"`:"",e.file?`data-file="${b(e.file)}"`:"",e.tooltip?`data-tooltip="${b(e.tooltip)}"`:""].filter(Boolean).join(" "),a={chat:"comment-discussion",link:"link-external",command:"zap"},i=e.hint?`<span class="hint-badge" title="${e.hint}"><span class="codicon codicon-${a[e.hint]}"></span></span>`:"";return`<button class="${n}" ${s}>
    <span class="codicon codicon-${b(e.icon)}"></span>
    <span class="btn-label">${S(e.label)}</span>
    ${i}
  </button>`}var Y=m(require("fs")),J=m(require("path"));function h(e,...t){return Y.existsSync(J.join(e,...t))}function mt(e){try{return JSON.parse(Y.readFileSync(e,"utf-8"))}catch{return null}}function vn(e,t){let n=[];(t||h(e,"tsconfig.json"))&&n.push("TypeScript"),(h(e,"requirements.txt")||h(e,"pyproject.toml")||h(e,"setup.py"))&&n.push("Python"),h(e,"go.mod")&&n.push("Go"),h(e,"Cargo.toml")&&n.push("Rust"),(h(e,"pom.xml")||h(e,"build.gradle"))&&n.push("Java");let o={...t?.dependencies??{},...t?.devDependencies??{}};if((o.react||o["react-dom"])&&n.push("React"),o.next&&n.push("Next.js"),o.vue&&n.push("Vue"),o.vitepress&&n.push("VitePress"),o.express&&n.push("Express"),o.fastify&&n.push("Fastify"),o["@azure/functions"]&&n.push("Azure Functions"),o.esbuild&&n.push("esbuild"),o.webpack&&n.push("webpack"),o.vite&&!o.vitepress&&n.push("Vite"),o.vitest&&n.push("Vitest"),o.jest&&n.push("Jest"),o.mocha&&n.push("Mocha"),(o.eslint||h(e,".eslintrc.json")||h(e,"eslint.config.js")||h(e,"eslint.config.mjs"))&&n.push("ESLint"),(o.prettier||h(e,".prettierrc"))&&n.push("Prettier"),h(e,"pyproject.toml"))try{let s=Y.readFileSync(J.join(e,"pyproject.toml"),"utf-8");s.includes("fastapi")&&n.push("FastAPI"),s.includes("flask")&&n.push("Flask"),s.includes("django")&&n.push("Django"),s.includes("pytest")&&n.push("pytest"),s.includes("ruff")&&n.push("Ruff"),s.includes("mypy")&&n.push("mypy")}catch{}return(h(e,"Dockerfile")||h(e,"docker-compose.yml")||h(e,"docker-compose.yaml"))&&n.push("Docker"),[...new Set(n)]}function bn(e,t){let n={},o=t?.scripts??{};o.build&&(n.buildCommand="npm run build"),o["build:prod"]&&(n.buildCommand="npm run build:prod"),o.test&&(n.testCommand="npm test"),o.lint&&(n.lintCommand="npm run lint"),!n.buildCommand&&h(e,"setup.py")&&(n.buildCommand="python setup.py build"),!n.testCommand&&h(e,"pyproject.toml")&&(n.testCommand="pytest"),!n.buildCommand&&h(e,"go.mod")&&(n.buildCommand="go build ./..."),!n.testCommand&&h(e,"go.mod")&&(n.testCommand="go test ./...");let s=["scripts/release.ps1","scripts/release.sh","scripts/release-vscode.ps1","scripts/release.cjs"];for(let a of s)if(h(e,a)){n.releaseScript=a;break}return n}function de(e){let t=J.join(e,"package.json"),n=mt(t),o=vn(e,n),s=bn(e,n),a="generic";return n&&n.engines?.vscode?(a="vscode-extension",{projectType:a,...s,conventions:o}):h(e,"platforms","vscode-extension","package.json")&&(mt(J.join(e,"platforms","vscode-extension","package.json"))?.engines??{}).vscode?(a="vscode-extension",{projectType:a,...s,conventions:o}):n&&(n.workspaces||h(e,"lerna.json")||h(e,"pnpm-workspace.yaml"))?(a="monorepo",{projectType:a,...s,conventions:o}):h(e,".vitepress","config.ts")||h(e,".vitepress","config.mts")||h(e,"next.config.js")||h(e,"next.config.mjs")||h(e,"gatsby-config.js")||h(e,"astro.config.mjs")?(a="static-site",{projectType:a,...s,conventions:o}):o.includes("FastAPI")||o.includes("Flask")||o.includes("Django")?(a="python-api",{projectType:a,...s,conventions:o}):h(e,"dbt_project.yml")||h(e,"notebook")||h(e,"synapse")||h(e,".pbixproj")?(a="data-pipeline",{projectType:a,...s,conventions:o}):{projectType:a,...s,conventions:o}}var j=m(require("fs")),K=m(require("path"));var yn=[{id:"extension-dev",label:"EXTENSION DEV",icon:"extensions",desc:"Package, publish, test, and debug the VS Code extension",collapsed:!0,buttons:[{id:"ext-package",icon:"package",label:"Package VSIX",command:"openChat",prompt:"Package the VS Code extension into a .vsix file. Run the build first, then package with vsce. Report the file size.",hint:"chat",tooltip:"Build and package the extension"},{id:"ext-publish",icon:"cloud-upload",label:"Publish",command:"openChat",prompt:"Run the release preflight checks, then publish the extension to the VS Code Marketplace. Follow the release-management skill.",hint:"chat",tooltip:"Publish to VS Code Marketplace"},{id:"ext-test",icon:"beaker",label:"Extension Tests",command:"openChat",prompt:"Run all extension tests. Report pass/fail counts and any failures with root cause analysis.",hint:"chat",tooltip:"Run extension test suite"},{id:"ext-debug",icon:"debug-alt",label:"Debug Launch",command:"runCommand",file:"workbench.action.debug.start",hint:"command",tooltip:"Launch Extension Development Host"}]}],wn=[{id:"api-dev",label:"API DEVELOPMENT",icon:"plug",desc:"Run, test, and document API endpoints",collapsed:!0,buttons:[{id:"api-run",icon:"play",label:"Run Server",command:"openChat",prompt:"Start the API development server. Detect the framework (FastAPI/Flask/Django) and use the appropriate command.",hint:"chat",tooltip:"Start the development server"},{id:"api-test",icon:"beaker",label:"Test API",command:"openChat",prompt:"Run the API test suite with pytest. Report coverage, pass/fail counts, and any failures.",hint:"chat",tooltip:"Run API tests with coverage"},{id:"api-lint",icon:"warning",label:"Lint & Type",command:"openChat",prompt:"Run linting (ruff/flake8) and type checking (mypy/pyright) on the Python codebase. Fix any issues found.",hint:"chat",tooltip:"Run linter and type checker"},{id:"api-docs",icon:"book",label:"API Docs",command:"openChat",prompt:"Review and update the API documentation. Ensure OpenAPI/Swagger specs match the current endpoints.",hint:"chat",tooltip:"Update API documentation"}]}],kn=[{id:"pipeline-phases",label:"PIPELINE PHASES",icon:"server-process",desc:"Medallion architecture: ingest, transform, serve",collapsed:!0,buttons:[{id:"bronze",icon:"database",label:"Bronze Layer",command:"openChat",prompt:"Help me work on the Bronze (raw ingestion) layer. Identify data sources, define schemas, implement extraction logic.",hint:"chat",tooltip:"Raw data ingestion patterns"},{id:"silver",icon:"filter",label:"Silver Layer",command:"openChat",prompt:"Help me work on the Silver (cleansed/conformed) layer. Apply data quality rules, standardize schemas, handle nulls and duplicates.",hint:"chat",tooltip:"Cleansing and conforming"},{id:"gold",icon:"star-full",label:"Gold Layer",command:"openChat",prompt:"Help me work on the Gold (business-ready) layer. Build aggregations, KPI calculations, and dimensional models.",hint:"chat",tooltip:"Business-ready aggregations"}]},{id:"data-quality",label:"DATA QUALITY",icon:"verified",desc:"Profile, validate, and trace data lineage",collapsed:!0,buttons:[{id:"profile",icon:"graph-line",label:"Profile Data",command:"openChat",prompt:"Profile the dataset: row counts, null rates, distributions, cardinality, outliers. Present findings in a summary table.",hint:"chat",tooltip:"Statistical data profiling"},{id:"validate",icon:"check",label:"Validate Schema",command:"openChat",prompt:"Validate data schemas against expectations. Check column types, constraints, referential integrity, and naming conventions.",hint:"chat",tooltip:"Schema validation checks"},{id:"lineage",icon:"git-merge",label:"Trace Lineage",command:"openChat",prompt:"Trace data lineage for the selected table or column. Map source-to-target transformations and document the flow.",hint:"chat",tooltip:"Data lineage documentation"}]}],xn=[{id:"site-dev",label:"SITE DEVELOPMENT",icon:"browser",desc:"Dev server, build, deploy, and performance audit",collapsed:!0,buttons:[{id:"site-dev-server",icon:"play",label:"Dev Server",command:"openChat",prompt:"Start the development server for this static site. Detect the framework and use the appropriate dev command.",hint:"chat",tooltip:"Start local dev server"},{id:"site-build",icon:"package",label:"Build Site",command:"openChat",prompt:"Build the static site for production. Report any build warnings or errors.",hint:"chat",tooltip:"Production build"},{id:"site-deploy",icon:"cloud-upload",label:"Deploy",command:"openChat",prompt:"Deploy the site to the configured hosting platform. Run preflight checks first.",hint:"chat",tooltip:"Deploy to hosting"},{id:"site-perf",icon:"dashboard",label:"Performance",command:"openChat",prompt:"Audit site performance: bundle size, image optimization, lazy loading, caching headers, Core Web Vitals.",hint:"chat",tooltip:"Performance and accessibility audit"}]}],Sn=[{id:"cross-package",label:"CROSS-PACKAGE",icon:"references",desc:"Shared types, dependency updates, and coordinated releases",collapsed:!0,buttons:[{id:"deps-update",icon:"package",label:"Update Deps",command:"openChat",prompt:"Check for outdated dependencies across all packages. Propose coordinated updates that maintain compatibility.",hint:"chat",tooltip:"Cross-package dependency updates"},{id:"shared-types",icon:"symbol-interface",label:"Shared Types",command:"openChat",prompt:"Review shared type definitions across packages. Identify drift, inconsistencies, or missing exports.",hint:"chat",tooltip:"Audit shared type definitions"},{id:"release-all",icon:"rocket",label:"Release Train",command:"openChat",prompt:"Coordinate a release across all packages. Check version consistency, run all tests, update changelogs.",hint:"chat",tooltip:"Coordinated multi-package release"}]}],vt={"vscode-extension":yn,"python-api":wn,"data-pipeline":kn,"static-site":xn,monorepo:Sn,generic:[]};function An(e){try{let t=JSON.parse(j.readFileSync(e,"utf-8"));return Array.isArray(t.groups)?t.groups:[]}catch{return[]}}function Cn(e,t){let n=t??de(e),o=K.join(e,".github","config","loop-menu.json"),s=An(o),a=new Set(Object.values(vt).flatMap(d=>d.map(l=>l.id))),i=s.filter(d=>!a.has(d.id)),r=vt[n.projectType]??[],p=[...i,...r],u={};return n.buildCommand&&(u.buildCommand=n.buildCommand),n.testCommand&&(u.testCommand=n.testCommand),n.lintCommand&&(u.lintCommand=n.lintCommand),n.releaseScript&&(u.releaseScript=n.releaseScript),n.conventions.length>0&&(u.conventions=n.conventions),{$schema:"./loop-config.schema.json",$comment:`Loop tab menu configuration \u2014 auto-generated for ${n.projectType} project. Prompts are loaded from .github/prompts/loop/{promptFile} at runtime.`,version:"1.0",projectType:n.projectType,projectPhase:"active-development",groups:p,...Object.keys(u).length>0?{projectContext:u}:{}}}function bt(e,t){let n=Cn(e,t),o=K.join(e,".github","config"),s=K.join(o,"loop-menu.json");try{return j.mkdirSync(o,{recursive:!0}),j.writeFileSync(s,JSON.stringify(n,null,2)+`
`,"utf-8"),!0}catch{return!1}}function yt(e,t){let n=K.join(e,".github","config","loop-menu.json");try{if(!j.existsSync(n))return!1;let o=JSON.parse(j.readFileSync(n,"utf-8"));return o.projectPhase=t,j.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0}catch{return!1}}var C=m(require("vscode")),y=m(require("fs")),x=m(require("path")),Se=m(require("os"));function wt(){let e=[],t=Se.homedir();try{for(let o of y.readdirSync(t))if(/^OneDrive/i.test(o)){let s=x.join(t,o,"AI-Memory");y.existsSync(s)&&e.push(s)}}catch{}let n=x.join(t,"Library","CloudStorage");try{if(y.existsSync(n)){for(let o of y.readdirSync(n))if(/^OneDrive/i.test(o)){let s=x.join(n,o,"AI-Memory");y.existsSync(s)&&e.push(s)}}}catch{}for(let o of[x.join(t,"AI-Memory"),x.join(t,".alex","AI-Memory")])y.existsSync(o)&&e.push(o);return e}function Pn(){let e=[],t=Se.homedir();try{for(let o of y.readdirSync(t))/^OneDrive/i.test(o)&&e.push(x.join(t,o,"AI-Memory"))}catch{}let n=x.join(t,"Library","CloudStorage");try{if(y.existsSync(n))for(let o of y.readdirSync(n))/^OneDrive/i.test(o)&&e.push(x.join(n,o,"AI-Memory"))}catch{}return e.push(x.join(t,"AI-Memory")),e.push(x.join(t,".alex","AI-Memory")),e}function Ae(){let e=C.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&y.existsSync(e))return e;let t=wt();return t.length>0?t[0]:null}var Tn=[".github","announcements","feedback","insights","knowledge","patterns"],$n={"global-knowledge.md":`# Global Knowledge

Cross-project patterns, insights, and reusable solutions.

## Patterns

## Insights

## Anti-Patterns
`,"notes.md":`# Session Notes

Quick notes, reminders, and observations.

## Quick Notes

## Reminders

## Observations
`,"learning-goals.md":`# Learning Goals

Active learning objectives and progress tracking.

## Active Goals

## Completed
`,"user-profile.json":()=>JSON.stringify({name:"",role:"",preferences:{communication:"direct",codeStyle:"",learningStyle:""},updatedAt:new Date().toISOString()},null,2),"project-registry.json":()=>JSON.stringify({version:1,projects:[],updatedAt:new Date().toISOString()},null,2),"index.json":()=>JSON.stringify({version:1,files:[],updatedAt:new Date().toISOString()},null,2)};function In(e){let t=[];y.existsSync(e)||(y.mkdirSync(e,{recursive:!0}),t.push(e));for(let n of Tn){let o=x.join(e,n);y.existsSync(o)||(y.mkdirSync(o,{recursive:!0}),t.push(o))}for(let[n,o]of Object.entries($n)){let s=x.join(e,n);if(!y.existsSync(s)){let a=typeof o=="function"?o():o;y.writeFileSync(s,a,"utf-8"),t.push(s)}}return t}async function Dn(){let e=C.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&y.existsSync(e)){let i=await C.window.showInformationMessage(`AI-Memory already configured at: ${e}`,"Use This","Change Location");if(i==="Use This")return e;if(!i)return}let t=wt(),n=Pn(),o=[];for(let i of t)o.push({label:"$(check) "+i,description:"Found \u2014 existing AI-Memory",detail:i});for(let i of n)if(!t.includes(i)){let r=/OneDrive/i.test(i);o.push({label:(r?"$(cloud) ":"$(folder) ")+i,description:r?"OneDrive \u2014 recommended (cloud-synced)":"Local fallback",detail:i})}o.push({label:"$(folder-opened) Browse...",description:"Choose a custom location",detail:"__browse__"});let s=await C.window.showQuickPick(o,{title:"AI-Memory Location",placeHolder:"Where should Alex store shared knowledge?",ignoreFocusOut:!0});if(!s)return;let a;if(s.detail==="__browse__"){let i=await C.window.showOpenDialog({canSelectFolders:!0,canSelectFiles:!1,canSelectMany:!1,openLabel:"Select AI-Memory Folder",title:"Choose AI-Memory Location"});if(!i||i.length===0)return;a=i[0].fsPath,x.basename(a).toLowerCase().includes("ai-memory")||(a=x.join(a,"AI-Memory"))}else a=s.detail;return a}async function pe(){let e=await Dn();if(e)try{let t=In(e);return await C.workspace.getConfiguration("alex.aiMemory").update("path",e,C.ConfigurationTarget.Global),t.length>0?C.window.showInformationMessage(`AI-Memory initialized at ${e} (${t.length} items created).`):C.window.showInformationMessage(`AI-Memory linked to ${e} (already complete).`),e}catch(t){let n=t instanceof Error?t.message:String(t);C.window.showErrorMessage(`AI-Memory setup failed: ${n}`);return}}var P=m(require("vscode")),Ce=m(require("path")),B=m(require("fs")),_=class extends P.TreeItem{constructor(n,o,s,a,i){super(n,s);this.metricId=a;this.children=i;this.description=o,this.tooltip=`${n}: ${o}`}},ue=class{constructor(t){this.workspaceRoot=t}_onDidChangeTreeData=new P.EventEmitter;onDidChangeTreeData=this._onDidChangeTreeData.event;refresh(){this._onDidChangeTreeData.fire(void 0)}getTreeItem(t){return t}getChildren(t){return this.workspaceRoot?t?.children?t.children:t?[]:this.getRootItems():[new _("No workspace","Open a folder",P.TreeItemCollapsibleState.None)]}getRootItems(){let t=[],n=Ce.join(this.workspaceRoot,".github","config","agent-metrics.json");if(!B.existsSync(n))return[new _("Not configured","No agent-metrics.json found",P.TreeItemCollapsibleState.None)];let o;try{o=JSON.parse(B.readFileSync(n,"utf-8"))}catch{return[new _("Config error","Invalid agent-metrics.json",P.TreeItemCollapsibleState.None)]}let s=Ce.join(this.workspaceRoot,".agent-metrics-state.json"),a={};if(B.existsSync(s))try{a=JSON.parse(B.readFileSync(s,"utf-8"))}catch{}let i=o.thresholds??{};for(let r of o.metrics){let p=a[r.id],u=p?`${p.value}${r.unit}`:"\u2014",d=i[r.id],l=this.getStatusIcon(r,p?.value,d),v=new _(r.name,u,P.TreeItemCollapsibleState.None,r.id);v.iconPath=new P.ThemeIcon(l);let D=d?`

Warning: ${d.warning}${r.unit} \xB7 Critical: ${d.critical}${r.unit}`:"";v.tooltip=new P.MarkdownString(`**${r.name}**

${r.description}

Current: ${u}${D}`),t.push(v)}return t}getStatusIcon(t,n,o){return n===void 0||!o?"circle-outline":t.id.includes("rate")||t.id==="tasks-run-count"?n<o.critical?"error":n<o.warning?"warning":"check":n>o.critical?"error":n>o.warning?"warning":"check"}};function Q(e){return(e instanceof Error?e.message:String(e)).replace(/[A-Z]:\\[\w\\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g,"[path]")}async function Pe(){let e=c.workspace.getConfiguration(),t="github.copilot.chat.copilotMemory.enabled";e.get(t)!==!1&&await e.update(t,!1,c.ConfigurationTarget.Global)}function Rn(e){Pe(),je(e.workspaceState);let t=c.chat.createChatParticipant("alex.chat",Je);t.iconPath=c.Uri.joinPath(e.extensionUri,"assets","icon.png"),t.followupProvider={provideFollowups(){return[{prompt:"/autopilot list",label:"List Autopilot Tasks",command:"autopilot"}]}},e.subscriptions.push(t);let n=new V(e.extensionUri,e.globalState);e.subscriptions.push(n),e.subscriptions.push(c.window.registerWebviewViewProvider(V.viewId,n));let o=c.workspace.workspaceFolders?.[0]?.uri.fsPath,s=lt(e);ke(o);let a=setInterval(()=>{ke(c.workspace.workspaceFolders?.[0]?.uri.fsPath)},300*1e3);e.subscriptions.push({dispose:()=>clearInterval(a)});let i=new ue(o);e.subscriptions.push(c.window.createTreeView("alex.agentActivity",{treeDataProvider:i})),e.subscriptions.push(c.commands.registerCommand("alex.refreshAgentActivity",()=>{i.refresh()})),e.subscriptions.push(c.commands.registerCommand("alex.refreshWelcome",()=>{n.refresh()})),e.subscriptions.push(c.commands.registerCommand("alex.openChat",()=>{c.commands.executeCommand("workbench.action.chat.open")})),e.subscriptions.push(c.commands.registerCommand("alex.dream",async()=>{try{await c.commands.executeCommand("workbench.action.chat.open",{query:"/dream"})}catch(l){c.window.showErrorMessage(`Dream protocol failed: ${Q(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.initialize",async()=>{try{await Pe(),Ae()||await c.window.showInformationMessage("Alex: Set up AI-Memory for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await pe(),await c.commands.executeCommand("workbench.action.chat.open",{query:"Initialize this workspace with Alex's cognitive architecture"})}catch(l){c.window.showErrorMessage(`Initialize failed: ${Q(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.upgrade",async()=>{try{await Pe(),Ae()||await c.window.showInformationMessage("Alex: AI-Memory not found. Set it up for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await pe(),await c.commands.executeCommand("workbench.action.chat.open",{query:"Upgrade this workspace's cognitive architecture to the latest version"})}catch(l){c.window.showErrorMessage(`Upgrade failed: ${Q(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setupAIMemory",async()=>{try{await pe(),n.refresh()}catch(l){c.window.showErrorMessage(`AI-Memory setup failed: ${Q(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.generateLoopConfig",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}try{let v=de(l);bt(l,v)?c.window.showInformationMessage(`Alex: Loop config generated for ${v.projectType} project (${v.conventions.length} conventions detected).`):c.window.showErrorMessage("Alex: Failed to write loop config.")}catch(v){c.window.showErrorMessage(`Alex: Loop config generation failed \u2014 ${Q(v)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setProjectPhase",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let v=[{label:"Planning",description:"Ideation, research, and design",value:"planning"},{label:"Active Development",description:"Building features and writing code",value:"active-development"},{label:"Testing",description:"QA, integration tests, and validation",value:"testing"},{label:"Release",description:"Packaging, publishing, and deployment",value:"release"},{label:"Maintenance",description:"Bug fixes, upgrades, and monitoring",value:"maintenance"}],D=await c.window.showQuickPick(v.map(L=>({label:L.label,description:L.description,value:L.value})),{placeHolder:"Select the current project phase"});if(!D)return;yt(l,D.value)?(n.refresh(),c.window.showInformationMessage(`Alex: Project phase set to "${D.label}".`)):c.window.showErrorMessage("Alex: Failed to update project phase. Generate a loop config first.")}));let r=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/config/loop-menu.json")),p=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/prompts/loop/*.prompt.md")),u=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/skills/*/loop-config.partial.json")),d=()=>n.refresh();e.subscriptions.push(r,r.onDidChange(d),r.onDidCreate(d),r.onDidDelete(d),p,p.onDidChange(d),p.onDidCreate(d),p.onDidDelete(d),u,u.onDidChange(d),u.onDidCreate(d),u.onDidDelete(d))}function jn(){}0&&(module.exports={activate,deactivate});
