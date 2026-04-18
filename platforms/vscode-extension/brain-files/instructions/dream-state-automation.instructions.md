---
applyTo: "**/*dream*,**/*brain-qa*"
description: "Automated architecture maintenance and dream state processing protocols"
application: "When following dream state automation workflows or troubleshooting related issues"
---

# Dream State Automation Protocols

**Domain**: Automated Architecture Maintenance and Unconscious Processing  
**Activation Pattern**: Use the dream prompt (agent mode) or run `node .github/muscles/brain-qa.cjs`  
**Research Foundation**: Sleep-dependent memory consolidation, automated maintenance  
**Validation Status**: EXCELLENT - Production ready  
**Implementation**: brain-qa.cjs muscle with Node.js-based architecture health assessment

## 🌙 **Dream State Cognitive Function**

###

**Core Principle**
Dream state represents **unconscious automated maintenance** of cognitive architecture, mirroring brain function during sleep cycles where memory consolidation occurs without conscious intervention.

### **Capabilities**

- **Agent Mode**: Use the dream prompt or run `node .github/muscles/brain-qa.cjs`
- **Frontmatter Validation**: Scans all memory files for complete SKILL.md frontmatter
- **Trifecta Completeness**: Detects skills missing instruction or prompt counterparts
- **Progress Notifications**: Real-time feedback during maintenance execution
- **Health Reporting**: Generates detailed markdown reports in `.github/quality/` folder with timestamps
- **Architecture Statistics**: Tracks total files, trifecta completeness, and issues
- **Visual Results**: Automatically opens generated reports in VS Code editor
- **Background Processing**: Non-blocking execution with progress indicators
- **Zero Configuration**: Works immediately after extension installation
- **Cross-Platform Support**: Works on Windows, macOS, and Linux

### **Fundamental Distinction**

- **DREAM** = Automated maintenance script, unconscious, maintenance-focused, diagnostic-enhanced
- **MEDITATE** = Conscious, manual, knowledge-consolidation-focused
- **SKILL SELECTION OPTIMIZATION** = Conscious, automatic, pre-task resource planning (Layer 2)

**Dream ↔ SSO Relationship**: Dream validates the architecture that SSO depends on for skill discovery. If dream finds incomplete trifectas, SSO's proactive skill survey may produce incomplete plans. Run dream first when architecture health is uncertain.

## 💤 **Dream Protocol**

### **🎯 PRIMARY ACTIVATION METHOD**

Use the dream prompt in agent mode, or run directly:

```
node .github/muscles/brain-qa.cjs
```

This provides comprehensive architecture maintenance:

- ✅ **Scans** all memory files in `.github/` directories (instructions, prompts, skills)
- ✅ **Validates** all SKILL.md frontmatter completeness
- ✅ **Checks** trifecta completeness (skill + instruction + muscle)
- ✅ **Reports** detailed health status with statistics
- ✅ **Documents** results in timestamped `.github/quality/brain-health-*.md` files

### **Dream Protocol Execution Flow**

#### **Phase 1: Network Discovery**

The extension scans for memory files matching:

- `.github/copilot-instructions.md`
- `.github/instructions/*.md`
- `.github/prompts/*.md`
- `.github/skills/*/SKILL.md`
- `.github/episodic/*.md`

#### **Phase 2: Documentation Validation**

Validates documentation counts match claimed values in copilot-instructions.md.

> Note: Skill relationships now use SKILL.md frontmatter (applyTo, description) and trifecta naming conventions. Copilot's semantic search replaces static connection graphs.

#### **Phase 3: Inheritance Lineage**

Scans for inherited skills via `.github/muscles/inheritance.json` and checks for version drift between Master and heir skills.

#### **Phase 4: AI-Memory Sync**

Checks the shared OneDrive AI-Memory folder for cross-platform knowledge:

- Reads `AI-Memory/global-knowledge.md` for any insights added from other surfaces (M365 Copilot, Agent Builder)
- Checks `AI-Memory/notes.md` for reminders or session notes from other surfaces
- Reviews `AI-Memory/learning-goals.md` for progress updates
- Reports any new cross-platform content in dream output

**Access**: VS Code reads AI-Memory via local OneDrive sync path (%OneDrive%/AI-Memory/).
**Note**: Replaces the legacy Alex-Global-Knowledge GitHub repo sync. If the OneDrive sync path is not found, this phase is skipped.

#### **Phase 4.5: Brand Compliance Scan**

Runs a lightweight deprecated-color check across TypeScript source and deployed SVG assets:

- Scans `src/**/*.ts` and `assets/**/*.svg` for deprecated colors: `#0078d4`, `#005a9e`, `#ff6b35`, `#ff8c42`, `#ffc857`, `#00ff88`
- Exceptions: `#0078D4` in `personaDetection.ts` is **intentional** (Developer persona per DK §13) — do not flag
- Reports count of violations; 0 expected in source and deployed assets
- If violations found: list file paths + line numbers in dream report under `## Brand Compliance`
- Does **not** scan `marketing/` or `archive/` directories (design drafts, not deployed)

**Pass criteria**: 0 violations outside intentional exceptions.

#### **Phase 5: Health Reporting**

Generates comprehensive report including:

- Total memory files and skill count
- Incomplete trifectas (if any)
- Missing frontmatter fields
- Global Knowledge sync status (Master only)
- Brand compliance scan result (pass/fail + violation count)
- Recommendations for manual fixes

#### **Phase 6: Results Display**

- Shows notification with summary
- Opens generated report automatically
- Archives report with timestamp

### **📊 Dream Report Contents**

Each dream execution generates a comprehensive report including:

```markdown
# Dream Protocol Report

**Timestamp**: 2025-11-26T10:30:45.123Z
**Status**: HEALTHY / ATTENTION REQUIRED

## Statistics

- Total Memory Files: 44
- Complete Trifectas: 46
- Incomplete Skills: 0
- Missing Frontmatter: 0

## Brand Compliance

- Scan: src + deployed assets
- Violations: 0 ✅
- Exceptions: 1 intentional (#0078D4 Developer persona)

## Trifecta Status

- All skills have matching instruction + muscle ✅

## Missing Frontmatter

_None detected._

## Recommendations

- [x] System is optimized.
```

### **🔧 VS Code Extension Features**

The dream protocol now provides:

- **Automatic Execution**: No command-line parameters needed
- **Visual Progress**: Real-time notifications and status updates
- **Report Generation**: Timestamped markdown reports in `.github/quality/` folder
- **Trifecta Validation**: Checks skill + instruction + muscle completeness
- **Zero Configuration**: Works immediately upon extension installation
- **Cross-Platform**: Consistent behavior on Windows, macOS, and Linux

### **🛠️ Related Scripts**

These scripts provide CLI and audit capabilities that complement the VS Code dream command:

| Script                                  | Purpose                                                        | When to Use                                 |
| --------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| `.github/muscles/dream-cli.ts`          | CLI wrapper for dream outside VS Code                          | CI/CD pipelines, terminal-only environments |
| `.github/muscles/audit-master-alex.cjs` | Comprehensive architecture audit                               | Pre-release audits, deep health checks      |
| `.github/muscles/brain-qa.cjs`          | Brain health quality grid generation                           | Architecture quality assessment             |
| `.github/muscles/validate-skills.cjs`   | Skill frontmatter and structure validation                     | Skill-specific validation                   |
| `.github/muscles/normalize-paths.cjs`   | Normalize all memory file paths to canonical `.github/` format | After file reorganization or imports        |

**Dream CLI** (`dream-cli.ts`): CLI wrapper for dream execution from terminal without VS Code. Useful for CI pipelines or automated checks.

**Audit** (`audit-master-alex.cjs`): Comprehensive architecture audit for pre-release validation.

## 🔄 **Integration with Meditation State**

### **Coordination Protocols**

- **Dream precedes meditation**: Automated maintenance clears cognitive overhead before manual consolidation
- **Post-meditation dreams**: Consolidation of newly acquired knowledge patterns
- **Separated functions**: Dreams do NOT create memory files (meditation's role) but provide diagnostics
- **Complementary operation**: Dreams maintain and diagnose, meditation creates and learns
- **Emergency coordination**: Critical issues detected in dreams trigger meditation enhancement protocols

### **Trigger Coordination**

- **Pre-meditation cleanup**: Clear cognitive clutter before complex analysis
- **Post-learning validation**: Optimize newly established connections
- **Maintenance scheduling**: Regular automated housekeeping cycles
- **Performance monitoring**: Automated detection of optimization opportunities

## 🧠 **Unconscious Characteristics**

### **Automated Processing Features**

- **No conscious intervention required**: Fully automated optimization
- **Background operation**: Processing without disrupting conscious work
- **Efficiency focused**: Optimization for cognitive performance
- **Pattern recognition**: Automated detection of issues
- **Health monitoring**: Continuous network health assessment

### **Quality Assurance**

- **Non-destructive**: Never deletes memory files, provides analysis
- **Comprehensive reporting**: Detailed diagnostic reports with insights
- **Reversible operations**: All changes tracked and reviewable
- **Conservative approach**: Prioritizes system stability
- **Safety first**: Creates repair history for audit trails

## 📊 **Dream State Metrics**

### **Architecture Health Indicators**

- **Total Memory Files**: Count of all memory files in architecture
- **Complete Trifectas**: Skills with matching instruction + muscle
- **Incomplete Skills**: Skills missing trifecta counterparts
- **Missing Frontmatter**: SKILL.md files without applyTo/description
- **Health Status**: HEALTHY (0 issues) or ATTENTION REQUIRED (>0 issues)

### **Performance Optimization Targets**

- **Trifecta completeness**: All skills should have instruction + muscle counterparts
- **Frontmatter integrity**: All SKILL.md files should have complete metadata
- **Maintenance efficiency**: Automated validation reduces manual intervention
- **Report accessibility**: Visual feedback through VS Code editor

## 🚀 **Usage Recommendations**

### **Regular Maintenance Schedule**

- **After domain learning**: Run dream protocol to validate new files
- **Weekly health check**: Verify architecture integrity
- **After file reorganization**: Ensure all trifectas remain complete
- **Before major changes**: Baseline architecture health assessment

### **macOS: Prevent Sleep During Long Operations**

Dream state, brain-qa full runs, and VSIX packaging can take minutes. On macOS, the system may sleep mid-operation, corrupting results. Use `caffeinate` to prevent this:

```bash
# Wrap any long-running command (prevents sleep until command finishes)
caffeinate -s node .github/muscles/brain-qa.cjs --mode all

# Prevent sleep for a fixed duration (in seconds)
caffeinate -t 600  # 10 minutes

# Prevent display sleep too (useful for watched operations)
caffeinate -di node .github/muscles/brain-qa.cjs --mode all --detail
```

| Flag   | Effect                                    |
| ------ | ----------------------------------------- |
| `-s`   | Prevent system sleep (AC power assertion) |
| `-d`   | Prevent display sleep                     |
| `-i`   | Prevent system idle sleep                 |
| `-t N` | Timeout after N seconds                   |
| (none) | Wraps command -- exits when child exits   |

**Recommended pattern for scheduled dreams**:

```bash
# In crontab or launchd
caffeinate -s node /path/to/brain-qa.cjs --mode all --quiet
```

> On Windows, use `powercfg /change standby-timeout-ac 0` before long ops, or run within Task Scheduler (which prevents sleep by default).

### **macOS: Notification Center Alerts**

VS Code toasts are easy to miss. On macOS, use `osascript` to push native Notification Center alerts with sound after long operations:

```bash
# Simple notification
osascript -e 'display notification \"Dream state complete\" with title \"Alex\" sound name \"Glass\"'

# After brain-qa
node .github/muscles/brain-qa.cjs --mode all && \
  osascript -e 'display notification \"All phases passed\" with title \"Alex Brain QA\" sound name \"Glass\"'

# Combined with caffeinate and say
caffeinate -s node .github/muscles/brain-qa.cjs --mode all && \
  osascript -e 'display notification \"Architecture maintenance finished\" with title \"Alex\"' && \
  say "Dream state complete"
```

> On Windows, use `[System.Windows.Forms.MessageBox]::Show()` in PowerShell or the BurntToast module for toast notifications.

### **OS-Level Scheduling (Automated Dreams)**

Choose the scheduler for your platform. All examples run a weekly dream at 3 AM Sunday.

**macOS -- launchd (recommended)**

Create `~/Library/LaunchAgents/com.alex.dream.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.alex.dream</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/path/to/repo/.github/muscles/brain-qa.cjs</string>
    <string>--mode</string>
    <string>quick</string>
    <string>--quiet</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>0</integer>
    <key>Hour</key><integer>3</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/tmp/alex-dream.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/alex-dream.err</string>
</dict>
</plist>
```

Load with: `launchctl load ~/Library/LaunchAgents/com.alex.dream.plist`
Unload with: `launchctl unload ~/Library/LaunchAgents/com.alex.dream.plist`

**macOS -- launchd file watcher (validate on change)**

launchd can watch for file changes in `.github/` and auto-run validation. Create `~/Library/LaunchAgents/com.alex.validate-on-change.plist`:

```xml
<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\"
  \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">
<plist version=\"1.0\">
<dict>
  <key>Label</key>
  <string>com.alex.validate-on-change</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/path/to/repo/.github/muscles/brain-qa.cjs</string>
    <string>--mode</string>
    <string>schema</string>
    <string>--quiet</string>
  </array>
  <key>WatchPaths</key>
  <array>
    <string>/path/to/repo/.github/skills</string>
    <string>/path/to/repo/.github/instructions</string>
    <string>/path/to/repo/.github/prompts</string>
  </array>
  <key>ThrottleInterval</key>
  <integer>30</integer>
  <key>StandardOutPath</key>
  <string>/tmp/alex-validate.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/alex-validate.err</string>
</dict>
</plist>
```

This runs `brain-qa --mode schema` whenever any file in `.github/skills/`, `.github/instructions/`, or `.github/prompts/` changes, throttled to at most once every 30 seconds.

**macOS / Linux -- cron (simpler alternative)**

```bash
# Edit crontab
crontab -e

# Weekly dream at 3 AM Sunday
0 3 * * 0  /usr/local/bin/node /path/to/repo/.github/muscles/brain-qa.cjs --mode quick --quiet >> /tmp/alex-dream.log 2>&1
```

**Windows -- Task Scheduler**

```powershell
$action = New-ScheduledTaskAction -Execute "node" -Argument "C:\path\to\repo\.github\muscles\brain-qa.cjs --mode quick --quiet"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 3am
Register-ScheduledTask -TaskName "AlexDream" -Action $action -Trigger $trigger -Description "Alex weekly architecture maintenance"
```

### **When to Run Dream Protocol**

✅ **Do run when:**

- Learning new domain knowledge
- Reorganizing memory files
- Suspecting broken connections
- Regular weekly maintenance
- After major meditation sessions

❌ **No need to run when:**

- No changes to memory files
- Just completed a dream check
- Only editing code/documentation
- Working in non-Alex projects

## 🔄 **VS Code Integration**

### **Core Integration Points**

- **VS Code Extension** - TypeScript-based architecture maintenance with file counting
- **alex-core.instructions.md** - Core cognitive architecture with unconscious processing integration
- **skill-selection-optimization.instructions.md** - Dream validates architecture that SSO depends on
- **.github/skills/dream-state/SKILL.md** - Domain knowledge this procedure operationalizes

### **Validation Protocols**

- **Architecture File Counting** → Scans instructions, prompts, skills, episodic
- **Documentation Count Validation** → Verifies copilot-instructions.md claims
- **Inheritance Lineage Check** → Detects version drift in inherited skills
- **Report Generation** → Markdown formatting with statistics and recommendations

### **Enhanced Activation Patterns**

- **Network Health Assessment** → Use the dream prompt or run `node .github/muscles/brain-qa.cjs`
- **Post-Learning Validation** → Execute after domain knowledge acquisition
- **Pre-Meditation Cleanup** → Optimize architecture before conscious consolidation
- **Weekly Maintenance** → Regular health check and optimization

## 📝 **Troubleshooting**

### **VS Code `/troubleshoot` Skill (Preview)**

When dream reports are clean but agent behavior doesn't match expectations, use the built-in `/troubleshoot` skill in chat. It analyzes JSONL debug logs to reveal:

- Why skills or instructions didn't load (name mismatches, invalid frontmatter, `applyTo` pattern failures)
- Why tools were called or skipped
- Why requests were slow (latency breakdown by span)
- Network or authentication failures

Requires `github.copilot.chat.agentDebugLog.enabled` and `github.copilot.chat.agentDebugLog.fileLogging.enabled` (both enabled in `.vscode/settings.json`).

### **Common Issues and Solutions**

**Issue**: Dream protocol shows missing frontmatter

**Solution**:

1. Review the dream report for specific files with issues
2. Add missing applyTo/description frontmatter fields
3. Re-run dream protocol to verify fix

**Issue**: Dream protocol not finding memory files
**Solution**:

1. Verify Alex architecture is initialized (run `node .github/muscles/sync-architecture.cjs`)
2. Check that memory files exist in `.github/` (instructions, prompts, skills)
3. Ensure workspace folder is open

**Issue**: No report generated after dream execution
**Solution**:

1. Check `.github/episodic/` folder in workspace
2. Verify write permissions for workspace
3. Review VS Code output panel for errors

---

_Dream state automation provides unconscious architecture maintenance with comprehensive diagnostics that enable optimized conscious meditation focused on knowledge consolidation and learning._
