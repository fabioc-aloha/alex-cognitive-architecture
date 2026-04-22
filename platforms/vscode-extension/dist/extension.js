"use strict";var Yt=Object.create;var de=Object.defineProperty;var Kt=Object.getOwnPropertyDescriptor;var Qt=Object.getOwnPropertyNames;var Xt=Object.getPrototypeOf,Zt=Object.prototype.hasOwnProperty;var en=(e,t)=>{for(var n in t)de(e,n,{get:t[n],enumerable:!0})},qe=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Qt(t))!Zt.call(e,s)&&s!==n&&de(e,s,{get:()=>t[s],enumerable:!(o=Kt(t,s))||o.enumerable});return e};var h=(e,t,n)=>(n=e!=null?Yt(Xt(e)):{},qe(t||!e||!e.__esModule?de(n,"default",{value:e,enumerable:!0}):n,e)),tn=e=>qe(de({},"__esModule",{value:!0}),e);var xo={};en(xo,{activate:()=>yo,deactivate:()=>wo});module.exports=tn(xo);var c=h(require("vscode")),Jt=h(require("path"));var Oe=h(require("vscode")),he=h(require("path")),ve=h(require("fs"));var f=h(require("fs")),A=h(require("path")),y=h(require("vscode")),ge=require("child_process");function j(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function w(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;").replace(/\\/g,"&#92;")}var q=h(require("fs")),Re=h(require("path")),nn=".agent-metrics-state.json",on=2160*60*60*1e3;function Je(e){return Re.join(e,nn)}function Ye(e){return Re.join(e,".agent-metrics-runlog.json")}function sn(e){try{return JSON.parse(q.readFileSync(Je(e),"utf-8"))}catch{return{}}}function rn(e,t){q.writeFileSync(Je(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function an(e){try{return JSON.parse(q.readFileSync(Ye(e),"utf-8"))}catch{return{runs:[]}}}function cn(e,t){q.writeFileSync(Ye(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function ln(e){let t=Date.now()-on;return{runs:e.runs.filter(n=>n.completedAt>t)}}var $e=new Map;function pe(e){let t=`${e}:${Date.now()}`;return $e.set(t,{startedAt:Date.now()}),t}function N(e,t,n){let o=$e.get(t),s=Date.now(),i=an(e);i.runs.push({taskId:t.split(":")[0],startedAt:o?.startedAt??s,completedAt:s,success:n});let a=ln(i);cn(e,a),$e.delete(t),dn(e,a)}function dn(e,t){let n=sn(e),o=new Date().toISOString(),s=t.runs;if(n["tasks-run-count"]={value:s.length,lastUpdated:o},s.length>0){let a=s.filter(r=>r.success).length;n["task-success-rate"]={value:Math.round(a/s.length*100),lastUpdated:o}}let i=s.map(a=>(a.completedAt-a.startedAt)/1e3).filter(a=>a>0);if(i.length>0){let a=i.reduce((r,d)=>r+d,0)/i.length;n["task-duration"]={value:Math.round(a),lastUpdated:o}}n["loop-guard-triggers"]||(n["loop-guard-triggers"]={value:0,lastUpdated:o}),rn(e,n)}function pn(e){let t=e.split(/\s+/);if(t.length!==5)return e;let[n,o,s,i,a]=t,r=`${o.padStart(2,"0")}:${n.padStart(2,"0")} UTC`;return s.startsWith("*/")&&i==="*"&&a==="*"?`Every ${s.slice(2)} days at ${r}`:o.startsWith("*/")?`Every ${o.slice(2)} hours`:s==="*"&&i==="*"&&a==="*"&&!o.includes("/")&&!o.includes(",")?`Daily at ${r}`:s==="*"&&i==="*"&&a!=="*"?`${{0:"Sun",1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat"}[a]??a} at ${r}`:e}function Ke(e){try{let t=(0,ge.execFileSync)("gh",["secret","list","--json","name"],{cwd:e,encoding:"utf-8",timeout:1e4,stdio:["pipe","pipe","pipe"]});return JSON.parse(t).some(o=>o.name==="COPILOT_PAT")}catch{return!1}}async function je(e){let t=await y.window.showInformationMessage("Autopilot needs a GitHub token (repo secret) to assign Copilot to issues. Set it up now using your existing GitHub CLI auth?",{modal:!0},"Set Up Automatically","I'll Do It Manually");if(t==="I'll Do It Manually")return y.env.openExternal(y.Uri.parse("https://github.com/settings/personal-access-tokens/new")),y.window.showInformationMessage("Create a fine-grained PAT with Issues (read/write) and Contents (read/write) permissions, then run: gh secret set COPILOT_PAT in your repo."),!1;if(t!=="Set Up Automatically")return!1;try{let n=(0,ge.execFileSync)("gh",["auth","token"],{cwd:e,encoding:"utf-8",timeout:1e4,stdio:["pipe","pipe","pipe"]}).trim();return n?((0,ge.execFileSync)("gh",["secret","set","COPILOT_PAT","--body",n],{cwd:e,timeout:15e3,stdio:["pipe","pipe","pipe"]}),y.window.showInformationMessage("COPILOT_PAT secret created. Copilot can now be auto-assigned to issues."),!0):(y.window.showErrorMessage("Could not retrieve GitHub CLI token. Run `gh auth login` first."),!1)}catch{return y.window.showErrorMessage("Failed to set up COPILOT_PAT. Make sure `gh` CLI is installed and you're authenticated (`gh auth login`)."),!1}}function un(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);if(n<1)return"just now";if(n<60)return`${n}m ago`;let o=Math.floor(n/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}function te(e){let t=A.join(e,".git","config");if(f.existsSync(t))try{let n=f.readFileSync(t,"utf-8"),o=n.match(/url\s*=\s*https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)/);if(o)return`https://github.com/${o[1]}`;let s=n.match(/url\s*=\s*git@github\.com:([^/\s]+\/[^/\s.]+)/);return s?`https://github.com/${s[1]}`:void 0}catch{return}}var gn=A.join(".github","config",".scheduled-tasks-state.json");function Qe(e){return A.join(e,gn)}function De(e){try{return JSON.parse(f.readFileSync(Qe(e),"utf-8"))}catch{return{}}}function Xe(e,t){let n=De(e);n[t]={lastRun:new Date().toISOString()};let o=Qe(e),s=A.dirname(o);f.existsSync(s)||f.mkdirSync(s,{recursive:!0}),f.writeFileSync(o,JSON.stringify(n,null,2)+`
`,"utf-8")}var fe=null,Ze="alex.scheduledRuns";function et(e){fe=e}function Ee(){return fe?.get(Ze)??{}}function tt(e){fe&&fe.update(Ze,e)}function nt(e){return Ee()[e]}function ot(e){let t=Ee();delete t[e],tt(t)}function ue(e,t){let n=Ee();n[e]=t,tt(n)}function fn(e,t,n){if(!e.dependsOn||e.dependsOn.length===0)return{satisfied:!0,blocking:[]};let o=De(n),s=[];for(let i of e.dependsOn){if(!t.find(d=>d.id===i)){s.push(`${i} (not found)`);continue}let r=nt(i);if(r){r.status==="failure"||r.status==="error"||r.status==="cancelled"?s.push(`${i} (${r.status})`):r.status!=="completed"&&s.push(`${i} (${r.status})`);continue}o[i]?.lastRun||s.push(`${i} (never run)`)}return{satisfied:s.length===0,blocking:s}}function st(e){let t=new Map(e.map(a=>[a.id,a])),n=new Set,o=new Set,s=[];function i(a){if(n.has(a)||o.has(a))return;o.add(a);let r=t.get(a);if(r?.dependsOn)for(let d of r.dependsOn)t.has(d)&&i(d);o.delete(a),n.add(a),r&&s.push(r)}for(let a of e)i(a.id);for(let a of e)n.has(a.id)||s.push(a);return s}function mn(e){let t=e.match(/github\.com\/([^/]+)\/([^/]+)/);if(t)return{owner:t[1],repo:t[2]}}async function me(e,t,n,o){let s=mn(e);if(!s)throw new Error("Cannot parse GitHub owner/repo from URL");let i=pe(t),a=o??y.workspace.workspaceFolders?.[0]?.uri.fsPath,{owner:r,repo:d}=s,l=`scheduled-${t}.yml`,u={Authorization:`Bearer ${(await y.authentication.getSession("github",["repo"],{createIfNone:!0})).accessToken}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"alex-cognitive-architecture"};ue(t,{status:"queued"}),n({status:"queued"});let b=new Date().toISOString(),T=`https://api.github.com/repos/${r}/${d}/actions/workflows/${l}/dispatches`,I=await fetch(T,{method:"POST",headers:{...u,"Content-Type":"application/json"},body:JSON.stringify({ref:"main"})});if(!I.ok){let W=await I.text(),Ie={status:"error"};throw ue(t,Ie),n(Ie),a&&N(a,i,!1),new Error(`Dispatch failed (${I.status}): ${W}`)}let G=`https://api.github.com/repos/${r}/${d}/actions/workflows/${l}/runs?per_page=1&created=>${b.slice(0,19)}Z`,z=0,V=120,Te=5e3,ce=async()=>{if(z++,z>V){let W={status:"error"};ue(t,W),n(W),a&&N(a,i,!1);return}try{let W=await fetch(G,{headers:u});if(!W.ok)return B();let L=(await W.json()).workflow_runs?.[0];if(!L)return B();let Ve={status:L.status==="completed"?L.conclusion==="success"?"completed":L.conclusion??"failure":L.status??"in_progress",runUrl:L.html_url,conclusion:L.conclusion??void 0};if(ue(t,Ve),n(Ve),L.status!=="completed")return B();a&&N(a,i,L.conclusion==="success")}catch{return B()}},le=!1,H=[],B=()=>{le||H.push(setTimeout(()=>void ce(),Te))};return H.push(setTimeout(()=>void ce(),3e3)),{dispose:()=>{le=!0,H.forEach(clearTimeout)}}}function Y(e){let t=A.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(t))return[];try{return JSON.parse(f.readFileSync(t,"utf-8")).tasks??[]}catch{return[]}}function it(e,t){let n=A.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(n))return null;try{let o=JSON.parse(f.readFileSync(n,"utf-8")),s=o.tasks?.find(i=>i.id===t);return s?(s.enabled=!s.enabled,f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),s.enabled?dt(e,s):pt(e,s.id),o.tasks):null}catch{return null}}function rt(e,t){let n=A.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(n))return null;try{let o=JSON.parse(f.readFileSync(n,"utf-8")),s=o.tasks?.findIndex(i=>i.id===t);return s===void 0||s<0?null:(o.tasks.splice(s,1),f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),pt(e,t),o.tasks)}catch{return null}}function Me(e,t){let n=A.join(e,".github","workflows",`scheduled-${t}.yml`);return f.existsSync(n)}function at(e){return A.join(e,".github","workflows")}function Fe(e,t){return A.join(at(e),`scheduled-${t}.yml`)}function J(e){return e.replace(/[\\"`$!#&|;(){}<>]/g,"")}function ct(e){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e))throw new Error(`Invalid task ID: "${e}". Must be lowercase alphanumeric with hyphens.`);return e}function lt(e){if(!/^[0-9*\/,\- ]+$/.test(e))throw new Error(`Invalid cron expression: "${e}".`);return e}function hn(e){let t=J(e.name),n=ct(e.id),o=lt(e.schedule);return`# Auto-generated \u2014 do not edit manually
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
          PROMPT_FILE: "${J(e.promptFile??"")}"
        run: |
          ISSUE_URL=$(gh issue create \\
            --title "$TASK_NAME: $(date -u +%Y-%m-%d-%H%M)" \\
            --body-file "$PROMPT_FILE" \\
            --label automated,${n})
          echo "issue_url=$ISSUE_URL" >> $GITHUB_OUTPUT

      - name: Assign Copilot to issue
        if: steps.create.outputs.issue_url != ''
        continue-on-error: true
        env:
          GH_TOKEN: \${{ secrets.COPILOT_PAT || github.token }}
        run: |
          ISSUE_NUM=$(echo "\${{ steps.create.outputs.issue_url }}" | grep -oE '[0-9]+$')
          gh api \\
            --method POST \\
            -H "Accept: application/vnd.github+json" \\
            -H "X-GitHub-Api-Version: 2022-11-28" \\
            "/repos/\${{ github.repository }}/issues/\${ISSUE_NUM}/assignees" \\
            --input - <<< '{
            "assignees": ["copilot-swe-agent[bot]"],
            "agent_assignment": {
              "target_repo": "'"\${{ github.repository }}"'",
              "base_branch": "main"
            }
          }' || echo "::warning::Could not auto-assign Copilot. Add a COPILOT_PAT repo secret for automatic assignment."
`}function vn(e){let t=J(e.name),n=J(e.description),o=e.muscle?J(e.muscle):"",s=e.muscleArgs?` ${e.muscleArgs.map(J).join(" ")}`:"",i=ct(e.id),a=lt(e.schedule);return`# Auto-generated \u2014 do not edit manually
name: "Scheduled: ${t}"

on:
  schedule:
    - cron: "${a}"
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

      - name: Run ${i}
        run: node ${o}${s}

      - name: Create PR if changes exist
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          TASK_NAME: "${t}"
          TASK_DESC: "${n}"
        run: |
          git diff --quiet && exit 0
          BRANCH="auto/${i}-$(date -u +%s)"
          git checkout -b "$BRANCH"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "chore(scheduled): ${i} $(date -u +%Y-%m-%d)"
          git push origin "$BRANCH"
          gh pr create \\
            --title "Scheduled: $TASK_NAME $(date -u +%Y-%m-%d)" \\
            --body "## Automated Task: $TASK_NAME\\n\\n$TASK_DESC\\n\\n---\\n\\n*Generated by scheduled-${i}.yml*" \\
            --label automated \\
            --base main
`}function dt(e,t){let n;if(t.mode==="agent"&&t.promptFile)n=hn(t);else if(t.mode==="direct"&&t.muscle)n=vn(t);else return!1;let o=at(e);return f.existsSync(o)||f.mkdirSync(o,{recursive:!0}),f.writeFileSync(Fe(e,t.id),n,"utf-8"),!0}function pt(e,t){let n=Fe(e,t);f.existsSync(n)&&f.unlinkSync(n)}function ut(e,t,n){let o;if(e.length===0)o=`
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
    </div>`;else{let i=n?De(n):{},a=e.map(r=>{let d=r.mode==="agent"?"hubot":"terminal",l=r.mode==="agent"?"Agent":"Script",p=pn(r.schedule),g=n?Me(n,r.id):!1,u=nt(r.id),b;u&&(u.status==="queued"||u.status==="in_progress")?b='<span class="schedule-pill schedule-pill-running"><span class="codicon codicon-loading codicon-modifier-spin"></span> Running</span>':u&&u.status==="completed"?b='<span class="schedule-pill schedule-pill-success"><span class="codicon codicon-check"></span> Dispatched</span>':u&&(u.status==="failure"||u.status==="cancelled"||u.status==="error")?b='<span class="schedule-pill schedule-pill-fail"><span class="codicon codicon-error"></span> Failed</span>':b=r.enabled?'<span class="schedule-pill schedule-pill-on">Active</span>':'<span class="schedule-pill schedule-pill-off">Paused</span>';let T=u&&(u.status==="queued"||u.status==="in_progress"),G=r.mode==="agent"&&r.promptFile||r.mode==="direct"&&r.muscle?T?'<button class="schedule-action-btn schedule-action-running" disabled title="Running\u2026"><span class="codicon codicon-loading codicon-modifier-spin"></span></button>':`<button class="schedule-action-btn schedule-action-run" data-command="runTask" data-file="${w(r.id)}" title="${g?"Run on GitHub Actions":"Run now"}"><span class="codicon codicon-rocket"></span></button>`:"",z=u?.runUrl?`<button class="schedule-action-btn" data-command="openExternal" data-file="${w(u.runUrl)}" title="View run on GitHub"><span class="codicon codicon-link-external"></span></button>`:"",V=r.mode==="agent"&&r.promptFile?`<button class="schedule-action-btn" data-command="openPromptFile" data-file="${w(r.promptFile)}" title="Edit prompt"><span class="codicon codicon-edit"></span></button>`:"",Te=`<button class="schedule-action-btn ${r.enabled?"schedule-action-pause":"schedule-action-resume"}" data-command="toggleTask" data-file="${w(r.id)}" title="${r.enabled?"Pause":"Resume"}">${r.enabled?'<span class="codicon codicon-debug-pause"></span>':'<span class="codicon codicon-play-circle"></span>'}</button>`,ce=`<button class="schedule-action-btn schedule-action-danger" data-command="deleteTask" data-file="${w(r.id)}" title="Delete"><span class="codicon codicon-trash"></span></button>`,le=i[r.id]?.lastRun?`<span class="schedule-last-run" title="Last run: ${w(i[r.id].lastRun)}"><span class="codicon codicon-history"></span> ${un(i[r.id].lastRun)}</span>`:"",H="";if(r.dependsOn&&r.dependsOn.length>0&&n){let B=fn(r,e,n);B.satisfied?H='<div class="schedule-task-deps schedule-deps-ok"><span class="codicon codicon-pass"></span> Dependencies met</div>':H=`<div class="schedule-task-deps schedule-deps-blocked"><span class="codicon codicon-lock"></span> Blocked by: ${j(B.blocking.join(", "))}</div>`}return`
      <div class="schedule-task ${r.enabled?"enabled":"disabled"}" data-task-id="${w(r.id)}">
        <div class="schedule-task-header">
          <span class="schedule-mode" title="${l}"><span class="codicon codicon-${d}"></span></span>
          <span class="schedule-task-name" title="${w(r.name)}">${j(r.name)}</span>
          ${b}
        </div>
        <div class="schedule-task-meta">
          <span class="schedule-schedule"><span class="codicon codicon-clock"></span> ${j(p)}</span>
          ${le}
        </div>
        <div class="schedule-task-desc">${j(r.description)}</div>
        ${H}
        <div class="schedule-task-actions">
          ${G}
          ${z}
          ${V}
          ${Te}
          ${ce}
        </div>
      </div>`}).join("");o=`
    <div class="schedule-section-header">
      <span class="codicon codicon-clock"></span>
      <strong>Scheduled Tasks</strong>
      <span class="agent-badge">${e.filter(r=>r.enabled).length}/${e.length}</span>
    </div>
    <div class="schedule-tasks">
      ${a}
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
    </div>`}return e.some(i=>i.mode==="agent")&&n&&!Ke(n)&&(o+=`
    <div class="schedule-setup-banner">
      <span class="codicon codicon-warning"></span>
      <span>Set up <strong>COPILOT_PAT</strong> to auto-assign Copilot to issues.</span>
      <button class="action-btn" data-command="setupCopilotPAT" style="margin-left:auto">
        <span class="codicon codicon-key"></span>
        <span class="btn-label">Set Up</span>
      </button>
    </div>`),o+=`
  <div class="schedule-divider"></div>
  <div class="schedule-actions">`,t&&(o+=`
      <button class="action-btn" data-command="openExternal" data-file="${w(t)}/actions">
        <span class="codicon codicon-github-action"></span>
        <span class="btn-label">GitHub Actions</span>
      </button>`),o+=`
      <button class="action-btn" data-command="openExternal" data-file="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Autopilot">
        <span class="codicon codicon-book"></span>
        <span class="btn-label">Documentation</span>
      </button>
    </div>`,o}function bn(e,t){let n=A.join(e,".github","config","scheduled-tasks.json");try{let o;if(f.existsSync(n))o=JSON.parse(f.readFileSync(n,"utf-8"));else{let s=A.dirname(n);f.existsSync(s)||f.mkdirSync(s,{recursive:!0}),o={version:"1.0.0",tasks:[]}}return o.tasks.some(s=>s.id===t.id)?(y.window.showWarningMessage(`Task "${t.id}" already exists.`),!1):(o.tasks.push(t),f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0)}catch{return!1}}var yn=[{label:"Every 3 hours",cron:"0 */3 * * *",description:"8 times/day"},{label:"Every 6 hours",cron:"0 */6 * * *",description:"4 times/day"},{label:"Every 12 hours",cron:"0 */12 * * *",description:"Twice daily"},{label:"Daily at 8 AM",cron:"0 8 * * *",description:"Once daily (UTC)"},{label:"Daily at noon",cron:"0 12 * * *",description:"Once daily (UTC)"},{label:"Weekly Monday",cron:"0 8 * * 1",description:"Every Monday 8 AM UTC"},{label:"Weekly Friday",cron:"0 16 * * 5",description:"Every Friday 4 PM UTC"},{label:"Custom cron...",cron:"",description:"Enter POSIX cron expression"}];async function gt(e){let t=await y.window.showInputBox({title:"Add Scheduled Task (1/5)",prompt:"Task name",placeHolder:"e.g. Weekly Code Review",validateInput:p=>p.trim()?void 0:"Name is required"});if(!t)return!1;let n=await y.window.showInputBox({title:"Add Scheduled Task (2/5)",prompt:"Brief description",placeHolder:"What does this automation do?",validateInput:p=>p.trim()?void 0:"Description is required"});if(!n)return!1;let o=await y.window.showQuickPick([{label:"$(hubot) Cloud Agent",description:"Creates a GitHub issue assigned to Copilot",detail:"Best for creative tasks: writing, analysis, reviews",mode:"agent"},{label:"$(terminal) Direct",description:"Runs a script in GitHub Actions",detail:"Best for mechanical tasks: audits, builds, syncs",mode:"direct"}],{title:"Add Scheduled Task (3/5)",placeHolder:"Execution mode"});if(!o)return!1;let s=await y.window.showQuickPick(yn.map(p=>({label:p.label,description:p.description,cron:p.cron})),{title:"Add Scheduled Task (4/5)",placeHolder:"Schedule frequency"});if(!s)return!1;let i=s.cron;if(!i){let p=await y.window.showInputBox({title:"Custom Cron Expression",prompt:"POSIX cron: minute hour day-of-month month day-of-week",placeHolder:"0 */4 * * *",validateInput:g=>g.trim().split(/\s+/).length===5?void 0:"Must be 5 space-separated fields"});if(!p)return!1;i=p.trim()}let a=A.join(e,".github","skills"),r;if(f.existsSync(a)){let p=f.readdirSync(a,{withFileTypes:!0}).filter(g=>g.isDirectory()).map(g=>({label:g.name}));if(p.length>0){let g=await y.window.showQuickPick([{label:"(none)",description:"No specific skill"},...p],{title:"Add Scheduled Task (5/5)",placeHolder:"Associate a skill (optional)"});g&&g.label!=="(none)"&&(r=g.label)}}let d=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");if(!d)return y.window.showErrorMessage("Task name must contain at least one letter or digit."),!1;let l={id:d,name:t,description:n,mode:o.mode,schedule:i,enabled:!0,...r?{skill:r}:{},...o.mode==="agent"?{promptFile:`.github/config/scheduled-tasks/${d}.md`}:{}};if(bn(e,l)){if(o.mode==="agent"&&l.promptFile){let u=A.join(e,l.promptFile),b=A.dirname(u);if(f.existsSync(b)||f.mkdirSync(b,{recursive:!0}),!f.existsSync(u)){let T=[`# ${t}`,"","## Task","",`${n}`,"","## Instructions","","1. Read relevant context from the repository","2. Perform the task","3. Create a PR with your changes","","## Quality Standards","","- Follow existing project conventions","- Include meaningful commit messages","- Ensure all tests pass before submitting",""].join(`
`);f.writeFileSync(u,T,"utf-8")}y.commands.executeCommand("vscode.open",y.Uri.file(u))}dt(e,l),o.mode==="agent"&&!Ke(e)&&je(e);let p=o.mode==="agent"?`Task "${t}" created with workflow. Edit the prompt template, then commit & push to activate on GitHub.`:`Task "${t}" created with workflow. Commit & push to activate on GitHub.`,g=o.mode==="agent"?"Edit Prompt":"View Workflow";return y.window.showInformationMessage(p,g).then(u=>{if(u==="Edit Prompt"&&l.promptFile){let b=A.join(e,l.promptFile);y.commands.executeCommand("vscode.open",y.Uri.file(b))}else if(u==="View Workflow"){let b=Fe(e,l.id);y.commands.executeCommand("vscode.open",y.Uri.file(b))}}),!0}return!1}var ft=`
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
      opacity: 0.6;
      border-left: 3px solid transparent;
    }
    .schedule-task.disabled:hover {
      opacity: 0.8;
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
    .schedule-section-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: var(--spacing-sm, 8px) var(--spacing-sm, 8px) var(--spacing-xs, 4px);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
    }
    .schedule-section-header .codicon {
      font-size: 13px;
      opacity: 0.7;
    }
    .schedule-section-header strong {
      flex: 1;
    }
    .schedule-setup-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 6px;
      background: var(--vscode-inputValidation-warningBackground, rgba(205, 145, 0, 0.1));
      border: 1px solid var(--vscode-inputValidation-warningBorder, #cda100);
      font-size: 12px;
    }
    .schedule-setup-banner .codicon-warning {
      color: var(--vscode-inputValidation-warningBorder, #cda100);
      flex-shrink: 0;
    }
    .schedule-setup-banner .action-btn {
      flex-shrink: 0;
      width: auto;
    }
`;var mt=async(e,t,n,o)=>e.command==="autopilot"?wn(e,n):e.command==="cloud"?xn(e,n,o):{};async function wn(e,t){let n=Oe.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!n)return t.markdown("Open a workspace folder to use Autopilot."),{};let o=Y(n),s=e.prompt.trim().toLowerCase();if(s==="list"||s===""){t.markdown(`## Autopilot Tasks

`);let i=st(o);for(let a of i){let r=a.mode==="agent"?"\u{1F916}":"\u2699\uFE0F",d=a.enabled?"Active":"Paused",l=a.dependsOn?.length?` \u2190 depends on: ${a.dependsOn.join(", ")}`:"";t.markdown(`- ${r} **${a.name}** \u2014 ${d}${l}
`)}return t.markdown(`
*${o.length} tasks configured. Use \`/autopilot status\` for run history.*`),{}}if(s==="status"){t.markdown(`## Autopilot Status

`);let i=o.filter(r=>r.enabled),a=o.filter(r=>!r.enabled);t.markdown(`**${i.length}** active \xB7 **${a.length}** paused

`);for(let r of i)t.markdown(`- **${r.name}** \u2014 \`${r.schedule}\`
`);return{}}if(s.startsWith("run ")){let i=s.slice(4).trim(),a=o.find(r=>r.id===i);if(!a)return t.markdown(`Task \`${i}\` not found. Use \`/autopilot list\` to see available tasks.`),{};if(a.mode==="agent"&&a.promptFile){let r=he.join(n,a.promptFile),d=he.resolve(r);if(!d.toLowerCase().startsWith(n.toLowerCase()))return t.markdown("Invalid prompt file path."),{};if(ve.existsSync(d)){let l=ve.readFileSync(d,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();t.markdown(`Running **${a.name}**...

${l}`)}else t.markdown(`Prompt file not found: \`${a.promptFile}\``)}else t.markdown(`Task **${a.name}** uses direct mode (script: \`${a.muscle??"n/a"}\`). Run it from the Autopilot tab or GitHub Actions.`);return{}}return t.markdown(`## Autopilot Commands

`),t.markdown("- `/autopilot list` \u2014 Show all configured tasks\n"),t.markdown("- `/autopilot status` \u2014 Show active tasks and schedules\n"),t.markdown("- `/autopilot run <task-id>` \u2014 Run a specific task\n"),{}}async function xn(e,t,n){let o=Oe.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!o)return t.markdown("Open a workspace folder to use cloud dispatch."),{};let s=Y(o),i=e.prompt.trim().toLowerCase();if(i===""||i==="help")return t.markdown(`## Cloud Dispatch

`),t.markdown(`Dispatch Autopilot tasks to GitHub Actions for cloud execution.

`),t.markdown("- `/cloud list` \u2014 Show cloud-eligible tasks\n"),t.markdown("- `/cloud run <task-id>` \u2014 Dispatch a task to GitHub Actions\n"),{};if(i==="list"){let a=s.filter(r=>r.enabled&&r.mode==="agent");if(a.length===0)return t.markdown("No cloud-eligible tasks found. Enable agent-mode tasks in scheduled-tasks.json."),{};t.markdown(`## Cloud-Eligible Tasks

`);for(let r of a)t.markdown(`- **${r.id}** \u2014 ${r.name}
`);return t.markdown("\n*Use `/cloud run <task-id>` to dispatch.*"),{}}if(i.startsWith("run ")){let a=i.slice(4).trim(),r=s.find(l=>l.id===a);if(!r)return t.markdown(`Task \`${a}\` not found. Use \`/cloud list\` to see eligible tasks.`),{};if(!r.enabled)return t.markdown(`Task **${r.name}** is paused. Enable it first.`),{};let d=te(o);if(!d)return t.markdown("Could not determine GitHub repo URL from workspace."),{};t.markdown(`Dispatching **${r.name}** to GitHub Actions...

`);try{let l=await me(d,r.id,()=>{},o);n.onCancellationRequested(()=>l.dispose()),t.markdown("Workflow dispatched. Check the Autopilot tab or GitHub Actions for progress.")}catch(l){let g=(l instanceof Error?l.message:String(l)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");t.markdown(`Dispatch failed: ${g}`)}return{}}return t.markdown("Unknown cloud command. Use `/cloud help` for usage."),{}}var m=h(require("vscode")),Mt=h(require("crypto")),_=h(require("fs")),C=h(require("path")),X=h(require("os"));var U=h(require("fs")),M=h(require("path")),ye=require("child_process");function be(e,t){return Math.abs(t.getTime()-e.getTime())/(1e3*60*60*24)}function kn(e){let t=new Date,n=e.lastDreamDate?Math.floor(be(e.lastDreamDate,t)):1/0;return e.dreamNeeded&&n>14||e.syncStale&&n>3?"critical":e.dreamNeeded||n>7||e.syncStale?"attention":"healthy"}function Sn(e){let t=M.join(e,".github","quality","dream-report.json");try{let n=U.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function An(e){let t=M.join(e,".github",".sync-manifest.json");try{let n=U.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function Cn(){try{let e=M.resolve(__dirname,"..","package.json");return JSON.parse(U.readFileSync(e,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}}function Pn(e){let t=An(e);if(!t)return!1;let n=Cn();if(t.brainVersion!==n)return!0;let o=new Date(t.lastSync);return!!(isNaN(o.getTime())||be(o,new Date)>7)}function Tn(e){try{let t=(0,ye.execFileSync)("git",["diff","--cached","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),n=(0,ye.execFileSync)("git",["diff","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),o=t?t.split(`
`).length:0,s=n?n.split(`
`).length:0,i=o+s;if(i===0)return{fileCount:0,days:0};let a=0;try{let r=(0,ye.execFileSync)("git",["log","-1","--format=%ci"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim();r&&(a=Math.floor(be(new Date(r),new Date)))}catch{}return{fileCount:i,days:a}}catch{return{fileCount:0,days:0}}}function In(e){let t=M.join(e,".github"),n=s=>{try{return U.readdirSync(s,{withFileTypes:!0}).filter(i=>i.isDirectory()).length}catch{return 0}},o=(s,i,a=!1)=>{try{if(!a)return U.readdirSync(s).filter(l=>l.endsWith(i)).length;let r=0,d=l=>{for(let p of U.readdirSync(l,{withFileTypes:!0}))p.isDirectory()?d(M.join(l,p.name)):p.name.endsWith(i)&&r++};return d(s),r}catch{return 0}};return{skills:n(M.join(t,"skills")),instructions:o(M.join(t,"instructions"),".instructions.md"),prompts:o(M.join(t,"prompts"),".prompt.md",!0),agents:o(M.join(t,"agents"),".agent.md")}}function ht(e){let t=Sn(e),n=In(e),o=t?new Date(t.timestamp):null,s=t?t.brokenRefs.length>0||t.trifectaIssues.length>20:!0,i=Tn(e),a={status:"healthy",skillCount:n.skills,instructionCount:n.instructions,promptCount:n.prompts,agentCount:n.agents,lastDreamDate:o,dreamNeeded:s,syncStale:Pn(e),uncommittedFileCount:i.fileCount,uncommittedDays:i.days};return a.status=kn(a),a}function $n(e,t){let n=(t.getTime()-e.getTime())/864e5,o=Math.LN2/7;return Math.exp(-o*n)}function Rn(e,t=new Date){let n=new Date(e.lastUsed),o=$n(n,t);return Math.sqrt(e.count)*o}function vt(e,t,n=new Date){return e.actions.find(s=>s.id===t)?{...e,actions:e.actions.map(s=>s.id===t?{...s,count:s.count+1,lastUsed:n.toISOString()}:s)}:{...e,actions:[...e.actions,{id:t,count:1,lastUsed:n.toISOString()}]}}function bt(e,t,n=new Date){let o=new Map;for(let a of t.actions){let r=Rn(a,n);r>=.1&&o.set(a.id,r)}let s=e.filter(a=>o.has(a)),i=e.filter(a=>!o.has(a));return s.sort((a,r)=>(o.get(r)??0)-(o.get(a)??0)),[...s,...i]}function yt(){return{version:1,actions:[]}}var jn=["Two minds, one vision","Better together than alone","Your ideas, amplified","Where human meets machine","The sum of us","Let's build something meaningful","From thought to reality","Creating what neither could alone","Turning possibility into code","What will we make today?","Exploring the edge of possible","Learning never looked like this","Growing smarter, together","Every question opens a door","Uncharted territory, good company","I see what you're building","Your vision, our journey","Thinking alongside you","Understanding before answering"],Dn=["Still here, still building","Every pause is a chance to reflect","The best work takes time","Progress isn't always visible","Let's pick up where we left off","Good things are worth the wait","One conversation at a time"],En=["Fresh starts are powerful","We'll figure this out","The first step is showing up","Building begins with connection","Ready when you are","Together, we'll find the way"],Mn=["Two minds, ready to build","Let's see what we can create","The beginning of something","Your partner in possibility"],Fn=["A new day to create","Fresh ideas await","What will we build today?"],On=["Wrapping up what we started","Good work deserves reflection","Tomorrow we build on today"];function Ln(e=new Date){let t=e.getHours();return t<12?"morning":t<18?"afternoon":"evening"}function wt(e=new Date){let t=new Date(e.getFullYear(),0,0),n=e.getTime()-t.getTime(),o=1e3*60*60*24;return Math.floor(n/o)}function we(e,t=new Date){let n=wt(t);return e[n%e.length]}function Gn(e){switch(e){case"healthy":return jn;case"attention":return Dn;case"critical":return En;default:return Mn}}function xt(e,t,n){let o=n.join(e,".github","config","taglines.json");if(!t.existsSync(o))return null;try{let s=t.readFileSync(o,"utf-8"),i=JSON.parse(s);return!i.taglines?.project||i.taglines.project.length===0?null:i}catch{return null}}function Nn(e){let t=[];for(let n of Object.keys(e.taglines)){let o=e.taglines[n];Array.isArray(o)&&t.push(...o)}return t}function kt(e={}){let{status:t="unknown",config:n,useTimeOfDay:o=!0,date:s=new Date}=e,i=wt(s);if(n&&t==="healthy"){let r=n.rotation?.projectWeight??50,d=Math.floor(r);if(i%100<d){let p=Nn(n);if(p.length>0)return we(p,s)}}if(o&&t==="healthy"&&i%10===0){let r=Ln(s);if(r==="morning")return we(Fn,s);if(r==="evening")return we(On,s)}let a=Gn(t);return we(a,s)}var F=h(require("fs")),K=h(require("path"));function Un(e){let t=e.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);return t?e.slice(t[0].length).trim():e.trim()}function _n(e){let t=K.join(e,".github","skills");if(!F.existsSync(t))return[];let n=[],o;try{o=F.readdirSync(t,{withFileTypes:!0})}catch{return[]}for(let s of o){if(!s.isDirectory())continue;let i=K.join(t,s.name,"loop-config.partial.json");if(F.existsSync(i))try{let a=JSON.parse(F.readFileSync(i,"utf-8"));if(Array.isArray(a.groups))for(let r of a.groups)n.push({...r,source:"skill"})}catch{}}return n}function Hn(e,t){let n=e.map(o=>({...o,buttons:[...o.buttons]}));for(let o of t){let s=n.find(i=>i.id===o.id);if(s){let i=new Set(s.buttons.map(a=>a.id??a.label));for(let a of o.buttons){let r=a.id??a.label;i.has(r)||(s.buttons.push(a),i.add(r))}}else n.push({...o,buttons:[...o.buttons]})}return n}function Bn(e,t){return t?e.filter(n=>!n.phase||n.phase.includes(t)).map(n=>{let o=n.buttons.filter(i=>!i.phase||i.phase.includes(t)),s=n.phase?.includes(t);return{...n,buttons:o,collapsed:s?!1:n.collapsed}}).filter(n=>n.buttons.length>0):e}function Wn(e,t){let n={id:e.id,icon:e.icon,label:e.label,command:e.command,hint:e.hint,tooltip:e.tooltip};if(e.promptFile){let o=K.join(t,e.promptFile);try{F.existsSync(o)&&(n.prompt=Un(F.readFileSync(o,"utf-8")))}catch{}}return!n.prompt&&e.prompt&&(n.prompt=e.prompt),e.file&&(n.file=e.file),n}function St(e){let t=K.join(e,".github","config","loop-menu.json");if(!F.existsSync(t))return[];let n;try{n=JSON.parse(F.readFileSync(t,"utf-8"))}catch{return[]}if(!Array.isArray(n.groups))return[];let o=_n(e),s=Hn(n.groups,o),i=Bn(s,n.projectPhase),a=K.join(e,".github","prompts","loop");return i.map(r=>({id:r.id,label:r.label,desc:r.desc,accent:r.accent,icon:r.icon,collapsed:r.collapsed,buttons:r.buttons.map(d=>Wn(d,a))}))}var xe=h(require("vscode")),It=require("child_process");var Q={recentAgentPRs:[],pendingReviews:[],totalPending:0,lastFetched:null,error:null};function At(e,t){return new Promise(n=>{let o=e.split(/\s+/);(0,It.execFile)("gh",o,{cwd:t,timeout:15e3,maxBuffer:1024*1024},(s,i)=>{if(s){n(null);return}n(i.trim())})})}function Ct(e){if(!e)return[];try{return JSON.parse(e).map(n=>({number:n.number,title:n.title,url:n.url,state:n.state,author:n.author?.login??"unknown",createdAt:n.createdAt,updatedAt:n.updatedAt,isDraft:n.isDraft??!1,reviewDecision:n.reviewDecision??"",labels:(n.labels??[]).map(o=>o.name)}))}catch{return[]}}var Pt="number,title,url,state,author,createdAt,updatedAt,isDraft,reviewDecision,labels";var Le=!1;async function Ge(e,t){if(!Le){Le=!0;try{let[n,o]=await Promise.all([At(`pr list --author app/copilot-swe-agent --state all --limit 10 --json ${Pt}`,e),At(`pr list --search review-requested:@me --state open --limit 10 --json ${Pt}`,e)]),s=Ct(n),i=Ct(o);Q={recentAgentPRs:s,pendingReviews:i,totalPending:i.length,lastFetched:new Date,error:null}}catch(n){Q={...Q,error:n instanceof Error?n.message:String(n)}}Le=!1,t?.()}}function zn(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/36e5);if(n<1)return"just now";if(n<24)return`${n}h ago`;let o=Math.floor(n/24);return o===1?"yesterday":`${o}d ago`}function Vn(e){return e.state==="merged"?"git-merge":e.state==="closed"?"close":e.isDraft?"git-pull-request-draft":"git-pull-request"}function qn(e){return e.state==="merged"?"var(--vscode-charts-purple, #a371f7)":e.state==="closed"?"var(--vscode-errorForeground, #f85149)":"var(--vscode-charts-green, #3fb950)"}function $t(e){let t=Q;if(t.error||!t.recentAgentPRs.length&&!t.pendingReviews.length)return`
    <div class="agent-activity">
      <div class="agent-activity-empty">
        <span class="codicon codicon-hubot"></span>
        <p class="agent-empty-title">${t.error?"GitHub CLI unavailable":"No agent activity yet"}</p>
        <p class="agent-empty-hint">${t.error?"Install and authenticate <code>gh</code> to see agent PRs.":"When Copilot creates PRs, they\u2019ll appear here."}</p>
      </div>
    </div>`;let n='<div class="agent-activity">';if(t.pendingReviews.length>0){n+=`
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-eye"></span>
        <strong>Pending Reviews</strong>
        <span class="agent-badge">${t.pendingReviews.length}</span>
      </div>`;for(let o of t.pendingReviews)n+=Tt(o);n+="</div>"}if(t.recentAgentPRs.length>0){n+=`
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-hubot"></span>
        <strong>Recent Agent Sessions</strong>
      </div>`;for(let o of t.recentAgentPRs.slice(0,5))n+=Tt(o);n+="</div>"}return n+="</div>",n}function Tt(e){let t=Vn(e),n=qn(e);return`
  <div class="agent-pr-row" data-command="openExternal" data-file="${w(e.url)}" role="button" tabindex="0" title="${w(e.title)}">
    <span class="codicon codicon-${w(t)}" style="color:${w(n)};"></span>
    <div class="agent-pr-info">
      <span class="agent-pr-title">${j(e.title)}</span>
      <span class="agent-pr-meta">#${e.number} \xB7 ${j(zn(e.createdAt))} \xB7 ${j(e.author)}</span>
    </div>
    <span class="agent-pr-arrow codicon codicon-link-external"></span>
  </div>`}var S=null;function Rt(e){return S=xe.window.createStatusBarItem(xe.StatusBarAlignment.Right,50),S.command="alex.openChat",S.name="Alex Agent Activity",e.subscriptions.push(S),S}function Ne(e){if(!S)return;if(!e){S.text="$(brain) Alex",S.tooltip="Alex Cognitive Architecture",S.show();return}let t=Q.pendingReviews;t.length>0?(S.text=`$(brain) Alex $(bell-dot) ${t.length}`,S.tooltip=`${t.length} PR${t.length===1?"":"s"} awaiting review`):(S.text="$(brain) Alex",S.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"),S.show(),Ge(e,()=>{let n=Q.pendingReviews;S&&(n.length>0?(S.text=`$(brain) Alex $(bell-dot) ${n.length}`,S.tooltip=`${n.length} PR${n.length===1?"":"s"} awaiting review`):(S.text="$(brain) Alex",S.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"))})}var jt=`
  .agent-activity {
    margin: var(--spacing-sm, 8px) 0;
  }
  .agent-activity-empty {
    padding: var(--spacing-xl, 24px) var(--spacing-lg, 16px);
    text-align: center;
    color: var(--vscode-descriptionForeground);
  }
  .agent-activity-empty .codicon {
    font-size: 32px;
    display: block;
    margin-bottom: var(--spacing-sm, 8px);
    opacity: 0.5;
  }
  .agent-empty-title {
    font-size: var(--font-lg, 13px);
    font-weight: 600;
    color: var(--vscode-foreground);
    margin: var(--spacing-xs, 4px) 0;
  }
  .agent-empty-hint {
    font-size: var(--font-sm, 11px);
    color: var(--vscode-descriptionForeground);
    line-height: 1.5;
    margin: 0;
  }
  .agent-section {
    margin-bottom: var(--spacing-md, 12px);
  }
  .agent-section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
  }
  .agent-section-header .codicon {
    font-size: 13px;
    opacity: 0.7;
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
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-sm, 8px);
    cursor: pointer;
    border-radius: var(--radius-sm, 4px);
    transition: background 0.12s ease;
  }
  .agent-pr-row:hover {
    background: var(--vscode-list-hoverBackground);
  }
  .agent-pr-row:focus-visible {
    outline: 2px solid var(--accent, #6366f1);
    outline-offset: -2px;
  }
  .agent-pr-row .codicon {
    margin-top: 2px;
    flex-shrink: 0;
  }
  .agent-pr-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .agent-pr-title {
    font-size: var(--font-md, 12px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .agent-pr-meta {
    font-size: var(--font-xs, 10px);
    color: var(--vscode-descriptionForeground);
    margin-top: 1px;
  }
  .agent-pr-arrow {
    opacity: 0;
    font-size: 12px;
    margin-top: 2px;
    flex-shrink: 0;
    transition: opacity 0.12s;
    color: var(--vscode-descriptionForeground);
  }
  .agent-pr-row:hover .agent-pr-arrow {
    opacity: 0.6;
  }
`;var Jn="alex.welcomeView";function Ue(){let e=X.platform();return e==="win32"?C.join(process.env.APPDATA||C.join(X.homedir(),"AppData","Roaming"),"Code","User"):e==="darwin"?C.join(X.homedir(),"Library","Application Support","Code","User"):C.join(process.env.XDG_CONFIG_HOME||C.join(X.homedir(),".config"),"Code","User")}var Yn=C.resolve(__dirname,"..","package.json"),Ft=(()=>{try{return JSON.parse(_.readFileSync(Yn,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}})(),_e="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki",Kn=[{id:"workspace",label:"WORKSPACE",icon:"folder",desc:"Initialize and upgrade your cognitive architecture",collapsed:!1,buttons:[{icon:"sync",label:"Initialize Workspace",command:"initialize",tooltip:"Install Alex brain files in this workspace",hint:"command"},{icon:"arrow-up",label:"Upgrade Architecture",command:"upgrade",tooltip:"Update to the latest brain architecture",hint:"command"},{icon:"cloud",label:"Setup AI-Memory",command:"setupAIMemory",tooltip:"Find or create the shared AI-Memory knowledge store",hint:"command"}]},{id:"brain-status",label:"BRAIN STATUS",icon:"symbol-structure",desc:"Cognitive architecture health and maintenance",collapsed:!1,buttons:[{icon:"symbol-event",label:"Run Dream Protocol",command:"dream",tooltip:"Autonomous architecture maintenance",hint:"command"},{icon:"heart",label:"Meditate",command:"openChat",prompt:"Run a meditation session \u2014 consolidate knowledge, review recent changes, and strengthen architecture",tooltip:"Knowledge consolidation session",hint:"chat"},{icon:"graph",label:"Self-Actualize",command:"openChat",prompt:"Run a self-actualization assessment \u2014 evaluate architecture completeness, identify growth areas, and plan improvements",tooltip:"Deep self-assessment and growth",hint:"chat"}]},{id:"user-memory",label:"USER MEMORY",icon:"notebook",desc:"Access your persistent memory locations",collapsed:!0,buttons:[{icon:"notebook",label:"Memories",command:"openMemories",tooltip:"Open VS Code user memories folder",hint:"command"},{icon:"edit",label:"User Prompts",command:"openPrompts",tooltip:"Reusable prompt templates",hint:"command"},{icon:"server",label:"MCP Config",command:"openMcpConfig",tooltip:"Model Context Protocol servers",hint:"command"},{icon:"cloud",label:"Copilot Memory (GitHub)",command:"openExternal",file:"https://github.com/settings/copilot",tooltip:"Manage cloud-synced Copilot memory",hint:"link"}]},{id:"environment",label:"ENVIRONMENT",icon:"settings-gear",desc:"Extension settings",collapsed:!0,buttons:[{icon:"settings-gear",label:"Open Extension Settings",command:"openSettings",tooltip:"Configure Alex extension behavior",hint:"command"}]},{id:"learn",label:"LEARN",icon:"book",desc:"Documentation and support resources",collapsed:!0,buttons:[{icon:"book",label:"Documentation",command:"openExternal",file:`${_e}`,tooltip:"Full documentation on GitHub Wiki",hint:"link"},{icon:"comment-discussion",label:"User Stories",command:"openExternal",file:`${_e}/blog/README`,tooltip:"Real-world examples of working with Alex",hint:"link"},{icon:"mortar-board",label:"Tutorials",command:"openExternal",file:`${_e}/tutorials/README`,tooltip:"Step-by-step guides for common tasks",hint:"link"},{icon:"lightbulb",label:"LearnAI Playbooks",command:"openExternal",file:"https://learnai.correax.com/",tooltip:"80 AI playbooks for professional disciplines",hint:"link"},{icon:"bug",label:"Report an Issue",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/issues",tooltip:"Found a bug? Let us know",hint:"link"}]},{id:"about",label:"ABOUT",icon:"info",collapsed:!0,buttons:[{icon:"tag",label:`Version ${Ft}`,command:"noop",tooltip:"Installed extension version"},{icon:"person",label:"Publisher: fabioc-aloha",command:"openExternal",file:"https://github.com/fabioc-aloha",hint:"link",tooltip:"View publisher on GitHub"},{icon:"law",label:"PolyForm Noncommercial 1.0.0",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md",hint:"link",tooltip:"View license"}]}],Qn=["https://github.com/","https://marketplace.visualstudio.com/","https://learnai.correax.com/"],Dt="alex.quickActionFrecency",ne=class{constructor(t,n){this.extensionUri=t;this.globalState=n;this.workspaceRoot=m.workspace.workspaceFolders?.[0]?.uri.fsPath??"",this.frecencyData=n.get(Dt)??yt()}static viewId=Jn;view;workspaceRoot;frecencyData;disposables=[];dispose(){for(let t of this.disposables)t.dispose();this.disposables.length=0}recordActionUse(t){this.frecencyData=vt(this.frecencyData,t),this.globalState.update(Dt,this.frecencyData)}loopGroupsCache=null;getLoopGroups(){return this.loopGroupsCache||(this.loopGroupsCache=this.workspaceRoot?St(this.workspaceRoot):[]),this.loopGroupsCache}renderGroupsWithFrecency(t){let n=t.map(o=>{if(o.id==="creative-loop")return o;let s=o.buttons.map(r=>r.id??r.label.toLowerCase().replace(/\s+/g,"-")),a=bt(s,this.frecencyData).map(r=>o.buttons.find(d=>(d.id??d.label.toLowerCase().replace(/\s+/g,"-"))===r)).filter(r=>r!==void 0);return{...o,buttons:a}});return Et(n)}refresh(){this.loopGroupsCache=null,this.view&&(this.view.webview.html=this.getHtml(this.view.webview))}resolveWebviewView(t,n,o){this.view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this.extensionUri]},t.webview.html=this.getHtml(t.webview),this.workspaceRoot&&Ge(this.workspaceRoot,()=>this.refresh()),t.webview.onDidReceiveMessage(s=>this.handleMessage(s)),t.onDidChangeVisibility(()=>{t.visible&&this.refresh()})}async handleMessage(t){switch(t.actionId&&this.recordActionUse(t.actionId),t.command){case"openChat":if(t.prompt){let n=t.prompt.endsWith(": ");await m.commands.executeCommand("workbench.action.chat.open",{query:t.prompt,isPartialQuery:n})}else await m.commands.executeCommand("workbench.action.chat.open");break;case"initialize":await m.commands.executeCommand("alex.initialize");break;case"upgrade":await m.commands.executeCommand("alex.upgrade");break;case"setupAIMemory":await m.commands.executeCommand("alex.setupAIMemory");break;case"dream":await m.commands.executeCommand("alex.dream");break;case"openSettings":await m.commands.executeCommand("workbench.action.openSettings","alex");break;case"openMemories":{let n=m.Uri.file(C.join(Ue(),"globalStorage","github.copilot-chat","memory-tool","memories"));try{await m.commands.executeCommand("revealFileInOS",n)}catch{await m.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openPrompts":{let n=m.Uri.file(C.join(Ue(),"prompts"));try{await m.commands.executeCommand("revealFileInOS",n)}catch{await m.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openMcpConfig":{let n=m.Uri.file(C.join(Ue(),"mcp.json"));await m.commands.executeCommand("vscode.open",n)}break;case"openExternal":if(t.file){let n=String(t.file);Qn.some(o=>n.startsWith(o))&&await m.env.openExternal(m.Uri.parse(n))}break;case"refresh":this.refresh();break;case"toggleTask":if(this.workspaceRoot&&t.file){let n=it(this.workspaceRoot,t.file);if(n){this.refresh();let o=n.find(s=>s.id===t.file);if(o){let s=o.enabled?"enabled":"disabled",i=o.enabled?"Workflow created.":"Workflow removed.";m.window.showInformationMessage(`Task "${o.name}" ${s}. ${i} Commit & push to activate on GitHub.`)}}}break;case"addTask":this.workspaceRoot&&await gt(this.workspaceRoot)&&this.refresh();break;case"setupCopilotPAT":this.workspaceRoot&&(await je(this.workspaceRoot),this.refresh());break;case"deleteTask":this.workspaceRoot&&t.file&&await m.window.showWarningMessage(`Delete task "${t.file}"?`,{modal:!0},"Delete")==="Delete"&&rt(this.workspaceRoot,t.file)!==null&&(this.refresh(),m.window.showInformationMessage(`Task "${t.file}" deleted. Commit & push to remove the workflow from GitHub.`));break;case"openPromptFile":if(this.workspaceRoot&&t.file){let n=C.resolve(this.workspaceRoot,t.file);if(!n.toLowerCase().startsWith(this.workspaceRoot.toLowerCase()+C.sep)&&n.toLowerCase()!==this.workspaceRoot.toLowerCase())break;_.existsSync(n)?await m.commands.executeCommand("vscode.open",m.Uri.file(n)):m.window.showWarningMessage(`Prompt file not found: ${t.file}`)}break;case"runTask":if(this.workspaceRoot&&t.file){let n=te(this.workspaceRoot),o=Me(this.workspaceRoot,t.file);if(Xe(this.workspaceRoot,t.file),this.refresh(),n&&o)try{let s=await me(n,t.file,i=>{this.refresh()},this.workspaceRoot);this.disposables.push(s),m.window.showInformationMessage(`Workflow dispatched for "${t.file}". Monitoring execution\u2026`)}catch(s){let i=s instanceof Error?s.message:String(s);m.window.showErrorMessage(`Failed to dispatch workflow: ${i}`)}else{let s=pe(t.file),a=Y(this.workspaceRoot).find(r=>r.id===t.file);if(a?.promptFile){let r=C.resolve(this.workspaceRoot,a.promptFile),d=this.workspaceRoot.toLowerCase()+C.sep;if(!r.toLowerCase().startsWith(d))break;if(_.existsSync(r)){let l=_.readFileSync(r,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();await m.commands.executeCommand("workbench.action.chat.open",{query:l,isPartialQuery:!1}),N(this.workspaceRoot,s,!0)}else m.window.showWarningMessage(`Prompt file not found: ${a.promptFile}`),N(this.workspaceRoot,s,!1)}else N(this.workspaceRoot,s,!1)}}break;case"clearRunStatus":t.file&&(ot(t.file),this.refresh());break;case"openScheduleConfig":if(this.workspaceRoot){let n=C.join(this.workspaceRoot,".github","config","scheduled-tasks.json");_.existsSync(n)&&await m.commands.executeCommand("vscode.open",m.Uri.file(n))}break;case"noop":break;case"switchTab":break}}getHtml(t){let n=Xn(),o=t.asWebviewUri(m.Uri.joinPath(this.extensionUri,"dist","codicon.css")),i=(this.workspaceRoot?ht(this.workspaceRoot):null)?.status??"unknown",a=this.workspaceRoot?xt(this.workspaceRoot,_,C):null,r=kt({status:i,config:a});return`<!DOCTYPE html>
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
      scroll-behavior: smooth;
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
    .tab-panel {
      display: none;
      animation: panel-fade 0.15s ease-out;
    }
    .tab-panel.active { display: block; }
    @keyframes panel-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

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
      transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .group.expanded .group-content {
      max-height: 2000px;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
      padding-left: calc(var(--spacing-md) + 2px);
      margin-bottom: 2px;
      font-size: var(--font-md);
      color: var(--vscode-foreground);
      background: none;
      border: none;
      border-left: 2px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      transition: background 0.12s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s;
      position: relative;
    }
    .action-btn:hover {
      background: var(--vscode-list-hoverBackground);
      border-left-color: color-mix(in srgb, var(--accent) 50%, transparent);
    }
    .action-btn:focus-visible {
      outline: var(--focus-ring);
      outline-offset: var(--focus-ring-offset);
      box-shadow: 0 0 0 4px var(--accent-subtle);
    }
    .action-btn:active {
      transform: scale(0.99);
    }
    /* Noop buttons \u2014 informational only, not interactive */
    .action-btn[data-command="noop"] {
      cursor: default;
      opacity: 0.7;
    }
    .action-btn[data-command="noop"]:hover {
      background: none;
      border-left-color: transparent;
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
      border-left-color: transparent;
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

    /* Tooltips \u2014 positioned below to fit narrow sidebar */
    .action-btn[data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: var(--spacing-md);
      top: 100%;
      margin-top: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-sm);
      font-weight: normal;
      color: var(--vscode-editorWidget-foreground);
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-editorWidget-border);
      border-radius: var(--radius-sm);
      white-space: nowrap;
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      animation: tooltip-fade 0.15s ease-out;
    }
    @keyframes tooltip-fade {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    ${ft}
    ${jt}
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
    <div class="tagline">${j(r)}</div>
    <div class="version">v${Ft}</div>
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
    ${Ot({icon:"comment-discussion",label:"Chat with Alex",command:"openChat",hint:"chat"},!0)}

    ${this.renderGroupsWithFrecency(this.getLoopGroups())}
  </div>

  <!-- Setup Tab -->
  <div id="tab-setup" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-setup">
    ${Et(Kn)}
  </div>

  <!-- Autopilot Tab -->
  <div id="tab-autopilot" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-autopilot">
    ${this.workspaceRoot?$t(this.workspaceRoot):""}
    ${ut(this.workspaceRoot?Y(this.workspaceRoot):[],this.workspaceRoot?te(this.workspaceRoot):void 0,this.workspaceRoot)}
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

    // Keyboard support for interactive elements (Enter/Space)
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target.closest('[data-command][role="button"]');
      if (!el) return;
      e.preventDefault();
      el.click();
    });


  </script>
</body>
</html>`}};function Xn(){return Mt.randomBytes(16).toString("hex")}function Et(e){return e.map(t=>{let n=t.collapsed===!1?"expanded":"",o=t.icon?`<span class="codicon codicon-${w(t.icon)}"></span>`:"";return`
    <div class="group ${n}" data-group-id="${w(t.id)}">
      <div class="group-header" role="button" tabindex="0" aria-expanded="${t.collapsed===!1}">
        ${o}
        <span>${j(t.label)}</span>
        <span class="codicon codicon-chevron-right chevron" aria-hidden="true"></span>
      </div>
      ${t.desc?`<div class="group-desc">${j(t.desc)}</div>`:""}
      <div class="group-content">
        <div class="group-buttons">
          ${t.buttons.map(s=>Ot(s)).join("")}
        </div>
      </div>
    </div>`}).join("")}function Ot(e,t=!1){let n=t?"action-btn primary":"action-btn",o=e.id??e.label.toLowerCase().replace(/\s+/g,"-"),s=[`data-command="${w(e.command)}"`,`data-action-id="${w(o)}"`,e.prompt?`data-prompt="${w(e.prompt)}"`:"",e.file?`data-file="${w(e.file)}"`:"",e.tooltip?`data-tooltip="${w(e.tooltip)}"`:""].filter(Boolean).join(" "),i={chat:"comment-discussion",link:"link-external",command:"zap"},a=e.hint?`<span class="hint-badge" title="${e.hint}"><span class="codicon codicon-${i[e.hint]}"></span></span>`:"";return`<button class="${n}" ${s}>
    <span class="codicon codicon-${w(e.icon)}"></span>
    <span class="btn-label">${j(e.label)}</span>
    ${a}
  </button>`}var se=h(require("fs")),oe=h(require("path"));function v(e,...t){return se.existsSync(oe.join(e,...t))}function Lt(e){try{return JSON.parse(se.readFileSync(e,"utf-8"))}catch{return null}}function Zn(e,t){let n=[];(t||v(e,"tsconfig.json"))&&n.push("TypeScript"),(v(e,"requirements.txt")||v(e,"pyproject.toml")||v(e,"setup.py"))&&n.push("Python"),v(e,"go.mod")&&n.push("Go"),v(e,"Cargo.toml")&&n.push("Rust"),(v(e,"pom.xml")||v(e,"build.gradle"))&&n.push("Java");let o={...t?.dependencies??{},...t?.devDependencies??{}};if((o.react||o["react-dom"])&&n.push("React"),o.next&&n.push("Next.js"),o.vue&&n.push("Vue"),o.vitepress&&n.push("VitePress"),o.express&&n.push("Express"),o.fastify&&n.push("Fastify"),o["@azure/functions"]&&n.push("Azure Functions"),o.esbuild&&n.push("esbuild"),o.webpack&&n.push("webpack"),o.vite&&!o.vitepress&&n.push("Vite"),o.vitest&&n.push("Vitest"),o.jest&&n.push("Jest"),o.mocha&&n.push("Mocha"),(o.eslint||v(e,".eslintrc.json")||v(e,"eslint.config.js")||v(e,"eslint.config.mjs"))&&n.push("ESLint"),(o.prettier||v(e,".prettierrc"))&&n.push("Prettier"),v(e,"pyproject.toml"))try{let s=se.readFileSync(oe.join(e,"pyproject.toml"),"utf-8");s.includes("fastapi")&&n.push("FastAPI"),s.includes("flask")&&n.push("Flask"),s.includes("django")&&n.push("Django"),s.includes("pytest")&&n.push("pytest"),s.includes("ruff")&&n.push("Ruff"),s.includes("mypy")&&n.push("mypy")}catch{}return(v(e,"Dockerfile")||v(e,"docker-compose.yml")||v(e,"docker-compose.yaml"))&&n.push("Docker"),[...new Set(n)]}function eo(e,t){let n={},o=t?.scripts??{};o.build&&(n.buildCommand="npm run build"),o["build:prod"]&&(n.buildCommand="npm run build:prod"),o.test&&(n.testCommand="npm test"),o.lint&&(n.lintCommand="npm run lint"),!n.buildCommand&&v(e,"setup.py")&&(n.buildCommand="python setup.py build"),!n.testCommand&&v(e,"pyproject.toml")&&(n.testCommand="pytest"),!n.buildCommand&&v(e,"go.mod")&&(n.buildCommand="go build ./..."),!n.testCommand&&v(e,"go.mod")&&(n.testCommand="go test ./...");let s=["scripts/release.ps1","scripts/release.sh","scripts/release-vscode.ps1","scripts/release.cjs"];for(let i of s)if(v(e,i)){n.releaseScript=i;break}return n}function ke(e){let t=oe.join(e,"package.json"),n=Lt(t),o=Zn(e,n),s=eo(e,n),i="generic";return n&&n.engines?.vscode?(i="vscode-extension",{projectType:i,...s,conventions:o}):v(e,"platforms","vscode-extension","package.json")&&(Lt(oe.join(e,"platforms","vscode-extension","package.json"))?.engines??{}).vscode?(i="vscode-extension",{projectType:i,...s,conventions:o}):n&&(n.workspaces||v(e,"lerna.json")||v(e,"pnpm-workspace.yaml"))?(i="monorepo",{projectType:i,...s,conventions:o}):v(e,".vitepress","config.ts")||v(e,".vitepress","config.mts")||v(e,"next.config.js")||v(e,"next.config.mjs")||v(e,"gatsby-config.js")||v(e,"astro.config.mjs")?(i="static-site",{projectType:i,...s,conventions:o}):o.includes("FastAPI")||o.includes("Flask")||o.includes("Django")?(i="python-api",{projectType:i,...s,conventions:o}):v(e,"dbt_project.yml")||v(e,"notebook")||v(e,"synapse")||v(e,".pbixproj")?(i="data-pipeline",{projectType:i,...s,conventions:o}):{projectType:i,...s,conventions:o}}var O=h(require("fs")),ie=h(require("path"));var to=[{id:"extension-dev",label:"EXTENSION DEV",icon:"extensions",desc:"Package, publish, test, and debug the VS Code extension",collapsed:!0,buttons:[{id:"ext-package",icon:"package",label:"Package VSIX",command:"openChat",prompt:"Package the VS Code extension into a .vsix file. Run the build first, then package with vsce. Report the file size.",hint:"chat",tooltip:"Build and package the extension"},{id:"ext-publish",icon:"cloud-upload",label:"Publish",command:"openChat",prompt:"Run the release preflight checks, then publish the extension to the VS Code Marketplace. Follow the release-management skill.",hint:"chat",tooltip:"Publish to VS Code Marketplace"},{id:"ext-test",icon:"beaker",label:"Extension Tests",command:"openChat",prompt:"Run all extension tests. Report pass/fail counts and any failures with root cause analysis.",hint:"chat",tooltip:"Run extension test suite"},{id:"ext-debug",icon:"debug-alt",label:"Debug Launch",command:"runCommand",file:"workbench.action.debug.start",hint:"command",tooltip:"Launch Extension Development Host"}]}],no=[{id:"api-dev",label:"API DEVELOPMENT",icon:"plug",desc:"Run, test, and document API endpoints",collapsed:!0,buttons:[{id:"api-run",icon:"play",label:"Run Server",command:"openChat",prompt:"Start the API development server. Detect the framework (FastAPI/Flask/Django) and use the appropriate command.",hint:"chat",tooltip:"Start the development server"},{id:"api-test",icon:"beaker",label:"Test API",command:"openChat",prompt:"Run the API test suite with pytest. Report coverage, pass/fail counts, and any failures.",hint:"chat",tooltip:"Run API tests with coverage"},{id:"api-lint",icon:"warning",label:"Lint & Type",command:"openChat",prompt:"Run linting (ruff/flake8) and type checking (mypy/pyright) on the Python codebase. Fix any issues found.",hint:"chat",tooltip:"Run linter and type checker"},{id:"api-docs",icon:"book",label:"API Docs",command:"openChat",prompt:"Review and update the API documentation. Ensure OpenAPI/Swagger specs match the current endpoints.",hint:"chat",tooltip:"Update API documentation"}]}],oo=[{id:"pipeline-phases",label:"PIPELINE PHASES",icon:"server-process",desc:"Medallion architecture: ingest, transform, serve",collapsed:!0,buttons:[{id:"bronze",icon:"database",label:"Bronze Layer",command:"openChat",prompt:"Help me work on the Bronze (raw ingestion) layer. Identify data sources, define schemas, implement extraction logic.",hint:"chat",tooltip:"Raw data ingestion patterns"},{id:"silver",icon:"filter",label:"Silver Layer",command:"openChat",prompt:"Help me work on the Silver (cleansed/conformed) layer. Apply data quality rules, standardize schemas, handle nulls and duplicates.",hint:"chat",tooltip:"Cleansing and conforming"},{id:"gold",icon:"star-full",label:"Gold Layer",command:"openChat",prompt:"Help me work on the Gold (business-ready) layer. Build aggregations, KPI calculations, and dimensional models.",hint:"chat",tooltip:"Business-ready aggregations"}]},{id:"data-quality",label:"DATA QUALITY",icon:"verified",desc:"Profile, validate, and trace data lineage",collapsed:!0,buttons:[{id:"profile",icon:"graph-line",label:"Profile Data",command:"openChat",prompt:"Profile the dataset: row counts, null rates, distributions, cardinality, outliers. Present findings in a summary table.",hint:"chat",tooltip:"Statistical data profiling"},{id:"validate",icon:"check",label:"Validate Schema",command:"openChat",prompt:"Validate data schemas against expectations. Check column types, constraints, referential integrity, and naming conventions.",hint:"chat",tooltip:"Schema validation checks"},{id:"lineage",icon:"git-merge",label:"Trace Lineage",command:"openChat",prompt:"Trace data lineage for the selected table or column. Map source-to-target transformations and document the flow.",hint:"chat",tooltip:"Data lineage documentation"}]}],so=[{id:"site-dev",label:"SITE DEVELOPMENT",icon:"browser",desc:"Dev server, build, deploy, and performance audit",collapsed:!0,buttons:[{id:"site-dev-server",icon:"play",label:"Dev Server",command:"openChat",prompt:"Start the development server for this static site. Detect the framework and use the appropriate dev command.",hint:"chat",tooltip:"Start local dev server"},{id:"site-build",icon:"package",label:"Build Site",command:"openChat",prompt:"Build the static site for production. Report any build warnings or errors.",hint:"chat",tooltip:"Production build"},{id:"site-deploy",icon:"cloud-upload",label:"Deploy",command:"openChat",prompt:"Deploy the site to the configured hosting platform. Run preflight checks first.",hint:"chat",tooltip:"Deploy to hosting"},{id:"site-perf",icon:"dashboard",label:"Performance",command:"openChat",prompt:"Audit site performance: bundle size, image optimization, lazy loading, caching headers, Core Web Vitals.",hint:"chat",tooltip:"Performance and accessibility audit"}]}],io=[{id:"cross-package",label:"CROSS-PACKAGE",icon:"references",desc:"Shared types, dependency updates, and coordinated releases",collapsed:!0,buttons:[{id:"deps-update",icon:"package",label:"Update Deps",command:"openChat",prompt:"Check for outdated dependencies across all packages. Propose coordinated updates that maintain compatibility.",hint:"chat",tooltip:"Cross-package dependency updates"},{id:"shared-types",icon:"symbol-interface",label:"Shared Types",command:"openChat",prompt:"Review shared type definitions across packages. Identify drift, inconsistencies, or missing exports.",hint:"chat",tooltip:"Audit shared type definitions"},{id:"release-all",icon:"rocket",label:"Release Train",command:"openChat",prompt:"Coordinate a release across all packages. Check version consistency, run all tests, update changelogs.",hint:"chat",tooltip:"Coordinated multi-package release"}]}],Gt={"vscode-extension":to,"python-api":no,"data-pipeline":oo,"static-site":so,monorepo:io,generic:[]};function ro(e){try{let t=JSON.parse(O.readFileSync(e,"utf-8"));return Array.isArray(t.groups)?t.groups:[]}catch{return[]}}function ao(e,t){let n=t??ke(e),o=ie.join(e,".github","config","loop-menu.json"),s=ro(o),i=new Set(Object.values(Gt).flatMap(p=>p.map(g=>g.id))),a=s.filter(p=>!i.has(p.id)),r=Gt[n.projectType]??[],d=[...a,...r],l={};return n.buildCommand&&(l.buildCommand=n.buildCommand),n.testCommand&&(l.testCommand=n.testCommand),n.lintCommand&&(l.lintCommand=n.lintCommand),n.releaseScript&&(l.releaseScript=n.releaseScript),n.conventions.length>0&&(l.conventions=n.conventions),{$schema:"./loop-config.schema.json",$comment:`Loop tab menu configuration \u2014 auto-generated for ${n.projectType} project. Prompts are loaded from .github/prompts/loop/{promptFile} at runtime.`,version:"1.0",projectType:n.projectType,projectPhase:"active-development",groups:d,...Object.keys(l).length>0?{projectContext:l}:{}}}function Se(e,t){let n=ao(e,t),o=ie.join(e,".github","config"),s=ie.join(o,"loop-menu.json");try{return O.mkdirSync(o,{recursive:!0}),O.writeFileSync(s,JSON.stringify(n,null,2)+`
`,"utf-8"),!0}catch{return!1}}function Nt(e,t){let n=ie.join(e,".github","config","loop-menu.json");try{if(!O.existsSync(n))return!1;let o=JSON.parse(O.readFileSync(n,"utf-8"));return o.projectPhase=t,O.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0}catch{return!1}}var D=h(require("vscode")),k=h(require("fs")),$=h(require("path")),He=h(require("os"));function Ut(){let e=[],t=He.homedir();try{for(let o of k.readdirSync(t))if(/^OneDrive/i.test(o)){let s=$.join(t,o,"AI-Memory");k.existsSync(s)&&e.push(s)}}catch{}let n=$.join(t,"Library","CloudStorage");try{if(k.existsSync(n)){for(let o of k.readdirSync(n))if(/^OneDrive/i.test(o)){let s=$.join(n,o,"AI-Memory");k.existsSync(s)&&e.push(s)}}}catch{}for(let o of[$.join(t,"AI-Memory"),$.join(t,".alex","AI-Memory")])k.existsSync(o)&&e.push(o);return e}function co(){let e=[],t=He.homedir();try{for(let o of k.readdirSync(t))/^OneDrive/i.test(o)&&e.push($.join(t,o,"AI-Memory"))}catch{}let n=$.join(t,"Library","CloudStorage");try{if(k.existsSync(n))for(let o of k.readdirSync(n))/^OneDrive/i.test(o)&&e.push($.join(n,o,"AI-Memory"))}catch{}return e.push($.join(t,"AI-Memory")),e.push($.join(t,".alex","AI-Memory")),e}function _t(){let e=D.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&k.existsSync(e))return e;let t=Ut();return t.length>0?t[0]:null}var lo=[".github","announcements","feedback","insights","knowledge","patterns"],po={"global-knowledge.md":`# Global Knowledge

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
`,"user-profile.json":()=>JSON.stringify({name:"",role:"",preferences:{communication:"direct",codeStyle:"",learningStyle:""},updatedAt:new Date().toISOString()},null,2),"project-registry.json":()=>JSON.stringify({version:1,projects:[],updatedAt:new Date().toISOString()},null,2),"index.json":()=>JSON.stringify({version:1,files:[],updatedAt:new Date().toISOString()},null,2)};function uo(e){let t=[];k.existsSync(e)||(k.mkdirSync(e,{recursive:!0}),t.push(e));for(let n of lo){let o=$.join(e,n);k.existsSync(o)||(k.mkdirSync(o,{recursive:!0}),t.push(o))}for(let[n,o]of Object.entries(po)){let s=$.join(e,n);if(!k.existsSync(s)){let i=typeof o=="function"?o():o;k.writeFileSync(s,i,"utf-8"),t.push(s)}}return t}async function go(){let e=D.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&k.existsSync(e)){let a=await D.window.showInformationMessage(`AI-Memory already configured at: ${e}`,"Use This","Change Location");if(a==="Use This")return e;if(!a)return}let t=Ut(),n=co(),o=[];for(let a of t)o.push({label:"$(check) "+a,description:"Found \u2014 existing AI-Memory",detail:a});for(let a of n)if(!t.includes(a)){let r=/OneDrive/i.test(a);o.push({label:(r?"$(cloud) ":"$(folder) ")+a,description:r?"OneDrive \u2014 recommended (cloud-synced)":"Local fallback",detail:a})}o.push({label:"$(folder-opened) Browse...",description:"Choose a custom location",detail:"__browse__"});let s=await D.window.showQuickPick(o,{title:"AI-Memory Location",placeHolder:"Where should Alex store shared knowledge?",ignoreFocusOut:!0});if(!s)return;let i;if(s.detail==="__browse__"){let a=await D.window.showOpenDialog({canSelectFolders:!0,canSelectFiles:!1,canSelectMany:!1,openLabel:"Select AI-Memory Folder",title:"Choose AI-Memory Location"});if(!a||a.length===0)return;i=a[0].fsPath,$.basename(i).toLowerCase().includes("ai-memory")||(i=$.join(i,"AI-Memory"))}else i=s.detail;return i}async function Ae(){let e=await go();if(e)try{let t=uo(e);return await D.workspace.getConfiguration("alex.aiMemory").update("path",e,D.ConfigurationTarget.Global),t.length>0?D.window.showInformationMessage(`AI-Memory initialized at ${e} (${t.length} items created).`):D.window.showInformationMessage(`AI-Memory linked to ${e} (already complete).`),e}catch(t){let o=(t instanceof Error?t.message:String(t)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");D.window.showErrorMessage(`AI-Memory setup failed: ${o}`);return}}var E=h(require("vscode")),We=h(require("path")),ee=h(require("fs")),Z=class extends E.TreeItem{constructor(n,o,s,i,a){super(n,s);this.metricId=i;this.children=a;this.description=o,this.tooltip=`${n}: ${o}`}};function Be(e,t){switch(t){case"percent":return`${e}%`;case"seconds":return`${e}s`;case"count":return`${e}`;default:return`${e} ${t}`}}var Ce=class{constructor(t){this.workspaceRoot=t}_onDidChangeTreeData=new E.EventEmitter;onDidChangeTreeData=this._onDidChangeTreeData.event;refresh(){this._onDidChangeTreeData.fire(void 0)}getTreeItem(t){return t}getChildren(t){return this.workspaceRoot?t?.children?t.children:t?[]:this.getRootItems():[new Z("No workspace","Open a folder",E.TreeItemCollapsibleState.None)]}getRootItems(){let t=[],n=We.join(this.workspaceRoot,".github","config","agent-metrics.json");if(!ee.existsSync(n))return[new Z("Not configured","No agent-metrics.json found",E.TreeItemCollapsibleState.None)];let o;try{o=JSON.parse(ee.readFileSync(n,"utf-8"))}catch{return[new Z("Config error","Invalid agent-metrics.json",E.TreeItemCollapsibleState.None)]}let s=We.join(this.workspaceRoot,".agent-metrics-state.json"),i={};if(ee.existsSync(s))try{i=JSON.parse(ee.readFileSync(s,"utf-8"))}catch{}let a=o.thresholds??{};for(let r of o.metrics){let d=i[r.id],l=d?Be(d.value,r.unit):"\u2014",p=a[r.id],g=this.getStatusIcon(r,d?.value,p),u=new Z(r.name,l,E.TreeItemCollapsibleState.None,r.id);u.iconPath=new E.ThemeIcon(g);let b=p?`

Warning: ${Be(p.warning,r.unit)} \xB7 Critical: ${Be(p.critical,r.unit)}`:"";u.tooltip=new E.MarkdownString(`**${r.name}**

${r.description}

Current: ${l}${b}`),t.push(u)}return t}getStatusIcon(t,n,o){return n===void 0||!o?"circle-outline":t.higherIsBetter===!0||t.id.includes("rate")||t.id==="tasks-run-count"?n<o.critical?"error":n<o.warning?"warning":"check":n>o.critical?"error":n>o.warning?"warning":"check"}};var R=h(require("vscode")),x=h(require("fs")),P=h(require("path"));var fo=["instructions","skills","prompts","agents","muscles","config","hooks"],mo=["copilot-instructions.md"],ho="brain-files",ze=".github",Ht=".github/.alex-brain-version",vo=".github/config/MASTER-ALEX-PROTECTED.json";function Bt(e){return e.extension.packageJSON.version}function Wt(e){let t=P.join(e,Ht);try{return x.readFileSync(t,"utf-8").trim()}catch{return}}function zt(e,t,n){let o=n??t;x.mkdirSync(t,{recursive:!0});for(let s of x.readdirSync(e,{withFileTypes:!0})){let i=P.join(e,s.name),a=P.resolve(t,s.name);if(!a.startsWith(o+P.sep)&&a!==o)throw new Error(`Path traversal blocked: ${s.name}`);s.isDirectory()?zt(i,a,o):x.copyFileSync(i,a)}}function Vt(e){return x.existsSync(P.join(e,vo))}async function Pe(e,t=!1){let n=R.workspace.workspaceFolders;if(!n||n.length===0)return R.window.showWarningMessage("Alex: Open a workspace folder first."),!1;let o=n[0].uri.fsPath;if(Vt(o))return R.window.showWarningMessage("Alex: Protected mode \u2014 brain updates blocked in this workspace."),!1;let s=Bt(e),i=Wt(o),a=P.join(o,ze);if(!(t||!x.existsSync(a)||i!==s))return R.window.showInformationMessage(`Alex: Brain is up to date (v${s}).`),!1;let d=P.join(e.extensionUri.fsPath,ho);if(!x.existsSync(d))return R.window.showWarningMessage("Alex: Brain files not found in extension bundle."),!1;try{let l=P.join(o,ze);x.mkdirSync(l,{recursive:!0});for(let b of fo){let T=P.join(d,b);if(!x.existsSync(T))continue;let I=P.join(l,b),G=I+`.staging-${Date.now()}`;zt(T,G),x.existsSync(I)&&x.rmSync(I,{recursive:!0,force:!0}),x.renameSync(G,I)}for(let b of mo){let T=P.join(d,b);x.existsSync(T)&&x.copyFileSync(T,P.join(l,b))}let p=P.join(o,Ht);x.writeFileSync(p,s,"utf-8"),Se(o);let g=i?"updated":"installed";return await R.window.showInformationMessage(`Alex: Brain ${g} to v${s}. Configure recommended settings?`,"Optimize Settings","Skip")==="Optimize Settings"&&R.commands.executeCommand("alex.optimizeSettings"),_t()||await R.window.showInformationMessage("Alex: Set up AI-Memory for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await Ae(),!0}catch(l){let p=l instanceof Error?l.message:String(l);return R.window.showErrorMessage(`Alex: Brain install failed \u2014 ${p}`),!1}}function bo(e){let t=Bt(e),n=R.workspace.workspaceFolders;if(!n||n.length===0)return{installed:!1,bundledVersion:t,needsUpgrade:!1};let o=n[0].uri.fsPath,s=Wt(o),i=P.join(o,ze),a=x.existsSync(i);return{installed:a,version:s,bundledVersion:t,needsUpgrade:a&&s!==t}}async function qt(e){let t=bo(e);if(!t.needsUpgrade)return;let n=R.workspace.workspaceFolders?.[0]?.uri.fsPath;if(n&&Vt(n))return;await R.window.showInformationMessage(`Alex: Brain v${t.version} \u2192 v${t.bundledVersion} available.`,"Upgrade Now","Later")==="Upgrade Now"&&await Pe(e,!0)}function re(e){return(e instanceof Error?e.message:String(e)).replace(/[A-Z]:\\[\w\\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g,"[path]")}async function ae(){let e=c.workspace.getConfiguration(),t="github.copilot.chat.copilotMemory.enabled";e.get(t)!==!1&&await e.update(t,!1,c.ConfigurationTarget.Global)}function yo(e){ae(),et(e.workspaceState);let t=c.chat.createChatParticipant("alex.chat",mt);t.iconPath=c.Uri.joinPath(e.extensionUri,"assets","icon.png"),t.followupProvider={provideFollowups(){return[{prompt:"/autopilot list",label:"List Autopilot Tasks",command:"autopilot"}]}},e.subscriptions.push(t);let n=new ne(e.extensionUri,e.globalState);e.subscriptions.push(n),e.subscriptions.push(c.window.registerWebviewViewProvider(ne.viewId,n));let o=c.workspace.workspaceFolders?.[0]?.uri.fsPath;Rt(e),Ne(o);let s=setInterval(()=>{Ne(c.workspace.workspaceFolders?.[0]?.uri.fsPath)},300*1e3);e.subscriptions.push({dispose:()=>clearInterval(s)});let i=new Ce(o);if(e.subscriptions.push(c.window.createTreeView("alex.agentActivity",{treeDataProvider:i})),e.subscriptions.push(c.commands.registerCommand("alex.refreshAgentActivity",()=>{i.refresh()})),o){let g=new c.RelativePattern(o,".agent-metrics-state.json"),u=c.workspace.createFileSystemWatcher(g);u.onDidChange(()=>i.refresh()),u.onDidCreate(()=>i.refresh()),e.subscriptions.push(u)}e.subscriptions.push(c.commands.registerCommand("alex.refreshWelcome",()=>{n.refresh()})),e.subscriptions.push(c.commands.registerCommand("alex.openChat",()=>{c.commands.executeCommand("workbench.action.chat.open")})),e.subscriptions.push(c.commands.registerCommand("alex.dream",async()=>{try{await c.commands.executeCommand("workbench.action.chat.open",{query:"/dream"})}catch(g){c.window.showErrorMessage(`Dream protocol failed: ${re(g)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.initialize",async()=>{try{await ae(),await c.window.showInformationMessage("Install the Alex brain in this workspace?","Install","Cancel")==="Install"&&await Pe(e,!0)&&(await ae(),n.refresh())}catch(g){c.window.showErrorMessage(`Initialize failed: ${re(g)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.upgrade",async()=>{try{await ae(),await Pe(e,!0)&&(await ae(),n.refresh())}catch(g){c.window.showErrorMessage(`Upgrade failed: ${re(g)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setupAIMemory",async()=>{try{await Ae(),n.refresh()}catch(g){c.window.showErrorMessage(`AI-Memory setup failed: ${re(g)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.generateLoopConfig",async()=>{let g=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!g){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}try{let u=ke(g);Se(g,u)?c.window.showInformationMessage(`Alex: Loop config generated for ${u.projectType} project (${u.conventions.length} conventions detected).`):c.window.showErrorMessage("Alex: Failed to write loop config.")}catch(u){c.window.showErrorMessage(`Alex: Loop config generation failed \u2014 ${re(u)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setProjectPhase",async()=>{let g=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!g){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let u=[{label:"Planning",description:"Ideation, research, and design",value:"planning"},{label:"Active Development",description:"Building features and writing code",value:"active-development"},{label:"Testing",description:"QA, integration tests, and validation",value:"testing"},{label:"Release",description:"Packaging, publishing, and deployment",value:"release"},{label:"Maintenance",description:"Bug fixes, upgrades, and monitoring",value:"maintenance"}],b=await c.window.showQuickPick(u.map(I=>({label:I.label,description:I.description,value:I.value})),{placeHolder:"Select the current project phase"});if(!b)return;Nt(g,b.value)?(n.refresh(),c.window.showInformationMessage(`Alex: Project phase set to "${b.label}".`)):c.window.showErrorMessage("Alex: Failed to update project phase. Generate a loop config first.")}));let a={"alex.convertMdToHtml":{muscle:"md-to-html.cjs",label:"HTML",srcExt:".md"},"alex.convertMdToWord":{muscle:"md-to-word.cjs",label:"Word",srcExt:".md"},"alex.convertMdToEml":{muscle:"md-to-eml.cjs",label:"Email",srcExt:".md"},"alex.convertMdToPdf":{muscle:"md-to-pdf.cjs",label:"PDF",srcExt:".md"},"alex.convertMdToPptx":{muscle:"md-to-pptx.cjs",label:"PowerPoint",srcExt:".md"},"alex.convertMdToEpub":{muscle:"md-to-epub.cjs",label:"EPUB",srcExt:".md"},"alex.convertMdToLatex":{muscle:"md-to-latex.cjs",label:"LaTeX",srcExt:".md"},"alex.convertMdToTxt":{muscle:"md-to-txt.cjs",label:"Plain Text",srcExt:".md"},"alex.convertDocxToMd":{muscle:"docx-to-md.cjs",label:"Markdown",srcExt:".docx"},"alex.convertHtmlToMd":{muscle:"html-to-md.cjs",label:"Markdown",srcExt:".html"},"alex.convertPptxToMd":{muscle:"pptx-to-md.cjs",label:"Markdown",srcExt:".pptx"}};for(let[g,u]of Object.entries(a))e.subscriptions.push(c.commands.registerCommand(g,async b=>{let T=b??c.window.activeTextEditor?.document.uri;if(!T||T.scheme!=="file"){c.window.showWarningMessage("Alex: Select a file to convert.");return}let I=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!I){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let G=Jt.join(I,".github","muscles",u.muscle),z=T.fsPath,V=c.window.createTerminal(`Alex: Convert \u2192 ${u.label}`);V.show(),V.sendText(`node "${G}" "${z}"`)}));let r=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/config/loop-menu.json")),d=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/prompts/loop/*.prompt.md")),l=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/skills/*/loop-config.partial.json")),p=()=>n.refresh();e.subscriptions.push(r,r.onDidChange(p),r.onDidCreate(p),r.onDidDelete(p),d,d.onDidChange(p),d.onDidCreate(p),d.onDidDelete(p),l,l.onDidChange(p),l.onDidCreate(p),l.onDidDelete(p)),qt(e).then(()=>{n.refresh()})}function wo(){}0&&(module.exports={activate,deactivate});
