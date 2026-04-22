"use strict";var Xt=Object.create;var fe=Object.defineProperty;var Zt=Object.getOwnPropertyDescriptor;var en=Object.getOwnPropertyNames;var tn=Object.getPrototypeOf,nn=Object.prototype.hasOwnProperty;var on=(e,t)=>{for(var n in t)fe(e,n,{get:t[n],enumerable:!0})},Ke=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of en(t))!nn.call(e,s)&&s!==n&&fe(e,s,{get:()=>t[s],enumerable:!(o=Zt(t,s))||o.enumerable});return e};var h=(e,t,n)=>(n=e!=null?Xt(tn(e)):{},Ke(t||!e||!e.__esModule?fe(n,"default",{value:e,enumerable:!0}):n,e)),sn=e=>Ke(fe({},"__esModule",{value:!0}),e);var bo={};on(bo,{activate:()=>ho,deactivate:()=>vo});module.exports=sn(bo);var c=h(require("vscode")),A=h(require("fs")),T=h(require("path"));var Le=h(require("vscode")),xe=h(require("path")),ke=h(require("fs"));var v=h(require("fs")),j=h(require("path")),x=h(require("vscode")),ve=require("child_process");function Q(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function G(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;").replace(/\\/g,"&#92;")}var Z=h(require("fs")),Me=h(require("path")),rn=".agent-metrics-state.json",an=2160*60*60*1e3;function Qe(e){return Me.join(e,rn)}function Xe(e){return Me.join(e,".agent-metrics-runlog.json")}function cn(e){try{return JSON.parse(Z.readFileSync(Qe(e),"utf-8"))}catch{return{}}}function ln(e,t){Z.writeFileSync(Qe(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function dn(e){try{return JSON.parse(Z.readFileSync(Xe(e),"utf-8"))}catch{return{runs:[]}}}function pn(e,t){Z.writeFileSync(Xe(e),JSON.stringify(t,null,2)+`
`,"utf-8")}function un(e){let t=Date.now()-an;return{runs:e.runs.filter(n=>n.completedAt>t)}}var Ee=new Map;function me(e){let t=`${e}:${Date.now()}`;return Ee.set(t,{startedAt:Date.now()}),t}function V(e,t,n){let o=Ee.get(t),s=Date.now(),i=dn(e);i.runs.push({taskId:t.split(":")[0],startedAt:o?.startedAt??s,completedAt:s,success:n});let r=un(i);pn(e,r),Ee.delete(t),gn(e,r)}function gn(e,t){let n=cn(e),o=new Date().toISOString(),s=t.runs;if(n["tasks-run-count"]={value:s.length,lastUpdated:o},s.length>0){let r=s.filter(a=>a.success).length;n["task-success-rate"]={value:Math.round(r/s.length*100),lastUpdated:o}}let i=s.map(r=>(r.completedAt-r.startedAt)/1e3).filter(r=>r>0);if(i.length>0){let r=i.reduce((a,u)=>a+u,0)/i.length;n["task-duration"]={value:Math.round(r),lastUpdated:o}}n["loop-guard-triggers"]||(n["loop-guard-triggers"]={value:0,lastUpdated:o}),ln(e,n)}function fn(e){try{let t=(0,ve.execFileSync)("gh",["secret","list","--json","name"],{cwd:e,encoding:"utf-8",timeout:1e4,stdio:["pipe","pipe","pipe"]});return JSON.parse(t).some(o=>o.name==="COPILOT_PAT")}catch{return!1}}async function Fe(e){let t=await x.window.showInformationMessage("Autopilot needs a GitHub token (repo secret) to assign Copilot to issues. Set it up now using your existing GitHub CLI auth?",{modal:!0},"Set Up Automatically","I'll Do It Manually");if(t==="I'll Do It Manually")return x.env.openExternal(x.Uri.parse("https://github.com/settings/personal-access-tokens/new")),x.window.showInformationMessage("Create a fine-grained PAT with Issues (read/write) and Contents (read/write) permissions, then run: gh secret set COPILOT_PAT in your repo."),!1;if(t!=="Set Up Automatically")return!1;try{let n=(0,ve.execFileSync)("gh",["auth","token"],{cwd:e,encoding:"utf-8",timeout:1e4,stdio:["pipe","pipe","pipe"]}).trim();return n?((0,ve.execFileSync)("gh",["secret","set","COPILOT_PAT","--body",n],{cwd:e,timeout:15e3,stdio:["pipe","pipe","pipe"]}),x.window.showInformationMessage("COPILOT_PAT secret created. Copilot can now be auto-assigned to issues."),!0):(x.window.showErrorMessage("Could not retrieve GitHub CLI token. Run `gh auth login` first."),!1)}catch{return x.window.showErrorMessage("Failed to set up COPILOT_PAT. Make sure `gh` CLI is installed and you're authenticated (`gh auth login`)."),!1}}function we(e){let t=j.join(e,".git","config");if(v.existsSync(t))try{let n=v.readFileSync(t,"utf-8"),o=n.match(/url\s*=\s*https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)/);if(o)return`https://github.com/${o[1]}`;let s=n.match(/url\s*=\s*git@github\.com:([^/\s]+\/[^/\s.]+)/);return s?`https://github.com/${s[1]}`:void 0}catch{return}}var mn=j.join(".github","config",".scheduled-tasks-state.json");function Ze(e){return j.join(e,mn)}function hn(e){try{return JSON.parse(v.readFileSync(Ze(e),"utf-8"))}catch{return{}}}function et(e,t){let n=hn(e);n[t]={lastRun:new Date().toISOString()};let o=Ze(e),s=j.dirname(o);v.existsSync(s)||v.mkdirSync(s,{recursive:!0}),v.writeFileSync(o,JSON.stringify(n,null,2)+`
`,"utf-8")}var be=null,tt="alex.scheduledRuns";function nt(e){be=e}function ot(){return be?.get(tt)??{}}function st(e){be&&be.update(tt,e)}function it(e){let t=ot();delete t[e],st(t)}function he(e,t){let n=ot();n[e]=t,st(n)}function rt(e){let t=new Map(e.map(r=>[r.id,r])),n=new Set,o=new Set,s=[];function i(r){if(n.has(r)||o.has(r))return;o.add(r);let a=t.get(r);if(a?.dependsOn)for(let u of a.dependsOn)t.has(u)&&i(u);o.delete(r),n.add(r),a&&s.push(a)}for(let r of e)i(r.id);for(let r of e)n.has(r.id)||s.push(r);return s}function vn(e){let t=e.match(/github\.com\/([^/]+)\/([^/]+)/);if(t)return{owner:t[1],repo:t[2]}}async function ye(e,t,n,o){let s=vn(e);if(!s)throw new Error("Cannot parse GitHub owner/repo from URL");let i=me(t),r=o??x.workspace.workspaceFolders?.[0]?.uri.fsPath,{owner:a,repo:u}=s,p=`scheduled-${t}.yml`,d={Authorization:`Bearer ${(await x.authentication.getSession("github",["repo"],{createIfNone:!0})).accessToken}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"alex-cognitive-architecture"};he(t,{status:"queued"}),n({status:"queued"});let m=new Date().toISOString(),S=`https://api.github.com/repos/${a}/${u}/actions/workflows/${p}/dispatches`,b=await fetch(S,{method:"POST",headers:{...d,"Content-Type":"application/json"},body:JSON.stringify({ref:"main"})});if(!b.ok){let W=await b.text(),De={status:"error"};throw he(t,De),n(De),r&&V(r,i,!1),new Error(`Dispatch failed (${b.status}): ${W}`)}let I=`https://api.github.com/repos/${a}/${u}/actions/workflows/${p}/runs?per_page=1&created=>${m.slice(0,19)}Z`,y=0,M=120,U=5e3,X=async()=>{if(y++,y>M){let W={status:"error"};he(t,W),n(W),r&&V(r,i,!1);return}try{let W=await fetch(I,{headers:d});if(!W.ok)return K();let z=(await W.json()).workflow_runs?.[0];if(!z)return K();let Ye={status:z.status==="completed"?z.conclusion==="success"?"completed":z.conclusion??"failure":z.status??"in_progress",runUrl:z.html_url,conclusion:z.conclusion??void 0};if(he(t,Ye),n(Ye),z.status!=="completed")return K();r&&V(r,i,z.conclusion==="success")}catch{return K()}},O=!1,F=[],K=()=>{O||F.push(setTimeout(()=>void X(),U))};return F.push(setTimeout(()=>void X(),3e3)),{dispose:()=>{O=!0,F.forEach(clearTimeout)}}}function re(e){let t=j.join(e,".github","config","scheduled-tasks.json");if(!v.existsSync(t))return[];try{return JSON.parse(v.readFileSync(t,"utf-8")).tasks??[]}catch{return[]}}function at(e,t){let n=j.join(e,".github","config","scheduled-tasks.json");if(!v.existsSync(n))return null;try{let o=JSON.parse(v.readFileSync(n,"utf-8")),s=o.tasks?.find(i=>i.id===t);return s?(s.enabled=!s.enabled,v.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),s.enabled?gt(e,s):ft(e,s.id),o.tasks):null}catch{return null}}function ct(e,t){let n=j.join(e,".github","config","scheduled-tasks.json");if(!v.existsSync(n))return null;try{let o=JSON.parse(v.readFileSync(n,"utf-8")),s=o.tasks?.findIndex(i=>i.id===t);return s===void 0||s<0?null:(o.tasks.splice(s,1),v.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),ft(e,t),o.tasks)}catch{return null}}function lt(e,t){let n=j.join(e,".github","workflows",`scheduled-${t}.yml`);return v.existsSync(n)}function dt(e){return j.join(e,".github","workflows")}function Oe(e,t){return j.join(dt(e),`scheduled-${t}.yml`)}function ee(e){return e.replace(/[\\"`$!#&|;(){}<>]/g,"")}function pt(e){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e))throw new Error(`Invalid task ID: "${e}". Must be lowercase alphanumeric with hyphens.`);return e}function ut(e){if(!/^[0-9*\/,\- ]+$/.test(e))throw new Error(`Invalid cron expression: "${e}".`);return e}function bn(e){let t=ee(e.name),n=pt(e.id),o=ut(e.schedule);return`# Auto-generated \u2014 do not edit manually
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
          PROMPT_FILE: "${ee(e.promptFile??"")}"
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
`}function wn(e){let t=ee(e.name),n=ee(e.description),o=e.muscle?ee(e.muscle):"",s=e.muscleArgs?` ${e.muscleArgs.map(ee).join(" ")}`:"",i=pt(e.id),r=ut(e.schedule);return`# Auto-generated \u2014 do not edit manually
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
`}function gt(e,t){let n;if(t.mode==="agent"&&t.promptFile)n=bn(t);else if(t.mode==="direct"&&t.muscle)n=wn(t);else return!1;let o=dt(e);return v.existsSync(o)||v.mkdirSync(o,{recursive:!0}),v.writeFileSync(Oe(e,t.id),n,"utf-8"),!0}function ft(e,t){let n=Oe(e,t);v.existsSync(n)&&v.unlinkSync(n)}function yn(e,t){let n=j.join(e,".github","config","scheduled-tasks.json");try{let o;if(v.existsSync(n))o=JSON.parse(v.readFileSync(n,"utf-8"));else{let s=j.dirname(n);v.existsSync(s)||v.mkdirSync(s,{recursive:!0}),o={version:"1.0.0",tasks:[]}}return o.tasks.some(s=>s.id===t.id)?(x.window.showWarningMessage(`Task "${t.id}" already exists.`),!1):(o.tasks.push(t),v.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0)}catch{return!1}}var xn=[{label:"Every 3 hours",cron:"0 */3 * * *",description:"8 times/day"},{label:"Every 6 hours",cron:"0 */6 * * *",description:"4 times/day"},{label:"Every 12 hours",cron:"0 */12 * * *",description:"Twice daily"},{label:"Daily at 8 AM",cron:"0 8 * * *",description:"Once daily (UTC)"},{label:"Daily at noon",cron:"0 12 * * *",description:"Once daily (UTC)"},{label:"Weekly Monday",cron:"0 8 * * 1",description:"Every Monday 8 AM UTC"},{label:"Weekly Friday",cron:"0 16 * * 5",description:"Every Friday 4 PM UTC"},{label:"Custom cron...",cron:"",description:"Enter POSIX cron expression"}];async function mt(e){let t=await x.window.showInputBox({title:"Add Scheduled Task (1/5)",prompt:"Task name",placeHolder:"e.g. Weekly Code Review",validateInput:g=>g.trim()?void 0:"Name is required"});if(!t)return!1;let n=await x.window.showInputBox({title:"Add Scheduled Task (2/5)",prompt:"Brief description",placeHolder:"What does this automation do?",validateInput:g=>g.trim()?void 0:"Description is required"});if(!n)return!1;let o=await x.window.showQuickPick([{label:"$(hubot) Cloud Agent",description:"Creates a GitHub issue assigned to Copilot",detail:"Best for creative tasks: writing, analysis, reviews",mode:"agent"},{label:"$(terminal) Direct",description:"Runs a script in GitHub Actions",detail:"Best for mechanical tasks: audits, builds, syncs",mode:"direct"}],{title:"Add Scheduled Task (3/5)",placeHolder:"Execution mode"});if(!o)return!1;let s=await x.window.showQuickPick(xn.map(g=>({label:g.label,description:g.description,cron:g.cron})),{title:"Add Scheduled Task (4/5)",placeHolder:"Schedule frequency"});if(!s)return!1;let i=s.cron;if(!i){let g=await x.window.showInputBox({title:"Custom Cron Expression",prompt:"POSIX cron: minute hour day-of-month month day-of-week",placeHolder:"0 */4 * * *",validateInput:l=>l.trim().split(/\s+/).length===5?void 0:"Must be 5 space-separated fields"});if(!g)return!1;i=g.trim()}let r=j.join(e,".github","skills"),a;if(v.existsSync(r)){let g=v.readdirSync(r,{withFileTypes:!0}).filter(l=>l.isDirectory()).map(l=>({label:l.name}));if(g.length>0){let l=await x.window.showQuickPick([{label:"(none)",description:"No specific skill"},...g],{title:"Add Scheduled Task (5/5)",placeHolder:"Associate a skill (optional)"});l&&l.label!=="(none)"&&(a=l.label)}}let u=t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");if(!u)return x.window.showErrorMessage("Task name must contain at least one letter or digit."),!1;let p={id:u,name:t,description:n,mode:o.mode,schedule:i,enabled:!0,...a?{skill:a}:{},...o.mode==="agent"?{promptFile:`.github/config/scheduled-tasks/${u}.md`}:{}};if(yn(e,p)){if(o.mode==="agent"&&p.promptFile){let d=j.join(e,p.promptFile),m=j.dirname(d);if(v.existsSync(m)||v.mkdirSync(m,{recursive:!0}),!v.existsSync(d)){let S=[`# ${t}`,"","## Task","",`${n}`,"","## Instructions","","1. Read relevant context from the repository","2. Perform the task","3. Create a PR with your changes","","## Quality Standards","","- Follow existing project conventions","- Include meaningful commit messages","- Ensure all tests pass before submitting",""].join(`
`);v.writeFileSync(d,S,"utf-8")}x.commands.executeCommand("vscode.open",x.Uri.file(d))}gt(e,p),o.mode==="agent"&&!fn(e)&&Fe(e);let g=o.mode==="agent"?`Task "${t}" created with workflow. Edit the prompt template, then commit & push to activate on GitHub.`:`Task "${t}" created with workflow. Commit & push to activate on GitHub.`,l=o.mode==="agent"?"Edit Prompt":"View Workflow";return x.window.showInformationMessage(g,l).then(d=>{if(d==="Edit Prompt"&&p.promptFile){let m=j.join(e,p.promptFile);x.commands.executeCommand("vscode.open",x.Uri.file(m))}else if(d==="View Workflow"){let m=Oe(e,p.id);x.commands.executeCommand("vscode.open",x.Uri.file(m))}}),!0}return!1}var ht=`
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
`;var vt=async(e,t,n,o)=>e.command==="autopilot"?kn(e,n):e.command==="cloud"?Sn(e,n,o):{};async function kn(e,t){let n=Le.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!n)return t.markdown("Open a workspace folder to use Autopilot."),{};let o=re(n),s=e.prompt.trim().toLowerCase();if(s==="list"||s===""){t.markdown(`## Autopilot Tasks

`);let i=rt(o);for(let r of i){let a=r.mode==="agent"?"\u{1F916}":"\u2699\uFE0F",u=r.enabled?"Active":"Paused",p=r.dependsOn?.length?` \u2190 depends on: ${r.dependsOn.join(", ")}`:"";t.markdown(`- ${a} **${r.name}** \u2014 ${u}${p}
`)}return t.markdown(`
*${o.length} tasks configured. Use \`/autopilot status\` for run history.*`),{}}if(s==="status"){t.markdown(`## Autopilot Status

`);let i=o.filter(a=>a.enabled),r=o.filter(a=>!a.enabled);t.markdown(`**${i.length}** active \xB7 **${r.length}** paused

`);for(let a of i)t.markdown(`- **${a.name}** \u2014 \`${a.schedule}\`
`);return{}}if(s.startsWith("run ")){let i=s.slice(4).trim(),r=o.find(a=>a.id===i);if(!r)return t.markdown(`Task \`${i}\` not found. Use \`/autopilot list\` to see available tasks.`),{};if(r.mode==="agent"&&r.promptFile){let a=xe.join(n,r.promptFile),u=xe.resolve(a);if(!u.toLowerCase().startsWith(n.toLowerCase()))return t.markdown("Invalid prompt file path."),{};if(ke.existsSync(u)){let p=ke.readFileSync(u,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();t.markdown(`Running **${r.name}**...

${p}`)}else t.markdown(`Prompt file not found: \`${r.promptFile}\``)}else t.markdown(`Task **${r.name}** uses direct mode (script: \`${r.muscle??"n/a"}\`). Run it from the Autopilot tab or GitHub Actions.`);return{}}return t.markdown(`## Autopilot Commands

`),t.markdown("- `/autopilot list` \u2014 Show all configured tasks\n"),t.markdown("- `/autopilot status` \u2014 Show active tasks and schedules\n"),t.markdown("- `/autopilot run <task-id>` \u2014 Run a specific task\n"),{}}async function Sn(e,t,n){let o=Le.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!o)return t.markdown("Open a workspace folder to use cloud dispatch."),{};let s=re(o),i=e.prompt.trim().toLowerCase();if(i===""||i==="help")return t.markdown(`## Cloud Dispatch

`),t.markdown(`Dispatch Autopilot tasks to GitHub Actions for cloud execution.

`),t.markdown("- `/cloud list` \u2014 Show cloud-eligible tasks\n"),t.markdown("- `/cloud run <task-id>` \u2014 Dispatch a task to GitHub Actions\n"),{};if(i==="list"){let r=s.filter(a=>a.enabled&&a.mode==="agent");if(r.length===0)return t.markdown("No cloud-eligible tasks found. Enable agent-mode tasks in scheduled-tasks.json."),{};t.markdown(`## Cloud-Eligible Tasks

`);for(let a of r)t.markdown(`- **${a.id}** \u2014 ${a.name}
`);return t.markdown("\n*Use `/cloud run <task-id>` to dispatch.*"),{}}if(i.startsWith("run ")){let r=i.slice(4).trim(),a=s.find(p=>p.id===r);if(!a)return t.markdown(`Task \`${r}\` not found. Use \`/cloud list\` to see eligible tasks.`),{};if(!a.enabled)return t.markdown(`Task **${a.name}** is paused. Enable it first.`),{};let u=we(o);if(!u)return t.markdown("Could not determine GitHub repo URL from workspace."),{};t.markdown(`Dispatching **${a.name}** to GitHub Actions...

`);try{let p=await ye(u,a.id,()=>{},o);n.onCancellationRequested(()=>p.dispose()),t.markdown("Workflow dispatched. Check the Autopilot tab or GitHub Actions for progress.")}catch(p){let l=(p instanceof Error?p.message:String(p)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");t.markdown(`Dispatch failed: ${l}`)}return{}}return t.markdown("Unknown cloud command. Use `/cloud help` for usage."),{}}var f=h(require("vscode")),Mt=h(require("crypto")),J=h(require("fs")),R=h(require("path")),ne=h(require("os"));var q=h(require("fs")),_=h(require("path")),Ae=require("child_process");function Se(e,t){return Math.abs(t.getTime()-e.getTime())/(1e3*60*60*24)}function An(e){let t=new Date,n=e.lastDreamDate?Math.floor(Se(e.lastDreamDate,t)):1/0;return e.dreamNeeded&&n>14||e.syncStale&&n>3?"critical":e.dreamNeeded||n>7||e.syncStale?"attention":"healthy"}function Cn(e){let t=_.join(e,".github","quality","dream-report.json");try{let n=q.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function Pn(e){let t=_.join(e,".github",".sync-manifest.json");try{let n=q.readFileSync(t,"utf-8");return JSON.parse(n)}catch{return null}}function Tn(){try{let e=_.resolve(__dirname,"..","package.json");return JSON.parse(q.readFileSync(e,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}}function In(e){let t=Pn(e);if(!t)return!1;let n=Tn();if(t.brainVersion!==n)return!0;let o=new Date(t.lastSync);return!!(isNaN(o.getTime())||Se(o,new Date)>7)}function $n(e){try{let t=(0,Ae.execFileSync)("git",["diff","--cached","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),n=(0,Ae.execFileSync)("git",["diff","--name-only"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim(),o=t?t.split(`
`).length:0,s=n?n.split(`
`).length:0,i=o+s;if(i===0)return{fileCount:0,days:0};let r=0;try{let a=(0,Ae.execFileSync)("git",["log","-1","--format=%ci"],{cwd:e,encoding:"utf-8",timeout:5e3}).trim();a&&(r=Math.floor(Se(new Date(a),new Date)))}catch{}return{fileCount:i,days:r}}catch{return{fileCount:0,days:0}}}function jn(e){let t=_.join(e,".github"),n=s=>{try{return q.readdirSync(s,{withFileTypes:!0}).filter(i=>i.isDirectory()).length}catch{return 0}},o=(s,i,r=!1)=>{try{if(!r)return q.readdirSync(s).filter(p=>p.endsWith(i)).length;let a=0,u=p=>{for(let g of q.readdirSync(p,{withFileTypes:!0}))g.isDirectory()?u(_.join(p,g.name)):g.name.endsWith(i)&&a++};return u(s),a}catch{return 0}};return{skills:n(_.join(t,"skills")),instructions:o(_.join(t,"instructions"),".instructions.md"),prompts:o(_.join(t,"prompts"),".prompt.md",!0),agents:o(_.join(t,"agents"),".agent.md")}}function bt(e){let t=Cn(e),n=jn(e),o=t?new Date(t.timestamp):null,s=t?t.brokenRefs.length>0||t.trifectaIssues.length>20:!0,i=$n(e),r={status:"healthy",skillCount:n.skills,instructionCount:n.instructions,promptCount:n.prompts,agentCount:n.agents,lastDreamDate:o,dreamNeeded:s,syncStale:In(e),uncommittedFileCount:i.fileCount,uncommittedDays:i.days};return r.status=An(r),r}function Rn(e,t){let n=(t.getTime()-e.getTime())/864e5,o=Math.LN2/7;return Math.exp(-o*n)}function Dn(e,t=new Date){let n=new Date(e.lastUsed),o=Rn(n,t);return Math.sqrt(e.count)*o}function wt(e,t,n=new Date){return e.actions.find(s=>s.id===t)?{...e,actions:e.actions.map(s=>s.id===t?{...s,count:s.count+1,lastUsed:n.toISOString()}:s)}:{...e,actions:[...e.actions,{id:t,count:1,lastUsed:n.toISOString()}]}}function yt(e,t,n=new Date){let o=new Map;for(let r of t.actions){let a=Dn(r,n);a>=.1&&o.set(r.id,a)}let s=e.filter(r=>o.has(r)),i=e.filter(r=>!o.has(r));return s.sort((r,a)=>(o.get(a)??0)-(o.get(r)??0)),[...s,...i]}function xt(){return{version:1,actions:[]}}var En=["Two minds, one vision","Better together than alone","Your ideas, amplified","Where human meets machine","The sum of us","Let's build something meaningful","From thought to reality","Creating what neither could alone","Turning possibility into code","What will we make today?","Exploring the edge of possible","Learning never looked like this","Growing smarter, together","Every question opens a door","Uncharted territory, good company","I see what you're building","Your vision, our journey","Thinking alongside you","Understanding before answering"],Mn=["Still here, still building","Every pause is a chance to reflect","The best work takes time","Progress isn't always visible","Let's pick up where we left off","Good things are worth the wait","One conversation at a time"],Fn=["Fresh starts are powerful","We'll figure this out","The first step is showing up","Building begins with connection","Ready when you are","Together, we'll find the way"],On=["Two minds, ready to build","Let's see what we can create","The beginning of something","Your partner in possibility"],Ln=["A new day to create","Fresh ideas await","What will we build today?"],Nn=["Wrapping up what we started","Good work deserves reflection","Tomorrow we build on today"];function Un(e=new Date){let t=e.getHours();return t<12?"morning":t<18?"afternoon":"evening"}function kt(e=new Date){let t=new Date(e.getFullYear(),0,0),n=e.getTime()-t.getTime(),o=1e3*60*60*24;return Math.floor(n/o)}function Ce(e,t=new Date){let n=kt(t);return e[n%e.length]}function Gn(e){switch(e){case"healthy":return En;case"attention":return Mn;case"critical":return Fn;default:return On}}function St(e,t,n){let o=n.join(e,".github","config","taglines.json");if(!t.existsSync(o))return null;try{let s=t.readFileSync(o,"utf-8"),i=JSON.parse(s);return!i.taglines?.project||i.taglines.project.length===0?null:i}catch{return null}}function _n(e){let t=[];for(let n of Object.keys(e.taglines)){let o=e.taglines[n];Array.isArray(o)&&t.push(...o)}return t}function At(e={}){let{status:t="unknown",config:n,useTimeOfDay:o=!0,date:s=new Date}=e,i=kt(s);if(n&&t==="healthy"){let a=n.rotation?.projectWeight??50,u=Math.floor(a);if(i%100<u){let g=_n(n);if(g.length>0)return Ce(g,s)}}if(o&&t==="healthy"&&i%10===0){let a=Un(s);if(a==="morning")return Ce(Ln,s);if(a==="evening")return Ce(Nn,s)}let r=Gn(t);return Ce(r,s)}var H=h(require("fs")),te=h(require("path"));function Hn(e){let t=e.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);return t?e.slice(t[0].length).trim():e.trim()}function Bn(e){let t=te.join(e,".github","skills");if(!H.existsSync(t))return[];let n=[],o;try{o=H.readdirSync(t,{withFileTypes:!0})}catch{return[]}for(let s of o){if(!s.isDirectory())continue;let i=te.join(t,s.name,"loop-config.partial.json");if(H.existsSync(i))try{let r=JSON.parse(H.readFileSync(i,"utf-8"));if(Array.isArray(r.groups))for(let a of r.groups)n.push({...a,source:"skill"})}catch{}}return n}function Wn(e,t){let n=e.map(o=>({...o,buttons:[...o.buttons]}));for(let o of t){let s=n.find(i=>i.id===o.id);if(s){let i=new Set(s.buttons.map(r=>r.id??r.label));for(let r of o.buttons){let a=r.id??r.label;i.has(a)||(s.buttons.push(r),i.add(a))}}else n.push({...o,buttons:[...o.buttons]})}return n}function zn(e,t){return t?e.filter(n=>!n.phase||n.phase.includes(t)).map(n=>{let o=n.buttons.filter(i=>!i.phase||i.phase.includes(t)),s=n.phase?.includes(t);return{...n,buttons:o,collapsed:s?!1:n.collapsed}}).filter(n=>n.buttons.length>0):e}function Vn(e,t){let n={id:e.id,icon:e.icon,label:e.label,command:e.command,hint:e.hint,tooltip:e.tooltip};if(e.promptFile){let o=te.join(t,e.promptFile);try{H.existsSync(o)&&(n.prompt=Hn(H.readFileSync(o,"utf-8")))}catch{}}return!n.prompt&&e.prompt&&(n.prompt=e.prompt),e.file&&(n.file=e.file),n}function Ct(e){let t=te.join(e,".github","config","loop-menu.json");if(!H.existsSync(t))return[];let n;try{n=JSON.parse(H.readFileSync(t,"utf-8"))}catch{return[]}if(!Array.isArray(n.groups))return[];let o=Bn(e),s=Wn(n.groups,o),i=zn(s,n.projectPhase),r=te.join(e,".github","prompts","loop");return i.map(a=>({id:a.id,label:a.label,desc:a.desc,accent:a.accent,icon:a.icon,collapsed:a.collapsed,buttons:a.buttons.map(u=>Vn(u,r))}))}var Pe=h(require("vscode")),$t=require("child_process");var ae={recentAgentPRs:[],pendingReviews:[],totalPending:0,lastFetched:null,error:null};function Pt(e,t){return new Promise(n=>{let o=e.split(/\s+/);(0,$t.execFile)("gh",o,{cwd:t,timeout:15e3,maxBuffer:1024*1024},(s,i)=>{if(s){n(null);return}n(i.trim())})})}function Tt(e){if(!e)return[];try{return JSON.parse(e).map(n=>({number:n.number,title:n.title,url:n.url,state:n.state,author:n.author?.login??"unknown",createdAt:n.createdAt,updatedAt:n.updatedAt,isDraft:n.isDraft??!1,reviewDecision:n.reviewDecision??"",labels:(n.labels??[]).map(o=>o.name)}))}catch{return[]}}var It="number,title,url,state,author,createdAt,updatedAt,isDraft,reviewDecision,labels";var Ne=!1;async function Ue(e,t){if(!Ne){Ne=!0;try{let[n,o]=await Promise.all([Pt(`pr list --author app/copilot-swe-agent --state all --limit 10 --json ${It}`,e),Pt(`pr list --search review-requested:@me --state open --limit 10 --json ${It}`,e)]),s=Tt(n),i=Tt(o);ae={recentAgentPRs:s,pendingReviews:i,totalPending:i.length,lastFetched:new Date,error:null}}catch(n){ae={...ae,error:n instanceof Error?n.message:String(n)}}Ne=!1,t?.()}}var $=null;function jt(e){return $=Pe.window.createStatusBarItem(Pe.StatusBarAlignment.Right,50),$.command="alex.openChat",$.name="Alex Agent Activity",e.subscriptions.push($),$}function Ge(e){if(!$)return;if(!e){$.text="$(brain) Alex",$.tooltip="Alex Cognitive Architecture",$.show();return}let t=ae.pendingReviews;t.length>0?($.text=`$(brain) Alex $(bell-dot) ${t.length}`,$.tooltip=`${t.length} PR${t.length===1?"":"s"} awaiting review`):($.text="$(brain) Alex",$.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"),$.show(),Ue(e,()=>{let n=ae.pendingReviews;$&&(n.length>0?($.text=`$(brain) Alex $(bell-dot) ${n.length}`,$.tooltip=`${n.length} PR${n.length===1?"":"s"} awaiting review`):($.text="$(brain) Alex",$.tooltip="Alex Cognitive Architecture \u2014 no pending reviews"))})}var Rt=`
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
`;var qn="alex.welcomeView";function _e(){let e=ne.platform();return e==="win32"?R.join(process.env.APPDATA||R.join(ne.homedir(),"AppData","Roaming"),"Code","User"):e==="darwin"?R.join(ne.homedir(),"Library","Application Support","Code","User"):R.join(process.env.XDG_CONFIG_HOME||R.join(ne.homedir(),".config"),"Code","User")}var Jn=R.resolve(__dirname,"..","package.json"),Ft=(()=>{try{return JSON.parse(J.readFileSync(Jn,"utf-8")).version??"0.0.0"}catch{return"0.0.0"}})(),He="https://github.com/fabioc-aloha/alex-cognitive-architecture/wiki",Yn=[{id:"workspace",label:"WORKSPACE",icon:"folder",desc:"Initialize and upgrade your cognitive architecture",collapsed:!1,buttons:[{icon:"sync",label:"Initialize Workspace",command:"initialize",tooltip:"Install Alex brain files in this workspace",hint:"command"},{icon:"arrow-up",label:"Upgrade Architecture",command:"upgrade",tooltip:"Update to the latest brain architecture",hint:"command"},{icon:"cloud",label:"Setup AI-Memory",command:"setupAIMemory",tooltip:"Find or create the shared AI-Memory knowledge store",hint:"command"}]},{id:"brain-status",label:"BRAIN STATUS",icon:"symbol-structure",desc:"Cognitive architecture health and maintenance",collapsed:!1,buttons:[{icon:"symbol-event",label:"Run Dream Protocol",command:"dream",tooltip:"Run brain health check then fix issues",hint:"command"},{icon:"shield",label:"Brain Health Check",command:"brainQA",tooltip:"Generate brain health quality grid",hint:"command"},{icon:"check-all",label:"Validate Skills",command:"validateSkills",tooltip:"Check all skills for compliance",hint:"command"},{icon:"dashboard",label:"Token Cost Report",command:"tokenCostReport",tooltip:"Measure brain file token costs",hint:"command"},{icon:"heart",label:"Meditate",command:"openChat",prompt:"Run a meditation session \u2014 consolidate knowledge, review recent changes, and strengthen architecture",tooltip:"Knowledge consolidation session",hint:"chat"},{icon:"graph",label:"Self-Actualize",command:"openChat",prompt:"Run a self-actualization assessment \u2014 evaluate architecture completeness, identify growth areas, and plan improvements",tooltip:"Deep self-assessment and growth",hint:"chat"}]},{id:"tools",label:"TOOLS",icon:"tools",desc:"Muscle-backed development utilities",collapsed:!0,buttons:[{icon:"add",label:"New Skill",command:"newSkill",tooltip:"Scaffold a new skill from template",hint:"command"},{icon:"person-add",label:"New Agent",command:"createCustomAgent",tooltip:"Scaffold a custom agent with frontmatter",hint:"command"},{icon:"warning",label:"Lint Markdown",command:"markdownLint",tooltip:"Validate current file for converter readiness",hint:"command"},{icon:"lightbulb",label:"Extract Insights",command:"insightPipeline",tooltip:"Extract cross-project insights",hint:"command"},{icon:"references",label:"Set Package Context",command:"setContext",tooltip:"Switch active package in monorepo projects",hint:"command"}]},{id:"user-memory",label:"USER MEMORY",icon:"notebook",desc:"Access your persistent memory locations",collapsed:!0,buttons:[{icon:"notebook",label:"Memories",command:"openMemories",tooltip:"Open VS Code user memories folder",hint:"command"},{icon:"edit",label:"User Prompts",command:"openPrompts",tooltip:"Reusable prompt templates",hint:"command"},{icon:"server",label:"MCP Config",command:"openMcpConfig",tooltip:"Model Context Protocol servers",hint:"command"},{icon:"cloud",label:"Copilot Memory (GitHub)",command:"openExternal",file:"https://github.com/settings/copilot",tooltip:"Manage cloud-synced Copilot memory",hint:"link"}]},{id:"environment",label:"ENVIRONMENT",icon:"settings-gear",desc:"Extension settings",collapsed:!0,buttons:[{icon:"settings-gear",label:"Open Extension Settings",command:"openSettings",tooltip:"Configure Alex extension behavior",hint:"command"}]},{id:"learn",label:"LEARN",icon:"book",desc:"Documentation and support resources",collapsed:!0,buttons:[{icon:"book",label:"Documentation",command:"openExternal",file:`${He}`,tooltip:"Full documentation on GitHub Wiki",hint:"link"},{icon:"comment-discussion",label:"User Stories",command:"openExternal",file:`${He}/blog/README`,tooltip:"Real-world examples of working with Alex",hint:"link"},{icon:"mortar-board",label:"Tutorials",command:"openExternal",file:`${He}/tutorials/README`,tooltip:"Step-by-step guides for common tasks",hint:"link"},{icon:"lightbulb",label:"LearnAI Playbooks",command:"openExternal",file:"https://learnai.correax.com/",tooltip:"80 AI playbooks for professional disciplines",hint:"link"},{icon:"bug",label:"Report an Issue",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/issues",tooltip:"Found a bug? Let us know",hint:"link"}]},{id:"about",label:"ABOUT",icon:"info",collapsed:!0,buttons:[{icon:"tag",label:`Version ${Ft}`,command:"noop",tooltip:"Installed extension version"},{icon:"person",label:"Publisher: fabioc-aloha",command:"openExternal",file:"https://github.com/fabioc-aloha",hint:"link",tooltip:"View publisher on GitHub"},{icon:"law",label:"PolyForm Noncommercial 1.0.0",command:"openExternal",file:"https://github.com/fabioc-aloha/alex-cognitive-architecture/blob/main/LICENSE.md",hint:"link",tooltip:"View license"}]}],Kn=["https://github.com/","https://marketplace.visualstudio.com/","https://learnai.correax.com/"],Dt="alex.quickActionFrecency",ce=class{constructor(t,n){this.extensionUri=t;this.globalState=n;this.workspaceRoot=f.workspace.workspaceFolders?.[0]?.uri.fsPath??"",this.frecencyData=n.get(Dt)??xt()}static viewId=qn;view;workspaceRoot;frecencyData;disposables=[];dispose(){for(let t of this.disposables)t.dispose();this.disposables.length=0}recordActionUse(t){this.frecencyData=wt(this.frecencyData,t),this.globalState.update(Dt,this.frecencyData)}loopGroupsCache=null;getLoopGroups(){return this.loopGroupsCache||(this.loopGroupsCache=this.workspaceRoot?Ct(this.workspaceRoot):[]),this.loopGroupsCache}renderGroupsWithFrecency(t){let n=t.map(o=>{if(o.id==="creative-loop")return o;let s=o.buttons.map(a=>a.id??a.label.toLowerCase().replace(/\s+/g,"-")),r=yt(s,this.frecencyData).map(a=>o.buttons.find(u=>(u.id??u.label.toLowerCase().replace(/\s+/g,"-"))===a)).filter(a=>a!==void 0);return{...o,buttons:r}});return Et(n)}refresh(){this.loopGroupsCache=null,this.view&&(this.view.webview.html=this.getHtml(this.view.webview))}resolveWebviewView(t,n,o){this.view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this.extensionUri]},t.webview.html=this.getHtml(t.webview),this.workspaceRoot&&Ue(this.workspaceRoot,()=>this.refresh()),t.webview.onDidReceiveMessage(s=>this.handleMessage(s)),t.onDidChangeVisibility(()=>{t.visible&&this.refresh()})}async handleMessage(t){switch(t.actionId&&this.recordActionUse(t.actionId),t.command){case"openChat":if(t.prompt){let n=t.prompt.endsWith(": ");await f.commands.executeCommand("workbench.action.chat.open",{query:t.prompt,isPartialQuery:n})}else await f.commands.executeCommand("workbench.action.chat.open");break;case"initialize":await f.commands.executeCommand("alex.initialize");break;case"upgrade":await f.commands.executeCommand("alex.upgrade");break;case"setupAIMemory":await f.commands.executeCommand("alex.setupAIMemory");break;case"dream":await f.commands.executeCommand("alex.dream");break;case"brainQA":await f.commands.executeCommand("alex.brainQA");break;case"validateSkills":await f.commands.executeCommand("alex.validateSkills");break;case"tokenCostReport":await f.commands.executeCommand("alex.tokenCostReport");break;case"newSkill":await f.commands.executeCommand("alex.newSkill");break;case"createCustomAgent":await f.commands.executeCommand("alex.createCustomAgent");break;case"markdownLint":await f.commands.executeCommand("alex.markdownLint");break;case"insightPipeline":await f.commands.executeCommand("alex.insightPipeline");break;case"setContext":await f.commands.executeCommand("alex.setContext");break;case"openSettings":await f.commands.executeCommand("workbench.action.openSettings","alex");break;case"openMemories":{let n=f.Uri.file(R.join(_e(),"globalStorage","github.copilot-chat","memory-tool","memories"));try{await f.commands.executeCommand("revealFileInOS",n)}catch{await f.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openPrompts":{let n=f.Uri.file(R.join(_e(),"prompts"));try{await f.commands.executeCommand("revealFileInOS",n)}catch{await f.commands.executeCommand("vscode.openFolder",n,{forceNewWindow:!1})}}break;case"openMcpConfig":{let n=f.Uri.file(R.join(_e(),"mcp.json"));await f.commands.executeCommand("vscode.open",n)}break;case"openExternal":if(t.file){let n=String(t.file);Kn.some(o=>n.startsWith(o))&&await f.env.openExternal(f.Uri.parse(n))}break;case"refresh":this.refresh();break;case"toggleTask":if(this.workspaceRoot&&t.file){let n=at(this.workspaceRoot,t.file);if(n){this.refresh();let o=n.find(s=>s.id===t.file);if(o){let s=o.enabled?"enabled":"disabled",i=o.enabled?"Workflow created.":"Workflow removed.";f.window.showInformationMessage(`Task "${o.name}" ${s}. ${i} Commit & push to activate on GitHub.`)}}}break;case"addTask":this.workspaceRoot&&await mt(this.workspaceRoot)&&this.refresh();break;case"setupCopilotPAT":this.workspaceRoot&&(await Fe(this.workspaceRoot),this.refresh());break;case"deleteTask":this.workspaceRoot&&t.file&&await f.window.showWarningMessage(`Delete task "${t.file}"?`,{modal:!0},"Delete")==="Delete"&&ct(this.workspaceRoot,t.file)!==null&&(this.refresh(),f.window.showInformationMessage(`Task "${t.file}" deleted. Commit & push to remove the workflow from GitHub.`));break;case"openPromptFile":if(this.workspaceRoot&&t.file){let n=R.resolve(this.workspaceRoot,t.file);if(!n.toLowerCase().startsWith(this.workspaceRoot.toLowerCase()+R.sep)&&n.toLowerCase()!==this.workspaceRoot.toLowerCase())break;J.existsSync(n)?await f.commands.executeCommand("vscode.open",f.Uri.file(n)):f.window.showWarningMessage(`Prompt file not found: ${t.file}`)}break;case"runTask":if(this.workspaceRoot&&t.file){let n=we(this.workspaceRoot),o=lt(this.workspaceRoot,t.file);if(et(this.workspaceRoot,t.file),this.refresh(),n&&o)try{let s=await ye(n,t.file,i=>{this.refresh()},this.workspaceRoot);this.disposables.push(s),f.window.showInformationMessage(`Workflow dispatched for "${t.file}". Monitoring execution\u2026`)}catch(s){let i=s instanceof Error?s.message:String(s);f.window.showErrorMessage(`Failed to dispatch workflow: ${i}`)}else{let s=me(t.file),r=re(this.workspaceRoot).find(a=>a.id===t.file);if(r?.promptFile){let a=R.resolve(this.workspaceRoot,r.promptFile),u=this.workspaceRoot.toLowerCase()+R.sep;if(!a.toLowerCase().startsWith(u))break;if(J.existsSync(a)){let p=J.readFileSync(a,"utf-8").replace(/^---[\s\S]*?---\s*/,"").trim();await f.commands.executeCommand("workbench.action.chat.open",{query:p,isPartialQuery:!1}),V(this.workspaceRoot,s,!0)}else f.window.showWarningMessage(`Prompt file not found: ${r.promptFile}`),V(this.workspaceRoot,s,!1)}else V(this.workspaceRoot,s,!1)}}break;case"clearRunStatus":t.file&&(it(t.file),this.refresh());break;case"openScheduleConfig":if(this.workspaceRoot){let n=R.join(this.workspaceRoot,".github","config","scheduled-tasks.json");J.existsSync(n)&&await f.commands.executeCommand("vscode.open",f.Uri.file(n))}break;case"noop":break;case"switchTab":break}}getHtml(t){let n=Qn(),o=t.asWebviewUri(f.Uri.joinPath(this.extensionUri,"dist","codicon.css")),i=(this.workspaceRoot?bt(this.workspaceRoot):null)?.status??"unknown",r=this.workspaceRoot?St(this.workspaceRoot,J,R):null,a=At({status:i,config:r});return`<!DOCTYPE html>
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
    ${Rt}
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
    <div class="tagline">${Q(a)}</div>
    <div class="version">v${Ft}</div>
  </div>

  <!-- Tabs -->
  <div class="tabs" role="tablist">
    <button class="tab active" role="tab" id="tab-btn-loop" data-tab="loop" aria-selected="true" aria-controls="tab-loop">
      <span class="codicon codicon-sync"></span> Loop
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
    ${Et(Yn)}
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
</html>`}};function Qn(){return Mt.randomBytes(16).toString("hex")}function Et(e){return e.map(t=>{let n=t.collapsed===!1?"expanded":"",o=t.icon?`<span class="codicon codicon-${G(t.icon)}"></span>`:"";return`
    <div class="group ${n}" data-group-id="${G(t.id)}">
      <div class="group-header" role="button" tabindex="0" aria-expanded="${t.collapsed===!1}">
        ${o}
        <span>${Q(t.label)}</span>
        <span class="codicon codicon-chevron-right chevron" aria-hidden="true"></span>
      </div>
      ${t.desc?`<div class="group-desc">${Q(t.desc)}</div>`:""}
      <div class="group-content">
        <div class="group-buttons">
          ${t.buttons.map(s=>Ot(s)).join("")}
        </div>
      </div>
    </div>`}).join("")}function Ot(e,t=!1){let n=t?"action-btn primary":"action-btn",o=e.id??e.label.toLowerCase().replace(/\s+/g,"-"),s=[`data-command="${G(e.command)}"`,`data-action-id="${G(o)}"`,e.prompt?`data-prompt="${G(e.prompt)}"`:"",e.file?`data-file="${G(e.file)}"`:"",e.tooltip?`data-tooltip="${G(e.tooltip)}"`:""].filter(Boolean).join(" "),i={chat:"comment-discussion",link:"link-external",command:"zap"},r=e.hint?`<span class="hint-badge" title="${e.hint}"><span class="codicon codicon-${i[e.hint]}"></span></span>`:"";return`<button class="${n}" ${s}>
    <span class="codicon codicon-${G(e.icon)}"></span>
    <span class="btn-label">${Q(e.label)}</span>
    ${r}
  </button>`}var de=h(require("fs")),le=h(require("path"));function w(e,...t){return de.existsSync(le.join(e,...t))}function Lt(e){try{return JSON.parse(de.readFileSync(e,"utf-8"))}catch{return null}}function Xn(e,t){let n=[];(t||w(e,"tsconfig.json"))&&n.push("TypeScript"),(w(e,"requirements.txt")||w(e,"pyproject.toml")||w(e,"setup.py"))&&n.push("Python"),w(e,"go.mod")&&n.push("Go"),w(e,"Cargo.toml")&&n.push("Rust"),(w(e,"pom.xml")||w(e,"build.gradle"))&&n.push("Java");let o={...t?.dependencies??{},...t?.devDependencies??{}};if((o.react||o["react-dom"])&&n.push("React"),o.next&&n.push("Next.js"),o.vue&&n.push("Vue"),o.vitepress&&n.push("VitePress"),o.express&&n.push("Express"),o.fastify&&n.push("Fastify"),o["@azure/functions"]&&n.push("Azure Functions"),o.esbuild&&n.push("esbuild"),o.webpack&&n.push("webpack"),o.vite&&!o.vitepress&&n.push("Vite"),o.vitest&&n.push("Vitest"),o.jest&&n.push("Jest"),o.mocha&&n.push("Mocha"),(o.eslint||w(e,".eslintrc.json")||w(e,"eslint.config.js")||w(e,"eslint.config.mjs"))&&n.push("ESLint"),(o.prettier||w(e,".prettierrc"))&&n.push("Prettier"),w(e,"pyproject.toml"))try{let s=de.readFileSync(le.join(e,"pyproject.toml"),"utf-8");s.includes("fastapi")&&n.push("FastAPI"),s.includes("flask")&&n.push("Flask"),s.includes("django")&&n.push("Django"),s.includes("pytest")&&n.push("pytest"),s.includes("ruff")&&n.push("Ruff"),s.includes("mypy")&&n.push("mypy")}catch{}return(w(e,"Dockerfile")||w(e,"docker-compose.yml")||w(e,"docker-compose.yaml"))&&n.push("Docker"),[...new Set(n)]}function Zn(e,t){let n={},o=t?.scripts??{};o.build&&(n.buildCommand="npm run build"),o["build:prod"]&&(n.buildCommand="npm run build:prod"),o.test&&(n.testCommand="npm test"),o.lint&&(n.lintCommand="npm run lint"),!n.buildCommand&&w(e,"setup.py")&&(n.buildCommand="python setup.py build"),!n.testCommand&&w(e,"pyproject.toml")&&(n.testCommand="pytest"),!n.buildCommand&&w(e,"go.mod")&&(n.buildCommand="go build ./..."),!n.testCommand&&w(e,"go.mod")&&(n.testCommand="go test ./...");let s=["scripts/release-vscode.cjs","scripts/release-full.cjs","scripts/release.cjs","scripts/release.sh","scripts/release.ps1"];for(let i of s)if(w(e,i)){n.releaseScript=i;break}return n}function Te(e){let t=le.join(e,"package.json"),n=Lt(t),o=Xn(e,n),s=Zn(e,n),i="generic";return n&&n.engines?.vscode?(i="vscode-extension",{projectType:i,...s,conventions:o}):w(e,"platforms","vscode-extension","package.json")&&(Lt(le.join(e,"platforms","vscode-extension","package.json"))?.engines??{}).vscode?(i="vscode-extension",{projectType:i,...s,conventions:o}):n&&(n.workspaces||w(e,"lerna.json")||w(e,"pnpm-workspace.yaml"))?(i="monorepo",{projectType:i,...s,conventions:o}):w(e,".vitepress","config.ts")||w(e,".vitepress","config.mts")||w(e,"next.config.js")||w(e,"next.config.mjs")||w(e,"gatsby-config.js")||w(e,"astro.config.mjs")?(i="static-site",{projectType:i,...s,conventions:o}):o.includes("FastAPI")||o.includes("Flask")||o.includes("Django")?(i="python-api",{projectType:i,...s,conventions:o}):w(e,"dbt_project.yml")||w(e,"notebook")||w(e,"synapse")||w(e,".pbixproj")?(i="data-pipeline",{projectType:i,...s,conventions:o}):{projectType:i,...s,conventions:o}}var B=h(require("fs")),pe=h(require("path"));var eo=[{id:"extension-dev",label:"EXTENSION DEV",icon:"extensions",desc:"Package, publish, test, and debug the VS Code extension",collapsed:!0,buttons:[{id:"ext-package",icon:"package",label:"Package VSIX",command:"openChat",prompt:"Package the VS Code extension into a .vsix file. Run the build first, then package with vsce. Report the file size.",hint:"chat",tooltip:"Build and package the extension"},{id:"ext-publish",icon:"cloud-upload",label:"Publish",command:"openChat",prompt:"Run the release preflight checks, then publish the extension to the VS Code Marketplace. Follow the release-management skill.",hint:"chat",tooltip:"Publish to VS Code Marketplace"},{id:"ext-test",icon:"beaker",label:"Extension Tests",command:"openChat",prompt:"Run all extension tests. Report pass/fail counts and any failures with root cause analysis.",hint:"chat",tooltip:"Run extension test suite"},{id:"ext-debug",icon:"debug-alt",label:"Debug Launch",command:"runCommand",file:"workbench.action.debug.start",hint:"command",tooltip:"Launch Extension Development Host"}]}],to=[{id:"api-dev",label:"API DEVELOPMENT",icon:"plug",desc:"Run, test, and document API endpoints",collapsed:!0,buttons:[{id:"api-run",icon:"play",label:"Run Server",command:"openChat",prompt:"Start the API development server. Detect the framework (FastAPI/Flask/Django) and use the appropriate command.",hint:"chat",tooltip:"Start the development server"},{id:"api-test",icon:"beaker",label:"Test API",command:"openChat",prompt:"Run the API test suite with pytest. Report coverage, pass/fail counts, and any failures.",hint:"chat",tooltip:"Run API tests with coverage"},{id:"api-lint",icon:"warning",label:"Lint & Type",command:"openChat",prompt:"Run linting (ruff/flake8) and type checking (mypy/pyright) on the Python codebase. Fix any issues found.",hint:"chat",tooltip:"Run linter and type checker"},{id:"api-docs",icon:"book",label:"API Docs",command:"openChat",prompt:"Review and update the API documentation. Ensure OpenAPI/Swagger specs match the current endpoints.",hint:"chat",tooltip:"Update API documentation"}]}],no=[{id:"pipeline-phases",label:"PIPELINE PHASES",icon:"server-process",desc:"Medallion architecture: ingest, transform, serve",collapsed:!0,buttons:[{id:"bronze",icon:"database",label:"Bronze Layer",command:"openChat",prompt:"Help me work on the Bronze (raw ingestion) layer. Identify data sources, define schemas, implement extraction logic.",hint:"chat",tooltip:"Raw data ingestion patterns"},{id:"silver",icon:"filter",label:"Silver Layer",command:"openChat",prompt:"Help me work on the Silver (cleansed/conformed) layer. Apply data quality rules, standardize schemas, handle nulls and duplicates.",hint:"chat",tooltip:"Cleansing and conforming"},{id:"gold",icon:"star-full",label:"Gold Layer",command:"openChat",prompt:"Help me work on the Gold (business-ready) layer. Build aggregations, KPI calculations, and dimensional models.",hint:"chat",tooltip:"Business-ready aggregations"}]},{id:"data-quality",label:"DATA QUALITY",icon:"verified",desc:"Profile, validate, and trace data lineage",collapsed:!0,buttons:[{id:"profile",icon:"graph-line",label:"Profile Data",command:"openChat",prompt:"Profile the dataset: row counts, null rates, distributions, cardinality, outliers. Present findings in a summary table.",hint:"chat",tooltip:"Statistical data profiling"},{id:"validate",icon:"check",label:"Validate Schema",command:"openChat",prompt:"Validate data schemas against expectations. Check column types, constraints, referential integrity, and naming conventions.",hint:"chat",tooltip:"Schema validation checks"},{id:"lineage",icon:"git-merge",label:"Trace Lineage",command:"openChat",prompt:"Trace data lineage for the selected table or column. Map source-to-target transformations and document the flow.",hint:"chat",tooltip:"Data lineage documentation"}]}],oo=[{id:"site-dev",label:"SITE DEVELOPMENT",icon:"browser",desc:"Dev server, build, deploy, and performance audit",collapsed:!0,buttons:[{id:"site-dev-server",icon:"play",label:"Dev Server",command:"openChat",prompt:"Start the development server for this static site. Detect the framework and use the appropriate dev command.",hint:"chat",tooltip:"Start local dev server"},{id:"site-build",icon:"package",label:"Build Site",command:"openChat",prompt:"Build the static site for production. Report any build warnings or errors.",hint:"chat",tooltip:"Production build"},{id:"site-deploy",icon:"cloud-upload",label:"Deploy",command:"openChat",prompt:"Deploy the site to the configured hosting platform. Run preflight checks first.",hint:"chat",tooltip:"Deploy to hosting"},{id:"site-perf",icon:"dashboard",label:"Performance",command:"openChat",prompt:"Audit site performance: bundle size, image optimization, lazy loading, caching headers, Core Web Vitals.",hint:"chat",tooltip:"Performance and accessibility audit"}]}],so=[{id:"cross-package",label:"CROSS-PACKAGE",icon:"references",desc:"Shared types, dependency updates, and coordinated releases",collapsed:!0,buttons:[{id:"deps-update",icon:"package",label:"Update Deps",command:"openChat",prompt:"Check for outdated dependencies across all packages. Propose coordinated updates that maintain compatibility.",hint:"chat",tooltip:"Cross-package dependency updates"},{id:"shared-types",icon:"symbol-interface",label:"Shared Types",command:"openChat",prompt:"Review shared type definitions across packages. Identify drift, inconsistencies, or missing exports.",hint:"chat",tooltip:"Audit shared type definitions"},{id:"release-all",icon:"rocket",label:"Release Train",command:"openChat",prompt:"Coordinate a release across all packages. Check version consistency, run all tests, update changelogs.",hint:"chat",tooltip:"Coordinated multi-package release"}]}],Nt={"vscode-extension":eo,"python-api":to,"data-pipeline":no,"static-site":oo,monorepo:so,generic:[]};function io(e){try{let t=JSON.parse(B.readFileSync(e,"utf-8"));return Array.isArray(t.groups)?t.groups:[]}catch{return[]}}function ro(e,t){let n=t??Te(e),o=pe.join(e,".github","config","loop-menu.json"),s=io(o),i=new Set(Object.values(Nt).flatMap(g=>g.map(l=>l.id))),r=s.filter(g=>!i.has(g.id)),a=Nt[n.projectType]??[],u=[...r,...a],p={};return n.buildCommand&&(p.buildCommand=n.buildCommand),n.testCommand&&(p.testCommand=n.testCommand),n.lintCommand&&(p.lintCommand=n.lintCommand),n.releaseScript&&(p.releaseScript=n.releaseScript),n.conventions.length>0&&(p.conventions=n.conventions),{$schema:"./loop-config.schema.json",$comment:`Loop tab menu configuration \u2014 auto-generated for ${n.projectType} project. Prompts are loaded from .github/prompts/loop/{promptFile} at runtime.`,version:"1.0",projectType:n.projectType,projectPhase:"active-development",groups:u,...Object.keys(p).length>0?{projectContext:p}:{}}}function Ie(e,t){let n=ro(e,t),o=pe.join(e,".github","config"),s=pe.join(o,"loop-menu.json");try{return B.mkdirSync(o,{recursive:!0}),B.writeFileSync(s,JSON.stringify(n,null,2)+`
`,"utf-8"),!0}catch{return!1}}function Ut(e,t){let n=pe.join(e,".github","config","loop-menu.json");try{if(!B.existsSync(n))return!1;let o=JSON.parse(B.readFileSync(n,"utf-8"));return o.projectPhase=t,B.writeFileSync(n,JSON.stringify(o,null,2)+`
`,"utf-8"),!0}catch{return!1}}var L=h(require("vscode")),C=h(require("fs")),D=h(require("path")),Be=h(require("os"));function Gt(){let e=[],t=Be.homedir();try{for(let o of C.readdirSync(t))if(/^OneDrive/i.test(o)){let s=D.join(t,o,"AI-Memory");C.existsSync(s)&&e.push(s)}}catch{}let n=D.join(t,"Library","CloudStorage");try{if(C.existsSync(n)){for(let o of C.readdirSync(n))if(/^OneDrive/i.test(o)){let s=D.join(n,o,"AI-Memory");C.existsSync(s)&&e.push(s)}}}catch{}for(let o of[D.join(t,"AI-Memory"),D.join(t,".alex","AI-Memory")])C.existsSync(o)&&e.push(o);return e}function ao(){let e=[],t=Be.homedir();try{for(let o of C.readdirSync(t))/^OneDrive/i.test(o)&&e.push(D.join(t,o,"AI-Memory"))}catch{}let n=D.join(t,"Library","CloudStorage");try{if(C.existsSync(n))for(let o of C.readdirSync(n))/^OneDrive/i.test(o)&&e.push(D.join(n,o,"AI-Memory"))}catch{}return e.push(D.join(t,"AI-Memory")),e.push(D.join(t,".alex","AI-Memory")),e}function _t(){let e=L.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&C.existsSync(e))return e;let t=Gt();return t.length>0?t[0]:null}var co=[".github","announcements","feedback","insights","knowledge","patterns"],lo={"global-knowledge.md":`# Global Knowledge

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
`,"user-profile.json":()=>JSON.stringify({name:"",role:"",preferences:{communication:"direct",codeStyle:"",learningStyle:""},updatedAt:new Date().toISOString()},null,2),"project-registry.json":()=>JSON.stringify({version:1,projects:[],updatedAt:new Date().toISOString()},null,2),"index.json":()=>JSON.stringify({version:1,files:[],updatedAt:new Date().toISOString()},null,2)};function po(e){let t=[];C.existsSync(e)||(C.mkdirSync(e,{recursive:!0}),t.push(e));for(let n of co){let o=D.join(e,n);C.existsSync(o)||(C.mkdirSync(o,{recursive:!0}),t.push(o))}for(let[n,o]of Object.entries(lo)){let s=D.join(e,n);if(!C.existsSync(s)){let i=typeof o=="function"?o():o;C.writeFileSync(s,i,"utf-8"),t.push(s)}}return t}async function uo(){let e=L.workspace.getConfiguration("alex.aiMemory").get("path");if(e&&C.existsSync(e)){let r=await L.window.showInformationMessage(`AI-Memory already configured at: ${e}`,"Use This","Change Location");if(r==="Use This")return e;if(!r)return}let t=Gt(),n=ao(),o=[];for(let r of t)o.push({label:"$(check) "+r,description:"Found \u2014 existing AI-Memory",detail:r});for(let r of n)if(!t.includes(r)){let a=/OneDrive/i.test(r);o.push({label:(a?"$(cloud) ":"$(folder) ")+r,description:a?"OneDrive \u2014 recommended (cloud-synced)":"Local fallback",detail:r})}o.push({label:"$(folder-opened) Browse...",description:"Choose a custom location",detail:"__browse__"});let s=await L.window.showQuickPick(o,{title:"AI-Memory Location",placeHolder:"Where should Alex store shared knowledge?",ignoreFocusOut:!0});if(!s)return;let i;if(s.detail==="__browse__"){let r=await L.window.showOpenDialog({canSelectFolders:!0,canSelectFiles:!1,canSelectMany:!1,openLabel:"Select AI-Memory Folder",title:"Choose AI-Memory Location"});if(!r||r.length===0)return;i=r[0].fsPath,D.basename(i).toLowerCase().includes("ai-memory")||(i=D.join(i,"AI-Memory"))}else i=s.detail;return i}async function $e(){let e=await uo();if(e)try{let t=po(e);return await L.workspace.getConfiguration("alex.aiMemory").update("path",e,L.ConfigurationTarget.Global),t.length>0?L.window.showInformationMessage(`AI-Memory initialized at ${e} (${t.length} items created).`):L.window.showInformationMessage(`AI-Memory linked to ${e} (already complete).`),e}catch(t){let o=(t instanceof Error?t.message:String(t)).replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g,"[path]");L.window.showErrorMessage(`AI-Memory setup failed: ${o}`);return}}var N=h(require("vscode")),ze=h(require("path")),se=h(require("fs")),oe=class extends N.TreeItem{constructor(n,o,s,i,r){super(n,s);this.metricId=i;this.children=r;this.description=o,this.tooltip=`${n}: ${o}`}};function We(e,t){switch(t){case"percent":return`${e}%`;case"seconds":return`${e}s`;case"count":return`${e}`;default:return`${e} ${t}`}}var je=class{constructor(t){this.workspaceRoot=t}_onDidChangeTreeData=new N.EventEmitter;onDidChangeTreeData=this._onDidChangeTreeData.event;refresh(){this._onDidChangeTreeData.fire(void 0)}getTreeItem(t){return t}getChildren(t){return this.workspaceRoot?t?.children?t.children:t?[]:this.getRootItems():[new oe("No workspace","Open a folder",N.TreeItemCollapsibleState.None)]}getRootItems(){let t=[],n=ze.join(this.workspaceRoot,".github","config","agent-metrics.json");if(!se.existsSync(n))return[new oe("Not configured","No agent-metrics.json found",N.TreeItemCollapsibleState.None)];let o;try{o=JSON.parse(se.readFileSync(n,"utf-8"))}catch{return[new oe("Config error","Invalid agent-metrics.json",N.TreeItemCollapsibleState.None)]}let s=ze.join(this.workspaceRoot,".agent-metrics-state.json"),i={};if(se.existsSync(s))try{i=JSON.parse(se.readFileSync(s,"utf-8"))}catch{}let r=o.thresholds??{};for(let a of o.metrics){let u=i[a.id],p=u?We(u.value,a.unit):"\u2014",g=r[a.id],l=this.getStatusIcon(a,u?.value,g),d=new oe(a.name,p,N.TreeItemCollapsibleState.None,a.id);d.iconPath=new N.ThemeIcon(l);let m=g?`

Warning: ${We(g.warning,a.unit)} \xB7 Critical: ${We(g.critical,a.unit)}`:"";d.tooltip=new N.MarkdownString(`**${a.name}**

${a.description}

Current: ${p}${m}`),t.push(d)}return t}getStatusIcon(t,n,o){return n===void 0||!o?"circle-outline":t.higherIsBetter===!0||t.id.includes("rate")||t.id==="tasks-run-count"?n<o.critical?"error":n<o.warning?"warning":"check":n>o.critical?"error":n>o.warning?"warning":"check"}};var E=h(require("vscode")),k=h(require("fs")),P=h(require("path"));var Ht=["instructions","skills","prompts","agents","muscles","config","hooks"],Bt=["copilot-instructions.md","ABOUT.md","NORTH-STAR.md","EXTERNAL-API-REGISTRY.md"],go="brain-files",Ve=".github",Wt=".github/.alex-brain-version",fo=".github/config/MASTER-ALEX-PROTECTED.json";function zt(e){return e.extension.packageJSON.version}function Vt(e){let t=P.join(e,Wt);try{return k.readFileSync(t,"utf-8").trim()}catch{return}}function qe(e,t,n){let o=n??t;k.mkdirSync(t,{recursive:!0});for(let s of k.readdirSync(e,{withFileTypes:!0})){let i=P.join(e,s.name),r=P.resolve(t,s.name);if(!r.startsWith(o+P.sep)&&r!==o)throw new Error(`Path traversal blocked: ${s.name}`);s.isDirectory()?qe(i,r,o):k.copyFileSync(i,r)}}function qt(e){return k.existsSync(P.join(e,fo))}async function Re(e,t=!1){let n=E.workspace.workspaceFolders;if(!n||n.length===0)return E.window.showWarningMessage("Alex: Open a workspace folder first."),!1;let o=n[0].uri.fsPath;if(qt(o))return E.window.showWarningMessage("Alex: Protected mode \u2014 brain updates blocked in this workspace."),!1;let s=zt(e),i=Vt(o),r=P.join(o,Ve);if(!(t||!k.existsSync(r)||i!==s))return E.window.showInformationMessage(`Alex: Brain is up to date (v${s}).`),!1;let u=P.join(e.extensionUri.fsPath,go);if(!k.existsSync(u))return E.window.showWarningMessage("Alex: Brain files not found in extension bundle."),!1;try{let p=P.join(o,Ve);if(k.mkdirSync(p,{recursive:!0}),i){let m=new Date,S=`${m.getFullYear()}${String(m.getMonth()+1).padStart(2,"0")}${String(m.getDate()).padStart(2,"0")}-${String(m.getHours()).padStart(2,"0")}${String(m.getMinutes()).padStart(2,"0")}${String(m.getSeconds()).padStart(2,"0")}`,b=P.join(o,`.github-backup-${S}`);k.mkdirSync(b,{recursive:!0});for(let I of Ht){let y=P.join(p,I);k.existsSync(y)&&qe(y,P.join(b,I))}for(let I of Bt){let y=P.join(p,I);k.existsSync(y)&&k.copyFileSync(y,P.join(b,I))}}for(let m of Ht){let S=P.join(u,m);if(!k.existsSync(S))continue;let b=P.join(p,m),I=b+`.staging-${Date.now()}`;qe(S,I),k.existsSync(b)&&k.rmSync(b,{recursive:!0,force:!0}),k.renameSync(I,b)}for(let m of Bt){let S=P.join(u,m);k.existsSync(S)&&k.copyFileSync(S,P.join(p,m))}let g=P.join(o,Wt);k.writeFileSync(g,s,"utf-8"),Ie(o);let l=i?"updated":"installed";return await E.window.showInformationMessage(`Alex: Brain ${l} to v${s}. Configure recommended settings?`,"Optimize Settings","Skip")==="Optimize Settings"&&E.commands.executeCommand("alex.optimizeSettings"),_t()||await E.window.showInformationMessage("Alex: Set up AI-Memory for cross-project knowledge sharing?","Setup AI-Memory","Skip")==="Setup AI-Memory"&&await $e(),!0}catch(p){let g=p instanceof Error?p.message:String(p);return E.window.showErrorMessage(`Alex: Brain install failed \u2014 ${g}`),!1}}function Je(e){let t=zt(e),n=E.workspace.workspaceFolders;if(!n||n.length===0)return{installed:!1,bundledVersion:t,needsUpgrade:!1};let o=n[0].uri.fsPath,s=Vt(o),i=P.join(o,Ve),r=k.existsSync(i);return{installed:r,version:s,bundledVersion:t,needsUpgrade:r&&s!==t}}async function Jt(e){let t=Je(e);if(!t.needsUpgrade)return;let n=E.workspace.workspaceFolders?.[0]?.uri.fsPath;if(n&&qt(n))return;await E.window.showInformationMessage(`Alex: Brain v${t.version} \u2192 v${t.bundledVersion} available.`,"Upgrade Now","Later")==="Upgrade Now"&&await Re(e,!0)}var ue=h(require("vscode")),Yt=h(require("path")),Kt=h(require("fs")),Qt=require("child_process");function mo(e,t,n=[]){let o=Yt.join(e,".github","muscles",t);return Kt.existsSync(o)?new Promise(s=>{(0,Qt.execFile)("node",[o,...n],{cwd:e,maxBuffer:10*1024*1024,timeout:12e4},(i,r,a)=>{let u=typeof i?.code=="number"?i.code:i?1:0;s({code:u,stdout:r??"",stderr:a??""})})}):Promise.resolve({code:1,stdout:"",stderr:`Muscle not found: ${t}`})}async function Y(e,t,n,o,s){let i=ue.window.createOutputChannel(o);i.show(!0),i.appendLine(`Running ${t}...`),i.appendLine("");let r=await mo(e,t,n);r.stdout&&i.appendLine(r.stdout),r.stderr&&i.appendLine(r.stderr),r.code!==0&&i.appendLine(`
[Exit code: ${r.code}]`),i.appendLine(`
[Done]`),s&&await ue.window.showInformationMessage(`Alex: ${o} complete. Open chat for follow-up?`,"Open Chat","Done")==="Open Chat"&&await ue.commands.executeCommand("workbench.action.chat.open",{query:s})}function ie(e){return(e instanceof Error?e.message:String(e)).replace(/[A-Z]:\\[\w\\.\-\s]+/gi,"[path]").replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\-]+/g,"[path]")}async function ge(){let e=c.workspace.getConfiguration(),t="github.copilot.chat.copilotMemory.enabled";e.get(t)!==!1&&await e.update(t,!1,c.ConfigurationTarget.Global)}function ho(e){ge(),nt(e.workspaceState);let t=c.chat.createChatParticipant("alex.chat",vt);t.iconPath=c.Uri.joinPath(e.extensionUri,"assets","icon.png"),t.followupProvider={provideFollowups(){return[{prompt:"/autopilot list",label:"List Autopilot Tasks",command:"autopilot"}]}},e.subscriptions.push(t);let n=new ce(e.extensionUri,e.globalState);e.subscriptions.push(n),e.subscriptions.push(c.window.registerWebviewViewProvider(ce.viewId,n));let o=c.workspace.workspaceFolders?.[0]?.uri.fsPath;jt(e),Ge(o);let s=setInterval(()=>{Ge(c.workspace.workspaceFolders?.[0]?.uri.fsPath)},300*1e3);e.subscriptions.push({dispose:()=>clearInterval(s)});let i=new je(o);if(e.subscriptions.push(c.window.createTreeView("alex.agentActivity",{treeDataProvider:i})),e.subscriptions.push(c.commands.registerCommand("alex.refreshAgentActivity",()=>{i.refresh()})),o){let l=new c.RelativePattern(o,".agent-metrics-state.json"),d=c.workspace.createFileSystemWatcher(l);d.onDidChange(()=>i.refresh()),d.onDidCreate(()=>i.refresh()),e.subscriptions.push(d)}e.subscriptions.push(c.commands.registerCommand("alex.refreshWelcome",()=>{n.refresh()})),e.subscriptions.push(c.commands.registerCommand("alex.openChat",()=>{c.commands.executeCommand("workbench.action.chat.open")})),e.subscriptions.push(c.commands.registerCommand("alex.dream",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}try{await Y(l,"brain-qa.cjs",[],"Alex: Brain QA","Review the brain health grid at .github/quality/brain-health-grid.md and fix the top priority issues")}catch(d){c.window.showErrorMessage(`Dream protocol failed: ${ie(d)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.initialize",async()=>{try{await ge(),await c.window.showInformationMessage("Install the Alex brain in this workspace?","Install","Cancel")==="Install"&&await Re(e,!0)&&(await ge(),n.refresh())}catch(l){c.window.showErrorMessage(`Initialize failed: ${ie(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.upgrade",async()=>{try{await ge();let l=Je(e);if(!l.needsUpgrade&&l.installed){c.window.showInformationMessage(`Alex: Brain is already up to date (v${l.bundledVersion}).`);return}let d=l.version??"not installed";if(await c.window.showInformationMessage(`Upgrade Alex brain from v${d} to v${l.bundledVersion}? A backup will be created.`,"Upgrade","Cancel")!=="Upgrade")return;await Re(e,!0)&&(await ge(),n.refresh())}catch(l){c.window.showErrorMessage(`Upgrade failed: ${ie(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setupAIMemory",async()=>{try{await $e(),n.refresh()}catch(l){c.window.showErrorMessage(`AI-Memory setup failed: ${ie(l)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.generateLoopConfig",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}try{let d=Te(l);Ie(l,d)?c.window.showInformationMessage(`Alex: Loop config generated for ${d.projectType} project (${d.conventions.length} conventions detected).`):c.window.showErrorMessage("Alex: Failed to write loop config.")}catch(d){c.window.showErrorMessage(`Alex: Loop config generation failed \u2014 ${ie(d)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.setProjectPhase",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let d=[{label:"Planning",description:"Ideation, research, and design",value:"planning"},{label:"Active Development",description:"Building features and writing code",value:"active-development"},{label:"Testing",description:"QA, integration tests, and validation",value:"testing"},{label:"Release",description:"Packaging, publishing, and deployment",value:"release"},{label:"Maintenance",description:"Bug fixes, upgrades, and monitoring",value:"maintenance"}],m=await c.window.showQuickPick(d.map(b=>({label:b.label,description:b.description,value:b.value})),{placeHolder:"Select the current project phase"});if(!m)return;Ut(l,m.value)?(n.refresh(),c.window.showInformationMessage(`Alex: Project phase set to "${m.label}".`)):c.window.showErrorMessage("Alex: Failed to update project phase. Generate a loop config first.")}));let r={"alex.convertMdToHtml":{muscle:"md-to-html.cjs",label:"HTML",srcExt:".md"},"alex.convertMdToWord":{muscle:"md-to-word.cjs",label:"Word",srcExt:".md"},"alex.convertMdToEml":{muscle:"md-to-eml.cjs",label:"Email",srcExt:".md"},"alex.convertMdToPdf":{muscle:"md-to-pdf.cjs",label:"PDF",srcExt:".md"},"alex.convertMdToPptx":{muscle:"md-to-pptx.cjs",label:"PowerPoint",srcExt:".md"},"alex.convertMdToEpub":{muscle:"md-to-epub.cjs",label:"EPUB",srcExt:".md"},"alex.convertMdToLatex":{muscle:"md-to-latex.cjs",label:"LaTeX",srcExt:".md"},"alex.convertMdToTxt":{muscle:"md-to-txt.cjs",label:"Plain Text",srcExt:".md"},"alex.convertDocxToMd":{muscle:"docx-to-md.cjs",label:"Markdown",srcExt:".docx"},"alex.convertHtmlToMd":{muscle:"html-to-md.cjs",label:"Markdown",srcExt:".html"},"alex.convertPptxToMd":{muscle:"pptx-to-md.cjs",label:"Markdown",srcExt:".pptx"}};for(let[l,d]of Object.entries(r))e.subscriptions.push(c.commands.registerCommand(l,async m=>{let S=m??c.window.activeTextEditor?.document.uri;if(!S||S.scheme!=="file"){c.window.showWarningMessage("Alex: Select a file to convert.");return}if(!S.fsPath.endsWith(d.srcExt)){c.window.showWarningMessage(`Alex: This converter requires a ${d.srcExt} file.`);return}let b=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!b){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let I=T.join(b,".github","muscles",d.muscle),y=S.fsPath,M=c.window.createTerminal(`Alex: Convert \u2192 ${d.label}`);M.show(),M.sendText(`node "${I}" "${y}"`)}));e.subscriptions.push(c.commands.registerCommand("alex.brainQA",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}await Y(l,"brain-qa.cjs",[],"Alex: Brain QA")})),e.subscriptions.push(c.commands.registerCommand("alex.validateSkills",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}await Y(l,"validate-skills.cjs",[],"Alex: Validate Skills","Review the skill validation results and fix any issues found")})),e.subscriptions.push(c.commands.registerCommand("alex.markdownLint",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath,d=c.window.activeTextEditor?.document.uri;if(!l||!d||d.scheme!=="file"){c.window.showWarningMessage("Alex: Open a markdown file first.");return}await Y(l,"markdown-lint.cjs",[d.fsPath],"Alex: Markdown Lint","Fix the markdown lint issues found in the current file")})),e.subscriptions.push(c.commands.registerCommand("alex.tokenCostReport",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}await Y(l,"token-cost-report.cjs",[],"Alex: Token Cost Report")})),e.subscriptions.push(c.commands.registerCommand("alex.newSkill",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let d=await c.window.showInputBox({prompt:"Skill name (kebab-case, e.g., my-new-skill)",placeHolder:"my-new-skill",validateInput:b=>/^[a-z][a-z0-9-]*$/.test(b)?null:"Use kebab-case (lowercase, hyphens)"});if(!d)return;let m=await c.window.showInputBox({prompt:"Skill description",placeHolder:"What does this skill do?"}),S=[d];m&&S.push("--description",m),await Y(l,"new-skill.cjs",S,"Alex: New Skill",`Customize the new skill ${d} \u2014 fill in the SKILL.md with real content and create the matching instruction file`)})),e.subscriptions.push(c.commands.registerCommand("alex.createCustomAgent",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let d=await c.window.showInputBox({prompt:"Agent name (e.g., Code Reviewer, Data Analyst)",placeHolder:"My Custom Agent",validateInput:U=>U.trim().length>0?null:"Agent name cannot be empty"});if(!d)return;let m=await c.window.showInputBox({prompt:"Agent description (one sentence)",placeHolder:"What does this agent specialize in?"});if(m===void 0)return;let b=`${d.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}.agent.md`,I=T.join(l,".github","agents"),y=T.join(I,b);if(A.existsSync(y)){c.window.showWarningMessage(`Agent file already exists: .github/agents/${b}`),await c.commands.executeCommand("vscode.open",c.Uri.file(y));return}let M=["---",`description: "${m.replace(/"/g,"'")||d+" - custom agent"}"`,`name: "${d}"`,'model: ["Claude Sonnet 4", "GPT-4o"]',"tools:",'  ["search", "codebase", "problems", "usages", "runSubagent", "fetch", "agent"]',"user-invocable: true","---","",`# ${d}`,"",`You are **Alex** in **${d}** mode.`,"","## Purpose","",m||"Describe this agent's purpose and expertise.","","## Instructions","","1. Follow the project's existing conventions","2. Verify your work before declaring done","3. Ask for clarification when requirements are ambiguous","","## Relevant Skills","","<!-- List skills this agent should load, e.g.:","- `.github/skills/api-design/SKILL.md`","-->",""].join(`
`);A.mkdirSync(I,{recursive:!0}),A.writeFileSync(y,M,"utf-8"),await c.commands.executeCommand("vscode.open",c.Uri.file(y)),c.window.showInformationMessage(`Alex: Custom agent "${d}" created at .github/agents/${b}`)})),e.subscriptions.push(c.commands.registerCommand("alex.setContext",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}let d=[],m=T.join(l,"package.json");if(A.existsSync(m))try{let y=JSON.parse(A.readFileSync(m,"utf-8")),M=Array.isArray(y.workspaces)?y.workspaces:y.workspaces?.packages??[];for(let U of M){let X=U.replace(/\/\*$/,""),O=T.join(l,X);if(A.existsSync(O))for(let F of A.readdirSync(O,{withFileTypes:!0})){if(!F.isDirectory())continue;let K=T.join(O,F.name,"package.json");if(A.existsSync(K))try{let W=JSON.parse(A.readFileSync(K,"utf-8"));d.push({label:W.name??F.name,description:T.relative(l,T.join(O,F.name)),dir:T.join(O,F.name)})}catch{}}}}catch{}let S=T.join(l,"pnpm-workspace.yaml");if(d.length===0&&A.existsSync(S))try{let M=A.readFileSync(S,"utf-8").match(/- ['"](.*?)['"]/g)??[];for(let U of M){let X=U.replace(/- ['"](.*)['"]/,"$1").replace(/\/\*$/,""),O=T.join(l,X);if(A.existsSync(O))for(let F of A.readdirSync(O,{withFileTypes:!0}))F.isDirectory()&&d.push({label:F.name,description:T.relative(l,T.join(O,F.name)),dir:T.join(O,F.name)})}}catch{}if(d.length===0)for(let y of["platforms","packages","apps","libs"]){let M=T.join(l,y);if(A.existsSync(M))for(let U of A.readdirSync(M,{withFileTypes:!0}))U.isDirectory()&&d.push({label:U.name,description:`${y}/${U.name}`,dir:T.join(M,U.name)})}d.unshift({label:"(root)",description:"Workspace root",dir:l});let b=await c.window.showQuickPick(d,{placeHolder:"Select the active package context",title:"Set Active Package"});if(!b)return;let I=T.join(l,".github","config","loop-menu.json");try{let y={};A.existsSync(I)&&(y=JSON.parse(A.readFileSync(I,"utf-8"))),y.activePackage=b.label==="(root)"?null:b.description,y.activePackageName=b.label==="(root)"?null:b.label,A.mkdirSync(T.dirname(I),{recursive:!0}),A.writeFileSync(I,JSON.stringify(y,null,2)+`
`,"utf-8"),n.refresh(),c.window.showInformationMessage(b.label==="(root)"?"Alex: Active context set to workspace root.":`Alex: Active context set to "${b.label}" (${b.description}).`)}catch(y){c.window.showErrorMessage(`Alex: Failed to update context \u2014 ${ie(y)}`)}})),e.subscriptions.push(c.commands.registerCommand("alex.insightPipeline",async()=>{let l=c.workspace.workspaceFolders?.[0]?.uri.fsPath;if(!l){c.window.showWarningMessage("Alex: Open a workspace folder first.");return}await Y(l,"insight-pipeline.cjs",[],"Alex: Insight Pipeline","Review the extracted insights and promote the most valuable ones to global knowledge")}));let a=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/config/loop-menu.json")),u=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/prompts/loop/*.prompt.md")),p=c.workspace.createFileSystemWatcher(new c.RelativePattern(c.workspace.workspaceFolders?.[0]??"",".github/skills/*/loop-config.partial.json")),g=()=>n.refresh();e.subscriptions.push(a,a.onDidChange(g),a.onDidCreate(g),a.onDidDelete(g),u,u.onDidChange(g),u.onDidCreate(g),u.onDidDelete(g),p,p.onDidChange(g),p.onDidCreate(g),p.onDidDelete(g)),Jt(e).then(()=>{n.refresh()})}function vo(){}0&&(module.exports={activate,deactivate});
