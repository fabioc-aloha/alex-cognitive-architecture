"use strict";var Gt=Object.create;var re=Object.defineProperty;var Nt=Object.getOwnPropertyDescriptor;var Ut=Object.getOwnPropertyNames;var _t=Object.getPrototypeOf,Ht=Object.prototype.hasOwnProperty;var Wt=(e,t)=>{for(var n in t)re(e,n,{get:t[n],enumerable:!0})},He=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Ut(t))!Ht.call(e,s)&&s!==n&&re(e,s,{get:()=>t[s],enumerable:!(o=Nt(t,s))||o.enumerable});return e};var v=(e,t,n)=>(n=e!=null?Gt(_t(e)):{},He(t||!e||!e.__esModule?re(n,"default",{value:e,enumerable:!0}):n,e)),Bt=e=>He(re({},"__esModule",{value:!0}),e);var so={};Wt(so,{activate:()=>no,deactivate:()=>oo});module.exports=Bt(so);var c=v(require("vscode")),Lt=v(require("path"));var Re=v(require("vscode")),ue=v(require("path")),ge=v(require("fs"));var f=v(require("fs")),S=v(require("path")),b=v(require("vscode")),le=require("child_process");function P(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function y(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;").replace(/\\/g,"&#92;")}var W=v(require("fs")),Ae=v(require("path")),zt=".agent-metrics-state.json",Vt=2160*60*60*1e3;function We(e){return Ae.join(e,zt)}function Be(e){return Ae.join(e,".agent-metrics-runlog.json")}function qt(e){try{return JSON.parse(W.readFileSync(We(e),"utf-8"))}catch{return{}}}function Jt(e,t){W.writeFileSync(We(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function Yt(e){try{return JSON.parse(W.readFileSync(Be(e),"utf-8"))}catch{return{runs:[]}}}function Kt(e,t){W.writeFileSync(Be(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function Qt(e){let t=Date.now()-Vt;return{runs:e.runs.filter(n=>n.completedAt>t)}}var Se=new Map;function ae(e){let t=`${e}:${Date.now()}`;return Se.set(t,{startedAt:Date.now()}),t}function F(e,t,n){let o=Se.get(t),s=Date.now(),r=Yt(e);r.runs.push({taskId:t.split(":")[0],startedAt:o?.startedAt??s,completedAt:s,success:n});let a=Qt(r);Kt(e,a),Se.delete(t),Xt(e,a)}function Xt(e,t){let n=qt(e),o=new Date().toISOString(),s=t.runs;if(n["tasks-run-count"]={value:s.length,lastUpdated:o},s.length>0){let a=s.filter(i=>i.success).length;n["task-success-rate"]={value:Math.round(a/s.length*100),lastUpdated:o}}let r=s.map(a=>(a.completedAt-a.startedAt)/1e3).filter(a=>a>0);if(r.length>0){let a=r.reduce((i,l)=>i+l,0)/r.length;n["task-duration"]={value:Math.round(a),lastUpdated:o}}n["loop-guard-triggers"]||(n["loop-guard-triggers"]={value:0,lastUpdated:o}),Jt(e,n)}function Zt(e){let t=e.split(/\s+/);if(t.length!==5)return e;let[n,o,s,r,a]=t,i=`${o.padStart(2,"0")}:${n.padStart(2,"0")} UTC`;return s.startsWith("*/")&&r==="*"&&a==="*"?`Every ${s.slice(2)} days at ${i}`:o.startsWith("*/")?`Every ${o.slice(2)} hours`:s==="*"&&r==="*"&&a==="*"&&!o.includes("/")&&!o.includes(",")?`Daily at ${i}`:s==="*"&&r==="*"&&a!=="*"?`${{0:"Sun",1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat"}[a]??a} at ${i}`:e}function ze(e){try{let t=(0,le.execFileSync)("gh",["secret","list","--json","name"],{cwd:e,encoding:"utf-8",timeout:1e4,stdio:["pipe","pipe","pipe"]});return JSON.parse(t).some(o=>o.name==="COPILOT_PAT")}catch{return!1}}async function Ce(e){let t=await b.window.showInformationMessage("Autopilot needs a GitHub token (repo secret) to assign Copilot to issues. Set it up now using your existing GitHub CLI auth?",{modal:!0},"Set Up Automatically","I'll Do It Manually");if(t==="I'll Do It Manually")return b.env.openExternal(b.Uri.parse("https://github.com/settings/personal-access-tokens/new")),b.window.showInformationMessage("Create a fine-grained PAT with Issues (read/write) and Contents (read/write) permissions, then run: gh secret set COPILOT_PAT in your repo."),!1;if(t!=="Set Up Automatically")return!1;try{let n=(0,le.execFileSync)("gh",["auth","token"],{cwd:e,encoding:"utf-8",timeout:1e4,stdio:["pipe","pipe","pipe"]}).trim();return n?((0,le.execFileSync)("gh",["secret","set","COPILOT_PAT","--body",n],{cwd:e,timeout:15e3,stdio:["pipe","pipe","pipe"]}),b.window.showInformationMessage("COPILOT_PAT secret created. Copilot can now be auto-assigned to issues."),!0):(b.window.showErrorMessage("Could not retrieve GitHub CLI token. Run `gh auth login` first."),!1)}catch{return b.window.showErrorMessage("Failed to set up COPILOT_PAT. Make sure `gh` CLI is installed and you're authenticated (`gh auth login`)."),!1}}function en(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);if(n<1)return"just now";if(n<60)return`${n}m ago`;let o=Math.floor(n/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}function X(e){let t=S.join(e,".git","config");if(f.existsSync(t))try{let n=f.readFileSync(t,"utf-8"),o=n.match(/url\s*=\s*https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)/);if(o)return`https://github.com/${o[1]}`;let s=n.match(/url\s*=\s*git@github\.com:([^/\s]+\/[^/\s.]+)/);return s?`https://github.com/${s[1]}`:void 0}catch{return}}var tn=S.join(".github","config",".scheduled-tasks-state.json");function Ve(e){return S.join(e,tn)}function Pe(e){try{return JSON.parse(f.readFileSync(Ve(e),"utf-8"))}catch{return{}}}function qe(e,t){let n=Pe(e);n[t]={lastRun:new Date().toISOString()};let o=Ve(e),s=S.dirname(o);f.existsSync(s)||f.mkdirSync(s,{recursive:!0}),f.writeFileSync(o,JSON.stringify(n,null,2)+`
`,"utf-8")}var de=null,Je="alex.scheduledRuns";function Ye(e){de=e}function Te(){return de?.get(Je)??{}}function Ke(e){de&&de.update(Je,e)}function Qe(e){return Te()[e]}function Xe(e){let t=Te();delete t[e],Ke(t)}function ce(e,t){let n=Te();n[e]=t,Ke(n)}function nn(e,t,n){if(!e.dependsOn||e.dependsOn.length===0)return{satisfied:!0,blocking:[]};let o=Pe(n),s=[];for(let r of e.dependsOn){if(!t.find(l=>l.id===r)){s.push(`${r} (not found)`);continue}let i=Qe(r);if(i){i.status==="failure"||i.status==="error"||i.status==="cancelled"?s.push(`${r} (${i.status})`):i.status!=="completed"&&s.push(`${r} (${i.status})`);continue}o[r]?.lastRun||s.push(`${r} (never run)`)}return{satisfied:s.length===0,blocking:s}}function Ze(e){let t=new Map(e.map(a=>[a.id,a])),n=new Set,o=new Set,s=[];function r(a){if(n.has(a)||o.has(a))return;o.add(a);let i=t.get(a);if(i?.dependsOn)for(let l of i.dependsOn)t.has(l)&&r(l);o.delete(a),n.add(a),i&&s.push(i)}for(let a of e)r(a.id);for(let a of e)n.has(a.id)||s.push(a);return s}function on(e){let t=e.match(/github\.com\/([^/]+)\/([^/]+)/);if(t)return{owner:t[1],repo:t[2]}}async function pe(e,t,n,o){let s=on(e);if(!s)throw new Error("Cannot parse GitHub owner/repo from URL");let r=ae(t),a=o??b.workspace.workspaceFolders?.[0]?.uri.fsPath,{owner:i,repo:l}=s,d=`scheduled-${t}.yml`,p={Authorization:`Bearer ${(await b.authentication.getSession("github",["repo"],{createIfNone:!0})).accessToken}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"alex-cognitive-architecture"};ce(t,{status:"queued"}),n({status:"queued"});let w=new Date().toISOString(),D=`https://api.github.com/repos/${i}/${l}/actions/workflows/${d}/dispatches`,$=await fetch(D,{method:"POST",headers:{...p,"Content-Type":"application/json"},body:JSON.stringify({ref:"main"})});if(!$.ok){let U=await $.text(),ke={status:"error"};throw ce(t,ke),n(ke),a&&F(a,r,!1),new Error(`Dispatch failed (${$.status}): ${U}`)}let Q=`https://api.github.com/repos/${i}/${l}/actions/workflows/${d}/runs?per_page=1&created=>${w.slice(0,19)}Z`,_=0,H=120,xe=5e3,se=async()=>{if(_++,_>H){let U={status:"error"};ce(t,U),n(U),a&&F(a,r,!1);return}try{let U=await fetch(Q,{headers:p});if(!U.ok)return N();let M=(await U.json()).workflow_runs?.[0];if(!M)return N();let _e={status:M.status==="completed"?M.conclusion==="success"?"completed":M.conclusion??"failure":M.status??"in_progress",runUrl:M.html_url,conclusion:M.conclusion??void 0};if(ce(t,_e),n(_e),M.status!=="completed")return N();a&&F(a,r,M.conclusion==="success")}catch{return N()}},ie=!1,G=[],N=()=>{ie||G.push(setTimeout(()=>void se(),xe))};return G.push(setTimeout(()=>void se(),3e3)),{dispose:()=>{ie=!0,G.forEach(clearTimeout)}}}function z(e){let t=S.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(t))return[];try{return JSON.parse(f.readFileSync(t,"utf-8")).tasks??[]}catch{return[]}}function et(e,t){let n=S.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(n))return null;try{let o=JSON.parse(f.readFileSync(n,"utf-8")),s=o.tasks?.find(r=>r.id===t);return s?(s.enabled=!s.enabled,f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),s.enabled?it(e,s):rt(e,s.id),o.tasks):null}catch{return null}}function tt(e,t){let n=S.join(e,".github","config","scheduled-tasks.json");if(!f.existsSync(n))return null;try{let o=JSON.parse(f.readFileSync(n,"utf-8")),s=o.tasks?.findIndex(r=>r.id===t);return s===void 0||s<0?null:(o.tasks.splice(s,1),f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),rt(e,t),o.tasks)}catch{return null}}function Ie(e,t){let n=S.join(e,".github","workflows",`scheduled-${t}.yml`);return f.existsSync(n)}function nt(e){return S.join(e,".github","workflows")}function $e(e,t){return S.join(nt(e),`scheduled-${t}.yml`)}function B(e){return e.replace(/[\\"`$!#&|;(){}<>]/g,"")}function ot(e){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e))throw new Error(`Invalid task ID: "${e}". Must be lowercase alphanumeric with hyphens.`);return e}function st(e){if(!/^[0-9*\/,\- ]+$/.test(e))throw new Error(`Invalid cron expression: "${e}".`);return e}function sn(e){let t=B(e.name),n=ot(e.id),o=st(e.schedule);return`# Auto-generated \u2014 do not edit manually
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
          PROMPT_FILE: "${B(e.promptFile??"")}"
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
`}function rn(e){let t=B(e.name),n=B(e.description),o=e.muscle?B(e.muscle):"",s=e.muscleArgs?` ${e.muscleArgs.map(B).join(" ")}`:"",r=ot(e.id),a=st(e.schedule);return`# Auto-generated \u2014 do not edit manually
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
`}function it(e,t){let n;if(t.mode==="agent"&&t.promptFile)n=sn(t);else if(t.mode==="direct"&&t.muscle)n=rn(t);else return!1;let o=nt(e);return f.existsSync(o)||f.mkdirSync(o,{recursive:!0}),f.writeFileSync($e(e,t.id),n,"utf-8"),!0}function rt(e,t){let n=$e(e,t);f.existsSync(n)&&f.unlinkSync(n)}function at(e,t,n){let o;if(e.length===0)o=`
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
    </div>`;else{let r=n?Pe(n):{},a=e.map(i=>{let l=i.mode==="agent"?"hubot":"terminal",d=i.mode==="agent"?"Agent":"Script",u=Zt(i.schedule),g=n?Ie(n,i.id):!1,p=Qe(i.id),w;p&&(p.status==="queued"||p.status==="in_progress")?w='<span class="schedule-pill schedule-pill-running"><span class="codicon codicon-loading codicon-modifier-spin"></span> Running</span>':p&&p.status==="completed"?w='<span class="schedule-pill schedule-pill-success"><span class="codicon codicon-check"></span> Dispatched</span>':p&&(p.status==="failure"||p.status==="cancelled"||p.status==="error")?w='<span class="schedule-pill schedule-pill-fail"><span class="codicon codicon-error"></span> Failed</span>':w=i.enabled?'<span class="schedule-pill schedule-pill-on">Active</span>':'<span class="schedule-pill schedule-pill-off">Paused</span>';let D=p&&(p.status==="queued"||p.status==="in_progress"),Q=i.mode==="agent"&&i.promptFile||i.mode==="direct"&&i.muscle?D?'<button class="schedule-action-btn schedule-action-running" disabled title="Running\u2026"><span class="codicon codicon-loading codicon-modifier-spin"></span></button>':`<button class="schedule-action-btn schedule-action-run" data-command="runTask" data-file="${y(i.id)}" title="${g?"Run on GitHub Actions":"Run now"}"><span class="codicon codicon-rocket"></span></button>`:"",_=p?.runUrl?`<button class="schedule-action-btn" data-command="openExternal" data-file="${y(p.runUrl)}" title="View run on GitHub"><span class="codicon codicon-link-external"></span></button>`:"",H=i.mode==="agent"&&i.promptFile?`<button class="schedule-action-btn" data-command="openPromptFile" data-file="${y(i.promptFile)}" title="Edit prompt"><span class="codicon codicon-edit"></span></button>`:"",xe=`<button class="schedule-action-btn ${i.enabled?"schedule-action-pause":"schedule-action-resume"}" data-command="toggleTask" data-file="${y(i.id)}" title="${i.enabled?"Pause":"Resume"}">${i.enabled?'<span class="codicon codicon-debug-pause"></span>':'<span class="codicon codicon-play-circle"></span>'}</button>`,se=`<button class="schedule-action-btn schedule-action-danger" data-command="deleteTask" data-file="${y(i.id)}" title="Delete"><span class="codicon codicon-trash"></span></button>`,ie=r[i.id]?.lastRun?`<span class="schedule-last-run" title="Last run: ${y(r[i.id].lastRun)}"><span class="codicon codicon-history"></span> ${en(r[i.id].lastRun)}</span>`:"",G="";if(i.dependsOn&&i.dependsOn.length>0&&n){let N=nn(i,e,n);N.satisfied?G='<div class="schedule-task-deps schedule-deps-ok"><span class="codicon codicon-pass"></span> Dependencies met</div>':G=`<div class="schedule-task-deps schedule-deps-blocked"><span class="codicon codicon-lock"></span> Blocked by: ${P(N.blocking.join(", "))}</div>`}return`
      <div class="schedule-task ${i.enabled?"enabled":"disabled"}" data-task-id="${y(i.id)}">
        <div class="schedule-task-header">
          <span class="schedule-mode" title="${d}"><span class="codicon codicon-${l}"></span></span>
          <span class="schedule-task-name" title="${y(i.name)}">${P(i.name)}</span>
          ${w}
        </div>
        <div class="schedule-task-meta">
          <span class="schedule-schedule"><span class="codicon codicon-clock"></span> ${P(u)}</span>
          ${ie}
        </div>
        <div class="schedule-task-desc">${P(i.description)}</div>
        ${G}
        <div class="schedule-task-actions">
          ${Q}
          ${_}
          ${H}
          ${xe}
          ${se}
        </div>
      </div>`}).join("");o=`
    <div class="schedule-section-header">
      <span class="codicon codicon-clock"></span>
      <strong>Scheduled Tasks</strong>
      <span class="agent-badge">${e.filter(i=>i.enabled).length}/${e.length}</span>
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
    </div>`}return e.some(r=>r.mode==="agent")&&n&&!ze(n)&&(o+=`
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
      <button class="action-btn" data-command="openExternal" data-file="${y(t)}/actions">
        <span class="codicon codicon-github-action"></span>
        <span class="btn-label">GitHub Actions</span>
      </button>`),o+=`
      <button class="action-btn" data-command="openExternal" data-file="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki/Autopilot">
        <span class="codicon codicon-book"></span>
        <span class="btn-label">Documentation</span>
      </button>
    </div>`,o}function an(e,t){let n=S.join(e,".github","config","scheduled-tasks.json");try{let o;if(f.existsSync(n))o=JSON.parse(f.readFileSync(n,"utf-8"));else{let s=S.dirname(n);f.existsSync(s)||f.mkdirSync(s,{recursive:!0}),o={version:"1.0.0",tasks:[]}}return o.tasks.some(s=>s.id===t.id)?(b.window.showWarningMessage(`Task "${t.id}" already exists.`),!1):(o.tasks.push(t),f.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0)}catch{return!1}}var cn=[{label:"Every 3 hours",cron:"0 */3 * * *",description:"8 times/day"},{label:"Every 6 hours",cron:"0 */6 * * *",description:"4 times/day"},{label:"Every 12 hours",cron:"0 */12 * * *",description:"Twice daily"},{label:"Daily at 8 AM",cron:"0 8 * * *",description:"Once daily (UTC)"},{label:"Daily at noon",cron:"0 12 * * *",description:"Once daily (UTC)"},{label:"Weekly Monday",cron:"0 8 * * 1",description:"Every Monday 8 AM UTC"},{label:"Weekly Friday",cron:"0 16 * * 5",description:"Every Friday 4 PM UTC"},{label:"Custom cron...",cron:"",description:"Enter POSIX cron expression"}];async function ct(e){let t=await b.window.showInputBox({title:"Add Scheduled Task (1/5)",prompt:"Task name",placeHolder:"e.g. Weekly Code Review",validateInput:u=>u.trim()?void 0:"Name is required"});if(!t)return!1;let n=await b.window.showInputBox({title:"Add Scheduled Task (2/5)",prompt:"Brief description",placeHolder:"What does this automation do?",validateInput:u=>u.trim()?void 0:"Description is required"});if(!n)return!1;let o=await b.window.showQuickPick([{label:"$(hubot) Cloud Agent",description:"Creates a GitHub issue assigned to Copilot",detail:"Best for creative tasks: writing, analysis, reviews",mode:"agent"},{label:"$(terminal) Direct",description:"Runs a script in GitHub Actions",detail:"Best for mechanical tasks: audits, builds, syncs",mode:"direct"}],{title:"Add Scheduled Task (3/5)",placeHolder:"Execution mode"});if(!o)return!1;let s=await b.window.showQuickPick(cn.map(u=>({label:u.label,description:u.description,cron:u.cron})),{title:"Add Scheduled Task (4/5)",placeHolder:"Schedule frequency"});if(!s)return!1;let r=s.cron;if(!r){let u=await b.window.showInputBox({title:"Custom Cron Expression",prompt:"POSIX cron: minute hour day-of-month month day-of-week",placeHolder:"0 */4 * * *",validateInput:g=>g.trim().split(/\s+/).length===5?void 0:"Must be 5 space-separated fields"});if(!u)return!1;r=u.trim()}let a=S.join(e,".github","skills"),i;if(f.existsSync(a)){let u=f.readdirSync(a,{withFileTypes:!0}).filter(g=>g.isDirectory()).map(g=>({label:g.name}));if(u.length>0){let g=await b.window.showQuickPick([{label:"(none)",description:"No specific skill"},...u],{title:"Add Scheduled Task (5/5)",placeHolder:"Associate a skill (optional)"});g&&g.label!=="(none)"&&(i=g.label)}}let l=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");if(!l)return b.window.showErrorMessage("Task name must contain at least one letter or digit."),!1;let d={id:l,name:t,description:n,mode:o.mode,schedule:r,enabled:!0,...i?{skill:i}:{},...o.mode==="agent"?{promptFile:`.github/config/scheduled-tasks/${l}.md`}:{}};if(an(e,d)){if(o.mode==="agent"&&d.promptFile){let p=S.join(e,d.promptFile),w=S.dirname(p);if(f.existsSync(w)||f.mkdirSync(w,{recursive:!0}),!f.existsSync(p)){let D=[`# ${t}`,"","## Task","",`${n}`,"","## Instructions","","1. Read relevant context from the repository","2. Perform the task","3. Create a PR with your changes","","## Quality Standards","","- Follow existing project conventions","- Include meaningful commit messages","- Ensure all tests pass before submitting",""].join(`
`);f.writeFileSync(p,D,"utf-8")}b.commands.executeCommand("vscode.open",b.Uri.file(p))}it(e,d),o.mode==="agent"&&!ze(e)&&Ce(e);let u=o.mode==="agent"?`Task "${t}" created with workflow. Edit the prompt template, then commit & push to activate on GitHub.`:`Task "${t}" created with workflow. Commit & push to activate on GitHub.`,g=o.mode==="agent"?"Edit Prompt":"View Workflow";return b.window.showInformationMessage(u,g).then(p=>{if(p==="Edit Prompt"&&d.promptFile){let w=S.join(e,d.promptFile);b.commands.executeCommand("vscode.open",b.Uri.file(w))}else if(p==="View Workflow"){let w=$e(e,d.id);b.commands.executeCommand("vscode.open",b.Uri.file(w))}}),!0}return!1}var lt=`
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
`;var dt=async(e,t,n,o)=>e.command==="autopilot"?ln(e,n):e.command==="cloud"?dn(e,n,o):{};async function ln(e,t){let n=Re.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!n)return t.markdown("Open a workspace folder to use Autopilot."),{};let o=z(n),s=e.prompt.trim().toLowerCase();if(s==="list"||s===""){t.markdown(`## Autopilot Tasks

`);let r=Ze(o);for(let a of r){let i=a.mode==="agent"?"\u{1F916}":"\u2699\uFE0F",l=a.enabled?"Active":"Paused",d=a.dependsOn?.length?` \u2190 depends on: ${a.dependsOn.join(", ")}`:"";t.markdown(`- ${i} **${a.name}** \u2014 ${l}${d}
`)}return t.markdown(`
*${o.length} tasks configured. Use \`/autopilot status\` for run history.*`),{}}if(s==="status"){t.markdown(`## Autopilot Status

`);let r=o.filter(i=>i.enabled),a=o.filter(i=>!i.enabled);t.markdown(`**${r.length}** active \xB7 **${a.length}** paused

`);for(let i of r)t.markdown(`- **${i.name}** \u2014 \`${i.schedule}\`
`);return{}}if(s.startsWith("run ")){let r=s.slice(4).trim(),a=o.find(i=>i.id===r);if(!a)return t.markdown(`Task \`${r}\` not found. Use \`/autopilot list\` to see available tasks.`),{};if(a.mode==="agent"&&a.promptFile){let i=ue.join(n,a.promptFile),l=ue.resolve(i);if(!l.toLowerCase().startsWith(n.toLowerCase()))return t.markdown("Invalid prompt file path."),{};if(ge.existsSync(l)){let d=ge.readFileSync(l,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();t.markdown(`Running **${a.name}**...

${d}`)}else t.markdown(`Prompt file not found: \`${a.promptFile}\``)}else t.markdown(`Task **${a.name}** uses direct mode (script: \`${a.muscle??"n/a"}\`). Run it from the Autopilot tab or GitHub Actions.`);return{}}return t.markdown(`## Autopilot Commands

`),t.markdown("- `/autopilot list` \u2014 Show all configured tasks\n"),t.markdown("- `/autopilot status` \u2014 Show active tasks and schedules\n"),t.markdown("- `/autopilot run <task-id>` \u2014 Run a specific task\n"),{}}async function dn(e,t,n){let o=Re.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!o)return t.markdown("Open a workspace folder to use cloud dispatch."),{};let s=z(o),r=e.prompt.trim().toLowerCase();if(r===""||r==="help")return t.markdown(`## Cloud Dispatch

`),t.markdown(`Dispatch Autopilot tasks to GitHub Actions for cloud execution.

`),t.markdown("- `/cloud list` \u2014 Show cloud-eligible tasks\n"),t.markdown("- `/cloud run <task-id>` \u2014 Dispatch a task to GitHub Actions\n"),{};if(r==="list"){let a=s.filter(i=>i.enabled&&i.mode==="agent");if(a.length===0)return t.markdown("No cloud-eligible tasks found. Enable agent-mode tasks in scheduled-tasks.json."),{};t.markdown(`## Cloud-Eligible Tasks

`);for(let i of a)t.markdown(`- **${i.id}** \u2014 ${i.name}
`);return t.markdown("\n*Use `/cloud run <task-id>` to dispatch.*"),{}}if(r.startsWith("run ")){let a=r.slice(4).trim(),i=s.find(d=>d.id===a);if(!i)return t.markdown(`Task \`${a}\` not found. Use \`/cloud list\` to see eligible tasks.`),{};if(!i.enabled)return t.markdown(`Task **${i.name}** is paused. Enable it first.`),{};let l=X(o);if(!l)return t.markdown("Could not determine GitHub repo URL from workspace."),{};t.markdown(`Dispatching **${i.name}** to GitHub Actions...

`);try{let d=await pe(l,i.id,()=>{},o);n.onCancellationRequested(()=>d.dispose()),t.markdown("Workflow dispatched. Check the Autopilot tab or GitHub Actions for progress.")}catch(d){let g=(d instanceof Error?d.message:String(d)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");t.markdown(`Dispatch failed: ${g}`)}return{}}return t.markdown("Unknown cloud command. Use `/cloud help` for usage."),{}}var m=v(require("vscode")),$t=v(require("crypto")),L=v(require("fs")),A=v(require("path")),J=v(require("os"));var O=v(require("fs")),R=v(require("path")),me=require("child_process");function fe(e,t){return Math.abs(t.getTime()-e.getTime())/(1e3*60*60*24)}function pn(e){let t=new Date,n=e.lastDreamDate?Math.floor(fe(e.lastDreamDate,t)):1/0;return e.dreamNeeded&&n>14||e.syncStale&&n>3?"critical":e.dreamNeeded||n>7||e.syncStale?"attention":"healthy"}function un(e){let t=R.join(e,".github","quality","dream-report.json");try{let n=O.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function gn(e){let t=R.join(e,".github",".sync-manifest.json");try{let n=O.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function fn(){try{let e=R.resolve(__dirname,"..","package.json");return JSON.parse(O.readFileSync(e,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}}function mn(e){let t=gn(e);if(!t)return!1;let n=fn();if(t.brainVersion!==n)return!0;let o=new Date(t.lastSync);return!!(isNaN(o.getTime())||fe(o,new Date)>7)}function hn(e){try{let t=(0,me.execFileSync)("git",["diff","--cached","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),n=(0,me.execFileSync)("git",["diff","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),o=t?t.split(`
`).length:0,s=n?n.split(`
`).length:0,r=o+s;if(r===0)return{fileCount:0,days:0};let a=0;try{let i=(0,me.execFileSync)("git",["log","-1","--format=%ci"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim();i&&(a=Math.floor(fe(new Date(i),new Date)))}catch{}return{fileCount:r,days:a}}catch{return{fileCount:0,days:0}}}function vn(e){let t=R.join(e,".github"),n=s=>{try{return O.readdirSync(s,{withFileTypes:!0}).filter(r=>r.isDirectory()).length}catch{return 0}},o=(s,r,a=!1)=>{try{if(!a)return O.readdirSync(s).filter(d=>d.endsWith(r)).length;let i=0,l=d=>{for(let u of O.readdirSync(d,{withFileTypes:!0}))u.isDirectory()?l(R.join(d,u.name)):u.name.endsWith(r)&&i++};return l(s),i}catch{return 0}};return{skills:n(R.join(t,"skills")),instructions:o(R.join(t,"instructions"),".instructions.md"),prompts:o(R.join(t,"prompts"),".prompt.md",!0),agents:o(R.join(t,"agents"),".agent.md")}}function pt(e){let t=un(e),n=vn(e),o=t?new Date(t.timestamp):null,s=t?t.brokenRefs.length>0||t.trifectaIssues.length>20:!0,r=hn(e),a={status:"healthy",skillCount:n.skills,instructionCount:n.instructions,promptCount:n.prompts,agentCount:n.agents,lastDreamDate:o,dreamNeeded:s,syncStale:mn(e),uncommittedFileCount:r.fileCount,uncommittedDays:r.days};return a.status=pn(a),a}function bn(e,t){let n=(t.getTime()-e.getTime())/864e5,o=Math.LN2/7;return Math.exp(-o*n)}function yn(e,t=new Date){let n=new Date(e.lastUsed),o=bn(n,t);return Math.sqrt(e.count)*o}function ut(e,t,n=new Date){return e.actions.find(s=>s.id===t)?{...e,actions:e.actions.map(s=>s.id===t?{...s,count:s.count+1,lastUsed:n.toISOString()}:s)}:{...e,actions:[...e.actions,{id:t,count:1,lastUsed:n.toISOString()}]}}function gt(e,t,n=new Date){let o=new Map;for(let a of t.actions){let i=yn(a,n);i>=.1&&o.set(a.id,i)}let s=e.filter(a=>o.has(a)),r=e.filter(a=>!o.has(a));return s.sort((a,i)=>(o.get(i)??0)-(o.get(a)??0)),[...s,...r]}function ft(){return{version:1,actions:[]}}var wn=["Two minds, one vision","Better together than alone","Your ideas, amplified","Where human meets machine","The sum of us","Let's build something meaningful","From thought to reality","Creating what neither could alone","Turning possibility into code","What will we make today?","Exploring the edge of possible","Learning never looked like this","Growing smarter, together","Every question opens a door","Uncharted territory, good company","I see what you're building","Your vision, our journey","Thinking alongside you","Understanding before answering"],xn=["Still here, still building","Every pause is a chance to reflect","The best work takes time","Progress isn't always visible","Let's pick up where we left off","Good things are worth the wait","One conversation at a time"],kn=["Fresh starts are powerful","We'll figure this out","The first step is showing up","Building begins with connection","Ready when you are","Together, we'll find the way"],Sn=["Two minds, ready to build","Let's see what we can create","The beginning of something","Your partner in possibility"],An=["A new day to create","Fresh ideas await","What will we build today?"],Cn=["Wrapping up what we started","Good work deserves reflection","Tomorrow we build on today"];function Pn(e=new Date){let t=e.getHours();return t<12?"morning":t<18?"afternoon":"evening"}function mt(e=new Date){let t=new Date(e.getFullYear(),0,0),n=e.getTime()-t.getTime(),o=1e3*60*60*24;return Math.floor(n/o)}function he(e,t=new Date){let n=mt(t);return e[n%e.length]}function Tn(e){switch(e){case"healthy":return wn;case"attention":return xn;case"critical":return kn;default:return Sn}}function ht(e,t,n){let o=n.join(e,".github","config","taglines.json");if(!t.existsSync(o))return null;try{let s=t.readFileSync(o,"utf-8"),r=JSON.parse(s);return!r.taglines?.project||r.taglines.project.length===0?null:r}catch{return null}}function In(e){let t=[];for(let n of Object.keys(e.taglines)){let o=e.taglines[n];Array.isArray(o)&&t.push(...o)}return t}function vt(e={}){let{status:t="unknown",config:n,useTimeOfDay:o=!0,date:s=new Date}=e,r=mt(s);if(n&&t==="healthy"){let i=n.rotation?.projectWeight??50,l=Math.floor(i);if(r%100<l){let u=In(n);if(u.length>0)return he(u,s)}}if(o&&t==="healthy"&&r%10===0){let i=Pn(s);if(i==="morning")return he(An,s);if(i==="evening")return he(Cn,s)}let a=Tn(t);return he(a,s)}var j=v(require("fs")),V=v(require("path"));function $n(e){let t=e.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);return t?e.slice(t[0].length).trim():e.trim()}function Rn(e){let t=V.join(e,".github","skills");if(!j.existsSync(t))return[];let n=[],o;try{o=j.readdirSync(t,{withFileTypes:!0})}catch{return[]}for(let s of o){if(!s.isDirectory())continue;let r=V.join(t,s.name,"loop-config.partial.json");if(j.existsSync(r))try{let a=JSON.parse(j.readFileSync(r,"utf-8"));if(Array.isArray(a.groups))for(let i of a.groups)n.push({...i,source:"skill"})}catch{}}return n}function jn(e,t){let n=e.map(o=>({...o,buttons:[...o.buttons]}));for(let o of t){let s=n.find(r=>r.id===o.id);if(s){let r=new Set(s.buttons.map(a=>a.id??a.label));for(let a of o.buttons){let i=a.id??a.label;r.has(i)||(s.buttons.push(a),r.add(i))}}else n.push({...o,buttons:[...o.buttons]})}return n}function Dn(e,t){return t?e.filter(n=>!n.phase||n.phase.includes(t)).map(n=>{let o=n.buttons.filter(r=>!r.phase||r.phase.includes(t)),s=n.phase?.includes(t);return{...n,buttons:o,collapsed:s?!1:n.collapsed}}).filter(n=>n.buttons.length>0):e}function En(e,t){let n={id:e.id,icon:e.icon,label:e.label,command:e.command,hint:e.hint,tooltip:e.tooltip};if(e.promptFile){let o=V.join(t,e.promptFile);try{j.existsSync(o)&&(n.prompt=$n(j.readFileSync(o,"utf-8")))}catch{}}return!n.prompt&&e.prompt&&(n.prompt=e.prompt),e.file&&(n.file=e.file),n}function bt(e){let t=V.join(e,".github","config","loop-menu.json");if(!j.existsSync(t))return[];let n;try{n=JSON.parse(j.readFileSync(t,"utf-8"))}catch{return[]}if(!Array.isArray(n.groups))return[];let o=Rn(e),s=jn(n.groups,o),r=Dn(s,n.projectPhase),a=V.join(e,".github","prompts","loop");return r.map(i=>({id:i.id,label:i.label,desc:i.desc,accent:i.accent,icon:i.icon,collapsed:i.collapsed,buttons:i.buttons.map(l=>En(l,a))}))}var ve=v(require("vscode")),St=require("child_process");var q={recentAgentPRs:[],pendingReviews:[],totalPending:0,lastFetched:null,error:null};function yt(e,t){return new Promise(n=>{let o=e.split(/\s+/);(0,St.execFile)("gh",o,{cwd:t,timeout:15e3,maxBuffer:1024*1024},(s,r)=>{if(s){n(null);return}n(r.trim())})})}function wt(e){if(!e)return[];try{return JSON.parse(e).map(n=>({number:n.number,title:n.title,url:n.url,state:n.state,author:n.author?.login??"unknown",createdAt:n.createdAt,updatedAt:n.updatedAt,isDraft:n.isDraft??!1,reviewDecision:n.reviewDecision??"",labels:(n.labels??[]).map(o=>o.name)}))}catch{return[]}}var xt="number,title,url,state,author,createdAt,updatedAt,isDraft,reviewDecision,labels";var je=!1;async function De(e,t){if(!je){je=!0;try{let[n,o]=await Promise.all([yt(`pr list --author app/copilot-swe-agent --state all --limit 10 --json ${xt}`,e),yt(`pr list --search review-requested:@me --state open --limit 10 --json ${xt}`,e)]),s=wt(n),r=wt(o);q={recentAgentPRs:s,pendingReviews:r,totalPending:r.length,lastFetched:new Date,error:null}}catch(n){q={...q,error:n instanceof Error?n.message:String(n)}}je=!1,t?.()}}function Mn(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/36e5);if(n<1)return"just now";if(n<24)return`${n}h ago`;let o=Math.floor(n/24);return o===1?"yesterday":`${o}d ago`}function Fn(e){return e.state==="merged"?"git-merge":e.state==="closed"?"close":e.isDraft?"git-pull-request-draft":"git-pull-request"}function On(e){return e.state==="merged"?"var(--vscode-charts-purple, #a371f7)":e.state==="closed"?"var(--vscode-errorForeground, #f85149)":"var(--vscode-charts-green, #3fb950)"}function At(e){let t=q;if(t.error||!t.recentAgentPRs.length&&!t.pendingReviews.length)return`
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
      </div>`;for(let o of t.pendingReviews)n+=kt(o);n+="</div>"}if(t.recentAgentPRs.length>0){n+=`
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-hubot"></span>
        <strong>Recent Agent Sessions</strong>
      </div>`;for(let o of t.recentAgentPRs.slice(0,5))n+=kt(o);n+="</div>"}return n+="</div>",n}function kt(e){let t=Fn(e),n=On(e);return`
  <div class="agent-pr-row" data-command="openExternal" data-file="${y(e.url)}" role="button" tabindex="0" title="${y(e.title)}">
    <span class="codicon codicon-${y(t)}" style="color:${y(n)};"></span>
    <div class="agent-pr-info">
      <span class="agent-pr-title">${P(e.title)}</span>
      <span class="agent-pr-meta">#${e.number} \xB7 ${P(Mn(e.createdAt))} \xB7 ${P(e.author)}</span>
    </div>
    <span class="agent-pr-arrow codicon codicon-link-external"></span>
  </div>`}var k=null;function Ct(e){return k=ve.window.createStatusBarItem(ve.StatusBarAlignment.Right,50),k.command="alex.openChat",k.name="Alex Agent Activity",e.subscriptions.push(k),k}function Ee(e){if(!k)return;if(!e){k.text="$(brain) Alex",k.tooltip="Alex Cognitive Architecture",k.show();return}let t=q.pendingReviews;t.length>0?(k.text=`$(brain) Alex $(bell-dot) ${t.length}`,k.tooltip=`${t.length} PR${t.length===1?"":"s"} awaiting review`):(k.text="$(brain) Alex",k.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"),k.show(),De(e,()=>{let n=q.pendingReviews;k&&(n.length>0?(k.text=`$(brain) Alex $(bell-dot) ${n.length}`,k.tooltip=`${n.length} PR${n.length===1?"":"s"} awaiting review`):(k.text="$(brain) Alex",k.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"))})}var Pt=`
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
`;var Ln="alex.welcomeView";function Me(){let e=J.platform();return e==="win32"?A.join(process.env.APPDATA||A.join(J.homedir(),"AppData","Roaming"),"Code","User"):e==="darwin"?A.join(J.homedir(),"Library","Application Support","Code","User"):A.join(process.env.XDG_CONFIG_HOME||A.join(J.homedir(),".config"),"Code","User")}var Gn=A.resolve(__dirname,"..","package.json"),Rt=(()=>{try{return JSON.parse(L.readFileSync(Gn,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}})(),Fe="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki",Nn=[{id:"workspace",label:"WORKSPACE",icon:"folder",desc:"Initialize and upgrade your cognitive architecture",collapsed:!1,buttons:[{icon:"sync",label:"Initialize Workspace",command:"initialize",tooltip:"Install Alex brain files in this workspace",hint:"command"},{icon:"arrow-up",label:"Upgrade Architecture",command:"upgrade",tooltip:"Update to the latest brain architecture",hint:"command"},{icon:"cloud",label:"Setup AI-Memory",command:"setupAIMemory",tooltip:"Find or create the shared AI-Memory knowledge store",hint:"command"}]},{id:"brain-status",label:"BRAIN STATUS",icon:"symbol-structure",desc:"Cognitive architecture health and maintenance",collapsed:!1,buttons:[{icon:"symbol-event",label:"Run Dream Protocol",command:"dream",tooltip:"Autonomous architecture maintenance",hint:"command"},{icon:"heart",label:"Meditate",command:"openChat",prompt:"Run a meditation session \u2014 consolidate knowledge, review recent changes, and strengthen architecture",tooltip:"Knowledge consolidation session",hint:"chat"},{icon:"graph",label:"Self-Actualize",command:"openChat",prompt:"Run a self-actualization assessment \u2014 evaluate architecture completeness, identify growth areas, and plan improvements",tooltip:"Deep self-assessment and growth",hint:"chat"}]},{id:"user-memory",label:"USER MEMORY",icon:"notebook",desc:"Access your persistent memory locations",collapsed:!0,buttons:[{icon:"notebook",label:"Memories",command:"openMemories",tooltip:"Open VS Code user memories folder",hint:"command"},{icon:"edit",label:"User Prompts",command:"openPrompts",tooltip:"Reusable prompt templates",hint:"command"},{icon:"server",label:"MCP Config",command:"openMcpConfig",tooltip:"Model Context Protocol servers",hint:"command"},{icon:"cloud",label:"Copilot Memory (GitHub)",command:"openExternal",file:"https://github.com/settings/copilot",tooltip:"Manage cloud-synced Copilot memory",hint:"link"}]},{id:"environment",label:"ENVIRONMENT",icon:"settings-gear",desc:"Extension settings",collapsed:!0,buttons:[{icon:"settings-gear",label:"Open Extension Settings",command:"openSettings",tooltip:"Configure Alex extension behavior",hint:"command"}]},{id:"learn",label:"LEARN",icon:"book",desc:"Documentation and support resources",collapsed:!0,buttons:[{icon:"book",label:"Documentation",command:"openExternal",file:`${Fe}`,tooltip:"Full documentation on GitHub Wiki",hint:"link"},{icon:"comment-discussion",label:"User Stories",command:"openExternal",file:`${Fe}/blog/README`,tooltip:"Real-world examples of working with Alex",hint:"link"},{icon:"mortar-board",label:"Tutorials",command:"openExternal",file:`${Fe}/tutorials/README`,tooltip:"Step-by-step guides for common tasks",hint:"link"},{icon:"lightbulb",label:"LearnAI Playbooks",command:"openExternal",file:"https://learnai.correax.com/",tooltip:"80 AI playbooks for professional disciplines",hint:"link"},{icon:"bug",label:"Report an Issue",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/issues",tooltip:"Found a bug? Let us know",hint:"link"}]},{id:"about",label:"ABOUT",icon:"info",collapsed:!0,buttons:[{icon:"tag",label:`Version ${Rt}`,command:"noop",tooltip:"Installed extension version"},{icon:"person",label:"Publisher: fabioc-aloha",command:"openExternal",file:"https://github.com/fabioc-aloha",hint:"link",tooltip:"View publisher on GitHub"},{icon:"law",label:"PolyForm Noncommercial 1.0.0",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md",hint:"link",tooltip:"View license"}]}],Un=["https://github.com/","https://marketplace.visualstudio.com/","https://learnai.correax.com/"],Tt="alex.quickActionFrecency",Z=class{constructor(t,n){this.extensionUri=t;this.globalState=n;this.workspaceRoot=m.workspace.workspaceFolders?.[0]?.uri.fsPath??"",this.frecencyData=n.get(Tt)??ft()}static viewId=Ln;view;workspaceRoot;frecencyData;disposables=[];dispose(){for(let t of this.disposables)t.dispose();this.disposables.length=0}recordActionUse(t){this.frecencyData=ut(this.frecencyData,t),this.globalState.update(Tt,this.frecencyData)}loopGroupsCache=null;getLoopGroups(){return this.loopGroupsCache||(this.loopGroupsCache=this.workspaceRoot?bt(this.workspaceRoot):[]),this.loopGroupsCache}renderGroupsWithFrecency(t){let n=t.map(o=>{if(o.id==="creative-loop")return o;let s=o.buttons.map(i=>i.id??i.label.toLowerCase().replace(/\s+/g,"-")),a=gt(s,this.frecencyData).map(i=>o.buttons.find(l=>(l.id??l.label.toLowerCase().replace(/\s+/g,"-"))===i)).filter(i=>i!==void 0);return{...o,buttons:a}});return It(n)}refresh(){this.loopGroupsCache=null,this.view&&(this.view.webview.html=this.getHtml(this.view.webview))}resolveWebviewView(t,n,o){this.view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this.extensionUri]},t.webview.html=this.getHtml(t.webview),this.workspaceRoot&&De(this.workspaceRoot,()=>this.refresh()),t.webview.onDidReceiveMessage(s=>this.handleMessage(s)),t.onDidChangeVisibility(()=>{t.visible&&this.refresh()})}async handleMessage(t){switch(t.actionId&&this.recordActionUse(t.actionId),t.command){case"openChat":if(t.prompt){let n=t.prompt.endsWith(": ");await m.commands.executeCommand("workbench.action.chat.open",{query:t.prompt,isPartialQuery:n})}else await m.commands.executeCommand("workbench.action.chat.open");break;case"initialize":await m.commands.executeCommand("alex.initialize");break;case"upgrade":await m.commands.executeCommand("alex.upgrade");break;case"setupAIMemory":await m.commands.executeCommand("alex.setupAIMemory");break;case"dream":await m.commands.executeCommand("alex.dream");break;case"openSettings":await m.commands.executeCommand("workbench.action.openSettings","alex");break;case"openMemories":{let n=m.Uri.file(A.join(Me(),"globalStorage","github.copilot-chat","memory-tool","memories"));try{await m.commands.executeCommand("revealFileInOS",n)}catch{await m.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openPrompts":{let n=m.Uri.file(A.join(Me(),"prompts"));try{await m.commands.executeCommand("revealFileInOS",n)}catch{await m.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openMcpConfig":{let n=m.Uri.file(A.join(Me(),"mcp.json"));await m.commands.executeCommand("vscode.open",n)}break;case"openExternal":if(t.file){let n=String(t.file);Un.some(o=>n.startsWith(o))&&await m.env.openExternal(m.Uri.parse(n))}break;case"refresh":this.refresh();break;case"toggleTask":if(this.workspaceRoot&&t.file){let n=et(this.workspaceRoot,t.file);if(n){this.refresh();let o=n.find(s=>s.id===t.file);if(o){let s=o.enabled?"enabled":"disabled",r=o.enabled?"Workflow created.":"Workflow removed.";m.window.showInformationMessage(`Task "${o.name}" ${s}. ${r} Commit & push to activate on GitHub.`)}}}break;case"addTask":this.workspaceRoot&&await ct(this.workspaceRoot)&&this.refresh();break;case"setupCopilotPAT":this.workspaceRoot&&(await Ce(this.workspaceRoot),this.refresh());break;case"deleteTask":this.workspaceRoot&&t.file&&await m.window.showWarningMessage(`Delete task "${t.file}"?`,{modal:!0},"Delete")==="Delete"&&tt(this.workspaceRoot,t.file)!==null&&(this.refresh(),m.window.showInformationMessage(`Task "${t.file}" deleted. Commit & push to remove the workflow from GitHub.`));break;case"openPromptFile":if(this.workspaceRoot&&t.file){let n=A.resolve(this.workspaceRoot,t.file);if(!n.toLowerCase().startsWith(this.workspaceRoot.toLowerCase()+A.sep)&&n.toLowerCase()!==this.workspaceRoot.toLowerCase())break;L.existsSync(n)?await m.commands.executeCommand("vscode.open",m.Uri.file(n)):m.window.showWarningMessage(`Prompt file not found: ${t.file}`)}break;case"runTask":if(this.workspaceRoot&&t.file){let n=X(this.workspaceRoot),o=Ie(this.workspaceRoot,t.file);if(qe(this.workspaceRoot,t.file),this.refresh(),n&&o)try{let s=await pe(n,t.file,r=>{this.refresh()},this.workspaceRoot);this.disposables.push(s),m.window.showInformationMessage(`Workflow dispatched for "${t.file}". Monitoring execution\u2026`)}catch(s){let r=s instanceof Error?s.message:String(s);m.window.showErrorMessage(`Failed to dispatch workflow: ${r}`)}else{let s=ae(t.file),a=z(this.workspaceRoot).find(i=>i.id===t.file);if(a?.promptFile){let i=A.resolve(this.workspaceRoot,a.promptFile),l=this.workspaceRoot.toLowerCase()+A.sep;if(!i.toLowerCase().startsWith(l))break;if(L.existsSync(i)){let d=L.readFileSync(i,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();await m.commands.executeCommand("workbench.action.chat.open",{query:d,isPartialQuery:!1}),F(this.workspaceRoot,s,!0)}else m.window.showWarningMessage(`Prompt file not found: ${a.promptFile}`),F(this.workspaceRoot,s,!1)}else F(this.workspaceRoot,s,!1)}}break;case"clearRunStatus":t.file&&(Xe(t.file),this.refresh());break;case"openScheduleConfig":if(this.workspaceRoot){let n=A.join(this.workspaceRoot,".github","config","scheduled-tasks.json");L.existsSync(n)&&await m.commands.executeCommand("vscode.open",m.Uri.file(n))}break;case"noop":break;case"switchTab":break}}getHtml(t){let n=_n(),o=t.asWebviewUri(m.Uri.joinPath(this.extensionUri,"dist","codicon.css")),r=(this.workspaceRoot?pt(this.workspaceRoot):null)?.status??"unknown",a=this.workspaceRoot?ht(this.workspaceRoot,L,A):null,i=vt({status:r,config:a});return`<!DOCTYPE html>
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
    ${lt}
    ${Pt}
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
    <div class="tagline">${P(i)}</div>
    <div class="version">v${Rt}</div>
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
    ${jt({icon:"comment-discussion",label:"Chat with Alex",command:"openChat",hint:"chat"},!0)}

    ${this.renderGroupsWithFrecency(this.getLoopGroups())}
  </div>

  <!-- Setup Tab -->
  <div id="tab-setup" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-setup">
    ${It(Nn)}
  </div>

  <!-- Autopilot Tab -->
  <div id="tab-autopilot" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-autopilot">
    ${this.workspaceRoot?At(this.workspaceRoot):""}
    ${at(this.workspaceRoot?z(this.workspaceRoot):[],this.workspaceRoot?X(this.workspaceRoot):void 0,this.workspaceRoot)}
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
</html>`}};function _n(){return $t.randomBytes(16).toString("hex")}function It(e){return e.map(t=>{let n=t.collapsed===!1?"expanded":"",o=t.icon?`<span class="codicon codicon-${y(t.icon)}"></span>`:"";return`
    <div class="group ${n}" data-group-id="${y(t.id)}">
      <div class="group-header" role="button" tabindex="0" aria-expanded="${t.collapsed===!1}">
        ${o}
        <span>${P(t.label)}</span>
        <span class="codicon codicon-chevron-right chevron" aria-hidden="true"></span>
      </div>
      ${t.desc?`<div class="group-desc">${P(t.desc)}</div>`:""}
      <div class="group-content">
        <div class="group-buttons">
          ${t.buttons.map(s=>jt(s)).join("")}
        </div>
      </div>
    </div>`}).join("")}function jt(e,t=!1){let n=t?"action-btn primary":"action-btn",o=e.id??e.label.toLowerCase().replace(/\s+/g,"-"),s=[`data-command="${y(e.command)}"`,`data-action-id="${y(o)}"`,e.prompt?`data-prompt="${y(e.prompt)}"`:"",e.file?`data-file="${y(e.file)}"`:"",e.tooltip?`data-tooltip="${y(e.tooltip)}"`:""].filter(Boolean).join(" "),r={chat:"comment-discussion",link:"link-external",command:"zap"},a=e.hint?`<span class="hint-badge" title="${e.hint}"><span class="codicon codicon-${r[e.hint]}"></span></span>`:"";return`<button class="${n}" ${s}>
    <span class="codicon codicon-${y(e.icon)}"></span>
    <span class="btn-label">${P(e.label)}</span>
    ${a}
  </button>`}var te=v(require("fs")),ee=v(require("path"));function h(e,...t){return te.existsSync(ee.join(e,...t))}function Dt(e){try{return JSON.parse(te.readFileSync(e,"utf-8"))}catch{return null}}function Hn(e,t){let n=[];(t||h(e,"tsconfig.json"))&&n.push("TypeScript"),(h(e,"requirements.txt")||h(e,"pyproject.toml")||h(e,"setup.py"))&&n.push("Python"),h(e,"go.mod")&&n.push("Go"),h(e,"Cargo.toml")&&n.push("Rust"),(h(e,"pom.xml")||h(e,"build.gradle"))&&n.push("Java");let o={...t?.dependencies??{},...t?.devDependencies??{}};if((o.react||o["react-dom"])&&n.push("React"),o.next&&n.push("Next.js"),o.vue&&n.push("Vue"),o.vitepress&&n.push("VitePress"),o.express&&n.push("Express"),o.fastify&&n.push("Fastify"),o["@azure/functions"]&&n.push("Azure Functions"),o.esbuild&&n.push("esbuild"),o.webpack&&n.push("webpack"),o.vite&&!o.vitepress&&n.push("Vite"),o.vitest&&n.push("Vitest"),o.jest&&n.push("Jest"),o.mocha&&n.push("Mocha"),(o.eslint||h(e,".eslintrc.json")||h(e,"eslint.config.js")||h(e,"eslint.config.mjs"))&&n.push("ESLint"),(o.prettier||h(e,".prettierrc"))&&n.push("Prettier"),h(e,"pyproject.toml"))try{let s=te.readFileSync(ee.join(e,"pyproject.toml"),"utf-8");s.includes("fastapi")&&n.push("FastAPI"),s.includes("flask")&&n.push("Flask"),s.includes("django")&&n.push("Django"),s.includes("pytest")&&n.push("pytest"),s.includes("ruff")&&n.push("Ruff"),s.includes("mypy")&&n.push("mypy")}catch{}return(h(e,"Dockerfile")||h(e,"docker-compose.yml")||h(e,"docker-compose.yaml"))&&n.push("Docker"),[...new Set(n)]}function Wn(e,t){let n={},o=t?.scripts??{};o.build&&(n.buildCommand="npm run build"),o["build:prod"]&&(n.buildCommand="npm run build:prod"),o.test&&(n.testCommand="npm test"),o.lint&&(n.lintCommand="npm run lint"),!n.buildCommand&&h(e,"setup.py")&&(n.buildCommand="python setup.py build"),!n.testCommand&&h(e,"pyproject.toml")&&(n.testCommand="pytest"),!n.buildCommand&&h(e,"go.mod")&&(n.buildCommand="go build ./..."),!n.testCommand&&h(e,"go.mod")&&(n.testCommand="go test ./...");let s=["scripts/release.ps1","scripts/release.sh","scripts/release-vscode.ps1","scripts/release.cjs"];for(let r of s)if(h(e,r)){n.releaseScript=r;break}return n}function be(e){let t=ee.join(e,"package.json"),n=Dt(t),o=Hn(e,n),s=Wn(e,n),r="generic";return n&&n.engines?.vscode?(r="vscode-extension",{projectType:r,...s,conventions:o}):h(e,"platforms","vscode-extension","package.json")&&(Dt(ee.join(e,"platforms","vscode-extension","package.json"))?.engines??{}).vscode?(r="vscode-extension",{projectType:r,...s,conventions:o}):n&&(n.workspaces||h(e,"lerna.json")||h(e,"pnpm-workspace.yaml"))?(r="monorepo",{projectType:r,...s,conventions:o}):h(e,".vitepress","config.ts")||h(e,".vitepress","config.mts")||h(e,"next.config.js")||h(e,"next.config.mjs")||h(e,"gatsby-config.js")||h(e,"astro.config.mjs")?(r="static-site",{projectType:r,...s,conventions:o}):o.includes("FastAPI")||o.includes("Flask")||o.includes("Django")?(r="python-api",{projectType:r,...s,conventions:o}):h(e,"dbt_project.yml")||h(e,"notebook")||h(e,"synapse")||h(e,".pbixproj")?(r="data-pipeline",{projectType:r,...s,conventions:o}):{projectType:r,...s,conventions:o}}var E=v(require("fs")),ne=v(require("path"));var Bn=[{id:"extension-dev",label:"EXTENSION DEV",icon:"extensions",desc:"Package, publish, test, and debug the VS Code extension",collapsed:!0,buttons:[{id:"ext-package",icon:"package",label:"Package VSIX",command:"openChat",prompt:"Package the VS Code extension into a .vsix file. Run the build first, then package with vsce. Report the file size.",hint:"chat",tooltip:"Build and package the extension"},{id:"ext-publish",icon:"cloud-upload",label:"Publish",command:"openChat",prompt:"Run the release preflight checks, then publish the extension to the VS Code Marketplace. Follow the release-management skill.",hint:"chat",tooltip:"Publish to VS Code Marketplace"},{id:"ext-test",icon:"beaker",label:"Extension Tests",command:"openChat",prompt:"Run all extension tests. Report pass/fail counts and any failures with root cause analysis.",hint:"chat",tooltip:"Run extension test suite"},{id:"ext-debug",icon:"debug-alt",label:"Debug Launch",command:"runCommand",file:"workbench.action.debug.start",hint:"command",tooltip:"Launch Extension Development Host"}]}],zn=[{id:"api-dev",label:"API DEVELOPMENT",icon:"plug",desc:"Run, test, and document API endpoints",collapsed:!0,buttons:[{id:"api-run",icon:"play",label:"Run Server",command:"openChat",prompt:"Start the API development server. Detect the framework (FastAPI/Flask/Django) and use the appropriate command.",hint:"chat",tooltip:"Start the development server"},{id:"api-test",icon:"beaker",label:"Test API",command:"openChat",prompt:"Run the API test suite with pytest. Report coverage, pass/fail counts, and any failures.",hint:"chat",tooltip:"Run API tests with coverage"},{id:"api-lint",icon:"warning",label:"Lint & Type",command:"openChat",prompt:"Run linting (ruff/flake8) and type checking (mypy/pyright) on the Python codebase. Fix any issues found.",hint:"chat",tooltip:"Run linter and type checker"},{id:"api-docs",icon:"book",label:"API Docs",command:"openChat",prompt:"Review and update the API documentation. Ensure OpenAPI/Swagger specs match the current endpoints.",hint:"chat",tooltip:"Update API documentation"}]}],Vn=[{id:"pipeline-phases",label:"PIPELINE PHASES",icon:"server-process",desc:"Medallion architecture: ingest, transform, serve",collapsed:!0,buttons:[{id:"bronze",icon:"database",label:"Bronze Layer",command:"openChat",prompt:"Help me work on the Bronze (raw ingestion) layer. Identify data sources, define schemas, implement extraction logic.",hint:"chat",tooltip:"Raw data ingestion patterns"},{id:"silver",icon:"filter",label:"Silver Layer",command:"openChat",prompt:"Help me work on the Silver (cleansed/conformed) layer. Apply data quality rules, standardize schemas, handle nulls and duplicates.",hint:"chat",tooltip:"Cleansing and conforming"},{id:"gold",icon:"star-full",label:"Gold Layer",command:"openChat",prompt:"Help me work on the Gold (business-ready) layer. Build aggregations, KPI calculations, and dimensional models.",hint:"chat",tooltip:"Business-ready aggregations"}]},{id:"data-quality",label:"DATA QUALITY",icon:"verified",desc:"Profile, validate, and trace data lineage",collapsed:!0,buttons:[{id:"profile",icon:"graph-line",label:"Profile Data",command:"openChat",prompt:"Profile the dataset: row counts, null rates, distributions, cardinality, outliers. Present findings in a summary table.",hint:"chat",tooltip:"Statistical data profiling"},{id:"validate",icon:"check",label:"Validate Schema",command:"openChat",prompt:"Validate data schemas against expectations. Check column types, constraints, referential integrity, and naming conventions.",hint:"chat",tooltip:"Schema validation checks"},{id:"lineage",icon:"git-merge",label:"Trace Lineage",command:"openChat",prompt:"Trace data lineage for the selected table or column. Map source-to-target transformations and document the flow.",hint:"chat",tooltip:"Data lineage documentation"}]}],qn=[{id:"site-dev",label:"SITE DEVELOPMENT",icon:"browser",desc:"Dev server, build, deploy, and performance audit",collapsed:!0,buttons:[{id:"site-dev-server",icon:"play",label:"Dev Server",command:"openChat",prompt:"Start the development server for this static site. Detect the framework and use the appropriate dev command.",hint:"chat",tooltip:"Start local dev server"},{id:"site-build",icon:"package",label:"Build Site",command:"openChat",prompt:"Build the static site for production. Report any build warnings or errors.",hint:"chat",tooltip:"Production build"},{id:"site-deploy",icon:"cloud-upload",label:"Deploy",command:"openChat",prompt:"Deploy the site to the configured hosting platform. Run preflight checks first.",hint:"chat",tooltip:"Deploy to hosting"},{id:"site-perf",icon:"dashboard",label:"Performance",command:"openChat",prompt:"Audit site performance: bundle size, image optimization, lazy loading, caching headers, Core Web Vitals.",hint:"chat",tooltip:"Performance and accessibility audit"}]}],Jn=[{id:"cross-package",label:"CROSS-PACKAGE",icon:"references",desc:"Shared types, dependency updates, and coordinated releases",collapsed:!0,buttons:[{id:"deps-update",icon:"package",label:"Update Deps",command:"openChat",prompt:"Check for outdated dependencies across all packages. Propose coordinated updates that maintain compatibility.",hint:"chat",tooltip:"Cross-package dependency updates"},{id:"shared-types",icon:"symbol-interface",label:"Shared Types",command:"openChat",prompt:"Review shared type definitions across packages. Identify drift, inconsistencies, or missing exports.",hint:"chat",tooltip:"Audit shared type definitions"},{id:"release-all",icon:"rocket",label:"Release Train",command:"openChat",prompt:"Coordinate a release across all packages. Check version consistency, run all tests, update changelogs.",hint:"chat",tooltip:"Coordinated multi-package release"}]}],Et={"vscode-extension":Bn,"python-api":zn,"data-pipeline":Vn,"static-site":qn,monorepo:Jn,generic:[]};function Yn(e){try{let t=JSON.parse(E.readFileSync(e,"utf-8"));return Array.isArray(t.groups)?t.groups:[]}catch{return[]}}function Kn(e,t){let n=t??be(e),o=ne.join(e,".github","config","loop-menu.json"),s=Yn(o),r=new Set(Object.values(Et).flatMap(u=>u.map(g=>g.id))),a=s.filter(u=>!r.has(u.id)),i=Et[n.projectType]??[],l=[...a,...i],d={};return n.buildCommand&&(d.buildCommand=n.buildCommand),n.testCommand&&(d.testCommand=n.testCommand),n.lintCommand&&(d.lintCommand=n.lintCommand),n.releaseScript&&(d.releaseScript=n.releaseScript),n.conventions.length>0&&(d.conventions=n.conventions),{$schema:"./loop-config.schema.json",$comment:`Loop tab menu configuration \u2014 auto-generated for ${n.projectType} project. Prompts are loaded from .github/prompts/loop/{promptFile} at runtime.`,version:"1.0",projectType:n.projectType,projectPhase:"active-development",groups:l,...Object.keys(d).length>0?{projectContext:d}:{}}}function Mt(e,t){let n=Kn(e,t),o=ne.join(e,".github","config"),s=ne.join(o,"loop-menu.json");try{return E.mkdirSync(o,{recursive:!0}),E.writeFileSync(s,JSON.stringify(n,null,2)+`
`,"utf-8"),!0}catch{return!1}}function Ft(e,t){let n=ne.join(e,".github","config","loop-menu.json");try{if(!E.existsSync(n))return!1;let o=JSON.parse(E.readFileSync(n,"utf-8"));return o.projectPhase=t,E.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0}catch{return!1}}var T=v(require("vscode")),x=v(require("fs")),C=v(require("path")),Oe=v(require("os"));function Ot(){let e=[],t=Oe.homedir();try{for(let o of x.readdirSync(t))if(/^OneDrive/i.test(o)){let s=C.join(t,o,"AI-Memory");x.existsSync(s)&&e.push(s)}}catch{}let n=C.join(t,"Library","CloudStorage");try{if(x.existsSync(n)){for(let o of x.readdirSync(n))if(/^OneDrive/i.test(o)){let s=C.join(n,o,"AI-Memory");x.existsSync(s)&&e.push(s)}}}catch{}for(let o of[C.join(t,"AI-Memory"),C.join(t,".alex","AI-Memory")])x.existsSync(o)&&e.push(o);return e}function Qn(){let e=[],t=Oe.homedir();try{for(let o of x.readdirSync(t))/^OneDrive/i.test(o)&&e.push(C.join(t,o,"AI-Memory"))}catch{}let n=C.join(t,"Library","CloudStorage");try{if(x.existsSync(n))for(let o of x.readdirSync(n))/^OneDrive/i.test(o)&&e.push(C.join(n,o,"AI-Memory"))}catch{}return e.push(C.join(t,"AI-Memory")),e.push(C.join(t,".alex","AI-Memory")),e}function Le(){let e=T.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&x.existsSync(e))return e;let t=Ot();return t.length>0?t[0]:null}var Xn=[".github","announcements","feedback","insights","knowledge","patterns"],Zn={"global-knowledge.md":`# Global Knowledge

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
`,"user-profile.json":()=>JSON.stringify({name:"",role:"",preferences:{communication:"direct",codeStyle:"",learningStyle:""},updatedAt:new Date().toISOString()},null,2),"project-registry.json":()=>JSON.stringify({version:1,projects:[],updatedAt:new Date().toISOString()},null,2),"index.json":()=>JSON.stringify({version:1,files:[],updatedAt:new Date().toISOString()},null,2)};function eo(e){let t=[];x.existsSync(e)||(x.mkdirSync(e,{recursive:!0}),t.push(e));for(let n of Xn){let o=C.join(e,n);x.existsSync(o)||(x.mkdirSync(o,{recursive:!0}),t.push(o))}for(let[n,o]of Object.entries(Zn)){let s=C.join(e,n);if(!x.existsSync(s)){let r=typeof o=="function"?o():o;x.writeFileSync(s,r,"utf-8"),t.push(s)}}return t}async function to(){let e=T.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&x.existsSync(e)){let a=await T.window.showInformationMessage(`AI-Memory already configured at: ${e}`,"Use This","Change Location");if(a==="Use This")return e;if(!a)return}let t=Ot(),n=Qn(),o=[];for(let a of t)o.push({label:"$(check) "+a,description:"Found \u2014 existing AI-Memory",detail:a});for(let a of n)if(!t.includes(a)){let i=/OneDrive/i.test(a);o.push({label:(i?"$(cloud) ":"$(folder) ")+a,description:i?"OneDrive \u2014 recommended (cloud-synced)":"Local fallback",detail:a})}o.push({label:"$(folder-opened) Browse...",description:"Choose a custom location",detail:"__browse__"});let s=await T.window.showQuickPick(o,{title:"AI-Memory Location",placeHolder:"Where should Alex store shared knowledge?",ignoreFocusOut:!0});if(!s)return;let r;if(s.detail==="__browse__"){let a=await T.window.showOpenDialog({canSelectFolders:!0,canSelectFiles:!1,canSelectMany:!1,openLabel:"Select AI-Memory Folder",title:"Choose AI-Memory Location"});if(!a||a.length===0)return;r=a[0].fsPath,C.basename(r).toLowerCase().includes("ai-memory")||(r=C.join(r,"AI-Memory"))}else r=s.detail;return r}async function ye(){let e=await to();if(e)try{let t=eo(e);return await T.workspace.getConfiguration("alex.aiMemory").update("path",e,T.ConfigurationTarget.Global),t.length>0?T.window.showInformationMessage(`AI-Memory initialized at ${e} (${t.length} items created).`):T.window.showInformationMessage(`AI-Memory linked to ${e} (already complete).`),e}catch(t){let o=(t instanceof Error?t.message:String(t)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");T.window.showErrorMessage(`AI-Memory setup failed: ${o}`);return}}var I=v(require("vscode")),Ne=v(require("path")),K=v(require("fs")),Y=class extends I.TreeItem{constructor(n,o,s,r,a){super(n,s);this.metricId=r;this.children=a;this.description=o,this.tooltip=`${n}: ${o}`}};function Ge(e,t){switch(t){case"percent":return`${e}%`;case"seconds":return`${e}s`;case"count":return`${e}`;default:return`${e} ${t}`}}var we=class{constructor(t){this.workspaceRoot=t}_onDidChangeTreeData=new I.EventEmitter;onDidChangeTreeData=this._onDidChangeTreeData.event;refresh(){this._onDidChangeTreeData.fire(void 0)}getTreeItem(t){return t}getChildren(t){return this.workspaceRoot?t?.children?t.children:t?[]:this.getRootItems():[new Y("No workspace","Open a folder",I.TreeItemCollapsibleState.None)]}getRootItems(){let t=[],n=Ne.join(this.workspaceRoot,".github","config","agent-metrics.json");if(!K.existsSync(n))return[new Y("Not configured","No agent-metrics.json found",I.TreeItemCollapsibleState.None)];let o;try{o=JSON.parse(K.readFileSync(n,"utf-8"))}catch{return[new Y("Config error","Invalid agent-metrics.json",I.TreeItemCollapsibleState.None)]}let s=Ne.join(this.workspaceRoot,".agent-metrics-state.json"),r={};if(K.existsSync(s))try{r=JSON.parse(K.readFileSync(s,"utf-8"))}catch{}let a=o.thresholds??{};for(let i of o.metrics){let l=r[i.id],d=l?Ge(l.value,i.unit):"\u2014",u=a[i.id],g=this.getStatusIcon(i,l?.value,u),p=new Y(i.name,d,I.TreeItemCollapsibleState.None,i.id);p.iconPath=new I.ThemeIcon(g);let w=u?`

Warning: ${Ge(u.warning,i.unit)} \xB7 Critical: ${Ge(u.critical,i.unit)}`:"";p.tooltip=new I.MarkdownString(`**${i.name}**

${i.description}

Current: ${d}${w}`),t.push(p)}return t}getStatusIcon(t,n,o){return n===void 0||!o?"circle-outline":t.higherIsBetter===!0||t.id.includes("rate")||t.id==="tasks-run-count"?n<o.critical?"error":n<o.warning?"warning":"check":n>o.critical?"error":n>o.warning?"warning":"check"}};function oe(e){return(e instanceof Error?e.message:String(e)).replace(/[A-Z]:\\[\w\\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g,"[path]")}async function Ue(){let e=c.workspace.getConfiguration(),t="github.copilot.chat.copilotMemory.enabled";e.get(t)!==!1&&await e.update(t,!1,c.ConfigurationTarget.Global)}function no(e){Ue(),Ye(e.workspaceState);let t=c.chat.createChatParticipant("alex.chat",dt);t.iconPath=c.Uri.joinPath(e.extensionUri,"assets","icon.png"),t.followupProvider={provideFollowups(){return[{prompt:"/autopilot list",label:"List Autopilot Tasks",command:"autopilot"}]}},e.subscriptions.push(t);let n=new Z(e.extensionUri,e.globalState);e.subscriptions.push(n),e.subscriptions.push(c.window.registerWebviewViewProvider(Z.viewId,n));let o=c.workspace.workspaceFolders?.[0]?.uri.fsPath;Ct(e),Ee(o);let s=setInterval(()=>{Ee(c.workspace.workspaceFolders?.[0]?.uri.fsPath)},300*1e3);e.subscriptions.push({dispose:()=>clearInterval(s)});let r=new we(o);if(e.subscriptions.push(c.window.createTreeView("alex.agentActivity",{treeDataProvider:r})),e.subscriptions.push(c.commands.registerCommand("alex.refreshAgentActivity",()=>{r.refresh()})),o){let g=new c.RelativePattern(o,".agent-metrics-state.json"),p=c.workspace.createFileSystemWatcher(g);p.onDidChange(()=>r.refresh()),p.onDidCreate(()=>r.refresh()),e.subscriptions.push(p)}e.subscriptions.push(c.commands.registerCommand("alex.refreshWelcome",()=>{n.refresh()})),e.subscriptions.push(c.commands.registerCommand("alex.openChat",()=>{c.commands.executeCommand("workbench.action.chat.open")})),e.subscriptions.push(c.commands.registerCommand("alex.dream",async()=>{try{await c.commands.executeCommand("workbench.action.chat.open",{query:"/dream"})}catch(g){c.window.showErrorMessage(`Dream protocol failed: ${oe(g)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.initialize",async()=>{try{await Ue(),Le()||await c.window.showInformationMessage("Alex: Set up AI-Memory for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await ye(),await c.commands.executeCommand("workbench.action.chat.open",{query:"Initialize this workspace with Alex's cognitive architecture"})}catch(g){c.window.showErrorMessage(`Initialize failed: ${oe(g)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.upgrade",async()=>{try{await Ue(),Le()||await c.window.showInformationMessage("Alex: AI-Memory not found. Set it up for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await ye(),await c.commands.executeCommand("workbench.action.chat.open",{query:"Upgrade this workspace's cognitive architecture to the latest version"})}catch(g){c.window.showErrorMessage(`Upgrade failed: ${oe(g)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setupAIMemory",async()=>{try{await ye(),n.refresh()}catch(g){c.window.showErrorMessage(`AI-Memory setup failed: ${oe(g)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.generateLoopConfig",async()=>{let g=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!g){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}try{let p=be(g);Mt(g,p)?c.window.showInformationMessage(`Alex: Loop config generated for ${p.projectType} project (${p.conventions.length} conventions detected).`):c.window.showErrorMessage("Alex: Failed to write loop config.")}catch(p){c.window.showErrorMessage(`Alex: Loop config generation failed \u2014 ${oe(p)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setProjectPhase",async()=>{let g=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!g){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let p=[{label:"Planning",description:"Ideation, research, and design",value:"planning"},{label:"Active Development",description:"Building features and writing code",value:"active-development"},{label:"Testing",description:"QA, integration tests, and validation",value:"testing"},{label:"Release",description:"Packaging, publishing, and deployment",value:"release"},{label:"Maintenance",description:"Bug fixes, upgrades, and monitoring",value:"maintenance"}],w=await c.window.showQuickPick(p.map($=>({label:$.label,description:$.description,value:$.value})),{placeHolder:"Select the current project phase"});if(!w)return;Ft(g,w.value)?(n.refresh(),c.window.showInformationMessage(`Alex: Project phase set to "${w.label}".`)):c.window.showErrorMessage("Alex: Failed to update project phase. Generate a loop config first.")}));let a={"alex.convertMdToHtml":{muscle:"md-to-html.cjs",label:"HTML",srcExt:".md"},"alex.convertMdToWord":{muscle:"md-to-word.cjs",label:"Word",srcExt:".md"},"alex.convertMdToEml":{muscle:"md-to-eml.cjs",label:"Email",srcExt:".md"},"alex.convertMdToPdf":{muscle:"md-to-pdf.cjs",label:"PDF",srcExt:".md"},"alex.convertMdToPptx":{muscle:"md-to-pptx.cjs",label:"PowerPoint",srcExt:".md"},"alex.convertMdToEpub":{muscle:"md-to-epub.cjs",label:"EPUB",srcExt:".md"},"alex.convertMdToLatex":{muscle:"md-to-latex.cjs",label:"LaTeX",srcExt:".md"},"alex.convertMdToTxt":{muscle:"md-to-txt.cjs",label:"Plain Text",srcExt:".md"},"alex.convertDocxToMd":{muscle:"docx-to-md.cjs",label:"Markdown",srcExt:".docx"},"alex.convertHtmlToMd":{muscle:"html-to-md.cjs",label:"Markdown",srcExt:".html"},"alex.convertPptxToMd":{muscle:"pptx-to-md.cjs",label:"Markdown",srcExt:".pptx"}};for(let[g,p]of Object.entries(a))e.subscriptions.push(c.commands.registerCommand(g,async w=>{let D=w??c.window.activeTextEditor?.document.uri;if(!D||D.scheme!=="file"){c.window.showWarningMessage("Alex: Select a file to convert.");return}let $=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!$){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let Q=Lt.join($,".github","muscles",p.muscle),_=D.fsPath,H=c.window.createTerminal(`Alex: Convert \u2192 ${p.label}`);H.show(),H.sendText(`node "${Q}" "${_}"`)}));let i=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/config/loop-menu.json")),l=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/prompts/loop/*.prompt.md")),d=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/skills/*/loop-config.partial.json")),u=()=>n.refresh();e.subscriptions.push(i,i.onDidChange(u),i.onDidCreate(u),i.onDidDelete(u),l,l.onDidChange(u),l.onDidCreate(u),l.onDidDelete(u),d,d.onDidChange(u),d.onDidCreate(u),d.onDidDelete(u))}function oo(){}0&&(module.exports={activate,deactivate});
