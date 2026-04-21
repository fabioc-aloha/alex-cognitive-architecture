"use strict";var Et=Object.create;var oe=Object.defineProperty;var Ft=Object.getOwnPropertyDescriptor;var Mt=Object.getOwnPropertyNames;var Lt=Object.getPrototypeOf,Ot=Object.prototype.hasOwnProperty;var Gt=(e,t)=>{for(var n in t)oe(e,n,{get:t[n],enumerable:!0})},Ge=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Mt(t))!Ot.call(e,s)&&s!==n&&oe(e,s,{get:()=>t[s],enumerable:!(o=Ft(t,s))||o.enumerable});return e};var m=(e,t,n)=>(n=e!=null?Et(Lt(e)):{},Ge(t||!e||!e.__esModule?oe(n,"default",{value:e,enumerable:!0}):n,e)),Nt=e=>Ge(oe({},"__esModule",{value:!0}),e);var Zn={};Gt(Zn,{activate:()=>Qn,deactivate:()=>Xn});module.exports=Nt(Zn);var l=m(require("vscode"));var Te=m(require("vscode")),ce=m(require("path")),le=m(require("fs"));var g=m(require("fs")),x=m(require("path")),C=m(require("vscode"));function A(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function v(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;").replace(/\\/g,"&#92;")}var N=m(require("fs")),Se=m(require("path")),Ut=".agent-metrics-state.json",_t=2160*60*60*1e3;function Ne(e){return Se.join(e,Ut)}function Ue(e){return Se.join(e,".agent-metrics-runlog.json")}function Ht(e){try{return JSON.parse(N.readFileSync(Ne(e),"utf-8"))}catch{return{}}}function Bt(e,t){N.writeFileSync(Ne(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function Wt(e){try{return JSON.parse(N.readFileSync(Ue(e),"utf-8"))}catch{return{runs:[]}}}function zt(e,t){N.writeFileSync(Ue(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function qt(e){let t=Date.now()-_t;return{runs:e.runs.filter(n=>n.completedAt>t)}}var xe=new Map;function se(e){let t=`${e}:${Date.now()}`;return xe.set(t,{startedAt:Date.now()}),t}function j(e,t,n){let o=xe.get(t),s=Date.now(),r=Wt(e);r.runs.push({taskId:t.split(":")[0],startedAt:o?.startedAt??s,completedAt:s,success:n});let i=qt(r);zt(e,i),xe.delete(t),Jt(e,i)}function Jt(e,t){let n=Ht(e),o=new Date().toISOString(),s=t.runs;if(n["tasks-run-count"]={value:s.length,lastUpdated:o},s.length>0){let i=s.filter(a=>a.success).length;n["task-success-rate"]={value:Math.round(i/s.length*100),lastUpdated:o}}let r=s.map(i=>(i.completedAt-i.startedAt)/1e3).filter(i=>i>0);if(r.length>0){let i=r.reduce((a,p)=>a+p,0)/r.length;n["task-duration"]={value:Math.round(i),lastUpdated:o}}n["loop-guard-triggers"]||(n["loop-guard-triggers"]={value:0,lastUpdated:o}),Bt(e,n)}function Vt(e){let t=e.split(/\s+/);if(t.length!==5)return e;let[n,o,s,r,i]=t,a=`${o.padStart(2,"0")}:${n.padStart(2,"0")} UTC`;return s.startsWith("*/")&&r==="*"&&i==="*"?`Every ${s.slice(2)} days at ${a}`:o.startsWith("*/")?`Every ${o.slice(2)} hours`:s==="*"&&r==="*"&&i==="*"&&!o.includes("/")&&!o.includes(",")?`Daily at ${a}`:s==="*"&&r==="*"&&i!=="*"?`${{0:"Sun",1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat"}[i]??i} at ${a}`:e}function Yt(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);if(n<1)return"just now";if(n<60)return`${n}m ago`;let o=Math.floor(n/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}function Y(e){let t=x.join(e,".git","config");if(g.existsSync(t))try{let n=g.readFileSync(t,"utf-8"),o=n.match(/url\s*=\s*https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)/);if(o)return`https://github.com/${o[1]}`;let s=n.match(/url\s*=\s*git@github\.com:([^/\s]+\/[^/\s.]+)/);return s?`https://github.com/${s[1]}`:void 0}catch{return}}var Kt=x.join(".github","config",".scheduled-tasks-state.json");function _e(e){return x.join(e,Kt)}function Ae(e){try{return JSON.parse(g.readFileSync(_e(e),"utf-8"))}catch{return{}}}function He(e,t){let n=Ae(e);n[t]={lastRun:new Date().toISOString()};let o=_e(e),s=x.dirname(o);g.existsSync(s)||g.mkdirSync(s,{recursive:!0}),g.writeFileSync(o,JSON.stringify(n,null,2)+`
`,"utf-8")}var re=null,Be="alex.scheduledRuns";function We(e){re=e}function Ce(){return re?.get(Be)??{}}function ze(e){re&&re.update(Be,e)}function qe(e){return Ce()[e]}function Je(e){let t=Ce();delete t[e],ze(t)}function ie(e,t){let n=Ce();n[e]=t,ze(n)}function Qt(e,t,n){if(!e.dependsOn||e.dependsOn.length===0)return{satisfied:!0,blocking:[]};let o=Ae(n),s=[];for(let r of e.dependsOn){if(!t.find(p=>p.id===r)){s.push(`${r} (not found)`);continue}let a=qe(r);if(a){a.status==="failure"||a.status==="error"||a.status==="cancelled"?s.push(`${r} (${a.status})`):a.status!=="completed"&&s.push(`${r} (${a.status})`);continue}o[r]?.lastRun||s.push(`${r} (never run)`)}return{satisfied:s.length===0,blocking:s}}function Ve(e){let t=new Map(e.map(i=>[i.id,i])),n=new Set,o=new Set,s=[];function r(i){if(n.has(i)||o.has(i))return;o.add(i);let a=t.get(i);if(a?.dependsOn)for(let p of a.dependsOn)t.has(p)&&r(p);o.delete(i),n.add(i),a&&s.push(a)}for(let i of e)r(i.id);for(let i of e)n.has(i.id)||s.push(i);return s}function Xt(e){let t=e.match(/github\.com\/([^/]+)\/([^/]+)/);if(t)return{owner:t[1],repo:t[2]}}async function ae(e,t,n,o){let s=Xt(e);if(!s)throw new Error("Cannot parse GitHub owner/repo from URL");let r=se(t),i=o??C.workspace.workspaceFolders?.[0]?.uri.fsPath,{owner:a,repo:p}=s,d=`scheduled-${t}.yml`,y={Authorization:`Bearer ${(await C.authentication.getSession("github",["repo"],{createIfNone:!0})).accessToken}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"alex-cognitive-architecture"};ie(t,{status:"queued"}),n({status:"queued"});let O=new Date().toISOString(),M=`https://api.github.com/repos/${a}/${p}/actions/workflows/${d}/dispatches`,J=await fetch(M,{method:"POST",headers:{...y,"Content-Type":"application/json"},body:JSON.stringify({ref:"main"})});if(!J.ok){let L=await J.text(),ke={status:"error"};throw ie(t,ke),n(ke),i&&j(i,r,!1),new Error(`Dispatch failed (${J.status}): ${L}`)}let ve=`https://api.github.com/repos/${a}/${p}/actions/workflows/${d}/runs?per_page=1&created=>${O.slice(0,19)}Z`,te=0,be=120,ye=5e3,G=async()=>{if(te++,te>be){let L={status:"error"};ie(t,L),n(L),i&&j(i,r,!1);return}try{let L=await fetch(ve,{headers:y});if(!L.ok)return ne();let D=(await L.json()).workflow_runs?.[0];if(!D)return ne();let Oe={status:D.status==="completed"?D.conclusion==="success"?"completed":D.conclusion??"failure":D.status??"in_progress",runUrl:D.html_url,conclusion:D.conclusion??void 0};if(ie(t,Oe),n(Oe),D.status!=="completed")return ne();i&&j(i,r,D.conclusion==="success")}catch{return ne()}},V=!1,we=[],ne=()=>{V||we.push(setTimeout(()=>void G(),ye))};return we.push(setTimeout(()=>void G(),3e3)),{dispose:()=>{V=!0,we.forEach(clearTimeout)}}}function _(e){let t=x.join(e,".github","config","scheduled-tasks.json");if(!g.existsSync(t))return[];try{return JSON.parse(g.readFileSync(t,"utf-8")).tasks??[]}catch{return[]}}function Ye(e,t){let n=x.join(e,".github","config","scheduled-tasks.json");if(!g.existsSync(n))return null;try{let o=JSON.parse(g.readFileSync(n,"utf-8")),s=o.tasks?.find(r=>r.id===t);return s?(s.enabled=!s.enabled,g.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),s.enabled?tt(e,s):nt(e,s.id),o.tasks):null}catch{return null}}function Ke(e,t){let n=x.join(e,".github","config","scheduled-tasks.json");if(!g.existsSync(n))return null;try{let o=JSON.parse(g.readFileSync(n,"utf-8")),s=o.tasks?.findIndex(r=>r.id===t);return s===void 0||s<0?null:(o.tasks.splice(s,1),g.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),nt(e,t),o.tasks)}catch{return null}}function Pe(e,t){let n=x.join(e,".github","workflows",`scheduled-${t}.yml`);return g.existsSync(n)}function Qe(e){return x.join(e,".github","workflows")}function Xe(e,t){return x.join(Qe(e),`scheduled-${t}.yml`)}function U(e){return e.replace(/[\\"`$!#&|;(){}<>]/g,"")}function Ze(e){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e))throw new Error(`Invalid task ID: "${e}". Must be lowercase alphanumeric with hyphens.`);return e}function et(e){if(!/^[0-9*\/,\- ]+$/.test(e))throw new Error(`Invalid cron expression: "${e}".`);return e}function Zt(e){let t=U(e.name),n=Ze(e.id),o=et(e.schedule);return`# Auto-generated \u2014 do not edit manually
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
        id: create
        env:
          GH_TOKEN: \${{ github.token }}
          TASK_NAME: "${t}"
          PROMPT_FILE: "${U(e.promptFile??"")}"
        run: |
          ISSUE_URL=$(gh issue create \\
            --title "$TASK_NAME: $(date -u +%Y-%m-%d-%H%M)" \\
            --body-file "$PROMPT_FILE" \\
            --label automated,${n})
          echo "issue_url=$ISSUE_URL" >> $GITHUB_OUTPUT

      - name: Assign Copilot to issue
        if: steps.create.outputs.issue_url != ''
        env:
          GH_TOKEN: \${{ github.token }}
        run: |
          gh issue edit "\${{ steps.create.outputs.issue_url }}" --add-assignee copilot
`}function en(e){let t=U(e.name),n=U(e.description),o=e.muscle?U(e.muscle):"",s=e.muscleArgs?` ${e.muscleArgs.map(U).join(" ")}`:"",r=Ze(e.id),i=et(e.schedule);return`# Auto-generated \u2014 do not edit manually
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

      - name: Run ${r}
        run: node ${o}${s}

      - name: Create PR if changes exist
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          TASK_NAME: "${t}"
          TASK_DESC: "${n}"
        run: |
          git diff --quiet && exit 0
          BRANCH="auto/${r}-$(date -u +%s)"
          git checkout -b "$BRANCH"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "chore(scheduled): ${r} $(date -u +%Y-%m-%d)"
          git push origin "$BRANCH"
          gh pr create \\
            --title "Scheduled: $TASK_NAME $(date -u +%Y-%m-%d)" \\
            --body "## Automated Task: $TASK_NAME\\n\\n$TASK_DESC\\n\\n---\\n\\n*Generated by scheduled-${r}.yml*" \\
            --label automated \\
            --base main
`}function tt(e,t){let n;if(t.mode==="agent"&&t.promptFile)n=Zt(t);else if(t.mode==="direct"&&t.muscle)n=en(t);else return!1;let o=Qe(e);return g.existsSync(o)||g.mkdirSync(o,{recursive:!0}),g.writeFileSync(Xe(e,t.id),n,"utf-8"),!0}function nt(e,t){let n=Xe(e,t);g.existsSync(n)&&g.unlinkSync(n)}function ot(e,t,n){let o;if(e.length===0)o=`
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
    </div>`;else{let s=n?Ae(n):{};o=`
    <div class="schedule-tasks">
      ${e.map(i=>{let a=i.mode==="agent"?"hubot":"terminal",p=i.mode==="agent"?"Agent":"Script",d=Vt(i.schedule),c=n?Pe(n,i.id):!1,u=qe(i.id),y;u&&(u.status==="queued"||u.status==="in_progress")?y='<span class="schedule-pill schedule-pill-running"><span class="codicon codicon-loading codicon-modifier-spin"></span> Running</span>':u&&u.status==="completed"?y='<span class="schedule-pill schedule-pill-success"><span class="codicon codicon-check"></span> Passed</span>':u&&(u.status==="failure"||u.status==="cancelled"||u.status==="error")?y='<span class="schedule-pill schedule-pill-fail"><span class="codicon codicon-error"></span> Failed</span>':y=i.enabled?'<span class="schedule-pill schedule-pill-on">Active</span>':'<span class="schedule-pill schedule-pill-off">Paused</span>';let O=u&&(u.status==="queued"||u.status==="in_progress"),M=i.mode==="agent"&&i.promptFile?O?'<button class="schedule-action-btn schedule-action-running" disabled title="Running\u2026"><span class="codicon codicon-loading codicon-modifier-spin"></span></button>':`<button class="schedule-action-btn schedule-action-run" data-command="runTask" data-file="${v(i.id)}" title="${c?"Run on GitHub Actions":"Run now in Copilot Chat"}">\u{1F680}</button>`:"",J=u?.runUrl?`<button class="schedule-action-btn" data-command="openExternal" data-file="${v(u.runUrl)}" title="View run on GitHub"><span class="codicon codicon-link-external"></span></button>`:"",ve=i.mode==="agent"&&i.promptFile?`<button class="schedule-action-btn" data-command="openPromptFile" data-file="${v(i.promptFile)}" title="Edit prompt"><span class="codicon codicon-edit"></span></button>`:"",te=`<button class="schedule-action-btn ${i.enabled?"schedule-action-pause":"schedule-action-resume"}" data-command="toggleTask" data-file="${v(i.id)}" title="${i.enabled?"Pause":"Resume"}">${i.enabled?'<span class="codicon codicon-debug-pause"></span>':'<span class="codicon codicon-play-circle"></span>'}</button>`,be=`<button class="schedule-action-btn schedule-action-danger" data-command="deleteTask" data-file="${v(i.id)}" title="Delete"><span class="codicon codicon-trash"></span></button>`,ye=s[i.id]?.lastRun?`<span class="schedule-last-run" title="Last run: ${v(s[i.id].lastRun)}"><span class="codicon codicon-history"></span> ${Yt(s[i.id].lastRun)}</span>`:"",G="";if(i.dependsOn&&i.dependsOn.length>0&&n){let V=Qt(i,e,n);V.satisfied?G='<div class="schedule-task-deps schedule-deps-ok"><span class="codicon codicon-pass"></span> Dependencies met</div>':G=`<div class="schedule-task-deps schedule-deps-blocked"><span class="codicon codicon-lock"></span> Blocked by: ${A(V.blocking.join(", "))}</div>`}return`
      <div class="schedule-task ${i.enabled?"enabled":"disabled"}" data-task-id="${v(i.id)}">
        <div class="schedule-task-header">
          <span class="schedule-mode" title="${p}"><span class="codicon codicon-${a}"></span></span>
          <span class="schedule-task-name" title="${v(i.name)}">${A(i.name)}</span>
          ${y}
        </div>
        <div class="schedule-task-meta">
          <span class="schedule-schedule"><span class="codicon codicon-clock"></span> ${A(d)}</span>
          ${ye}
        </div>
        <div class="schedule-task-desc">${A(i.description)}</div>
        ${G}
        <div class="schedule-task-actions">
          ${M}
          ${J}
          ${ve}
          ${te}
          ${be}
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
      <button class="action-btn" data-command="openExternal" data-file="${v(t)}/actions">
        <span class="codicon codicon-github-action"></span>
        <span class="btn-label">GitHub Actions</span>
      </button>`),o+=`
      <button class="action-btn" data-command="openExternal" data-file="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Autopilot">
        <span class="codicon codicon-book"></span>
        <span class="btn-label">Documentation</span>
      </button>
    </div>`,o}function tn(e,t){let n=x.join(e,".github","config","scheduled-tasks.json");try{let o;if(g.existsSync(n))o=JSON.parse(g.readFileSync(n,"utf-8"));else{let s=x.dirname(n);g.existsSync(s)||g.mkdirSync(s,{recursive:!0}),o={version:"1.0.0",tasks:[]}}return o.tasks.some(s=>s.id===t.id)?(C.window.showWarningMessage(`Task "${t.id}" already exists.`),!1):(o.tasks.push(t),g.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0)}catch{return!1}}var nn=[{label:"Every 3 hours",cron:"0 */3 * * *",description:"8 times/day"},{label:"Every 6 hours",cron:"0 */6 * * *",description:"4 times/day"},{label:"Every 12 hours",cron:"0 */12 * * *",description:"Twice daily"},{label:"Daily at 8 AM",cron:"0 8 * * *",description:"Once daily (UTC)"},{label:"Daily at noon",cron:"0 12 * * *",description:"Once daily (UTC)"},{label:"Weekly Monday",cron:"0 8 * * 1",description:"Every Monday 8 AM UTC"},{label:"Weekly Friday",cron:"0 16 * * 5",description:"Every Friday 4 PM UTC"},{label:"Custom cron...",cron:"",description:"Enter POSIX cron expression"}];async function st(e){let t=await C.window.showInputBox({title:"Add Scheduled Task (1/5)",prompt:"Task name",placeHolder:"e.g. Weekly Code Review",validateInput:c=>c.trim()?void 0:"Name is required"});if(!t)return!1;let n=await C.window.showInputBox({title:"Add Scheduled Task (2/5)",prompt:"Brief description",placeHolder:"What does this automation do?",validateInput:c=>c.trim()?void 0:"Description is required"});if(!n)return!1;let o=await C.window.showQuickPick([{label:"$(hubot) Cloud Agent",description:"Creates a GitHub issue assigned to Copilot",detail:"Best for creative tasks: writing, analysis, reviews",mode:"agent"},{label:"$(terminal) Direct",description:"Runs a script in GitHub Actions",detail:"Best for mechanical tasks: audits, builds, syncs",mode:"direct"}],{title:"Add Scheduled Task (3/5)",placeHolder:"Execution mode"});if(!o)return!1;let s=await C.window.showQuickPick(nn.map(c=>({label:c.label,description:c.description,cron:c.cron})),{title:"Add Scheduled Task (4/5)",placeHolder:"Schedule frequency"});if(!s)return!1;let r=s.cron;if(!r){let c=await C.window.showInputBox({title:"Custom Cron Expression",prompt:"POSIX cron: minute hour day-of-month month day-of-week",placeHolder:"0 */4 * * *",validateInput:u=>u.trim().split(/\s+/).length===5?void 0:"Must be 5 space-separated fields"});if(!c)return!1;r=c.trim()}let i=x.join(e,".github","skills"),a;if(g.existsSync(i)){let c=g.readdirSync(i,{withFileTypes:!0}).filter(u=>u.isDirectory()).map(u=>({label:u.name}));if(c.length>0){let u=await C.window.showQuickPick([{label:"(none)",description:"No specific skill"},...c],{title:"Add Scheduled Task (5/5)",placeHolder:"Associate a skill (optional)"});u&&u.label!=="(none)"&&(a=u.label)}}let p=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");if(!p)return C.window.showErrorMessage("Task name must contain at least one letter or digit."),!1;let d={id:p,name:t,description:n,mode:o.mode,schedule:r,enabled:!1,...a?{skill:a}:{},...o.mode==="agent"?{promptFile:`.github/config/scheduled-tasks/${p}.md`}:{}};if(tn(e,d)){if(o.mode==="agent"&&d.promptFile){let c=x.join(e,d.promptFile),u=x.dirname(c);if(g.existsSync(u)||g.mkdirSync(u,{recursive:!0}),!g.existsSync(c)){let y=[`# ${t}`,"","## Task","",`${n}`,"","## Instructions","","1. Read relevant context from the repository","2. Perform the task","3. Create a PR with your changes","","## Quality Standards","","- Follow existing project conventions","- Include meaningful commit messages","- Ensure all tests pass before submitting",""].join(`
`);g.writeFileSync(c,y,"utf-8")}}return d.enabled&&tt(e,d),C.window.showInformationMessage(`Task "${t}" added (disabled). Enable it from the Autopilot tab to activate.`),!0}return!1}var it=`
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
`;var rt=async(e,t,n,o)=>e.command==="autopilot"?on(e,n):e.command==="cloud"?sn(e,n,o):{};async function on(e,t){let n=Te.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!n)return t.markdown("Open a workspace folder to use Autopilot."),{};let o=_(n),s=e.prompt.trim().toLowerCase();if(s==="list"||s===""){t.markdown(`## Autopilot Tasks

`);let r=Ve(o);for(let i of r){let a=i.mode==="agent"?"\u{1F916}":"\u2699\uFE0F",p=i.enabled?"Active":"Paused",d=i.dependsOn?.length?` \u2190 depends on: ${i.dependsOn.join(", ")}`:"";t.markdown(`- ${a} **${i.name}** \u2014 ${p}${d}
`)}return t.markdown(`
*${o.length} tasks configured. Use \`/autopilot status\` for run history.*`),{}}if(s==="status"){t.markdown(`## Autopilot Status

`);let r=o.filter(a=>a.enabled),i=o.filter(a=>!a.enabled);t.markdown(`**${r.length}** active \xB7 **${i.length}** paused

`);for(let a of r)t.markdown(`- **${a.name}** \u2014 \`${a.schedule}\`
`);return{}}if(s.startsWith("run ")){let r=s.slice(4).trim(),i=o.find(a=>a.id===r);if(!i)return t.markdown(`Task \`${r}\` not found. Use \`/autopilot list\` to see available tasks.`),{};if(i.mode==="agent"&&i.promptFile){let a=ce.join(n,i.promptFile),p=ce.resolve(a);if(!p.toLowerCase().startsWith(n.toLowerCase()))return t.markdown("Invalid prompt file path."),{};if(le.existsSync(p)){let d=le.readFileSync(p,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();t.markdown(`Running **${i.name}**...

${d}`)}else t.markdown(`Prompt file not found: \`${i.promptFile}\``)}else t.markdown(`Task **${i.name}** uses direct mode (script: \`${i.muscle??"n/a"}\`). Run it from the Autopilot tab or GitHub Actions.`);return{}}return t.markdown(`## Autopilot Commands

`),t.markdown("- `/autopilot list` \u2014 Show all configured tasks\n"),t.markdown("- `/autopilot status` \u2014 Show active tasks and schedules\n"),t.markdown("- `/autopilot run <task-id>` \u2014 Run a specific task\n"),{}}async function sn(e,t,n){let o=Te.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!o)return t.markdown("Open a workspace folder to use cloud dispatch."),{};let s=_(o),r=e.prompt.trim().toLowerCase();if(r===""||r==="help")return t.markdown(`## Cloud Dispatch

`),t.markdown(`Dispatch Autopilot tasks to GitHub Actions for cloud execution.

`),t.markdown("- `/cloud list` \u2014 Show cloud-eligible tasks\n"),t.markdown("- `/cloud run <task-id>` \u2014 Dispatch a task to GitHub Actions\n"),{};if(r==="list"){let i=s.filter(a=>a.enabled&&a.mode==="agent");if(i.length===0)return t.markdown("No cloud-eligible tasks found. Enable agent-mode tasks in scheduled-tasks.json."),{};t.markdown(`## Cloud-Eligible Tasks

`);for(let a of i)t.markdown(`- **${a.id}** \u2014 ${a.name}
`);return t.markdown("\n*Use `/cloud run <task-id>` to dispatch.*"),{}}if(r.startsWith("run ")){let i=r.slice(4).trim(),a=s.find(d=>d.id===i);if(!a)return t.markdown(`Task \`${i}\` not found. Use \`/cloud list\` to see eligible tasks.`),{};if(!a.enabled)return t.markdown(`Task **${a.name}** is paused. Enable it first.`),{};let p=Y(o);if(!p)return t.markdown("Could not determine GitHub repo URL from workspace."),{};t.markdown(`Dispatching **${a.name}** to GitHub Actions...

`);try{let d=await ae(p,a.id,()=>{},o);n.onCancellationRequested(()=>d.dispose()),t.markdown("Workflow dispatched. Check the Autopilot tab or GitHub Actions for progress.")}catch(d){let u=(d instanceof Error?d.message:String(d)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");t.markdown(`Dispatch failed: ${u}`)}return{}}return t.markdown("Unknown cloud command. Use `/cloud help` for usage."),{}}var f=m(require("vscode")),Ct=m(require("crypto")),F=m(require("fs")),k=m(require("path")),W=m(require("os"));var E=m(require("fs")),I=m(require("path")),pe=require("child_process");function de(e,t){return Math.abs(t.getTime()-e.getTime())/(1e3*60*60*24)}function rn(e){let t=new Date,n=e.lastDreamDate?Math.floor(de(e.lastDreamDate,t)):1/0;return e.dreamNeeded&&n>14||e.syncStale&&n>3?"critical":e.dreamNeeded||n>7||e.syncStale?"attention":"healthy"}function an(e){let t=I.join(e,".github","quality","dream-report.json");try{let n=E.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function cn(e){let t=I.join(e,".github",".sync-manifest.json");try{let n=E.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function ln(){try{let e=I.resolve(__dirname,"..","package.json");return JSON.parse(E.readFileSync(e,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}}function dn(e){let t=cn(e);if(!t)return!1;let n=ln();if(t.brainVersion!==n)return!0;let o=new Date(t.lastSync);return!!(isNaN(o.getTime())||de(o,new Date)>7)}function pn(e){try{let t=(0,pe.execFileSync)("git",["diff","--cached","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),n=(0,pe.execFileSync)("git",["diff","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),o=t?t.split(`
`).length:0,s=n?n.split(`
`).length:0,r=o+s;if(r===0)return{fileCount:0,days:0};let i=0;try{let a=(0,pe.execFileSync)("git",["log","-1","--format=%ci"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim();a&&(i=Math.floor(de(new Date(a),new Date)))}catch{}return{fileCount:r,days:i}}catch{return{fileCount:0,days:0}}}function un(e){let t=I.join(e,".github"),n=s=>{try{return E.readdirSync(s,{withFileTypes:!0}).filter(r=>r.isDirectory()).length}catch{return 0}},o=(s,r,i=!1)=>{try{if(!i)return E.readdirSync(s).filter(d=>d.endsWith(r)).length;let a=0,p=d=>{for(let c of E.readdirSync(d,{withFileTypes:!0}))c.isDirectory()?p(I.join(d,c.name)):c.name.endsWith(r)&&a++};return p(s),a}catch{return 0}};return{skills:n(I.join(t,"skills")),instructions:o(I.join(t,"instructions"),".instructions.md"),prompts:o(I.join(t,"prompts"),".prompt.md",!0),agents:o(I.join(t,"agents"),".agent.md")}}function at(e){let t=an(e),n=un(e),o=t?new Date(t.timestamp):null,s=t?t.brokenRefs.length>0||t.trifectaIssues.length>20:!0,r=pn(e),i={status:"healthy",skillCount:n.skills,instructionCount:n.instructions,promptCount:n.prompts,agentCount:n.agents,lastDreamDate:o,dreamNeeded:s,syncStale:dn(e),uncommittedFileCount:r.fileCount,uncommittedDays:r.days};return i.status=rn(i),i}function gn(e,t){let n=(t.getTime()-e.getTime())/864e5,o=Math.LN2/7;return Math.exp(-o*n)}function fn(e,t=new Date){let n=new Date(e.lastUsed),o=gn(n,t);return Math.sqrt(e.count)*o}function ct(e,t,n=new Date){return e.actions.find(s=>s.id===t)?{...e,actions:e.actions.map(s=>s.id===t?{...s,count:s.count+1,lastUsed:n.toISOString()}:s)}:{...e,actions:[...e.actions,{id:t,count:1,lastUsed:n.toISOString()}]}}function lt(e,t,n=new Date){let o=new Map;for(let i of t.actions){let a=fn(i,n);a>=.1&&o.set(i.id,a)}let s=e.filter(i=>o.has(i)),r=e.filter(i=>!o.has(i));return s.sort((i,a)=>(o.get(a)??0)-(o.get(i)??0)),[...s,...r]}function dt(){return{version:1,actions:[]}}var hn=["Two minds, one vision","Better together than alone","Your ideas, amplified","Where human meets machine","The sum of us","Let's build something meaningful","From thought to reality","Creating what neither could alone","Turning possibility into code","What will we make today?","Exploring the edge of possible","Learning never looked like this","Growing smarter, together","Every question opens a door","Uncharted territory, good company","I see what you're building","Your vision, our journey","Thinking alongside you","Understanding before answering"],mn=["Still here, still building","Every pause is a chance to reflect","The best work takes time","Progress isn't always visible","Let's pick up where we left off","Good things are worth the wait","One conversation at a time"],vn=["Fresh starts are powerful","We'll figure this out","The first step is showing up","Building begins with connection","Ready when you are","Together, we'll find the way"],bn=["Two minds, ready to build","Let's see what we can create","The beginning of something","Your partner in possibility"],yn=["A new day to create","Fresh ideas await","What will we build today?"],wn=["Wrapping up what we started","Good work deserves reflection","Tomorrow we build on today"];function kn(e=new Date){let t=e.getHours();return t<12?"morning":t<18?"afternoon":"evening"}function pt(e=new Date){let t=new Date(e.getFullYear(),0,0),n=e.getTime()-t.getTime(),o=1e3*60*60*24;return Math.floor(n/o)}function ue(e,t=new Date){let n=pt(t);return e[n%e.length]}function xn(e){switch(e){case"healthy":return hn;case"attention":return mn;case"critical":return vn;default:return bn}}function ut(e,t,n){let o=n.join(e,".github","config","taglines.json");if(!t.existsSync(o))return null;try{let s=t.readFileSync(o,"utf-8"),r=JSON.parse(s);return!r.taglines?.project||r.taglines.project.length===0?null:r}catch{return null}}function Sn(e){let t=[];for(let n of Object.keys(e.taglines)){let o=e.taglines[n];Array.isArray(o)&&t.push(...o)}return t}function gt(e={}){let{status:t="unknown",config:n,useTimeOfDay:o=!0,date:s=new Date}=e,r=pt(s);if(n&&t==="healthy"){let a=n.rotation?.projectWeight??50,p=Math.floor(a);if(r%100<p){let c=Sn(n);if(c.length>0)return ue(c,s)}}if(o&&t==="healthy"&&r%10===0){let a=kn(s);if(a==="morning")return ue(yn,s);if(a==="evening")return ue(wn,s)}let i=xn(t);return ue(i,s)}var $=m(require("fs")),H=m(require("path"));function An(e){let t=e.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);return t?e.slice(t[0].length).trim():e.trim()}function Cn(e){let t=H.join(e,".github","skills");if(!$.existsSync(t))return[];let n=[],o;try{o=$.readdirSync(t,{withFileTypes:!0})}catch{return[]}for(let s of o){if(!s.isDirectory())continue;let r=H.join(t,s.name,"loop-config.partial.json");if($.existsSync(r))try{let i=JSON.parse($.readFileSync(r,"utf-8"));if(Array.isArray(i.groups))for(let a of i.groups)n.push({...a,source:"skill"})}catch{}}return n}function Pn(e,t){let n=e.map(o=>({...o,buttons:[...o.buttons]}));for(let o of t){let s=n.find(r=>r.id===o.id);if(s){let r=new Set(s.buttons.map(i=>i.id??i.label));for(let i of o.buttons){let a=i.id??i.label;r.has(a)||(s.buttons.push(i),r.add(a))}}else n.push({...o,buttons:[...o.buttons]})}return n}function Tn(e,t){return t?e.filter(n=>!n.phase||n.phase.includes(t)).map(n=>{let o=n.buttons.filter(r=>!r.phase||r.phase.includes(t)),s=n.phase?.includes(t);return{...n,buttons:o,collapsed:s?!1:n.collapsed}}).filter(n=>n.buttons.length>0):e}function In(e,t){let n={id:e.id,icon:e.icon,label:e.label,command:e.command,hint:e.hint,tooltip:e.tooltip};if(e.promptFile){let o=H.join(t,e.promptFile);try{$.existsSync(o)&&(n.prompt=An($.readFileSync(o,"utf-8")))}catch{}}return!n.prompt&&e.prompt&&(n.prompt=e.prompt),e.file&&(n.file=e.file),n}function ft(e){let t=H.join(e,".github","config","loop-menu.json");if(!$.existsSync(t))return[];let n;try{n=JSON.parse($.readFileSync(t,"utf-8"))}catch{return[]}if(!Array.isArray(n.groups))return[];let o=Cn(e),s=Pn(n.groups,o),r=Tn(s,n.projectPhase),i=H.join(e,".github","prompts","loop");return r.map(a=>({id:a.id,label:a.label,desc:a.desc,accent:a.accent,icon:a.icon,collapsed:a.collapsed,buttons:a.buttons.map(p=>In(p,i))}))}var ge=m(require("vscode")),yt=require("child_process");var B={recentAgentPRs:[],pendingReviews:[],totalPending:0,lastFetched:null,error:null};function ht(e,t){return new Promise(n=>{let o=e.split(/\s+/);(0,yt.execFile)("gh",o,{cwd:t,timeout:15e3,maxBuffer:1024*1024},(s,r)=>{if(s){n(null);return}n(r.trim())})})}function mt(e){if(!e)return[];try{return JSON.parse(e).map(n=>({number:n.number,title:n.title,url:n.url,state:n.state,author:n.author?.login??"unknown",createdAt:n.createdAt,updatedAt:n.updatedAt,isDraft:n.isDraft??!1,reviewDecision:n.reviewDecision??"",labels:(n.labels??[]).map(o=>o.name)}))}catch{return[]}}var vt="number,title,url,state,author,createdAt,updatedAt,isDraft,reviewDecision,labels";var Ie=!1;async function $e(e,t){if(!Ie){Ie=!0;try{let[n,o]=await Promise.all([ht(`pr list --author app/copilot-swe-agent --state all --limit 10 --json ${vt}`,e),ht(`pr list --search review-requested:@me --state open --limit 10 --json ${vt}`,e)]),s=mt(n),r=mt(o);B={recentAgentPRs:s,pendingReviews:r,totalPending:r.length,lastFetched:new Date,error:null}}catch(n){B={...B,error:n instanceof Error?n.message:String(n)}}Ie=!1,t?.()}}function $n(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/36e5);if(n<1)return"just now";if(n<24)return`${n}h ago`;let o=Math.floor(n/24);return o===1?"yesterday":`${o}d ago`}function Rn(e){return e.state==="merged"?"git-merge":e.state==="closed"?"close":e.isDraft?"git-pull-request-draft":"git-pull-request"}function Dn(e){return e.state==="merged"?"var(--vscode-charts-purple, #a371f7)":e.state==="closed"?"var(--vscode-errorForeground, #f85149)":"var(--vscode-charts-green, #3fb950)"}function wt(e){let t=B;if(t.error||!t.recentAgentPRs.length&&!t.pendingReviews.length)return`
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
      </div>`;for(let o of t.pendingReviews)n+=bt(o);n+="</div>"}if(t.recentAgentPRs.length>0){n+=`
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-hubot"></span>
        <strong>Recent Agent Sessions</strong>
      </div>`;for(let o of t.recentAgentPRs.slice(0,5))n+=bt(o);n+="</div>"}return n+="</div>",n}function bt(e){let t=Rn(e),n=Dn(e);return`
  <div class="agent-pr-row" data-command="openExternal" data-file="${v(e.url)}" role="button" tabindex="0">
    <span class="codicon codicon-${v(t)}" style="color:${v(n)};"></span>
    <div class="agent-pr-info">
      <span class="agent-pr-title">${A(e.title)}</span>
      <span class="agent-pr-meta">#${e.number} \xB7 ${A($n(e.createdAt))} \xB7 ${A(e.author)}</span>
    </div>
  </div>`}var w=null;function kt(e){return w=ge.window.createStatusBarItem(ge.StatusBarAlignment.Right,50),w.command="alex.openChat",w.name="Alex Agent Activity",e.subscriptions.push(w),w}function Re(e){if(!w)return;if(!e){w.text="$(brain) Alex",w.tooltip="Alex Cognitive Architecture",w.show();return}let t=B.pendingReviews;t.length>0?(w.text=`$(brain) Alex $(bell-dot) ${t.length}`,w.tooltip=`${t.length} PR${t.length===1?"":"s"} awaiting review`):(w.text="$(brain) Alex",w.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"),w.show(),$e(e,()=>{let n=B.pendingReviews;w&&(n.length>0?(w.text=`$(brain) Alex $(bell-dot) ${n.length}`,w.tooltip=`${n.length} PR${n.length===1?"":"s"} awaiting review`):(w.text="$(brain) Alex",w.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"))})}var xt=`
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
`;var jn="alex.welcomeView";function De(){let e=W.platform();return e==="win32"?k.join(process.env.APPDATA||k.join(W.homedir(),"AppData","Roaming"),"Code","User"):e==="darwin"?k.join(W.homedir(),"Library","Application Support","Code","User"):k.join(process.env.XDG_CONFIG_HOME||k.join(W.homedir(),".config"),"Code","User")}var En=k.resolve(__dirname,"..","package.json"),Pt=(()=>{try{return JSON.parse(F.readFileSync(En,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}})(),je="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki",Fn=[{id:"workspace",label:"WORKSPACE",icon:"folder",desc:"Initialize and upgrade your cognitive architecture",collapsed:!1,buttons:[{icon:"sync",label:"Initialize Workspace",command:"initialize",tooltip:"Install Alex brain files in this workspace",hint:"command"},{icon:"arrow-up",label:"Upgrade Architecture",command:"upgrade",tooltip:"Update to the latest brain architecture",hint:"command"},{icon:"cloud",label:"Setup AI-Memory",command:"setupAIMemory",tooltip:"Find or create the shared AI-Memory knowledge store",hint:"command"}]},{id:"brain-status",label:"BRAIN STATUS",icon:"symbol-structure",desc:"Cognitive architecture health and maintenance",collapsed:!1,buttons:[{icon:"symbol-event",label:"Run Dream Protocol",command:"dream",tooltip:"Autonomous architecture maintenance",hint:"command"},{icon:"heart",label:"Meditate",command:"openChat",prompt:"Run a meditation session \u2014 consolidate knowledge, review recent changes, and strengthen architecture",tooltip:"Knowledge consolidation session",hint:"chat"},{icon:"graph",label:"Self-Actualize",command:"openChat",prompt:"Run a self-actualization assessment \u2014 evaluate architecture completeness, identify growth areas, and plan improvements",tooltip:"Deep self-assessment and growth",hint:"chat"}]},{id:"user-memory",label:"USER MEMORY",icon:"notebook",desc:"Access your persistent memory locations",collapsed:!0,buttons:[{icon:"notebook",label:"Memories",command:"openMemories",tooltip:"Open VS Code user memories folder",hint:"command"},{icon:"edit",label:"User Prompts",command:"openPrompts",tooltip:"Reusable prompt templates",hint:"command"},{icon:"server",label:"MCP Config",command:"openMcpConfig",tooltip:"Model Context Protocol servers",hint:"command"},{icon:"cloud",label:"Copilot Memory (GitHub)",command:"openExternal",file:"https://github.com/settings/copilot",tooltip:"Manage cloud-synced Copilot memory",hint:"link"}]},{id:"environment",label:"ENVIRONMENT",icon:"settings-gear",desc:"Extension settings",collapsed:!0,buttons:[{icon:"settings-gear",label:"Open Extension Settings",command:"openSettings",tooltip:"Configure Alex extension behavior",hint:"command"}]},{id:"learn",label:"LEARN",icon:"book",desc:"Documentation and support resources",collapsed:!0,buttons:[{icon:"book",label:"Documentation",command:"openExternal",file:`${je}`,tooltip:"Full documentation on GitHub Wiki",hint:"link"},{icon:"comment-discussion",label:"User Stories",command:"openExternal",file:`${je}/blog/README`,tooltip:"Real-world examples of working with Alex",hint:"link"},{icon:"mortar-board",label:"Tutorials",command:"openExternal",file:`${je}/tutorials/README`,tooltip:"Step-by-step guides for common tasks",hint:"link"},{icon:"lightbulb",label:"LearnAI Playbooks",command:"openExternal",file:"https://learnai.correax.com/",tooltip:"80 AI playbooks for professional disciplines",hint:"link"},{icon:"bug",label:"Report an Issue",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/issues",tooltip:"Found a bug? Let us know",hint:"link"}]},{id:"about",label:"ABOUT",icon:"info",collapsed:!0,buttons:[{icon:"info",label:`v${Pt}`,command:"noop"},{icon:"person",label:"Publisher: fabioc-aloha",command:"openExternal",file:"https://github.com/fabioc-aloha",hint:"link"},{icon:"law",label:"PolyForm Noncommercial 1.0.0",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md",hint:"link"}]}],Mn=["https://github.com/","https://marketplace.visualstudio.com/","https://learnai.correax.com/"],St="alex.quickActionFrecency",K=class{constructor(t,n){this.extensionUri=t;this.globalState=n;this.workspaceRoot=f.workspace.workspaceFolders?.[0]?.uri.fsPath??"",this.frecencyData=n.get(St)??dt()}static viewId=jn;view;workspaceRoot;frecencyData;disposables=[];dispose(){for(let t of this.disposables)t.dispose();this.disposables.length=0}recordActionUse(t){this.frecencyData=ct(this.frecencyData,t),this.globalState.update(St,this.frecencyData)}loopGroupsCache=null;getLoopGroups(){return this.loopGroupsCache||(this.loopGroupsCache=this.workspaceRoot?ft(this.workspaceRoot):[]),this.loopGroupsCache}renderGroupsWithFrecency(t){let n=t.map(o=>{if(o.id==="creative-loop")return o;let s=o.buttons.map(a=>a.id??a.label.toLowerCase().replace(/\s+/g,"-")),i=lt(s,this.frecencyData).map(a=>o.buttons.find(p=>(p.id??p.label.toLowerCase().replace(/\s+/g,"-"))===a)).filter(a=>a!==void 0);return{...o,buttons:i}});return At(n)}refresh(){this.loopGroupsCache=null,this.view&&(this.view.webview.html=this.getHtml(this.view.webview))}resolveWebviewView(t,n,o){this.view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this.extensionUri]},t.webview.html=this.getHtml(t.webview),this.workspaceRoot&&$e(this.workspaceRoot,()=>this.refresh()),t.webview.onDidReceiveMessage(s=>this.handleMessage(s)),t.onDidChangeVisibility(()=>{t.visible&&this.refresh()})}async handleMessage(t){switch(t.actionId&&this.recordActionUse(t.actionId),t.command){case"openChat":if(t.prompt){let n=t.prompt.endsWith(": ");await f.commands.executeCommand("workbench.action.chat.open",{query:t.prompt,isPartialQuery:n})}else await f.commands.executeCommand("workbench.action.chat.open");break;case"initialize":await f.commands.executeCommand("alex.initialize");break;case"upgrade":await f.commands.executeCommand("alex.upgrade");break;case"setupAIMemory":await f.commands.executeCommand("alex.setupAIMemory");break;case"dream":await f.commands.executeCommand("alex.dream");break;case"openSettings":await f.commands.executeCommand("workbench.action.openSettings","alex");break;case"openMemories":{let n=f.Uri.file(k.join(De(),"globalStorage","github.copilot-chat","memory-tool","memories"));try{await f.commands.executeCommand("revealFileInOS",n)}catch{await f.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openPrompts":{let n=f.Uri.file(k.join(De(),"prompts"));try{await f.commands.executeCommand("revealFileInOS",n)}catch{await f.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openMcpConfig":{let n=f.Uri.file(k.join(De(),"mcp.json"));await f.commands.executeCommand("vscode.open",n)}break;case"openExternal":if(t.file){let n=String(t.file);Mn.some(o=>n.startsWith(o))&&await f.env.openExternal(f.Uri.parse(n))}break;case"refresh":this.refresh();break;case"toggleTask":if(this.workspaceRoot&&t.file){let n=Ye(this.workspaceRoot,t.file);if(n){this.refresh();let o=n.find(s=>s.id===t.file);if(o){let s=o.enabled?"enabled":"disabled",r=o.enabled?"Workflow created.":"Workflow removed.";f.window.showInformationMessage(`Task "${o.name}" ${s}. ${r} Commit & push to activate on GitHub.`)}}}break;case"addTask":this.workspaceRoot&&await st(this.workspaceRoot)&&this.refresh();break;case"deleteTask":this.workspaceRoot&&t.file&&await f.window.showWarningMessage(`Delete task "${t.file}"?`,{modal:!0},"Delete")==="Delete"&&Ke(this.workspaceRoot,t.file)!==null&&(this.refresh(),f.window.showInformationMessage(`Task "${t.file}" deleted. Commit & push to remove the workflow from GitHub.`));break;case"openPromptFile":if(this.workspaceRoot&&t.file){let n=k.resolve(this.workspaceRoot,t.file);if(!n.toLowerCase().startsWith(this.workspaceRoot.toLowerCase()+k.sep)&&n.toLowerCase()!==this.workspaceRoot.toLowerCase())break;F.existsSync(n)?await f.commands.executeCommand("vscode.open",f.Uri.file(n)):f.window.showWarningMessage(`Prompt file not found: ${t.file}`)}break;case"runTask":if(this.workspaceRoot&&t.file){let n=Y(this.workspaceRoot),o=Pe(this.workspaceRoot,t.file);if(He(this.workspaceRoot,t.file),this.refresh(),n&&o)try{let s=await ae(n,t.file,r=>{this.refresh()},this.workspaceRoot);this.disposables.push(s),f.window.showInformationMessage(`Workflow dispatched for "${t.file}". Monitoring execution\u2026`)}catch(s){let r=s instanceof Error?s.message:String(s);f.window.showErrorMessage(`Failed to dispatch workflow: ${r}`)}else{let s=se(t.file),i=_(this.workspaceRoot).find(a=>a.id===t.file);if(i?.promptFile){let a=k.resolve(this.workspaceRoot,i.promptFile),p=this.workspaceRoot.toLowerCase()+k.sep;if(!a.toLowerCase().startsWith(p))break;if(F.existsSync(a)){let d=F.readFileSync(a,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();await f.commands.executeCommand("workbench.action.chat.open",{query:d,isPartialQuery:!1}),j(this.workspaceRoot,s,!0)}else f.window.showWarningMessage(`Prompt file not found: ${i.promptFile}`),j(this.workspaceRoot,s,!1)}else j(this.workspaceRoot,s,!1)}}break;case"clearRunStatus":t.file&&(Je(t.file),this.refresh());break;case"openScheduleConfig":if(this.workspaceRoot){let n=k.join(this.workspaceRoot,".github","config","scheduled-tasks.json");F.existsSync(n)&&await f.commands.executeCommand("vscode.open",f.Uri.file(n))}break;case"noop":break;case"switchTab":break}}getHtml(t){let n=Ln(),o=t.asWebviewUri(f.Uri.joinPath(this.extensionUri,"dist","codicon.css")),r=(this.workspaceRoot?at(this.workspaceRoot):null)?.status??"unknown",i=this.workspaceRoot?ut(this.workspaceRoot,F,k):null,a=gt({status:r,config:i});return`<!DOCTYPE html>
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
    ${it}
    ${xt}
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
    <div class="tagline">${A(a)}</div>
    <div class="version">v${Pt}</div>
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
    ${Tt({icon:"comment-discussion",label:"Chat with Alex",command:"openChat",hint:"chat"},!0)}

    ${this.renderGroupsWithFrecency(this.getLoopGroups())}
  </div>

  <!-- Setup Tab -->
  <div id="tab-setup" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-setup">
    ${At(Fn)}
  </div>

  <!-- Autopilot Tab -->
  <div id="tab-autopilot" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-autopilot">
    ${this.workspaceRoot?wt(this.workspaceRoot):""}
    ${ot(this.workspaceRoot?_(this.workspaceRoot):[],this.workspaceRoot?Y(this.workspaceRoot):void 0,this.workspaceRoot)}
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
</html>`}};function Ln(){return Ct.randomBytes(16).toString("hex")}function At(e){return e.map(t=>{let n=t.collapsed===!1?"expanded":"",o=t.icon?`<span class="codicon codicon-${v(t.icon)}"></span>`:"";return`
    <div class="group ${n}" data-group-id="${v(t.id)}">
      <div class="group-header" role="button" tabindex="0" aria-expanded="${t.collapsed===!1}">
        ${o}
        <span>${A(t.label)}</span>
        <span class="codicon codicon-chevron-right chevron" aria-hidden="true"></span>
      </div>
      ${t.desc?`<div class="group-desc">${A(t.desc)}</div>`:""}
      <div class="group-content">
        <div class="group-buttons">
          ${t.buttons.map(s=>Tt(s)).join("")}
        </div>
      </div>
    </div>`}).join("")}function Tt(e,t=!1){let n=t?"action-btn primary":"action-btn",o=e.id??e.label.toLowerCase().replace(/\s+/g,"-"),s=[`data-command="${v(e.command)}"`,`data-action-id="${v(o)}"`,e.prompt?`data-prompt="${v(e.prompt)}"`:"",e.file?`data-file="${v(e.file)}"`:"",e.tooltip?`data-tooltip="${v(e.tooltip)}"`:""].filter(Boolean).join(" "),r={chat:"comment-discussion",link:"link-external",command:"zap"},i=e.hint?`<span class="hint-badge" title="${e.hint}"><span class="codicon codicon-${r[e.hint]}"></span></span>`:"";return`<button class="${n}" ${s}>
    <span class="codicon codicon-${v(e.icon)}"></span>
    <span class="btn-label">${A(e.label)}</span>
    ${i}
  </button>`}var X=m(require("fs")),Q=m(require("path"));function h(e,...t){return X.existsSync(Q.join(e,...t))}function It(e){try{return JSON.parse(X.readFileSync(e,"utf-8"))}catch{return null}}function On(e,t){let n=[];(t||h(e,"tsconfig.json"))&&n.push("TypeScript"),(h(e,"requirements.txt")||h(e,"pyproject.toml")||h(e,"setup.py"))&&n.push("Python"),h(e,"go.mod")&&n.push("Go"),h(e,"Cargo.toml")&&n.push("Rust"),(h(e,"pom.xml")||h(e,"build.gradle"))&&n.push("Java");let o={...t?.dependencies??{},...t?.devDependencies??{}};if((o.react||o["react-dom"])&&n.push("React"),o.next&&n.push("Next.js"),o.vue&&n.push("Vue"),o.vitepress&&n.push("VitePress"),o.express&&n.push("Express"),o.fastify&&n.push("Fastify"),o["@azure/functions"]&&n.push("Azure Functions"),o.esbuild&&n.push("esbuild"),o.webpack&&n.push("webpack"),o.vite&&!o.vitepress&&n.push("Vite"),o.vitest&&n.push("Vitest"),o.jest&&n.push("Jest"),o.mocha&&n.push("Mocha"),(o.eslint||h(e,".eslintrc.json")||h(e,"eslint.config.js")||h(e,"eslint.config.mjs"))&&n.push("ESLint"),(o.prettier||h(e,".prettierrc"))&&n.push("Prettier"),h(e,"pyproject.toml"))try{let s=X.readFileSync(Q.join(e,"pyproject.toml"),"utf-8");s.includes("fastapi")&&n.push("FastAPI"),s.includes("flask")&&n.push("Flask"),s.includes("django")&&n.push("Django"),s.includes("pytest")&&n.push("pytest"),s.includes("ruff")&&n.push("Ruff"),s.includes("mypy")&&n.push("mypy")}catch{}return(h(e,"Dockerfile")||h(e,"docker-compose.yml")||h(e,"docker-compose.yaml"))&&n.push("Docker"),[...new Set(n)]}function Gn(e,t){let n={},o=t?.scripts??{};o.build&&(n.buildCommand="npm run build"),o["build:prod"]&&(n.buildCommand="npm run build:prod"),o.test&&(n.testCommand="npm test"),o.lint&&(n.lintCommand="npm run lint"),!n.buildCommand&&h(e,"setup.py")&&(n.buildCommand="python setup.py build"),!n.testCommand&&h(e,"pyproject.toml")&&(n.testCommand="pytest"),!n.buildCommand&&h(e,"go.mod")&&(n.buildCommand="go build ./..."),!n.testCommand&&h(e,"go.mod")&&(n.testCommand="go test ./...");let s=["scripts/release.ps1","scripts/release.sh","scripts/release-vscode.ps1","scripts/release.cjs"];for(let r of s)if(h(e,r)){n.releaseScript=r;break}return n}function fe(e){let t=Q.join(e,"package.json"),n=It(t),o=On(e,n),s=Gn(e,n),r="generic";return n&&n.engines?.vscode?(r="vscode-extension",{projectType:r,...s,conventions:o}):h(e,"platforms","vscode-extension","package.json")&&(It(Q.join(e,"platforms","vscode-extension","package.json"))?.engines??{}).vscode?(r="vscode-extension",{projectType:r,...s,conventions:o}):n&&(n.workspaces||h(e,"lerna.json")||h(e,"pnpm-workspace.yaml"))?(r="monorepo",{projectType:r,...s,conventions:o}):h(e,".vitepress","config.ts")||h(e,".vitepress","config.mts")||h(e,"next.config.js")||h(e,"next.config.mjs")||h(e,"gatsby-config.js")||h(e,"astro.config.mjs")?(r="static-site",{projectType:r,...s,conventions:o}):o.includes("FastAPI")||o.includes("Flask")||o.includes("Django")?(r="python-api",{projectType:r,...s,conventions:o}):h(e,"dbt_project.yml")||h(e,"notebook")||h(e,"synapse")||h(e,".pbixproj")?(r="data-pipeline",{projectType:r,...s,conventions:o}):{projectType:r,...s,conventions:o}}var R=m(require("fs")),Z=m(require("path"));var Nn=[{id:"extension-dev",label:"EXTENSION DEV",icon:"extensions",desc:"Package, publish, test, and debug the VS Code extension",collapsed:!0,buttons:[{id:"ext-package",icon:"package",label:"Package VSIX",command:"openChat",prompt:"Package the VS Code extension into a .vsix file. Run the build first, then package with vsce. Report the file size.",hint:"chat",tooltip:"Build and package the extension"},{id:"ext-publish",icon:"cloud-upload",label:"Publish",command:"openChat",prompt:"Run the release preflight checks, then publish the extension to the VS Code Marketplace. Follow the release-management skill.",hint:"chat",tooltip:"Publish to VS Code Marketplace"},{id:"ext-test",icon:"beaker",label:"Extension Tests",command:"openChat",prompt:"Run all extension tests. Report pass/fail counts and any failures with root cause analysis.",hint:"chat",tooltip:"Run extension test suite"},{id:"ext-debug",icon:"debug-alt",label:"Debug Launch",command:"runCommand",file:"workbench.action.debug.start",hint:"command",tooltip:"Launch Extension Development Host"}]}],Un=[{id:"api-dev",label:"API DEVELOPMENT",icon:"plug",desc:"Run, test, and document API endpoints",collapsed:!0,buttons:[{id:"api-run",icon:"play",label:"Run Server",command:"openChat",prompt:"Start the API development server. Detect the framework (FastAPI/Flask/Django) and use the appropriate command.",hint:"chat",tooltip:"Start the development server"},{id:"api-test",icon:"beaker",label:"Test API",command:"openChat",prompt:"Run the API test suite with pytest. Report coverage, pass/fail counts, and any failures.",hint:"chat",tooltip:"Run API tests with coverage"},{id:"api-lint",icon:"warning",label:"Lint & Type",command:"openChat",prompt:"Run linting (ruff/flake8) and type checking (mypy/pyright) on the Python codebase. Fix any issues found.",hint:"chat",tooltip:"Run linter and type checker"},{id:"api-docs",icon:"book",label:"API Docs",command:"openChat",prompt:"Review and update the API documentation. Ensure OpenAPI/Swagger specs match the current endpoints.",hint:"chat",tooltip:"Update API documentation"}]}],_n=[{id:"pipeline-phases",label:"PIPELINE PHASES",icon:"server-process",desc:"Medallion architecture: ingest, transform, serve",collapsed:!0,buttons:[{id:"bronze",icon:"database",label:"Bronze Layer",command:"openChat",prompt:"Help me work on the Bronze (raw ingestion) layer. Identify data sources, define schemas, implement extraction logic.",hint:"chat",tooltip:"Raw data ingestion patterns"},{id:"silver",icon:"filter",label:"Silver Layer",command:"openChat",prompt:"Help me work on the Silver (cleansed/conformed) layer. Apply data quality rules, standardize schemas, handle nulls and duplicates.",hint:"chat",tooltip:"Cleansing and conforming"},{id:"gold",icon:"star-full",label:"Gold Layer",command:"openChat",prompt:"Help me work on the Gold (business-ready) layer. Build aggregations, KPI calculations, and dimensional models.",hint:"chat",tooltip:"Business-ready aggregations"}]},{id:"data-quality",label:"DATA QUALITY",icon:"verified",desc:"Profile, validate, and trace data lineage",collapsed:!0,buttons:[{id:"profile",icon:"graph-line",label:"Profile Data",command:"openChat",prompt:"Profile the dataset: row counts, null rates, distributions, cardinality, outliers. Present findings in a summary table.",hint:"chat",tooltip:"Statistical data profiling"},{id:"validate",icon:"check",label:"Validate Schema",command:"openChat",prompt:"Validate data schemas against expectations. Check column types, constraints, referential integrity, and naming conventions.",hint:"chat",tooltip:"Schema validation checks"},{id:"lineage",icon:"git-merge",label:"Trace Lineage",command:"openChat",prompt:"Trace data lineage for the selected table or column. Map source-to-target transformations and document the flow.",hint:"chat",tooltip:"Data lineage documentation"}]}],Hn=[{id:"site-dev",label:"SITE DEVELOPMENT",icon:"browser",desc:"Dev server, build, deploy, and performance audit",collapsed:!0,buttons:[{id:"site-dev-server",icon:"play",label:"Dev Server",command:"openChat",prompt:"Start the development server for this static site. Detect the framework and use the appropriate dev command.",hint:"chat",tooltip:"Start local dev server"},{id:"site-build",icon:"package",label:"Build Site",command:"openChat",prompt:"Build the static site for production. Report any build warnings or errors.",hint:"chat",tooltip:"Production build"},{id:"site-deploy",icon:"cloud-upload",label:"Deploy",command:"openChat",prompt:"Deploy the site to the configured hosting platform. Run preflight checks first.",hint:"chat",tooltip:"Deploy to hosting"},{id:"site-perf",icon:"dashboard",label:"Performance",command:"openChat",prompt:"Audit site performance: bundle size, image optimization, lazy loading, caching headers, Core Web Vitals.",hint:"chat",tooltip:"Performance and accessibility audit"}]}],Bn=[{id:"cross-package",label:"CROSS-PACKAGE",icon:"references",desc:"Shared types, dependency updates, and coordinated releases",collapsed:!0,buttons:[{id:"deps-update",icon:"package",label:"Update Deps",command:"openChat",prompt:"Check for outdated dependencies across all packages. Propose coordinated updates that maintain compatibility.",hint:"chat",tooltip:"Cross-package dependency updates"},{id:"shared-types",icon:"symbol-interface",label:"Shared Types",command:"openChat",prompt:"Review shared type definitions across packages. Identify drift, inconsistencies, or missing exports.",hint:"chat",tooltip:"Audit shared type definitions"},{id:"release-all",icon:"rocket",label:"Release Train",command:"openChat",prompt:"Coordinate a release across all packages. Check version consistency, run all tests, update changelogs.",hint:"chat",tooltip:"Coordinated multi-package release"}]}],$t={"vscode-extension":Nn,"python-api":Un,"data-pipeline":_n,"static-site":Hn,monorepo:Bn,generic:[]};function Wn(e){try{let t=JSON.parse(R.readFileSync(e,"utf-8"));return Array.isArray(t.groups)?t.groups:[]}catch{return[]}}function zn(e,t){let n=t??fe(e),o=Z.join(e,".github","config","loop-menu.json"),s=Wn(o),r=new Set(Object.values($t).flatMap(c=>c.map(u=>u.id))),i=s.filter(c=>!r.has(c.id)),a=$t[n.projectType]??[],p=[...i,...a],d={};return n.buildCommand&&(d.buildCommand=n.buildCommand),n.testCommand&&(d.testCommand=n.testCommand),n.lintCommand&&(d.lintCommand=n.lintCommand),n.releaseScript&&(d.releaseScript=n.releaseScript),n.conventions.length>0&&(d.conventions=n.conventions),{$schema:"./loop-config.schema.json",$comment:`Loop tab menu configuration \u2014 auto-generated for ${n.projectType} project. Prompts are loaded from .github/prompts/loop/{promptFile} at runtime.`,version:"1.0",projectType:n.projectType,projectPhase:"active-development",groups:p,...Object.keys(d).length>0?{projectContext:d}:{}}}function Rt(e,t){let n=zn(e,t),o=Z.join(e,".github","config"),s=Z.join(o,"loop-menu.json");try{return R.mkdirSync(o,{recursive:!0}),R.writeFileSync(s,JSON.stringify(n,null,2)+`
`,"utf-8"),!0}catch{return!1}}function Dt(e,t){let n=Z.join(e,".github","config","loop-menu.json");try{if(!R.existsSync(n))return!1;let o=JSON.parse(R.readFileSync(n,"utf-8"));return o.projectPhase=t,R.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0}catch{return!1}}var P=m(require("vscode")),b=m(require("fs")),S=m(require("path")),Ee=m(require("os"));function jt(){let e=[],t=Ee.homedir();try{for(let o of b.readdirSync(t))if(/^OneDrive/i.test(o)){let s=S.join(t,o,"AI-Memory");b.existsSync(s)&&e.push(s)}}catch{}let n=S.join(t,"Library","CloudStorage");try{if(b.existsSync(n)){for(let o of b.readdirSync(n))if(/^OneDrive/i.test(o)){let s=S.join(n,o,"AI-Memory");b.existsSync(s)&&e.push(s)}}}catch{}for(let o of[S.join(t,"AI-Memory"),S.join(t,".alex","AI-Memory")])b.existsSync(o)&&e.push(o);return e}function qn(){let e=[],t=Ee.homedir();try{for(let o of b.readdirSync(t))/^OneDrive/i.test(o)&&e.push(S.join(t,o,"AI-Memory"))}catch{}let n=S.join(t,"Library","CloudStorage");try{if(b.existsSync(n))for(let o of b.readdirSync(n))/^OneDrive/i.test(o)&&e.push(S.join(n,o,"AI-Memory"))}catch{}return e.push(S.join(t,"AI-Memory")),e.push(S.join(t,".alex","AI-Memory")),e}function Fe(){let e=P.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&b.existsSync(e))return e;let t=jt();return t.length>0?t[0]:null}var Jn=[".github","announcements","feedback","insights","knowledge","patterns"],Vn={"global-knowledge.md":`# Global Knowledge

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
`,"user-profile.json":()=>JSON.stringify({name:"",role:"",preferences:{communication:"direct",codeStyle:"",learningStyle:""},updatedAt:new Date().toISOString()},null,2),"project-registry.json":()=>JSON.stringify({version:1,projects:[],updatedAt:new Date().toISOString()},null,2),"index.json":()=>JSON.stringify({version:1,files:[],updatedAt:new Date().toISOString()},null,2)};function Yn(e){let t=[];b.existsSync(e)||(b.mkdirSync(e,{recursive:!0}),t.push(e));for(let n of Jn){let o=S.join(e,n);b.existsSync(o)||(b.mkdirSync(o,{recursive:!0}),t.push(o))}for(let[n,o]of Object.entries(Vn)){let s=S.join(e,n);if(!b.existsSync(s)){let r=typeof o=="function"?o():o;b.writeFileSync(s,r,"utf-8"),t.push(s)}}return t}async function Kn(){let e=P.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&b.existsSync(e)){let i=await P.window.showInformationMessage(`AI-Memory already configured at: ${e}`,"Use This","Change Location");if(i==="Use This")return e;if(!i)return}let t=jt(),n=qn(),o=[];for(let i of t)o.push({label:"$(check) "+i,description:"Found \u2014 existing AI-Memory",detail:i});for(let i of n)if(!t.includes(i)){let a=/OneDrive/i.test(i);o.push({label:(a?"$(cloud) ":"$(folder) ")+i,description:a?"OneDrive \u2014 recommended (cloud-synced)":"Local fallback",detail:i})}o.push({label:"$(folder-opened) Browse...",description:"Choose a custom location",detail:"__browse__"});let s=await P.window.showQuickPick(o,{title:"AI-Memory Location",placeHolder:"Where should Alex store shared knowledge?",ignoreFocusOut:!0});if(!s)return;let r;if(s.detail==="__browse__"){let i=await P.window.showOpenDialog({canSelectFolders:!0,canSelectFiles:!1,canSelectMany:!1,openLabel:"Select AI-Memory Folder",title:"Choose AI-Memory Location"});if(!i||i.length===0)return;r=i[0].fsPath,S.basename(r).toLowerCase().includes("ai-memory")||(r=S.join(r,"AI-Memory"))}else r=s.detail;return r}async function he(){let e=await Kn();if(e)try{let t=Yn(e);return await P.workspace.getConfiguration("alex.aiMemory").update("path",e,P.ConfigurationTarget.Global),t.length>0?P.window.showInformationMessage(`AI-Memory initialized at ${e} (${t.length} items created).`):P.window.showInformationMessage(`AI-Memory linked to ${e} (already complete).`),e}catch(t){let o=(t instanceof Error?t.message:String(t)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");P.window.showErrorMessage(`AI-Memory setup failed: ${o}`);return}}var T=m(require("vscode")),Me=m(require("path")),q=m(require("fs")),z=class extends T.TreeItem{constructor(n,o,s,r,i){super(n,s);this.metricId=r;this.children=i;this.description=o,this.tooltip=`${n}: ${o}`}},me=class{constructor(t){this.workspaceRoot=t}_onDidChangeTreeData=new T.EventEmitter;onDidChangeTreeData=this._onDidChangeTreeData.event;refresh(){this._onDidChangeTreeData.fire(void 0)}getTreeItem(t){return t}getChildren(t){return this.workspaceRoot?t?.children?t.children:t?[]:this.getRootItems():[new z("No workspace","Open a folder",T.TreeItemCollapsibleState.None)]}getRootItems(){let t=[],n=Me.join(this.workspaceRoot,".github","config","agent-metrics.json");if(!q.existsSync(n))return[new z("Not configured","No agent-metrics.json found",T.TreeItemCollapsibleState.None)];let o;try{o=JSON.parse(q.readFileSync(n,"utf-8"))}catch{return[new z("Config error","Invalid agent-metrics.json",T.TreeItemCollapsibleState.None)]}let s=Me.join(this.workspaceRoot,".agent-metrics-state.json"),r={};if(q.existsSync(s))try{r=JSON.parse(q.readFileSync(s,"utf-8"))}catch{}let i=o.thresholds??{};for(let a of o.metrics){let p=r[a.id],d=p?`${p.value}${a.unit}`:"\u2014",c=i[a.id],u=this.getStatusIcon(a,p?.value,c),y=new z(a.name,d,T.TreeItemCollapsibleState.None,a.id);y.iconPath=new T.ThemeIcon(u);let O=c?`

Warning: ${c.warning}${a.unit} \xB7 Critical: ${c.critical}${a.unit}`:"";y.tooltip=new T.MarkdownString(`**${a.name}**

${a.description}

Current: ${d}${O}`),t.push(y)}return t}getStatusIcon(t,n,o){return n===void 0||!o?"circle-outline":t.higherIsBetter===!0||t.id.includes("rate")||t.id==="tasks-run-count"?n<o.critical?"error":n<o.warning?"warning":"check":n>o.critical?"error":n>o.warning?"warning":"check"}};function ee(e){return(e instanceof Error?e.message:String(e)).replace(/[A-Z]:\\[\w\\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g,"[path]")}async function Le(){let e=l.workspace.getConfiguration(),t="github.copilot.chat.copilotMemory.enabled";e.get(t)!==!1&&await e.update(t,!1,l.ConfigurationTarget.Global)}function Qn(e){Le(),We(e.workspaceState);let t=l.chat.createChatParticipant("alex.chat",rt);t.iconPath=l.Uri.joinPath(e.extensionUri,"assets","icon.png"),t.followupProvider={provideFollowups(){return[{prompt:"/autopilot list",label:"List Autopilot Tasks",command:"autopilot"}]}},e.subscriptions.push(t);let n=new K(e.extensionUri,e.globalState);e.subscriptions.push(n),e.subscriptions.push(l.window.registerWebviewViewProvider(K.viewId,n));let o=l.workspace.workspaceFolders?.[0]?.uri.fsPath;kt(e),Re(o);let s=setInterval(()=>{Re(l.workspace.workspaceFolders?.[0]?.uri.fsPath)},300*1e3);e.subscriptions.push({dispose:()=>clearInterval(s)});let r=new me(o);if(e.subscriptions.push(l.window.createTreeView("alex.agentActivity",{treeDataProvider:r})),e.subscriptions.push(l.commands.registerCommand("alex.refreshAgentActivity",()=>{r.refresh()})),o){let c=new l.RelativePattern(o,".agent-metrics-state.json"),u=l.workspace.createFileSystemWatcher(c);u.onDidChange(()=>r.refresh()),u.onDidCreate(()=>r.refresh()),e.subscriptions.push(u)}e.subscriptions.push(l.commands.registerCommand("alex.refreshWelcome",()=>{n.refresh()})),e.subscriptions.push(l.commands.registerCommand("alex.openChat",()=>{l.commands.executeCommand("workbench.action.chat.open")})),e.subscriptions.push(l.commands.registerCommand("alex.dream",async()=>{try{await l.commands.executeCommand("workbench.action.chat.open",{query:"/dream"})}catch(c){l.window.showErrorMessage(`Dream protocol failed: ${ee(c)}`)}})),e.subscriptions.push(l.commands.registerCommand("alex.initialize",async()=>{try{await Le(),Fe()||await l.window.showInformationMessage("Alex: Set up AI-Memory for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await he(),await l.commands.executeCommand("workbench.action.chat.open",{query:"Initialize this workspace with Alex's cognitive architecture"})}catch(c){l.window.showErrorMessage(`Initialize failed: ${ee(c)}`)}})),e.subscriptions.push(l.commands.registerCommand("alex.upgrade",async()=>{try{await Le(),Fe()||await l.window.showInformationMessage("Alex: AI-Memory not found. Set it up for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await he(),await l.commands.executeCommand("workbench.action.chat.open",{query:"Upgrade this workspace's cognitive architecture to the latest version"})}catch(c){l.window.showErrorMessage(`Upgrade failed: ${ee(c)}`)}})),e.subscriptions.push(l.commands.registerCommand("alex.setupAIMemory",async()=>{try{await he(),n.refresh()}catch(c){l.window.showErrorMessage(`AI-Memory setup failed: ${ee(c)}`)}})),e.subscriptions.push(l.commands.registerCommand("alex.generateLoopConfig",async()=>{let c=l.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!c){l.window.showWarningMessage("Alex: Open a workspace folder first.");return}try{let u=fe(c);Rt(c,u)?l.window.showInformationMessage(`Alex: Loop config generated for ${u.projectType} project (${u.conventions.length} conventions detected).`):l.window.showErrorMessage("Alex: Failed to write loop config.")}catch(u){l.window.showErrorMessage(`Alex: Loop config generation failed \u2014 ${ee(u)}`)}})),e.subscriptions.push(l.commands.registerCommand("alex.setProjectPhase",async()=>{let c=l.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!c){l.window.showWarningMessage("Alex: Open a workspace folder first.");return}let u=[{label:"Planning",description:"Ideation, research, and design",value:"planning"},{label:"Active Development",description:"Building features and writing code",value:"active-development"},{label:"Testing",description:"QA, integration tests, and validation",value:"testing"},{label:"Release",description:"Packaging, publishing, and deployment",value:"release"},{label:"Maintenance",description:"Bug fixes, upgrades, and monitoring",value:"maintenance"}],y=await l.window.showQuickPick(u.map(M=>({label:M.label,description:M.description,value:M.value})),{placeHolder:"Select the current project phase"});if(!y)return;Dt(c,y.value)?(n.refresh(),l.window.showInformationMessage(`Alex: Project phase set to "${y.label}".`)):l.window.showErrorMessage("Alex: Failed to update project phase. Generate a loop config first.")}));let i=l.workspace.createFileSystemWatcher(new l.RelativePattern(l.workspace.workspaceFolders?.[0]??"",".github/config/loop-menu.json")),a=l.workspace.createFileSystemWatcher(new l.RelativePattern(l.workspace.workspaceFolders?.[0]??"",".github/prompts/loop/*.prompt.md")),p=l.workspace.createFileSystemWatcher(new l.RelativePattern(l.workspace.workspaceFolders?.[0]??"",".github/skills/*/loop-config.partial.json")),d=()=>n.refresh();e.subscriptions.push(i,i.onDidChange(d),i.onDidCreate(d),i.onDidDelete(d),a,a.onDidChange(d),a.onDidCreate(d),a.onDidDelete(d),p,p.onDidChange(d),p.onDidCreate(d),p.onDidDelete(d))}function Xn(){}0&&(module.exports={activate,deactivate});
