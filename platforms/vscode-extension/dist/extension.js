"use strict";var en=Object.create;var ue=Object.defineProperty;var tn=Object.getOwnPropertyDescriptor;var nn=Object.getOwnPropertyNames;var on=Object.getPrototypeOf,sn=Object.prototype.hasOwnProperty;var rn=(e,t)=>{for(var n in t)ue(e,n,{get:t[n],enumerable:!0})},Ye=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of nn(t))!sn.call(e,s)&&s!==n&&ue(e,s,{get:()=>t[s],enumerable:!(o=tn(t,s))||o.enumerable});return e};var m=(e,t,n)=>(n=e!=null?en(on(e)):{},Ye(t||!e||!e.__esModule?ue(n,"default",{value:e,enumerable:!0}):n,e)),an=e=>Ye(ue({},"__esModule",{value:!0}),e);var To={};rn(To,{activate:()=>Co,deactivate:()=>Po});module.exports=an(To);var c=m(require("vscode")),Zt=m(require("path"));var Ge=m(require("vscode")),be=m(require("path")),we=m(require("fs"));var h=m(require("fs")),P=m(require("path")),w=m(require("vscode")),me=require("child_process");function j(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function y(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;").replace(/\\/g,"&#92;")}var J=m(require("fs")),Ee=m(require("path")),cn=".agent-metrics-state.json",ln=2160*60*60*1e3;function Ke(e){return Ee.join(e,cn)}function Qe(e){return Ee.join(e,".agent-metrics-runlog.json")}function dn(e){try{return JSON.parse(J.readFileSync(Ke(e),"utf-8"))}catch{return{}}}function pn(e,t){J.writeFileSync(Ke(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function un(e){try{return JSON.parse(J.readFileSync(Qe(e),"utf-8"))}catch{return{runs:[]}}}function gn(e,t){J.writeFileSync(Qe(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function fn(e){let t=Date.now()-ln;return{runs:e.runs.filter(n=>n.completedAt>t)}}var je=new Map;function ge(e){let t=`${e}:${Date.now()}`;return je.set(t,{startedAt:Date.now()}),t}function N(e,t,n){let o=je.get(t),s=Date.now(),i=un(e);i.runs.push({taskId:t.split(":")[0],startedAt:o?.startedAt??s,completedAt:s,success:n});let r=fn(i);gn(e,r),je.delete(t),mn(e,r)}function mn(e,t){let n=dn(e),o=new Date().toISOString(),s=t.runs;if(n["tasks-run-count"]={value:s.length,lastUpdated:o},s.length>0){let r=s.filter(a=>a.success).length;n["task-success-rate"]={value:Math.round(r/s.length*100),lastUpdated:o}}let i=s.map(r=>(r.completedAt-r.startedAt)/1e3).filter(r=>r>0);if(i.length>0){let r=i.reduce((a,u)=>a+u,0)/i.length;n["task-duration"]={value:Math.round(r),lastUpdated:o}}n["loop-guard-triggers"]||(n["loop-guard-triggers"]={value:0,lastUpdated:o}),pn(e,n)}function hn(e){let t=e.split(/\s+/);if(t.length!==5)return e;let[n,o,s,i,r]=t,a=`${o.padStart(2,"0")}:${n.padStart(2,"0")} UTC`;return s.startsWith("*/")&&i==="*"&&r==="*"?`Every ${s.slice(2)} days at ${a}`:o.startsWith("*/")?`Every ${o.slice(2)} hours`:s==="*"&&i==="*"&&r==="*"&&!o.includes("/")&&!o.includes(",")?`Daily at ${a}`:s==="*"&&i==="*"&&r!=="*"?`${{0:"Sun",1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat"}[r]??r} at ${a}`:e}function Xe(e){try{let t=(0,me.execFileSync)("gh",["secret","list","--json","name"],{cwd:e,encoding:"utf-8",timeout:1e4,stdio:["pipe","pipe","pipe"]});return JSON.parse(t).some(o=>o.name==="COPILOT_PAT")}catch{return!1}}async function De(e){let t=await w.window.showInformationMessage("Autopilot needs a GitHub token (repo secret) to assign Copilot to issues. Set it up now using your existing GitHub CLI auth?",{modal:!0},"Set Up Automatically","I'll Do It Manually");if(t==="I'll Do It Manually")return w.env.openExternal(w.Uri.parse("https://github.com/settings/personal-access-tokens/new")),w.window.showInformationMessage("Create a fine-grained PAT with Issues (read/write) and Contents (read/write) permissions, then run: gh secret set COPILOT_PAT in your repo."),!1;if(t!=="Set Up Automatically")return!1;try{let n=(0,me.execFileSync)("gh",["auth","token"],{cwd:e,encoding:"utf-8",timeout:1e4,stdio:["pipe","pipe","pipe"]}).trim();return n?((0,me.execFileSync)("gh",["secret","set","COPILOT_PAT","--body",n],{cwd:e,timeout:15e3,stdio:["pipe","pipe","pipe"]}),w.window.showInformationMessage("COPILOT_PAT secret created. Copilot can now be auto-assigned to issues."),!0):(w.window.showErrorMessage("Could not retrieve GitHub CLI token. Run `gh auth login` first."),!1)}catch{return w.window.showErrorMessage("Failed to set up COPILOT_PAT. Make sure `gh` CLI is installed and you're authenticated (`gh auth login`)."),!1}}function vn(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4);if(n<1)return"just now";if(n<60)return`${n}m ago`;let o=Math.floor(n/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}function ne(e){let t=P.join(e,".git","config");if(h.existsSync(t))try{let n=h.readFileSync(t,"utf-8"),o=n.match(/url\s*=\s*https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)/);if(o)return`https://github.com/${o[1]}`;let s=n.match(/url\s*=\s*git@github\.com:([^/\s]+\/[^/\s.]+)/);return s?`https://github.com/${s[1]}`:void 0}catch{return}}var bn=P.join(".github","config",".scheduled-tasks-state.json");function Ze(e){return P.join(e,bn)}function Me(e){try{return JSON.parse(h.readFileSync(Ze(e),"utf-8"))}catch{return{}}}function et(e,t){let n=Me(e);n[t]={lastRun:new Date().toISOString()};let o=Ze(e),s=P.dirname(o);h.existsSync(s)||h.mkdirSync(s,{recursive:!0}),h.writeFileSync(o,JSON.stringify(n,null,2)+`
`,"utf-8")}var he=null,tt="alex.scheduledRuns";function nt(e){he=e}function Fe(){return he?.get(tt)??{}}function ot(e){he&&he.update(tt,e)}function st(e){return Fe()[e]}function it(e){let t=Fe();delete t[e],ot(t)}function fe(e,t){let n=Fe();n[e]=t,ot(n)}function wn(e,t,n){if(!e.dependsOn||e.dependsOn.length===0)return{satisfied:!0,blocking:[]};let o=Me(n),s=[];for(let i of e.dependsOn){if(!t.find(u=>u.id===i)){s.push(`${i} (not found)`);continue}let a=st(i);if(a){a.status==="failure"||a.status==="error"||a.status==="cancelled"?s.push(`${i} (${a.status})`):a.status!=="completed"&&s.push(`${i} (${a.status})`);continue}o[i]?.lastRun||s.push(`${i} (never run)`)}return{satisfied:s.length===0,blocking:s}}function rt(e){let t=new Map(e.map(r=>[r.id,r])),n=new Set,o=new Set,s=[];function i(r){if(n.has(r)||o.has(r))return;o.add(r);let a=t.get(r);if(a?.dependsOn)for(let u of a.dependsOn)t.has(u)&&i(u);o.delete(r),n.add(r),a&&s.push(a)}for(let r of e)i(r.id);for(let r of e)n.has(r.id)||s.push(r);return s}function yn(e){let t=e.match(/github\.com\/([^/]+)\/([^/]+)/);if(t)return{owner:t[1],repo:t[2]}}async function ve(e,t,n,o){let s=yn(e);if(!s)throw new Error("Cannot parse GitHub owner/repo from URL");let i=ge(t),r=o??w.workspace.workspaceFolders?.[0]?.uri.fsPath,{owner:a,repo:u}=s,d=`scheduled-${t}.yml`,p={Authorization:`Bearer ${(await w.authentication.getSession("github",["repo"],{createIfNone:!0})).accessToken}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"alex-cognitive-architecture"};fe(t,{status:"queued"}),n({status:"queued"});let b=new Date().toISOString(),S=`https://api.github.com/repos/${a}/${u}/actions/workflows/${d}/dispatches`,C=await fetch(S,{method:"POST",headers:{...p,"Content-Type":"application/json"},body:JSON.stringify({ref:"main"})});if(!C.ok){let z=await C.text(),Re={status:"error"};throw fe(t,Re),n(Re),r&&N(r,i,!1),new Error(`Dispatch failed (${C.status}): ${z}`)}let G=`https://api.github.com/repos/${a}/${u}/actions/workflows/${d}/runs?per_page=1&created=>${b.slice(0,19)}Z`,V=0,q=120,$e=5e3,de=async()=>{if(V++,V>q){let z={status:"error"};fe(t,z),n(z),r&&N(r,i,!1);return}try{let z=await fetch(G,{headers:p});if(!z.ok)return W();let L=(await z.json()).workflow_runs?.[0];if(!L)return W();let Je={status:L.status==="completed"?L.conclusion==="success"?"completed":L.conclusion??"failure":L.status??"in_progress",runUrl:L.html_url,conclusion:L.conclusion??void 0};if(fe(t,Je),n(Je),L.status!=="completed")return W();r&&N(r,i,L.conclusion==="success")}catch{return W()}},pe=!1,B=[],W=()=>{pe||B.push(setTimeout(()=>void de(),$e))};return B.push(setTimeout(()=>void de(),3e3)),{dispose:()=>{pe=!0,B.forEach(clearTimeout)}}}function K(e){let t=P.join(e,".github","config","scheduled-tasks.json");if(!h.existsSync(t))return[];try{return JSON.parse(h.readFileSync(t,"utf-8")).tasks??[]}catch{return[]}}function at(e,t){let n=P.join(e,".github","config","scheduled-tasks.json");if(!h.existsSync(n))return null;try{let o=JSON.parse(h.readFileSync(n,"utf-8")),s=o.tasks?.find(i=>i.id===t);return s?(s.enabled=!s.enabled,h.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),s.enabled?ut(e,s):gt(e,s.id),o.tasks):null}catch{return null}}function ct(e,t){let n=P.join(e,".github","config","scheduled-tasks.json");if(!h.existsSync(n))return null;try{let o=JSON.parse(h.readFileSync(n,"utf-8")),s=o.tasks?.findIndex(i=>i.id===t);return s===void 0||s<0?null:(o.tasks.splice(s,1),h.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),gt(e,t),o.tasks)}catch{return null}}function Oe(e,t){let n=P.join(e,".github","workflows",`scheduled-${t}.yml`);return h.existsSync(n)}function lt(e){return P.join(e,".github","workflows")}function Le(e,t){return P.join(lt(e),`scheduled-${t}.yml`)}function Y(e){return e.replace(/[\\"`$!#&|;(){}<>]/g,"")}function dt(e){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e))throw new Error(`Invalid task ID: "${e}". Must be lowercase alphanumeric with hyphens.`);return e}function pt(e){if(!/^[0-9*\/,\- ]+$/.test(e))throw new Error(`Invalid cron expression: "${e}".`);return e}function xn(e){let t=Y(e.name),n=dt(e.id),o=pt(e.schedule);return`# Auto-generated \u2014 do not edit manually
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
          PROMPT_FILE: "${Y(e.promptFile??"")}"
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
`}function kn(e){let t=Y(e.name),n=Y(e.description),o=e.muscle?Y(e.muscle):"",s=e.muscleArgs?` ${e.muscleArgs.map(Y).join(" ")}`:"",i=dt(e.id),r=pt(e.schedule);return`# Auto-generated \u2014 do not edit manually
name: "Scheduled: ${t}"

on:
  schedule:
    - cron: "${r}"
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
`}function ut(e,t){let n;if(t.mode==="agent"&&t.promptFile)n=xn(t);else if(t.mode==="direct"&&t.muscle)n=kn(t);else return!1;let o=lt(e);return h.existsSync(o)||h.mkdirSync(o,{recursive:!0}),h.writeFileSync(Le(e,t.id),n,"utf-8"),!0}function gt(e,t){let n=Le(e,t);h.existsSync(n)&&h.unlinkSync(n)}function ft(e,t,n){let o;if(e.length===0)o=`
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
    </div>`;else{let i=n?Me(n):{},r=e.map(a=>{let u=a.mode==="agent"?"hubot":"terminal",d=a.mode==="agent"?"Agent":"Script",g=hn(a.schedule),l=n?Oe(n,a.id):!1,p=st(a.id),b;p&&(p.status==="queued"||p.status==="in_progress")?b='<span class="schedule-pill schedule-pill-running"><span class="codicon codicon-loading codicon-modifier-spin"></span> Running</span>':p&&p.status==="completed"?b='<span class="schedule-pill schedule-pill-success"><span class="codicon codicon-check"></span> Dispatched</span>':p&&(p.status==="failure"||p.status==="cancelled"||p.status==="error")?b='<span class="schedule-pill schedule-pill-fail"><span class="codicon codicon-error"></span> Failed</span>':b=a.enabled?'<span class="schedule-pill schedule-pill-on">Active</span>':'<span class="schedule-pill schedule-pill-off">Paused</span>';let S=p&&(p.status==="queued"||p.status==="in_progress"),G=a.mode==="agent"&&a.promptFile||a.mode==="direct"&&a.muscle?S?'<button class="schedule-action-btn schedule-action-running" disabled title="Running\u2026"><span class="codicon codicon-loading codicon-modifier-spin"></span></button>':`<button class="schedule-action-btn schedule-action-run" data-command="runTask" data-file="${y(a.id)}" title="${l?"Run on GitHub Actions":"Run now"}"><span class="codicon codicon-rocket"></span></button>`:"",V=p?.runUrl?`<button class="schedule-action-btn" data-command="openExternal" data-file="${y(p.runUrl)}" title="View run on GitHub"><span class="codicon codicon-link-external"></span></button>`:"",q=a.mode==="agent"&&a.promptFile?`<button class="schedule-action-btn" data-command="openPromptFile" data-file="${y(a.promptFile)}" title="Edit prompt"><span class="codicon codicon-edit"></span></button>`:"",$e=`<button class="schedule-action-btn ${a.enabled?"schedule-action-pause":"schedule-action-resume"}" data-command="toggleTask" data-file="${y(a.id)}" title="${a.enabled?"Pause":"Resume"}">${a.enabled?'<span class="codicon codicon-debug-pause"></span>':'<span class="codicon codicon-play-circle"></span>'}</button>`,de=`<button class="schedule-action-btn schedule-action-danger" data-command="deleteTask" data-file="${y(a.id)}" title="Delete"><span class="codicon codicon-trash"></span></button>`,pe=i[a.id]?.lastRun?`<span class="schedule-last-run" title="Last run: ${y(i[a.id].lastRun)}"><span class="codicon codicon-history"></span> ${vn(i[a.id].lastRun)}</span>`:"",B="";if(a.dependsOn&&a.dependsOn.length>0&&n){let W=wn(a,e,n);W.satisfied?B='<div class="schedule-task-deps schedule-deps-ok"><span class="codicon codicon-pass"></span> Dependencies met</div>':B=`<div class="schedule-task-deps schedule-deps-blocked"><span class="codicon codicon-lock"></span> Blocked by: ${j(W.blocking.join(", "))}</div>`}return`
      <div class="schedule-task ${a.enabled?"enabled":"disabled"}" data-task-id="${y(a.id)}">
        <div class="schedule-task-header">
          <span class="schedule-mode" title="${d}"><span class="codicon codicon-${u}"></span></span>
          <span class="schedule-task-name" title="${y(a.name)}">${j(a.name)}</span>
          ${b}
        </div>
        <div class="schedule-task-meta">
          <span class="schedule-schedule"><span class="codicon codicon-clock"></span> ${j(g)}</span>
          ${pe}
        </div>
        <div class="schedule-task-desc">${j(a.description)}</div>
        ${B}
        <div class="schedule-task-actions">
          ${G}
          ${V}
          ${q}
          ${$e}
          ${de}
        </div>
      </div>`}).join("");o=`
    <div class="schedule-section-header">
      <span class="codicon codicon-clock"></span>
      <strong>Scheduled Tasks</strong>
      <span class="agent-badge">${e.filter(a=>a.enabled).length}/${e.length}</span>
    </div>
    <div class="schedule-tasks">
      ${r}
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
    </div>`}return e.some(i=>i.mode==="agent")&&n&&!Xe(n)&&(o+=`
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
    </div>`,o}function Sn(e,t){let n=P.join(e,".github","config","scheduled-tasks.json");try{let o;if(h.existsSync(n))o=JSON.parse(h.readFileSync(n,"utf-8"));else{let s=P.dirname(n);h.existsSync(s)||h.mkdirSync(s,{recursive:!0}),o={version:"1.0.0",tasks:[]}}return o.tasks.some(s=>s.id===t.id)?(w.window.showWarningMessage(`Task "${t.id}" already exists.`),!1):(o.tasks.push(t),h.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0)}catch{return!1}}var An=[{label:"Every 3 hours",cron:"0 */3 * * *",description:"8 times/day"},{label:"Every 6 hours",cron:"0 */6 * * *",description:"4 times/day"},{label:"Every 12 hours",cron:"0 */12 * * *",description:"Twice daily"},{label:"Daily at 8 AM",cron:"0 8 * * *",description:"Once daily (UTC)"},{label:"Daily at noon",cron:"0 12 * * *",description:"Once daily (UTC)"},{label:"Weekly Monday",cron:"0 8 * * 1",description:"Every Monday 8 AM UTC"},{label:"Weekly Friday",cron:"0 16 * * 5",description:"Every Friday 4 PM UTC"},{label:"Custom cron...",cron:"",description:"Enter POSIX cron expression"}];async function mt(e){let t=await w.window.showInputBox({title:"Add Scheduled Task (1/5)",prompt:"Task name",placeHolder:"e.g. Weekly Code Review",validateInput:g=>g.trim()?void 0:"Name is required"});if(!t)return!1;let n=await w.window.showInputBox({title:"Add Scheduled Task (2/5)",prompt:"Brief description",placeHolder:"What does this automation do?",validateInput:g=>g.trim()?void 0:"Description is required"});if(!n)return!1;let o=await w.window.showQuickPick([{label:"$(hubot) Cloud Agent",description:"Creates a GitHub issue assigned to Copilot",detail:"Best for creative tasks: writing, analysis, reviews",mode:"agent"},{label:"$(terminal) Direct",description:"Runs a script in GitHub Actions",detail:"Best for mechanical tasks: audits, builds, syncs",mode:"direct"}],{title:"Add Scheduled Task (3/5)",placeHolder:"Execution mode"});if(!o)return!1;let s=await w.window.showQuickPick(An.map(g=>({label:g.label,description:g.description,cron:g.cron})),{title:"Add Scheduled Task (4/5)",placeHolder:"Schedule frequency"});if(!s)return!1;let i=s.cron;if(!i){let g=await w.window.showInputBox({title:"Custom Cron Expression",prompt:"POSIX cron: minute hour day-of-month month day-of-week",placeHolder:"0 */4 * * *",validateInput:l=>l.trim().split(/\s+/).length===5?void 0:"Must be 5 space-separated fields"});if(!g)return!1;i=g.trim()}let r=P.join(e,".github","skills"),a;if(h.existsSync(r)){let g=h.readdirSync(r,{withFileTypes:!0}).filter(l=>l.isDirectory()).map(l=>({label:l.name}));if(g.length>0){let l=await w.window.showQuickPick([{label:"(none)",description:"No specific skill"},...g],{title:"Add Scheduled Task (5/5)",placeHolder:"Associate a skill (optional)"});l&&l.label!=="(none)"&&(a=l.label)}}let u=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");if(!u)return w.window.showErrorMessage("Task name must contain at least one letter or digit."),!1;let d={id:u,name:t,description:n,mode:o.mode,schedule:i,enabled:!0,...a?{skill:a}:{},...o.mode==="agent"?{promptFile:`.github/config/scheduled-tasks/${u}.md`}:{}};if(Sn(e,d)){if(o.mode==="agent"&&d.promptFile){let p=P.join(e,d.promptFile),b=P.dirname(p);if(h.existsSync(b)||h.mkdirSync(b,{recursive:!0}),!h.existsSync(p)){let S=[`# ${t}`,"","## Task","",`${n}`,"","## Instructions","","1. Read relevant context from the repository","2. Perform the task","3. Create a PR with your changes","","## Quality Standards","","- Follow existing project conventions","- Include meaningful commit messages","- Ensure all tests pass before submitting",""].join(`
`);h.writeFileSync(p,S,"utf-8")}w.commands.executeCommand("vscode.open",w.Uri.file(p))}ut(e,d),o.mode==="agent"&&!Xe(e)&&De(e);let g=o.mode==="agent"?`Task "${t}" created with workflow. Edit the prompt template, then commit & push to activate on GitHub.`:`Task "${t}" created with workflow. Commit & push to activate on GitHub.`,l=o.mode==="agent"?"Edit Prompt":"View Workflow";return w.window.showInformationMessage(g,l).then(p=>{if(p==="Edit Prompt"&&d.promptFile){let b=P.join(e,d.promptFile);w.commands.executeCommand("vscode.open",w.Uri.file(b))}else if(p==="View Workflow"){let b=Le(e,d.id);w.commands.executeCommand("vscode.open",w.Uri.file(b))}}),!0}return!1}var ht=`
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
`;var vt=async(e,t,n,o)=>e.command==="autopilot"?Cn(e,n):e.command==="cloud"?Pn(e,n,o):{};async function Cn(e,t){let n=Ge.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!n)return t.markdown("Open a workspace folder to use Autopilot."),{};let o=K(n),s=e.prompt.trim().toLowerCase();if(s==="list"||s===""){t.markdown(`## Autopilot Tasks

`);let i=rt(o);for(let r of i){let a=r.mode==="agent"?"\u{1F916}":"\u2699\uFE0F",u=r.enabled?"Active":"Paused",d=r.dependsOn?.length?` \u2190 depends on: ${r.dependsOn.join(", ")}`:"";t.markdown(`- ${a} **${r.name}** \u2014 ${u}${d}
`)}return t.markdown(`
*${o.length} tasks configured. Use \`/autopilot status\` for run history.*`),{}}if(s==="status"){t.markdown(`## Autopilot Status

`);let i=o.filter(a=>a.enabled),r=o.filter(a=>!a.enabled);t.markdown(`**${i.length}** active \xB7 **${r.length}** paused

`);for(let a of i)t.markdown(`- **${a.name}** \u2014 \`${a.schedule}\`
`);return{}}if(s.startsWith("run ")){let i=s.slice(4).trim(),r=o.find(a=>a.id===i);if(!r)return t.markdown(`Task \`${i}\` not found. Use \`/autopilot list\` to see available tasks.`),{};if(r.mode==="agent"&&r.promptFile){let a=be.join(n,r.promptFile),u=be.resolve(a);if(!u.toLowerCase().startsWith(n.toLowerCase()))return t.markdown("Invalid prompt file path."),{};if(we.existsSync(u)){let d=we.readFileSync(u,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();t.markdown(`Running **${r.name}**...

${d}`)}else t.markdown(`Prompt file not found: \`${r.promptFile}\``)}else t.markdown(`Task **${r.name}** uses direct mode (script: \`${r.muscle??"n/a"}\`). Run it from the Autopilot tab or GitHub Actions.`);return{}}return t.markdown(`## Autopilot Commands

`),t.markdown("- `/autopilot list` \u2014 Show all configured tasks\n"),t.markdown("- `/autopilot status` \u2014 Show active tasks and schedules\n"),t.markdown("- `/autopilot run <task-id>` \u2014 Run a specific task\n"),{}}async function Pn(e,t,n){let o=Ge.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!o)return t.markdown("Open a workspace folder to use cloud dispatch."),{};let s=K(o),i=e.prompt.trim().toLowerCase();if(i===""||i==="help")return t.markdown(`## Cloud Dispatch

`),t.markdown(`Dispatch Autopilot tasks to GitHub Actions for cloud execution.

`),t.markdown("- `/cloud list` \u2014 Show cloud-eligible tasks\n"),t.markdown("- `/cloud run <task-id>` \u2014 Dispatch a task to GitHub Actions\n"),{};if(i==="list"){let r=s.filter(a=>a.enabled&&a.mode==="agent");if(r.length===0)return t.markdown("No cloud-eligible tasks found. Enable agent-mode tasks in scheduled-tasks.json."),{};t.markdown(`## Cloud-Eligible Tasks

`);for(let a of r)t.markdown(`- **${a.id}** \u2014 ${a.name}
`);return t.markdown("\n*Use `/cloud run <task-id>` to dispatch.*"),{}}if(i.startsWith("run ")){let r=i.slice(4).trim(),a=s.find(d=>d.id===r);if(!a)return t.markdown(`Task \`${r}\` not found. Use \`/cloud list\` to see eligible tasks.`),{};if(!a.enabled)return t.markdown(`Task **${a.name}** is paused. Enable it first.`),{};let u=ne(o);if(!u)return t.markdown("Could not determine GitHub repo URL from workspace."),{};t.markdown(`Dispatching **${a.name}** to GitHub Actions...

`);try{let d=await ve(u,a.id,()=>{},o);n.onCancellationRequested(()=>d.dispose()),t.markdown("Workflow dispatched. Check the Autopilot tab or GitHub Actions for progress.")}catch(d){let l=(d instanceof Error?d.message:String(d)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");t.markdown(`Dispatch failed: ${l}`)}return{}}return t.markdown("Unknown cloud command. Use `/cloud help` for usage."),{}}var f=m(require("vscode")),Ot=m(require("crypto")),_=m(require("fs")),T=m(require("path")),Z=m(require("os"));var U=m(require("fs")),M=m(require("path")),xe=require("child_process");function ye(e,t){return Math.abs(t.getTime()-e.getTime())/(1e3*60*60*24)}function Tn(e){let t=new Date,n=e.lastDreamDate?Math.floor(ye(e.lastDreamDate,t)):1/0;return e.dreamNeeded&&n>14||e.syncStale&&n>3?"critical":e.dreamNeeded||n>7||e.syncStale?"attention":"healthy"}function In(e){let t=M.join(e,".github","quality","dream-report.json");try{let n=U.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function $n(e){let t=M.join(e,".github",".sync-manifest.json");try{let n=U.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function Rn(){try{let e=M.resolve(__dirname,"..","package.json");return JSON.parse(U.readFileSync(e,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}}function jn(e){let t=$n(e);if(!t)return!1;let n=Rn();if(t.brainVersion!==n)return!0;let o=new Date(t.lastSync);return!!(isNaN(o.getTime())||ye(o,new Date)>7)}function En(e){try{let t=(0,xe.execFileSync)("git",["diff","--cached","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),n=(0,xe.execFileSync)("git",["diff","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),o=t?t.split(`
`).length:0,s=n?n.split(`
`).length:0,i=o+s;if(i===0)return{fileCount:0,days:0};let r=0;try{let a=(0,xe.execFileSync)("git",["log","-1","--format=%ci"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim();a&&(r=Math.floor(ye(new Date(a),new Date)))}catch{}return{fileCount:i,days:r}}catch{return{fileCount:0,days:0}}}function Dn(e){let t=M.join(e,".github"),n=s=>{try{return U.readdirSync(s,{withFileTypes:!0}).filter(i=>i.isDirectory()).length}catch{return 0}},o=(s,i,r=!1)=>{try{if(!r)return U.readdirSync(s).filter(d=>d.endsWith(i)).length;let a=0,u=d=>{for(let g of U.readdirSync(d,{withFileTypes:!0}))g.isDirectory()?u(M.join(d,g.name)):g.name.endsWith(i)&&a++};return u(s),a}catch{return 0}};return{skills:n(M.join(t,"skills")),instructions:o(M.join(t,"instructions"),".instructions.md"),prompts:o(M.join(t,"prompts"),".prompt.md",!0),agents:o(M.join(t,"agents"),".agent.md")}}function bt(e){let t=In(e),n=Dn(e),o=t?new Date(t.timestamp):null,s=t?t.brokenRefs.length>0||t.trifectaIssues.length>20:!0,i=En(e),r={status:"healthy",skillCount:n.skills,instructionCount:n.instructions,promptCount:n.prompts,agentCount:n.agents,lastDreamDate:o,dreamNeeded:s,syncStale:jn(e),uncommittedFileCount:i.fileCount,uncommittedDays:i.days};return r.status=Tn(r),r}function Mn(e,t){let n=(t.getTime()-e.getTime())/864e5,o=Math.LN2/7;return Math.exp(-o*n)}function Fn(e,t=new Date){let n=new Date(e.lastUsed),o=Mn(n,t);return Math.sqrt(e.count)*o}function wt(e,t,n=new Date){return e.actions.find(s=>s.id===t)?{...e,actions:e.actions.map(s=>s.id===t?{...s,count:s.count+1,lastUsed:n.toISOString()}:s)}:{...e,actions:[...e.actions,{id:t,count:1,lastUsed:n.toISOString()}]}}function yt(e,t,n=new Date){let o=new Map;for(let r of t.actions){let a=Fn(r,n);a>=.1&&o.set(r.id,a)}let s=e.filter(r=>o.has(r)),i=e.filter(r=>!o.has(r));return s.sort((r,a)=>(o.get(a)??0)-(o.get(r)??0)),[...s,...i]}function xt(){return{version:1,actions:[]}}var On=["Two minds, one vision","Better together than alone","Your ideas, amplified","Where human meets machine","The sum of us","Let's build something meaningful","From thought to reality","Creating what neither could alone","Turning possibility into code","What will we make today?","Exploring the edge of possible","Learning never looked like this","Growing smarter, together","Every question opens a door","Uncharted territory, good company","I see what you're building","Your vision, our journey","Thinking alongside you","Understanding before answering"],Ln=["Still here, still building","Every pause is a chance to reflect","The best work takes time","Progress isn't always visible","Let's pick up where we left off","Good things are worth the wait","One conversation at a time"],Gn=["Fresh starts are powerful","We'll figure this out","The first step is showing up","Building begins with connection","Ready when you are","Together, we'll find the way"],Nn=["Two minds, ready to build","Let's see what we can create","The beginning of something","Your partner in possibility"],Un=["A new day to create","Fresh ideas await","What will we build today?"],_n=["Wrapping up what we started","Good work deserves reflection","Tomorrow we build on today"];function Hn(e=new Date){let t=e.getHours();return t<12?"morning":t<18?"afternoon":"evening"}function kt(e=new Date){let t=new Date(e.getFullYear(),0,0),n=e.getTime()-t.getTime(),o=1e3*60*60*24;return Math.floor(n/o)}function ke(e,t=new Date){let n=kt(t);return e[n%e.length]}function Bn(e){switch(e){case"healthy":return On;case"attention":return Ln;case"critical":return Gn;default:return Nn}}function St(e,t,n){let o=n.join(e,".github","config","taglines.json");if(!t.existsSync(o))return null;try{let s=t.readFileSync(o,"utf-8"),i=JSON.parse(s);return!i.taglines?.project||i.taglines.project.length===0?null:i}catch{return null}}function Wn(e){let t=[];for(let n of Object.keys(e.taglines)){let o=e.taglines[n];Array.isArray(o)&&t.push(...o)}return t}function At(e={}){let{status:t="unknown",config:n,useTimeOfDay:o=!0,date:s=new Date}=e,i=kt(s);if(n&&t==="healthy"){let a=n.rotation?.projectWeight??50,u=Math.floor(a);if(i%100<u){let g=Wn(n);if(g.length>0)return ke(g,s)}}if(o&&t==="healthy"&&i%10===0){let a=Hn(s);if(a==="morning")return ke(Un,s);if(a==="evening")return ke(_n,s)}let r=Bn(t);return ke(r,s)}var F=m(require("fs")),Q=m(require("path"));function zn(e){let t=e.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);return t?e.slice(t[0].length).trim():e.trim()}function Vn(e){let t=Q.join(e,".github","skills");if(!F.existsSync(t))return[];let n=[],o;try{o=F.readdirSync(t,{withFileTypes:!0})}catch{return[]}for(let s of o){if(!s.isDirectory())continue;let i=Q.join(t,s.name,"loop-config.partial.json");if(F.existsSync(i))try{let r=JSON.parse(F.readFileSync(i,"utf-8"));if(Array.isArray(r.groups))for(let a of r.groups)n.push({...a,source:"skill"})}catch{}}return n}function qn(e,t){let n=e.map(o=>({...o,buttons:[...o.buttons]}));for(let o of t){let s=n.find(i=>i.id===o.id);if(s){let i=new Set(s.buttons.map(r=>r.id??r.label));for(let r of o.buttons){let a=r.id??r.label;i.has(a)||(s.buttons.push(r),i.add(a))}}else n.push({...o,buttons:[...o.buttons]})}return n}function Jn(e,t){return t?e.filter(n=>!n.phase||n.phase.includes(t)).map(n=>{let o=n.buttons.filter(i=>!i.phase||i.phase.includes(t)),s=n.phase?.includes(t);return{...n,buttons:o,collapsed:s?!1:n.collapsed}}).filter(n=>n.buttons.length>0):e}function Yn(e,t){let n={id:e.id,icon:e.icon,label:e.label,command:e.command,hint:e.hint,tooltip:e.tooltip};if(e.promptFile){let o=Q.join(t,e.promptFile);try{F.existsSync(o)&&(n.prompt=zn(F.readFileSync(o,"utf-8")))}catch{}}return!n.prompt&&e.prompt&&(n.prompt=e.prompt),e.file&&(n.file=e.file),n}function Ct(e){let t=Q.join(e,".github","config","loop-menu.json");if(!F.existsSync(t))return[];let n;try{n=JSON.parse(F.readFileSync(t,"utf-8"))}catch{return[]}if(!Array.isArray(n.groups))return[];let o=Vn(e),s=qn(n.groups,o),i=Jn(s,n.projectPhase),r=Q.join(e,".github","prompts","loop");return i.map(a=>({id:a.id,label:a.label,desc:a.desc,accent:a.accent,icon:a.icon,collapsed:a.collapsed,buttons:a.buttons.map(u=>Yn(u,r))}))}var Se=m(require("vscode")),Rt=require("child_process");var X={recentAgentPRs:[],pendingReviews:[],totalPending:0,lastFetched:null,error:null};function Pt(e,t){return new Promise(n=>{let o=e.split(/\s+/);(0,Rt.execFile)("gh",o,{cwd:t,timeout:15e3,maxBuffer:1024*1024},(s,i)=>{if(s){n(null);return}n(i.trim())})})}function Tt(e){if(!e)return[];try{return JSON.parse(e).map(n=>({number:n.number,title:n.title,url:n.url,state:n.state,author:n.author?.login??"unknown",createdAt:n.createdAt,updatedAt:n.updatedAt,isDraft:n.isDraft??!1,reviewDecision:n.reviewDecision??"",labels:(n.labels??[]).map(o=>o.name)}))}catch{return[]}}var It="number,title,url,state,author,createdAt,updatedAt,isDraft,reviewDecision,labels";var Ne=!1;async function Ue(e,t){if(!Ne){Ne=!0;try{let[n,o]=await Promise.all([Pt(`pr list --author app/copilot-swe-agent --state all --limit 10 --json ${It}`,e),Pt(`pr list --search review-requested:@me --state open --limit 10 --json ${It}`,e)]),s=Tt(n),i=Tt(o);X={recentAgentPRs:s,pendingReviews:i,totalPending:i.length,lastFetched:new Date,error:null}}catch(n){X={...X,error:n instanceof Error?n.message:String(n)}}Ne=!1,t?.()}}function Kn(e){let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/36e5);if(n<1)return"just now";if(n<24)return`${n}h ago`;let o=Math.floor(n/24);return o===1?"yesterday":`${o}d ago`}function Qn(e){return e.state==="merged"?"git-merge":e.state==="closed"?"close":e.isDraft?"git-pull-request-draft":"git-pull-request"}function Xn(e){return e.state==="merged"?"var(--vscode-charts-purple, #a371f7)":e.state==="closed"?"var(--vscode-errorForeground, #f85149)":"var(--vscode-charts-green, #3fb950)"}function jt(e){let t=X;if(t.error||!t.recentAgentPRs.length&&!t.pendingReviews.length)return`
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
      </div>`;for(let o of t.pendingReviews)n+=$t(o);n+="</div>"}if(t.recentAgentPRs.length>0){n+=`
    <div class="agent-section">
      <div class="agent-section-header">
        <span class="codicon codicon-hubot"></span>
        <strong>Recent Agent Sessions</strong>
      </div>`;for(let o of t.recentAgentPRs.slice(0,5))n+=$t(o);n+="</div>"}return n+="</div>",n}function $t(e){let t=Qn(e),n=Xn(e);return`
  <div class="agent-pr-row" data-command="openExternal" data-file="${y(e.url)}" role="button" tabindex="0" title="${y(e.title)}">
    <span class="codicon codicon-${y(t)}" style="color:${y(n)};"></span>
    <div class="agent-pr-info">
      <span class="agent-pr-title">${j(e.title)}</span>
      <span class="agent-pr-meta">#${e.number} \xB7 ${j(Kn(e.createdAt))} \xB7 ${j(e.author)}</span>
    </div>
    <span class="agent-pr-arrow codicon codicon-link-external"></span>
  </div>`}var A=null;function Et(e){return A=Se.window.createStatusBarItem(Se.StatusBarAlignment.Right,50),A.command="alex.openChat",A.name="Alex Agent Activity",e.subscriptions.push(A),A}function _e(e){if(!A)return;if(!e){A.text="$(brain) Alex",A.tooltip="Alex Cognitive Architecture",A.show();return}let t=X.pendingReviews;t.length>0?(A.text=`$(brain) Alex $(bell-dot) ${t.length}`,A.tooltip=`${t.length} PR${t.length===1?"":"s"} awaiting review`):(A.text="$(brain) Alex",A.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"),A.show(),Ue(e,()=>{let n=X.pendingReviews;A&&(n.length>0?(A.text=`$(brain) Alex $(bell-dot) ${n.length}`,A.tooltip=`${n.length} PR${n.length===1?"":"s"} awaiting review`):(A.text="$(brain) Alex",A.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"))})}var Dt=`
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
`;var Zn="alex.welcomeView";function He(){let e=Z.platform();return e==="win32"?T.join(process.env.APPDATA||T.join(Z.homedir(),"AppData","Roaming"),"Code","User"):e==="darwin"?T.join(Z.homedir(),"Library","Application Support","Code","User"):T.join(process.env.XDG_CONFIG_HOME||T.join(Z.homedir(),".config"),"Code","User")}var eo=T.resolve(__dirname,"..","package.json"),Lt=(()=>{try{return JSON.parse(_.readFileSync(eo,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}})(),Be="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki",to=[{id:"workspace",label:"WORKSPACE",icon:"folder",desc:"Initialize and upgrade your cognitive architecture",collapsed:!1,buttons:[{icon:"sync",label:"Initialize Workspace",command:"initialize",tooltip:"Install Alex brain files in this workspace",hint:"command"},{icon:"arrow-up",label:"Upgrade Architecture",command:"upgrade",tooltip:"Update to the latest brain architecture",hint:"command"},{icon:"cloud",label:"Setup AI-Memory",command:"setupAIMemory",tooltip:"Find or create the shared AI-Memory knowledge store",hint:"command"}]},{id:"brain-status",label:"BRAIN STATUS",icon:"symbol-structure",desc:"Cognitive architecture health and maintenance",collapsed:!1,buttons:[{icon:"symbol-event",label:"Run Dream Protocol",command:"dream",tooltip:"Run brain health check then fix issues",hint:"command"},{icon:"shield",label:"Brain Health Check",command:"brainQA",tooltip:"Generate brain health quality grid",hint:"command"},{icon:"check-all",label:"Validate Skills",command:"validateSkills",tooltip:"Check all skills for compliance",hint:"command"},{icon:"dashboard",label:"Token Cost Report",command:"tokenCostReport",tooltip:"Measure brain file token costs",hint:"command"},{icon:"heart",label:"Meditate",command:"openChat",prompt:"Run a meditation session \u2014 consolidate knowledge, review recent changes, and strengthen architecture",tooltip:"Knowledge consolidation session",hint:"chat"},{icon:"graph",label:"Self-Actualize",command:"openChat",prompt:"Run a self-actualization assessment \u2014 evaluate architecture completeness, identify growth areas, and plan improvements",tooltip:"Deep self-assessment and growth",hint:"chat"}]},{id:"tools",label:"TOOLS",icon:"tools",desc:"Muscle-backed development utilities",collapsed:!0,buttons:[{icon:"add",label:"New Skill",command:"newSkill",tooltip:"Scaffold a new skill from template",hint:"command"},{icon:"warning",label:"Lint Markdown",command:"markdownLint",tooltip:"Validate current file for converter readiness",hint:"command"},{icon:"lightbulb",label:"Extract Insights",command:"insightPipeline",tooltip:"Extract cross-project insights",hint:"command"}]},{id:"user-memory",label:"USER MEMORY",icon:"notebook",desc:"Access your persistent memory locations",collapsed:!0,buttons:[{icon:"notebook",label:"Memories",command:"openMemories",tooltip:"Open VS Code user memories folder",hint:"command"},{icon:"edit",label:"User Prompts",command:"openPrompts",tooltip:"Reusable prompt templates",hint:"command"},{icon:"server",label:"MCP Config",command:"openMcpConfig",tooltip:"Model Context Protocol servers",hint:"command"},{icon:"cloud",label:"Copilot Memory (GitHub)",command:"openExternal",file:"https://github.com/settings/copilot",tooltip:"Manage cloud-synced Copilot memory",hint:"link"}]},{id:"environment",label:"ENVIRONMENT",icon:"settings-gear",desc:"Extension settings",collapsed:!0,buttons:[{icon:"settings-gear",label:"Open Extension Settings",command:"openSettings",tooltip:"Configure Alex extension behavior",hint:"command"}]},{id:"learn",label:"LEARN",icon:"book",desc:"Documentation and support resources",collapsed:!0,buttons:[{icon:"book",label:"Documentation",command:"openExternal",file:`${Be}`,tooltip:"Full documentation on GitHub Wiki",hint:"link"},{icon:"comment-discussion",label:"User Stories",command:"openExternal",file:`${Be}/blog/README`,tooltip:"Real-world examples of working with Alex",hint:"link"},{icon:"mortar-board",label:"Tutorials",command:"openExternal",file:`${Be}/tutorials/README`,tooltip:"Step-by-step guides for common tasks",hint:"link"},{icon:"lightbulb",label:"LearnAI Playbooks",command:"openExternal",file:"https://learnai.correax.com/",tooltip:"80 AI playbooks for professional disciplines",hint:"link"},{icon:"bug",label:"Report an Issue",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/issues",tooltip:"Found a bug? Let us know",hint:"link"}]},{id:"about",label:"ABOUT",icon:"info",collapsed:!0,buttons:[{icon:"tag",label:`Version ${Lt}`,command:"noop",tooltip:"Installed extension version"},{icon:"person",label:"Publisher: fabioc-aloha",command:"openExternal",file:"https://github.com/fabioc-aloha",hint:"link",tooltip:"View publisher on GitHub"},{icon:"law",label:"PolyForm Noncommercial 1.0.0",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md",hint:"link",tooltip:"View license"}]}],no=["https://github.com/","https://marketplace.visualstudio.com/","https://learnai.correax.com/"],Mt="alex.quickActionFrecency",oe=class{constructor(t,n){this.extensionUri=t;this.globalState=n;this.workspaceRoot=f.workspace.workspaceFolders?.[0]?.uri.fsPath??"",this.frecencyData=n.get(Mt)??xt()}static viewId=Zn;view;workspaceRoot;frecencyData;disposables=[];dispose(){for(let t of this.disposables)t.dispose();this.disposables.length=0}recordActionUse(t){this.frecencyData=wt(this.frecencyData,t),this.globalState.update(Mt,this.frecencyData)}loopGroupsCache=null;getLoopGroups(){return this.loopGroupsCache||(this.loopGroupsCache=this.workspaceRoot?Ct(this.workspaceRoot):[]),this.loopGroupsCache}renderGroupsWithFrecency(t){let n=t.map(o=>{if(o.id==="creative-loop")return o;let s=o.buttons.map(a=>a.id??a.label.toLowerCase().replace(/\s+/g,"-")),r=yt(s,this.frecencyData).map(a=>o.buttons.find(u=>(u.id??u.label.toLowerCase().replace(/\s+/g,"-"))===a)).filter(a=>a!==void 0);return{...o,buttons:r}});return Ft(n)}refresh(){this.loopGroupsCache=null,this.view&&(this.view.webview.html=this.getHtml(this.view.webview))}resolveWebviewView(t,n,o){this.view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this.extensionUri]},t.webview.html=this.getHtml(t.webview),this.workspaceRoot&&Ue(this.workspaceRoot,()=>this.refresh()),t.webview.onDidReceiveMessage(s=>this.handleMessage(s)),t.onDidChangeVisibility(()=>{t.visible&&this.refresh()})}async handleMessage(t){switch(t.actionId&&this.recordActionUse(t.actionId),t.command){case"openChat":if(t.prompt){let n=t.prompt.endsWith(": ");await f.commands.executeCommand("workbench.action.chat.open",{query:t.prompt,isPartialQuery:n})}else await f.commands.executeCommand("workbench.action.chat.open");break;case"initialize":await f.commands.executeCommand("alex.initialize");break;case"upgrade":await f.commands.executeCommand("alex.upgrade");break;case"setupAIMemory":await f.commands.executeCommand("alex.setupAIMemory");break;case"dream":await f.commands.executeCommand("alex.dream");break;case"brainQA":await f.commands.executeCommand("alex.brainQA");break;case"validateSkills":await f.commands.executeCommand("alex.validateSkills");break;case"tokenCostReport":await f.commands.executeCommand("alex.tokenCostReport");break;case"newSkill":await f.commands.executeCommand("alex.newSkill");break;case"markdownLint":await f.commands.executeCommand("alex.markdownLint");break;case"insightPipeline":await f.commands.executeCommand("alex.insightPipeline");break;case"openSettings":await f.commands.executeCommand("workbench.action.openSettings","alex");break;case"openMemories":{let n=f.Uri.file(T.join(He(),"globalStorage","github.copilot-chat","memory-tool","memories"));try{await f.commands.executeCommand("revealFileInOS",n)}catch{await f.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openPrompts":{let n=f.Uri.file(T.join(He(),"prompts"));try{await f.commands.executeCommand("revealFileInOS",n)}catch{await f.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openMcpConfig":{let n=f.Uri.file(T.join(He(),"mcp.json"));await f.commands.executeCommand("vscode.open",n)}break;case"openExternal":if(t.file){let n=String(t.file);no.some(o=>n.startsWith(o))&&await f.env.openExternal(f.Uri.parse(n))}break;case"refresh":this.refresh();break;case"toggleTask":if(this.workspaceRoot&&t.file){let n=at(this.workspaceRoot,t.file);if(n){this.refresh();let o=n.find(s=>s.id===t.file);if(o){let s=o.enabled?"enabled":"disabled",i=o.enabled?"Workflow created.":"Workflow removed.";f.window.showInformationMessage(`Task "${o.name}" ${s}. ${i} Commit & push to activate on GitHub.`)}}}break;case"addTask":this.workspaceRoot&&await mt(this.workspaceRoot)&&this.refresh();break;case"setupCopilotPAT":this.workspaceRoot&&(await De(this.workspaceRoot),this.refresh());break;case"deleteTask":this.workspaceRoot&&t.file&&await f.window.showWarningMessage(`Delete task "${t.file}"?`,{modal:!0},"Delete")==="Delete"&&ct(this.workspaceRoot,t.file)!==null&&(this.refresh(),f.window.showInformationMessage(`Task "${t.file}" deleted. Commit & push to remove the workflow from GitHub.`));break;case"openPromptFile":if(this.workspaceRoot&&t.file){let n=T.resolve(this.workspaceRoot,t.file);if(!n.toLowerCase().startsWith(this.workspaceRoot.toLowerCase()+T.sep)&&n.toLowerCase()!==this.workspaceRoot.toLowerCase())break;_.existsSync(n)?await f.commands.executeCommand("vscode.open",f.Uri.file(n)):f.window.showWarningMessage(`Prompt file not found: ${t.file}`)}break;case"runTask":if(this.workspaceRoot&&t.file){let n=ne(this.workspaceRoot),o=Oe(this.workspaceRoot,t.file);if(et(this.workspaceRoot,t.file),this.refresh(),n&&o)try{let s=await ve(n,t.file,i=>{this.refresh()},this.workspaceRoot);this.disposables.push(s),f.window.showInformationMessage(`Workflow dispatched for "${t.file}". Monitoring execution\u2026`)}catch(s){let i=s instanceof Error?s.message:String(s);f.window.showErrorMessage(`Failed to dispatch workflow: ${i}`)}else{let s=ge(t.file),r=K(this.workspaceRoot).find(a=>a.id===t.file);if(r?.promptFile){let a=T.resolve(this.workspaceRoot,r.promptFile),u=this.workspaceRoot.toLowerCase()+T.sep;if(!a.toLowerCase().startsWith(u))break;if(_.existsSync(a)){let d=_.readFileSync(a,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();await f.commands.executeCommand("workbench.action.chat.open",{query:d,isPartialQuery:!1}),N(this.workspaceRoot,s,!0)}else f.window.showWarningMessage(`Prompt file not found: ${r.promptFile}`),N(this.workspaceRoot,s,!1)}else N(this.workspaceRoot,s,!1)}}break;case"clearRunStatus":t.file&&(it(t.file),this.refresh());break;case"openScheduleConfig":if(this.workspaceRoot){let n=T.join(this.workspaceRoot,".github","config","scheduled-tasks.json");_.existsSync(n)&&await f.commands.executeCommand("vscode.open",f.Uri.file(n))}break;case"noop":break;case"switchTab":break}}getHtml(t){let n=oo(),o=t.asWebviewUri(f.Uri.joinPath(this.extensionUri,"dist","codicon.css")),i=(this.workspaceRoot?bt(this.workspaceRoot):null)?.status??"unknown",r=this.workspaceRoot?St(this.workspaceRoot,_,T):null,a=At({status:i,config:r});return`<!DOCTYPE html>
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
    ${ht}
    ${Dt}
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
    <div class="tagline">${j(a)}</div>
    <div class="version">v${Lt}</div>
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
    ${Gt({icon:"comment-discussion",label:"Chat with Alex",command:"openChat",hint:"chat"},!0)}

    ${this.renderGroupsWithFrecency(this.getLoopGroups())}
  </div>

  <!-- Setup Tab -->
  <div id="tab-setup" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-setup">
    ${Ft(to)}
  </div>

  <!-- Autopilot Tab -->
  <div id="tab-autopilot" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-autopilot">
    ${this.workspaceRoot?jt(this.workspaceRoot):""}
    ${ft(this.workspaceRoot?K(this.workspaceRoot):[],this.workspaceRoot?ne(this.workspaceRoot):void 0,this.workspaceRoot)}
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
</html>`}};function oo(){return Ot.randomBytes(16).toString("hex")}function Ft(e){return e.map(t=>{let n=t.collapsed===!1?"expanded":"",o=t.icon?`<span class="codicon codicon-${y(t.icon)}"></span>`:"";return`
    <div class="group ${n}" data-group-id="${y(t.id)}">
      <div class="group-header" role="button" tabindex="0" aria-expanded="${t.collapsed===!1}">
        ${o}
        <span>${j(t.label)}</span>
        <span class="codicon codicon-chevron-right chevron" aria-hidden="true"></span>
      </div>
      ${t.desc?`<div class="group-desc">${j(t.desc)}</div>`:""}
      <div class="group-content">
        <div class="group-buttons">
          ${t.buttons.map(s=>Gt(s)).join("")}
        </div>
      </div>
    </div>`}).join("")}function Gt(e,t=!1){let n=t?"action-btn primary":"action-btn",o=e.id??e.label.toLowerCase().replace(/\s+/g,"-"),s=[`data-command="${y(e.command)}"`,`data-action-id="${y(o)}"`,e.prompt?`data-prompt="${y(e.prompt)}"`:"",e.file?`data-file="${y(e.file)}"`:"",e.tooltip?`data-tooltip="${y(e.tooltip)}"`:""].filter(Boolean).join(" "),i={chat:"comment-discussion",link:"link-external",command:"zap"},r=e.hint?`<span class="hint-badge" title="${e.hint}"><span class="codicon codicon-${i[e.hint]}"></span></span>`:"";return`<button class="${n}" ${s}>
    <span class="codicon codicon-${y(e.icon)}"></span>
    <span class="btn-label">${j(e.label)}</span>
    ${r}
  </button>`}var ie=m(require("fs")),se=m(require("path"));function v(e,...t){return ie.existsSync(se.join(e,...t))}function Nt(e){try{return JSON.parse(ie.readFileSync(e,"utf-8"))}catch{return null}}function so(e,t){let n=[];(t||v(e,"tsconfig.json"))&&n.push("TypeScript"),(v(e,"requirements.txt")||v(e,"pyproject.toml")||v(e,"setup.py"))&&n.push("Python"),v(e,"go.mod")&&n.push("Go"),v(e,"Cargo.toml")&&n.push("Rust"),(v(e,"pom.xml")||v(e,"build.gradle"))&&n.push("Java");let o={...t?.dependencies??{},...t?.devDependencies??{}};if((o.react||o["react-dom"])&&n.push("React"),o.next&&n.push("Next.js"),o.vue&&n.push("Vue"),o.vitepress&&n.push("VitePress"),o.express&&n.push("Express"),o.fastify&&n.push("Fastify"),o["@azure/functions"]&&n.push("Azure Functions"),o.esbuild&&n.push("esbuild"),o.webpack&&n.push("webpack"),o.vite&&!o.vitepress&&n.push("Vite"),o.vitest&&n.push("Vitest"),o.jest&&n.push("Jest"),o.mocha&&n.push("Mocha"),(o.eslint||v(e,".eslintrc.json")||v(e,"eslint.config.js")||v(e,"eslint.config.mjs"))&&n.push("ESLint"),(o.prettier||v(e,".prettierrc"))&&n.push("Prettier"),v(e,"pyproject.toml"))try{let s=ie.readFileSync(se.join(e,"pyproject.toml"),"utf-8");s.includes("fastapi")&&n.push("FastAPI"),s.includes("flask")&&n.push("Flask"),s.includes("django")&&n.push("Django"),s.includes("pytest")&&n.push("pytest"),s.includes("ruff")&&n.push("Ruff"),s.includes("mypy")&&n.push("mypy")}catch{}return(v(e,"Dockerfile")||v(e,"docker-compose.yml")||v(e,"docker-compose.yaml"))&&n.push("Docker"),[...new Set(n)]}function io(e,t){let n={},o=t?.scripts??{};o.build&&(n.buildCommand="npm run build"),o["build:prod"]&&(n.buildCommand="npm run build:prod"),o.test&&(n.testCommand="npm test"),o.lint&&(n.lintCommand="npm run lint"),!n.buildCommand&&v(e,"setup.py")&&(n.buildCommand="python setup.py build"),!n.testCommand&&v(e,"pyproject.toml")&&(n.testCommand="pytest"),!n.buildCommand&&v(e,"go.mod")&&(n.buildCommand="go build ./..."),!n.testCommand&&v(e,"go.mod")&&(n.testCommand="go test ./...");let s=["scripts/release.ps1","scripts/release.sh","scripts/release-vscode.ps1","scripts/release.cjs"];for(let i of s)if(v(e,i)){n.releaseScript=i;break}return n}function Ae(e){let t=se.join(e,"package.json"),n=Nt(t),o=so(e,n),s=io(e,n),i="generic";return n&&n.engines?.vscode?(i="vscode-extension",{projectType:i,...s,conventions:o}):v(e,"platforms","vscode-extension","package.json")&&(Nt(se.join(e,"platforms","vscode-extension","package.json"))?.engines??{}).vscode?(i="vscode-extension",{projectType:i,...s,conventions:o}):n&&(n.workspaces||v(e,"lerna.json")||v(e,"pnpm-workspace.yaml"))?(i="monorepo",{projectType:i,...s,conventions:o}):v(e,".vitepress","config.ts")||v(e,".vitepress","config.mts")||v(e,"next.config.js")||v(e,"next.config.mjs")||v(e,"gatsby-config.js")||v(e,"astro.config.mjs")?(i="static-site",{projectType:i,...s,conventions:o}):o.includes("FastAPI")||o.includes("Flask")||o.includes("Django")?(i="python-api",{projectType:i,...s,conventions:o}):v(e,"dbt_project.yml")||v(e,"notebook")||v(e,"synapse")||v(e,".pbixproj")?(i="data-pipeline",{projectType:i,...s,conventions:o}):{projectType:i,...s,conventions:o}}var O=m(require("fs")),re=m(require("path"));var ro=[{id:"extension-dev",label:"EXTENSION DEV",icon:"extensions",desc:"Package, publish, test, and debug the VS Code extension",collapsed:!0,buttons:[{id:"ext-package",icon:"package",label:"Package VSIX",command:"openChat",prompt:"Package the VS Code extension into a .vsix file. Run the build first, then package with vsce. Report the file size.",hint:"chat",tooltip:"Build and package the extension"},{id:"ext-publish",icon:"cloud-upload",label:"Publish",command:"openChat",prompt:"Run the release preflight checks, then publish the extension to the VS Code Marketplace. Follow the release-management skill.",hint:"chat",tooltip:"Publish to VS Code Marketplace"},{id:"ext-test",icon:"beaker",label:"Extension Tests",command:"openChat",prompt:"Run all extension tests. Report pass/fail counts and any failures with root cause analysis.",hint:"chat",tooltip:"Run extension test suite"},{id:"ext-debug",icon:"debug-alt",label:"Debug Launch",command:"runCommand",file:"workbench.action.debug.start",hint:"command",tooltip:"Launch Extension Development Host"}]}],ao=[{id:"api-dev",label:"API DEVELOPMENT",icon:"plug",desc:"Run, test, and document API endpoints",collapsed:!0,buttons:[{id:"api-run",icon:"play",label:"Run Server",command:"openChat",prompt:"Start the API development server. Detect the framework (FastAPI/Flask/Django) and use the appropriate command.",hint:"chat",tooltip:"Start the development server"},{id:"api-test",icon:"beaker",label:"Test API",command:"openChat",prompt:"Run the API test suite with pytest. Report coverage, pass/fail counts, and any failures.",hint:"chat",tooltip:"Run API tests with coverage"},{id:"api-lint",icon:"warning",label:"Lint & Type",command:"openChat",prompt:"Run linting (ruff/flake8) and type checking (mypy/pyright) on the Python codebase. Fix any issues found.",hint:"chat",tooltip:"Run linter and type checker"},{id:"api-docs",icon:"book",label:"API Docs",command:"openChat",prompt:"Review and update the API documentation. Ensure OpenAPI/Swagger specs match the current endpoints.",hint:"chat",tooltip:"Update API documentation"}]}],co=[{id:"pipeline-phases",label:"PIPELINE PHASES",icon:"server-process",desc:"Medallion architecture: ingest, transform, serve",collapsed:!0,buttons:[{id:"bronze",icon:"database",label:"Bronze Layer",command:"openChat",prompt:"Help me work on the Bronze (raw ingestion) layer. Identify data sources, define schemas, implement extraction logic.",hint:"chat",tooltip:"Raw data ingestion patterns"},{id:"silver",icon:"filter",label:"Silver Layer",command:"openChat",prompt:"Help me work on the Silver (cleansed/conformed) layer. Apply data quality rules, standardize schemas, handle nulls and duplicates.",hint:"chat",tooltip:"Cleansing and conforming"},{id:"gold",icon:"star-full",label:"Gold Layer",command:"openChat",prompt:"Help me work on the Gold (business-ready) layer. Build aggregations, KPI calculations, and dimensional models.",hint:"chat",tooltip:"Business-ready aggregations"}]},{id:"data-quality",label:"DATA QUALITY",icon:"verified",desc:"Profile, validate, and trace data lineage",collapsed:!0,buttons:[{id:"profile",icon:"graph-line",label:"Profile Data",command:"openChat",prompt:"Profile the dataset: row counts, null rates, distributions, cardinality, outliers. Present findings in a summary table.",hint:"chat",tooltip:"Statistical data profiling"},{id:"validate",icon:"check",label:"Validate Schema",command:"openChat",prompt:"Validate data schemas against expectations. Check column types, constraints, referential integrity, and naming conventions.",hint:"chat",tooltip:"Schema validation checks"},{id:"lineage",icon:"git-merge",label:"Trace Lineage",command:"openChat",prompt:"Trace data lineage for the selected table or column. Map source-to-target transformations and document the flow.",hint:"chat",tooltip:"Data lineage documentation"}]}],lo=[{id:"site-dev",label:"SITE DEVELOPMENT",icon:"browser",desc:"Dev server, build, deploy, and performance audit",collapsed:!0,buttons:[{id:"site-dev-server",icon:"play",label:"Dev Server",command:"openChat",prompt:"Start the development server for this static site. Detect the framework and use the appropriate dev command.",hint:"chat",tooltip:"Start local dev server"},{id:"site-build",icon:"package",label:"Build Site",command:"openChat",prompt:"Build the static site for production. Report any build warnings or errors.",hint:"chat",tooltip:"Production build"},{id:"site-deploy",icon:"cloud-upload",label:"Deploy",command:"openChat",prompt:"Deploy the site to the configured hosting platform. Run preflight checks first.",hint:"chat",tooltip:"Deploy to hosting"},{id:"site-perf",icon:"dashboard",label:"Performance",command:"openChat",prompt:"Audit site performance: bundle size, image optimization, lazy loading, caching headers, Core Web Vitals.",hint:"chat",tooltip:"Performance and accessibility audit"}]}],po=[{id:"cross-package",label:"CROSS-PACKAGE",icon:"references",desc:"Shared types, dependency updates, and coordinated releases",collapsed:!0,buttons:[{id:"deps-update",icon:"package",label:"Update Deps",command:"openChat",prompt:"Check for outdated dependencies across all packages. Propose coordinated updates that maintain compatibility.",hint:"chat",tooltip:"Cross-package dependency updates"},{id:"shared-types",icon:"symbol-interface",label:"Shared Types",command:"openChat",prompt:"Review shared type definitions across packages. Identify drift, inconsistencies, or missing exports.",hint:"chat",tooltip:"Audit shared type definitions"},{id:"release-all",icon:"rocket",label:"Release Train",command:"openChat",prompt:"Coordinate a release across all packages. Check version consistency, run all tests, update changelogs.",hint:"chat",tooltip:"Coordinated multi-package release"}]}],Ut={"vscode-extension":ro,"python-api":ao,"data-pipeline":co,"static-site":lo,monorepo:po,generic:[]};function uo(e){try{let t=JSON.parse(O.readFileSync(e,"utf-8"));return Array.isArray(t.groups)?t.groups:[]}catch{return[]}}function go(e,t){let n=t??Ae(e),o=re.join(e,".github","config","loop-menu.json"),s=uo(o),i=new Set(Object.values(Ut).flatMap(g=>g.map(l=>l.id))),r=s.filter(g=>!i.has(g.id)),a=Ut[n.projectType]??[],u=[...r,...a],d={};return n.buildCommand&&(d.buildCommand=n.buildCommand),n.testCommand&&(d.testCommand=n.testCommand),n.lintCommand&&(d.lintCommand=n.lintCommand),n.releaseScript&&(d.releaseScript=n.releaseScript),n.conventions.length>0&&(d.conventions=n.conventions),{$schema:"./loop-config.schema.json",$comment:`Loop tab menu configuration \u2014 auto-generated for ${n.projectType} project. Prompts are loaded from .github/prompts/loop/{promptFile} at runtime.`,version:"1.0",projectType:n.projectType,projectPhase:"active-development",groups:u,...Object.keys(d).length>0?{projectContext:d}:{}}}function Ce(e,t){let n=go(e,t),o=re.join(e,".github","config"),s=re.join(o,"loop-menu.json");try{return O.mkdirSync(o,{recursive:!0}),O.writeFileSync(s,JSON.stringify(n,null,2)+`
`,"utf-8"),!0}catch{return!1}}function _t(e,t){let n=re.join(e,".github","config","loop-menu.json");try{if(!O.existsSync(n))return!1;let o=JSON.parse(O.readFileSync(n,"utf-8"));return o.projectPhase=t,O.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0}catch{return!1}}var E=m(require("vscode")),k=m(require("fs")),$=m(require("path")),We=m(require("os"));function Ht(){let e=[],t=We.homedir();try{for(let o of k.readdirSync(t))if(/^OneDrive/i.test(o)){let s=$.join(t,o,"AI-Memory");k.existsSync(s)&&e.push(s)}}catch{}let n=$.join(t,"Library","CloudStorage");try{if(k.existsSync(n)){for(let o of k.readdirSync(n))if(/^OneDrive/i.test(o)){let s=$.join(n,o,"AI-Memory");k.existsSync(s)&&e.push(s)}}}catch{}for(let o of[$.join(t,"AI-Memory"),$.join(t,".alex","AI-Memory")])k.existsSync(o)&&e.push(o);return e}function fo(){let e=[],t=We.homedir();try{for(let o of k.readdirSync(t))/^OneDrive/i.test(o)&&e.push($.join(t,o,"AI-Memory"))}catch{}let n=$.join(t,"Library","CloudStorage");try{if(k.existsSync(n))for(let o of k.readdirSync(n))/^OneDrive/i.test(o)&&e.push($.join(n,o,"AI-Memory"))}catch{}return e.push($.join(t,"AI-Memory")),e.push($.join(t,".alex","AI-Memory")),e}function Bt(){let e=E.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&k.existsSync(e))return e;let t=Ht();return t.length>0?t[0]:null}var mo=[".github","announcements","feedback","insights","knowledge","patterns"],ho={"global-knowledge.md":`# Global Knowledge

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
`,"user-profile.json":()=>JSON.stringify({name:"",role:"",preferences:{communication:"direct",codeStyle:"",learningStyle:""},updatedAt:new Date().toISOString()},null,2),"project-registry.json":()=>JSON.stringify({version:1,projects:[],updatedAt:new Date().toISOString()},null,2),"index.json":()=>JSON.stringify({version:1,files:[],updatedAt:new Date().toISOString()},null,2)};function vo(e){let t=[];k.existsSync(e)||(k.mkdirSync(e,{recursive:!0}),t.push(e));for(let n of mo){let o=$.join(e,n);k.existsSync(o)||(k.mkdirSync(o,{recursive:!0}),t.push(o))}for(let[n,o]of Object.entries(ho)){let s=$.join(e,n);if(!k.existsSync(s)){let i=typeof o=="function"?o():o;k.writeFileSync(s,i,"utf-8"),t.push(s)}}return t}async function bo(){let e=E.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&k.existsSync(e)){let r=await E.window.showInformationMessage(`AI-Memory already configured at: ${e}`,"Use This","Change Location");if(r==="Use This")return e;if(!r)return}let t=Ht(),n=fo(),o=[];for(let r of t)o.push({label:"$(check) "+r,description:"Found \u2014 existing AI-Memory",detail:r});for(let r of n)if(!t.includes(r)){let a=/OneDrive/i.test(r);o.push({label:(a?"$(cloud) ":"$(folder) ")+r,description:a?"OneDrive \u2014 recommended (cloud-synced)":"Local fallback",detail:r})}o.push({label:"$(folder-opened) Browse...",description:"Choose a custom location",detail:"__browse__"});let s=await E.window.showQuickPick(o,{title:"AI-Memory Location",placeHolder:"Where should Alex store shared knowledge?",ignoreFocusOut:!0});if(!s)return;let i;if(s.detail==="__browse__"){let r=await E.window.showOpenDialog({canSelectFolders:!0,canSelectFiles:!1,canSelectMany:!1,openLabel:"Select AI-Memory Folder",title:"Choose AI-Memory Location"});if(!r||r.length===0)return;i=r[0].fsPath,$.basename(i).toLowerCase().includes("ai-memory")||(i=$.join(i,"AI-Memory"))}else i=s.detail;return i}async function Pe(){let e=await bo();if(e)try{let t=vo(e);return await E.workspace.getConfiguration("alex.aiMemory").update("path",e,E.ConfigurationTarget.Global),t.length>0?E.window.showInformationMessage(`AI-Memory initialized at ${e} (${t.length} items created).`):E.window.showInformationMessage(`AI-Memory linked to ${e} (already complete).`),e}catch(t){let o=(t instanceof Error?t.message:String(t)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");E.window.showErrorMessage(`AI-Memory setup failed: ${o}`);return}}var D=m(require("vscode")),Ve=m(require("path")),te=m(require("fs")),ee=class extends D.TreeItem{constructor(n,o,s,i,r){super(n,s);this.metricId=i;this.children=r;this.description=o,this.tooltip=`${n}: ${o}`}};function ze(e,t){switch(t){case"percent":return`${e}%`;case"seconds":return`${e}s`;case"count":return`${e}`;default:return`${e} ${t}`}}var Te=class{constructor(t){this.workspaceRoot=t}_onDidChangeTreeData=new D.EventEmitter;onDidChangeTreeData=this._onDidChangeTreeData.event;refresh(){this._onDidChangeTreeData.fire(void 0)}getTreeItem(t){return t}getChildren(t){return this.workspaceRoot?t?.children?t.children:t?[]:this.getRootItems():[new ee("No workspace","Open a folder",D.TreeItemCollapsibleState.None)]}getRootItems(){let t=[],n=Ve.join(this.workspaceRoot,".github","config","agent-metrics.json");if(!te.existsSync(n))return[new ee("Not configured","No agent-metrics.json found",D.TreeItemCollapsibleState.None)];let o;try{o=JSON.parse(te.readFileSync(n,"utf-8"))}catch{return[new ee("Config error","Invalid agent-metrics.json",D.TreeItemCollapsibleState.None)]}let s=Ve.join(this.workspaceRoot,".agent-metrics-state.json"),i={};if(te.existsSync(s))try{i=JSON.parse(te.readFileSync(s,"utf-8"))}catch{}let r=o.thresholds??{};for(let a of o.metrics){let u=i[a.id],d=u?ze(u.value,a.unit):"\u2014",g=r[a.id],l=this.getStatusIcon(a,u?.value,g),p=new ee(a.name,d,D.TreeItemCollapsibleState.None,a.id);p.iconPath=new D.ThemeIcon(l);let b=g?`

Warning: ${ze(g.warning,a.unit)} \xB7 Critical: ${ze(g.critical,a.unit)}`:"";p.tooltip=new D.MarkdownString(`**${a.name}**

${a.description}

Current: ${d}${b}`),t.push(p)}return t}getStatusIcon(t,n,o){return n===void 0||!o?"circle-outline":t.higherIsBetter===!0||t.id.includes("rate")||t.id==="tasks-run-count"?n<o.critical?"error":n<o.warning?"warning":"check":n>o.critical?"error":n>o.warning?"warning":"check"}};var R=m(require("vscode")),x=m(require("fs")),I=m(require("path"));var wo=["instructions","skills","prompts","agents","muscles","config","hooks"],yo=["copilot-instructions.md"],xo="brain-files",qe=".github",Wt=".github/.alex-brain-version",ko=".github/config/MASTER-ALEX-PROTECTED.json";function zt(e){return e.extension.packageJSON.version}function Vt(e){let t=I.join(e,Wt);try{return x.readFileSync(t,"utf-8").trim()}catch{return}}function qt(e,t,n){let o=n??t;x.mkdirSync(t,{recursive:!0});for(let s of x.readdirSync(e,{withFileTypes:!0})){let i=I.join(e,s.name),r=I.resolve(t,s.name);if(!r.startsWith(o+I.sep)&&r!==o)throw new Error(`Path traversal blocked: ${s.name}`);s.isDirectory()?qt(i,r,o):x.copyFileSync(i,r)}}function Jt(e){return x.existsSync(I.join(e,ko))}async function Ie(e,t=!1){let n=R.workspace.workspaceFolders;if(!n||n.length===0)return R.window.showWarningMessage("Alex: Open a workspace folder first."),!1;let o=n[0].uri.fsPath;if(Jt(o))return R.window.showWarningMessage("Alex: Protected mode \u2014 brain updates blocked in this workspace."),!1;let s=zt(e),i=Vt(o),r=I.join(o,qe);if(!(t||!x.existsSync(r)||i!==s))return R.window.showInformationMessage(`Alex: Brain is up to date (v${s}).`),!1;let u=I.join(e.extensionUri.fsPath,xo);if(!x.existsSync(u))return R.window.showWarningMessage("Alex: Brain files not found in extension bundle."),!1;try{let d=I.join(o,qe);x.mkdirSync(d,{recursive:!0});for(let b of wo){let S=I.join(u,b);if(!x.existsSync(S))continue;let C=I.join(d,b),G=C+`.staging-${Date.now()}`;qt(S,G),x.existsSync(C)&&x.rmSync(C,{recursive:!0,force:!0}),x.renameSync(G,C)}for(let b of yo){let S=I.join(u,b);x.existsSync(S)&&x.copyFileSync(S,I.join(d,b))}let g=I.join(o,Wt);x.writeFileSync(g,s,"utf-8"),Ce(o);let l=i?"updated":"installed";return await R.window.showInformationMessage(`Alex: Brain ${l} to v${s}. Configure recommended settings?`,"Optimize Settings","Skip")==="Optimize Settings"&&R.commands.executeCommand("alex.optimizeSettings"),Bt()||await R.window.showInformationMessage("Alex: Set up AI-Memory for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await Pe(),!0}catch(d){let g=d instanceof Error?d.message:String(d);return R.window.showErrorMessage(`Alex: Brain install failed \u2014 ${g}`),!1}}function So(e){let t=zt(e),n=R.workspace.workspaceFolders;if(!n||n.length===0)return{installed:!1,bundledVersion:t,needsUpgrade:!1};let o=n[0].uri.fsPath,s=Vt(o),i=I.join(o,qe),r=x.existsSync(i);return{installed:r,version:s,bundledVersion:t,needsUpgrade:r&&s!==t}}async function Yt(e){let t=So(e);if(!t.needsUpgrade)return;let n=R.workspace.workspaceFolders?.[0]?.uri.fsPath;if(n&&Jt(n))return;await R.window.showInformationMessage(`Alex: Brain v${t.version} \u2192 v${t.bundledVersion} available.`,"Upgrade Now","Later")==="Upgrade Now"&&await Ie(e,!0)}var ae=m(require("vscode")),Kt=m(require("path")),Qt=m(require("fs")),Xt=require("child_process");function Ao(e,t,n=[]){let o=Kt.join(e,".github","muscles",t);return Qt.existsSync(o)?new Promise(s=>{(0,Xt.execFile)("node",[o,...n],{cwd:e,maxBuffer:10*1024*1024,timeout:12e4},(i,r,a)=>{let u=typeof i?.code=="number"?i.code:i?1:0;s({code:u,stdout:r??"",stderr:a??""})})}):Promise.resolve({code:1,stdout:"",stderr:`Muscle not found: ${t}`})}async function H(e,t,n,o,s){let i=ae.window.createOutputChannel(o);i.show(!0),i.appendLine(`Running ${t}...`),i.appendLine("");let r=await Ao(e,t,n);r.stdout&&i.appendLine(r.stdout),r.stderr&&i.appendLine(r.stderr),r.code!==0&&i.appendLine(`
[Exit code: ${r.code}]`),i.appendLine(`
[Done]`),s&&await ae.window.showInformationMessage(`Alex: ${o} complete. Open chat for follow-up?`,"Open Chat","Done")==="Open Chat"&&await ae.commands.executeCommand("workbench.action.chat.open",{query:s})}function ce(e){return(e instanceof Error?e.message:String(e)).replace(/[A-Z]:\\[\w\\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g,"[path]")}async function le(){let e=c.workspace.getConfiguration(),t="github.copilot.chat.copilotMemory.enabled";e.get(t)!==!1&&await e.update(t,!1,c.ConfigurationTarget.Global)}function Co(e){le(),nt(e.workspaceState);let t=c.chat.createChatParticipant("alex.chat",vt);t.iconPath=c.Uri.joinPath(e.extensionUri,"assets","icon.png"),t.followupProvider={provideFollowups(){return[{prompt:"/autopilot list",label:"List Autopilot Tasks",command:"autopilot"}]}},e.subscriptions.push(t);let n=new oe(e.extensionUri,e.globalState);e.subscriptions.push(n),e.subscriptions.push(c.window.registerWebviewViewProvider(oe.viewId,n));let o=c.workspace.workspaceFolders?.[0]?.uri.fsPath;Et(e),_e(o);let s=setInterval(()=>{_e(c.workspace.workspaceFolders?.[0]?.uri.fsPath)},300*1e3);e.subscriptions.push({dispose:()=>clearInterval(s)});let i=new Te(o);if(e.subscriptions.push(c.window.createTreeView("alex.agentActivity",{treeDataProvider:i})),e.subscriptions.push(c.commands.registerCommand("alex.refreshAgentActivity",()=>{i.refresh()})),o){let l=new c.RelativePattern(o,".agent-metrics-state.json"),p=c.workspace.createFileSystemWatcher(l);p.onDidChange(()=>i.refresh()),p.onDidCreate(()=>i.refresh()),e.subscriptions.push(p)}e.subscriptions.push(c.commands.registerCommand("alex.refreshWelcome",()=>{n.refresh()})),e.subscriptions.push(c.commands.registerCommand("alex.openChat",()=>{c.commands.executeCommand("workbench.action.chat.open")})),e.subscriptions.push(c.commands.registerCommand("alex.dream",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}try{await H(l,"brain-qa.cjs",[],"Alex: Brain QA","Review the brain health grid at .github/quality/brain-health-grid.md and fix the top priority issues")}catch(p){c.window.showErrorMessage(`Dream protocol failed: ${ce(p)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.initialize",async()=>{try{await le(),await c.window.showInformationMessage("Install the Alex brain in this workspace?","Install","Cancel")==="Install"&&await Ie(e,!0)&&(await le(),n.refresh())}catch(l){c.window.showErrorMessage(`Initialize failed: ${ce(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.upgrade",async()=>{try{await le(),await Ie(e,!0)&&(await le(),n.refresh())}catch(l){c.window.showErrorMessage(`Upgrade failed: ${ce(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setupAIMemory",async()=>{try{await Pe(),n.refresh()}catch(l){c.window.showErrorMessage(`AI-Memory setup failed: ${ce(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.generateLoopConfig",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}try{let p=Ae(l);Ce(l,p)?c.window.showInformationMessage(`Alex: Loop config generated for ${p.projectType} project (${p.conventions.length} conventions detected).`):c.window.showErrorMessage("Alex: Failed to write loop config.")}catch(p){c.window.showErrorMessage(`Alex: Loop config generation failed \u2014 ${ce(p)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setProjectPhase",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let p=[{label:"Planning",description:"Ideation, research, and design",value:"planning"},{label:"Active Development",description:"Building features and writing code",value:"active-development"},{label:"Testing",description:"QA, integration tests, and validation",value:"testing"},{label:"Release",description:"Packaging, publishing, and deployment",value:"release"},{label:"Maintenance",description:"Bug fixes, upgrades, and monitoring",value:"maintenance"}],b=await c.window.showQuickPick(p.map(C=>({label:C.label,description:C.description,value:C.value})),{placeHolder:"Select the current project phase"});if(!b)return;_t(l,b.value)?(n.refresh(),c.window.showInformationMessage(`Alex: Project phase set to "${b.label}".`)):c.window.showErrorMessage("Alex: Failed to update project phase. Generate a loop config first.")}));let r={"alex.convertMdToHtml":{muscle:"md-to-html.cjs",label:"HTML",srcExt:".md"},"alex.convertMdToWord":{muscle:"md-to-word.cjs",label:"Word",srcExt:".md"},"alex.convertMdToEml":{muscle:"md-to-eml.cjs",label:"Email",srcExt:".md"},"alex.convertMdToPdf":{muscle:"md-to-pdf.cjs",label:"PDF",srcExt:".md"},"alex.convertMdToPptx":{muscle:"md-to-pptx.cjs",label:"PowerPoint",srcExt:".md"},"alex.convertMdToEpub":{muscle:"md-to-epub.cjs",label:"EPUB",srcExt:".md"},"alex.convertMdToLatex":{muscle:"md-to-latex.cjs",label:"LaTeX",srcExt:".md"},"alex.convertMdToTxt":{muscle:"md-to-txt.cjs",label:"Plain Text",srcExt:".md"},"alex.convertDocxToMd":{muscle:"docx-to-md.cjs",label:"Markdown",srcExt:".docx"},"alex.convertHtmlToMd":{muscle:"html-to-md.cjs",label:"Markdown",srcExt:".html"},"alex.convertPptxToMd":{muscle:"pptx-to-md.cjs",label:"Markdown",srcExt:".pptx"}};for(let[l,p]of Object.entries(r))e.subscriptions.push(c.commands.registerCommand(l,async b=>{let S=b??c.window.activeTextEditor?.document.uri;if(!S||S.scheme!=="file"){c.window.showWarningMessage("Alex: Select a file to convert.");return}let C=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!C){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let G=Zt.join(C,".github","muscles",p.muscle),V=S.fsPath,q=c.window.createTerminal(`Alex: Convert \u2192 ${p.label}`);q.show(),q.sendText(`node "${G}" "${V}"`)}));e.subscriptions.push(c.commands.registerCommand("alex.brainQA",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}await H(l,"brain-qa.cjs",[],"Alex: Brain QA")})),e.subscriptions.push(c.commands.registerCommand("alex.validateSkills",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}await H(l,"validate-skills.cjs",[],"Alex: Validate Skills","Review the skill validation results and fix any issues found")})),e.subscriptions.push(c.commands.registerCommand("alex.markdownLint",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath,p=c.window.activeTextEditor?.document.uri;if(!l||!p||p.scheme!=="file"){c.window.showWarningMessage("Alex: Open a markdown file first.");return}await H(l,"markdown-lint.cjs",[p.fsPath],"Alex: Markdown Lint","Fix the markdown lint issues found in the current file")})),e.subscriptions.push(c.commands.registerCommand("alex.tokenCostReport",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}await H(l,"token-cost-report.cjs",[],"Alex: Token Cost Report")})),e.subscriptions.push(c.commands.registerCommand("alex.newSkill",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let p=await c.window.showInputBox({prompt:"Skill name (kebab-case, e.g., my-new-skill)",placeHolder:"my-new-skill",validateInput:C=>/^[a-z][a-z0-9-]*$/.test(C)?null:"Use kebab-case (lowercase, hyphens)"});if(!p)return;let b=await c.window.showInputBox({prompt:"Skill description",placeHolder:"What does this skill do?"}),S=[p];b&&S.push("--description",b),await H(l,"new-skill.cjs",S,"Alex: New Skill",`Customize the new skill ${p} \u2014 fill in the SKILL.md with real content and create the matching instruction file`)})),e.subscriptions.push(c.commands.registerCommand("alex.insightPipeline",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}await H(l,"insight-pipeline.cjs",[],"Alex: Insight Pipeline","Review the extracted insights and promote the most valuable ones to global knowledge")}));let a=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/config/loop-menu.json")),u=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/prompts/loop/*.prompt.md")),d=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/skills/*/loop-config.partial.json")),g=()=>n.refresh();e.subscriptions.push(a,a.onDidChange(g),a.onDidCreate(g),a.onDidDelete(g),u,u.onDidChange(g),u.onDidCreate(g),u.onDidDelete(g),d,d.onDidChange(g),d.onDidCreate(g),d.onDidDelete(g)),Yt(e).then(()=>{n.refresh()})}function Po(){}0&&(module.exports={activate,deactivate});
