#!/usr/bin/env node
/**
 * @muscle brain-qa
 * @inheritance inheritable
 * @description Generate brain health quality grid for cognitive architecture
 * @version 1.0.0
 * @skill brain-qa
 * @currency 2026-04-20
 * @platform windows,macos,linux
 * @requires node
 *
 * Brain QA - Generates brain health quality grid
 * Location: .github/muscles/brain-qa.cjs
 * 
 * Single responsibility: Scan cognitive architecture, output quality grid.
 * Other trifectas handle fixing issues identified in the grid.
 * 
 * Pass criteria (all types):
 *   fm       - Frontmatter complete (type-specific required fields)
 *   currency - Updated within CURRENCY_MAX_DAYS (90 days)
 * 
 * Informational dimensions (shown in grid, not scored):
 *   tri    - Trifecta complete (if workflow skill, has .instructions.md)
 *   inh    - Inheritance (1 = master-only, 0 = synced to heirs)
 *            Validated during currency audits to ensure master-only items don't leak
 *   cur    - Currency date (YYYY-MM-DD) when content was last researched & updated
 * 
 * 
 * Usage:
 *   node brain-qa.cjs              # Generate grid to .github/quality/
 *   node brain-qa.cjs --stdout     # Output to stdout instead of file
 */

"use strict";

const fs = require("fs");
const path = require("path");

// --- Config ---
const ROOT = path.resolve(__dirname, "..", "..");
const GH = path.join(ROOT, ".github");
const QUALITY_DIR = path.join(GH, "quality");
const STDOUT_MODE = process.argv.includes("--stdout");

// --- Token Waste Detection ---
// Brain files are LLM-consumed. Mermaid diagrams render for humans, not LLMs.
// LLMs see raw syntax like "flowchart LR" and "style X fill:#..." which waste tokens.
// Better: Use concise prose descriptions (e.g., "A → B → C").
//
// EXCEPTION: Skills that TEACH Mermaid (markdown-mermaid) may legitimately have examples.
// These should be minimal and clearly labeled as "example output" not workflow docs.

/**
 * Detect token waste patterns in brain files
 * @param {string} content - File content
 * @returns {{mermaidBlocks: number, mermaidLines: number, styleLines: number, wasteScore: number}}
 */
function detectTokenWaste(content) {
  // Count Mermaid blocks
  const mermaidMatches = content.match(/```mermaid[\s\S]*?```/g) || [];
  const mermaidBlocks = mermaidMatches.length;
  
  // Count lines inside Mermaid blocks
  const mermaidLines = mermaidMatches.reduce((sum, block) => {
    return sum + block.split('\n').length;
  }, 0);
  
  // Count style/linkStyle lines (pure visual, zero value to LLM)
  const styleLines = (content.match(/^\s*(style|linkStyle)\s+/gm) || []).length;
  
  // Calculate waste score (0 = clean, higher = more waste)
  // Each Mermaid block = 5 points (significant waste)
  // Each style line = 1 point (minor waste)
  const wasteScore = (mermaidBlocks * 5) + styleLines;
  
  return { mermaidBlocks, mermaidLines, styleLines, wasteScore };
}

// --- Ensure quality folder exists ---
if (!fs.existsSync(QUALITY_DIR)) {
  fs.mkdirSync(QUALITY_DIR, { recursive: true });
}

// --- Load master-only skills from sync-architecture.cjs ---
function getMasterOnlySkills() {
  const syncPath = path.join(GH, "muscles", "sync-architecture.cjs");
  if (!fs.existsSync(syncPath)) return new Set();

  const content = fs.readFileSync(syncPath, "utf-8");
  const masterOnly = new Set();

  // Extract SKILL_EXCLUSIONS map entries with "master-only"
  const mapMatch = content.match(/const SKILL_EXCLUSIONS = \{([\s\S]*?)\};/);
  if (mapMatch) {
    const entries = mapMatch[1].matchAll(/"([\w-]+)":\s*"master-only"/g);
    for (const entry of entries) {
      masterOnly.add(entry[1]);
    }
  }

  return masterOnly;
}

const MASTER_ONLY_SKILLS = getMasterOnlySkills();

// --- Currency freshness ---
// Pass requires currency updated within this many days
const CURRENCY_MAX_DAYS = 90;

function isCurrencyRecent(currency) {
  if (currency === '-') return false;
  const currDate = new Date(currency);
  if (isNaN(currDate.getTime())) return false;
  const daysSince = Math.floor((Date.now() - currDate) / (1000 * 60 * 60 * 24));
  return daysSince <= CURRENCY_MAX_DAYS;
}

// --- Check if skill has corresponding instruction (for trifecta) ---
function hasMatchingInstruction(skillName) {
  const instrPath = path.join(GH, "instructions", `${skillName}.instructions.md`);
  return fs.existsSync(instrPath);
}

// --- Check if skill describes a workflow (needs trifecta) ---
function isWorkflowSkill(content) {
  // Workflow indicators: phase/step/stage headings, workflow/procedure/process sections
  const workflowPatterns = [
    /(?:^|\n)##?\s*(?:phase|step|stage)\s*\d/i,  // Phase 1, Step 2, etc.
    /(?:^|\n)##?\s*workflow/i,                    // ## Workflow section
    /(?:^|\n)##?\s*procedure/i,                   // ## Procedure section
    /(?:^|\n)##?\s*process/i,                     // ## Process section
  ];
  return workflowPatterns.some(p => p.test(content));
}

// --- Skill Quality Scanner ---
function scanSkills() {
  const skillsDir = path.join(GH, "skills");
  if (!fs.existsSync(skillsDir)) return [];

  const results = [];
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const name of skillDirs) {
    const skillPath = path.join(skillsDir, name, "SKILL.md");
    if (!fs.existsSync(skillPath)) continue;

    const content = fs.readFileSync(skillPath, "utf-8");
    const lines = content.split("\n").length;

    // Check frontmatter completeness
    const hasName = /^name:/m.test(content);
    const hasDesc = /^description:/m.test(content);
    const hasApplyTo = /^applyTo:/m.test(content);
    const hasTier = /^tier:/m.test(content);
    const fmComplete = hasName && hasDesc && hasApplyTo && hasTier;

    // Extract tier value (informational)
    const tierMatch = content.match(/^tier:\s*(\w+)/m);
    const tier = tierMatch ? tierMatch[1].toLowerCase() : 'standard';

    // Check trifecta (only flag if workflow skill missing instruction)
    const isWorkflow = isWorkflowSkill(content);
    const hasInstr = hasMatchingInstruction(name);
    const triComplete = !isWorkflow || hasInstr;

    // Check inheritance (master-only)
    const isMasterOnly = MASTER_ONLY_SKILLS.has(name);

    // Extract currency date from frontmatter
    const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Quality flags (informational)
    const flags = {
      fm: fmComplete ? 1 : 0,
      tri: triComplete ? 1 : 0,
      inh: isMasterOnly ? 1 : 0,
    };

    // Pass = frontmatter complete AND currency recent
    const pass = fmComplete && isCurrencyRecent(currency);

    const waste = detectTokenWaste(content);

    results.push({ name, lines, flags, tier, pass, isWorkflow, waste, currency });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Agent Scanner ---
function scanAgents() {
  const agentsDir = path.join(GH, "agents");
  if (!fs.existsSync(agentsDir)) return [];

  const results = [];
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith(".agent.md"));

  for (const file of agentFiles) {
    const content = fs.readFileSync(path.join(agentsDir, file), "utf-8");
    const lines = content.split("\n").length;
    const name = file.replace(".agent.md", "");

    // Check frontmatter completeness (all 4 required)
    const hasDesc = /^description:/m.test(content);
    const hasName = /^name:/m.test(content);
    const hasModel = /^model:/m.test(content);
    const hasTools = /^tools:/m.test(content);
    const fmComplete = hasDesc && hasName && hasModel && hasTools;

    // Check handoffs
    const hasHandoffs = /^handoffs:/m.test(content);

    // Check persona (has mental model / when to use / persona section)
    const hasPersona = /##\s*(mental model|when to use|persona|mindset|core directive|core identity)/i.test(content);

    // Extract currency date from frontmatter
    const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Token waste detection (Mermaid diagrams, style lines)
    const waste = detectTokenWaste(content);

    const flags = {
      fm: fmComplete ? 1 : 0,
      handoffs: hasHandoffs ? 1 : 0,
      persona: hasPersona ? 1 : 0,
    };

    // Pass = frontmatter complete AND currency recent
    const pass = fmComplete && isCurrencyRecent(currency);
    results.push({ name, lines, flags, pass, currency, waste });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Instruction Scanner ---
function scanInstructions() {
  const instrDir = path.join(GH, "instructions");
  if (!fs.existsSync(instrDir)) return [];

  // Get list of existing skills for trifecta check
  const skillsDir = path.join(GH, "skills");
  const existingSkills = new Set();
  if (fs.existsSync(skillsDir)) {
    fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .forEach(d => existingSkills.add(d.name));
  }

  const results = [];
  const files = fs.readdirSync(instrDir).filter(f => f.endsWith(".instructions.md"));

  for (const file of files) {
    const content = fs.readFileSync(path.join(instrDir, file), "utf-8");
    const lines = content.split("\n").length;
    const name = file.replace(".instructions.md", "");

    // Check frontmatter completeness (description + application for discoverability)
    const hasDesc = /^description:/m.test(content);
    const hasApplication = /^application:/m.test(content);
    const fmComplete = hasDesc && hasApplication;

    // Check depth (>50 lines for substantive content)
    const hasDepth = lines > 50;

    // Check structure (≥2 ## section headers)
    const sectionCount = (content.match(/^##\s+/gm) || []).length;
    const hasStructure = sectionCount >= 2;

    // Check trifecta (has matching skill)
    const hasSkill = existingSkills.has(name);

    // Extract currency date from frontmatter
    const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    const flags = {
      fm: fmComplete ? 1 : 0,
      depth: hasDepth ? 1 : 0,
      sect: hasStructure ? 1 : 0,
      skill: hasSkill ? 1 : 0,
    };

    // Pass = frontmatter complete AND currency recent
    const pass = fmComplete && isCurrencyRecent(currency);

    // Token waste detection (Mermaid diagrams, style lines)
    const waste = detectTokenWaste(content);

    results.push({ name, lines, flags, pass, waste, currency });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Prompt Scanner ---
function scanPrompts() {
  const promptsDir = path.join(GH, "prompts");
  if (!fs.existsSync(promptsDir)) return [];

  const results = [];

  // Collect prompt files from root and subdirectories (e.g., loop/)
  const entries = fs.readdirSync(promptsDir, { withFileTypes: true });
  const promptFiles = [];

  // Root-level prompts
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith(".prompt.md")) {
      promptFiles.push({ file: e.name, subdir: null });
    }
  }

  // Subdirectory prompts (e.g., prompts/loop/*.prompt.md)
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const subPath = path.join(promptsDir, e.name);
    const subFiles = fs.readdirSync(subPath).filter(f => f.endsWith(".prompt.md"));
    for (const sf of subFiles) {
      promptFiles.push({ file: sf, subdir: e.name });
    }
  }

  for (const { file, subdir } of promptFiles) {
    const fullPath = subdir
      ? path.join(promptsDir, subdir, file)
      : path.join(promptsDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split("\n").length;
    const name = file.replace(".prompt.md", "");

    const hasDesc = /^description:/m.test(content);
    const hasApp = /^application:/m.test(content);
    const hasAgent = /^agent:/m.test(content) || /^mode:\s*agent/m.test(content);

    // Extract currency date from frontmatter
    const currencyMatch = content.match(/^currency:\s*(\d{4}-\d{2}-\d{2})/m);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    const flags = {
      desc: hasDesc ? 1 : 0,
      app: hasApp ? 1 : 0,
      agent: hasAgent ? 1 : 0,
      over20: lines > 20 ? 1 : 0,
    };

    const score = flags.desc + flags.app + flags.agent + flags.over20;
    // desc + app are GATES (prompt fm) AND currency recent
    const pass = hasDesc && hasApp && isCurrencyRecent(currency);
    results.push({ name, lines, flags, pass, subdir, currency });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Muscle Scanner ---
function scanMuscles() {
  const musclesDir = path.join(GH, "muscles");
  if (!fs.existsSync(musclesDir)) return [];

  // Helper to read @inheritance from file header
  function getInheritanceFromHeader(content) {
    const header = content.slice(0, 2000); // ~50 lines
    const match = header.match(/@inheritance\s+(master-only|inheritable)/);
    return match ? match[1] : 'inheritable'; // default
  }

  // Categorize muscles by pattern
  const CONVERTERS = ['md-to-word', 'md-to-html', 'md-to-eml', 'docx-to-md', 'md-scaffold', 'dashboard-scaffold', 'nav-inject'];
  const VALIDATION = ['brain-qa', 'audit', 'validate', 'converter-qa', 'markdown-lint'];
  const ANALYSIS = ['analyze', 'chart-recommend', 'data-profile', 'data-ingest'];
  const BUILD = ['build-extension', 'sync-architecture', 'install-hooks', 'new-skill'];

  function categorize(name) {
    const base = name.replace(/\.(cjs|js|ts|ps1)$/, '');
    if (CONVERTERS.some(c => base.includes(c))) return 'converter';
    if (VALIDATION.some(v => base.includes(v))) return 'validation';
    if (ANALYSIS.some(a => base.includes(a))) return 'analysis';
    if (BUILD.some(b => base.includes(b))) return 'build';
    return 'utility';
  }

  const results = [];
  const muscleExtensions = ['.cjs', '.js', '.ts', '.ps1'];
  const files = fs.readdirSync(musclesDir)
    .filter(f => muscleExtensions.some(ext => f.endsWith(ext)))
    .filter(f => !f.includes('.bak'))   // Exclude backup files
    .filter(f => !f.includes('.test.')); // Exclude test files

  for (const file of files) {
    const filePath = path.join(musclesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lineCount = content.split("\n").length;
    const name = file;

    // Get language from extension
    const ext = path.extname(file);
    const lang = ext === '.ps1' ? 'ps' : ext === '.ts' ? 'ts' : 'js';

    // Get inheritance from @inheritance tag in file header
    const inh = getInheritanceFromHeader(content) === 'master-only' ? 1 : 0;

    // Check for well-documented code (header + inline comments)
    // Header: JSDoc block or PowerShell comment block
    const hasHeader = /^\/\*\*[\s\S]*?\*\//m.test(content) || /^<#[\s\S]*?#>/m.test(content);
    // Inline comments: at least 5 comment lines (// or #) throughout the code
    const inlineCommentCount = (content.match(/^\s*(\/\/|#(?!!))[^\n]*/gm) || []).length;
    const hasInlineComments = inlineCommentCount >= 5;
    const isWellDocumented = hasHeader && hasInlineComments;

    // Check for error handling and resiliency
    // JS: try/catch, .catch(), throw
    // PS: try/catch, $ErrorActionPreference, -ErrorAction, throw
    const jsErrorPatterns = /try\s*\{|\.catch\s*\(|catch\s*\(/i.test(content);
    const psErrorPatterns = /\$ErrorActionPreference|\-ErrorAction|try\s*\{/i.test(content);
    const hasErrorHandling = lang === 'ps' ? psErrorPatterns : jsErrorPatterns;

    // Check cross-platform compatibility (Windows/macOS)
    // JS: use path.join/path.resolve, avoid hardcoded separators
    // PS: use Join-Path/Split-Path, avoid hardcoded separators
    let isCrossPlatform = false;
    if (lang === 'ps') {
      // PowerShell: must use Join-Path or Split-Path for path operations
      const usesPathCmdlets = /Join-Path|Split-Path|\$PSScriptRoot/i.test(content);
      const hasHardcodedSeparators = /['"][^'"]*\\[^'"]*['"]/.test(content) && !/\\n|\\r|\\t/.test(content);
      isCrossPlatform = usesPathCmdlets && !hasHardcodedSeparators;
    } else {
      // JS/TS: must use path module for path operations
      const usesPathModule = /path\.(join|resolve|dirname|basename|sep)/i.test(content);
      const hasHardcodedSeparators = /['"][^'"]*[\\/][^'"]*['"]/.test(content) && !/\\n|\\r|\\t|https?:|file:|\/\//.test(content);
      isCrossPlatform = usesPathModule || !hasHardcodedSeparators;
    }

    // Extract currency date (when content was last researched against latest practices)
    const currencyMatch = content.match(/@currency\s*:?\s*(\d{4}-\d{2}-\d{2})/i);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    // Extract standard metadata tags from header comment
    // Format: @tag value (with optional colon)
    // Handle both CRLF and LF line endings
    const extractTag = (tag) => {
      const match = content.match(new RegExp(`@${tag}\\s*:?\\s*(.+?)(?:\\r?\\n|\\*|$)`, 'i'));
      return match ? match[1].trim() : null;
    };
    
    const meta = {
      muscle: extractTag('muscle'),           // Canonical muscle name
      description: extractTag('description'), // What it does
      skill: extractTag('skill'),             // Linked skill name
      platform: extractTag('platform'),       // Supported platforms (windows,macos,linux)
      requires: extractTag('requires'),       // External dependencies
    };
    
    // Check if muscle has standard header (all required tags present)
    // Required: @muscle, @description, @platform, @requires
    const hasStandardHeader = !!(meta.muscle && meta.description && meta.platform && meta.requires);

    // Get category
    const category = categorize(file);

    const flags = {
      comments: isWellDocumented ? 1 : 0,
      err: hasErrorHandling ? 1 : 0,
      compat: isCrossPlatform ? 1 : 0,
    };

    // Pass = standard header (muscle fm) AND currency recent
    const pass = hasStandardHeader && isCurrencyRecent(currency);

    results.push({ name, lines: lineCount, lang, category, inh, flags, pass, meta, hasStandardHeader, currency });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Scan Hooks ---
function scanHooks() {
  const hooksDir = path.join(GH, "muscles", "hooks");
  if (!fs.existsSync(hooksDir)) return [];

  const results = [];
  const files = fs.readdirSync(hooksDir)
    .filter(f => f.endsWith('.cjs') || f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(hooksDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lineCount = content.split("\n").length;
    const name = file;

    // Check for header documentation (JSDoc block)
    const hasHeader = /^\/\*\*[\s\S]*?\*\//m.test(content);

    // Check for stdin JSON parsing pattern (hooks consume JSON from stdin)
    const hasStdinParse = /readFileSync\s*\(\s*0\s*[,)]|process\.stdin/i.test(content);

    // Check for stdout JSON output (hooks emit JSON to stdout)
    const hasStdoutJson = /JSON\.stringify|console\.log\s*\(\s*JSON/i.test(content);

    // Check for error handling (try/catch around stdin parse or main logic)
    const hasErrorHandling = /try\s*\{[\s\S]*?catch/i.test(content);

    // Determine hook event from filename or content
    const eventMatch = content.match(/hook_event_name.*?["'](.*?)["']/i) ||
                       content.match(/@hook\s+(\S+)/i);
    const event = eventMatch ? eventMatch[1] : name.replace('.cjs', '').replace('.js', '');

    // Extract @currency date
    const currencyMatch = content.match(/@currency\s*:?\s*(\d{4}-\d{2}-\d{2})/i);
    const currency = currencyMatch ? currencyMatch[1] : '-';

    const flags = {
      header: hasHeader ? 1 : 0,
      stdin: hasStdinParse ? 1 : 0,
      stdout: hasStdoutJson ? 1 : 0,
      err: hasErrorHandling ? 1 : 0,
    };

    // Pass = header (hook fm) AND currency recent
    const pass = hasHeader && isCurrencyRecent(currency);

    results.push({ name, lines: lineCount, event, flags, pass, currency });
  }

  // Sort: failing first, then oldest currency, then alphabetically
  return results.sort((a, b) => {
    if (a.pass !== b.pass) return a.pass ? 1 : -1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency < b.currency) return -1;
    if (a.currency > b.currency) return 1;
    return a.name.localeCompare(b.name);
  });
}

// --- Generate Grid ---
function generateGrid() {
  const skills = scanSkills();
  const agents = scanAgents();
  const instructions = scanInstructions();
  const prompts = scanPrompts();
  const muscles = scanMuscles();
  const hooks = scanHooks();

  const date = new Date().toISOString().split("T")[0];
  const lines = [];

  lines.push("# Brain Health Grid");
  lines.push("");
  lines.push(`Generated: ${date}`);
  lines.push("");
  lines.push("> **Scope**: This is a **structural linter**, not a content quality gate. It validates frontmatter and currency freshness — not whether advice is correct, examples are current, or skills conflict. Content accuracy requires semantic review (see below).");
  lines.push("");
  lines.push("## Pass Criteria");
  lines.push("");
  lines.push("All brain file types use the same two-gate pass model:");
  lines.push("");
  lines.push("| Gate | Requirement | Meaning |");
  lines.push("|------|-------------|---------|");
  lines.push(`| **fm** | Frontmatter complete | Type-specific required fields present (visibility to the brain) |`);
  lines.push(`| **currency** | Updated within ${CURRENCY_MAX_DAYS} days | Content researched against current external developments |`);
  lines.push("");
  lines.push("**Pass = fm AND currency**. Other dimensions (tri, handoffs, persona, etc.) are shown as informational columns but do not affect pass/fail.");
  lines.push("");
  lines.push("### Type-Specific fm Requirements");
  lines.push("");
  lines.push("| Type | Required Fields |");
  lines.push("|------|----------------|");
  lines.push("| Skills | `name`, `description`, `applyTo`, `tier` |");
  lines.push("| Agents | `description`, `name`, `model`, `tools` |");
  lines.push("| Instructions | `description`, `application` |");
  lines.push("| Prompts | `description`, `application` |");
  lines.push("| Muscles | Standard header: `@muscle`, `@description`, `@platform`, `@requires` |");
  lines.push("| Hooks | JSDoc header block |");
  lines.push("");
  lines.push("### Informational Columns");
  lines.push("");
  lines.push("| Col | Meaning | Value |");
  lines.push("|:---:|---------|-------|");
  lines.push("| **tri** | Trifecta | 1 = workflow skill has matching `.instructions.md` |");
  lines.push("| **inh** | Inheritance | 1 = Master-only, 0 = Synced to heirs |");
  lines.push("| **Currency** | Currency date | YYYY-MM-DD (when content was last researched) |");
  lines.push("");
  lines.push("> **inh validation**: During currency audits, verify that master-only items (`inh=1`) have not leaked to heir projects. The inheritance flag is confirmed by cross-referencing the master-only skills list in `.github/config/MASTER-ALEX-PROTECTED.json`.");
  lines.push("");

  // Currency Audit Process section
  lines.push("## Currency Audit Process");
  lines.push("");
  lines.push(`Files pass when \`currency\` is within ${CURRENCY_MAX_DAYS} days. A currency audit verifies content against current external knowledge (Research → Compare → Audit → Update → Stamp).`);
  lines.push("");
  lines.push("Full checklist and type-specific guidance: `.github/skills/currency-audit/SKILL.md`");
  lines.push("");

  // Priority Queue section
  lines.push("## Priority Queue");
  lines.push("");
  lines.push("> **Sorted by urgency**: Failing first, then no currency date, then oldest currency. Top 20 shown.");
  lines.push("");

  // Collect all items with priority metadata
  const priorityItems = [];
  
  for (const s of skills) {
    priorityItems.push({
      type: 'skill',
      name: s.name,
      path: `../skills/${s.name}/SKILL.md`,
      pass: s.pass,
      currency: s.currency,
    });
  }
  
  for (const a of agents) {
    priorityItems.push({
      type: 'agent',
      name: a.name,
      path: `../agents/${a.name}.agent.md`,
      pass: a.pass,
      currency: a.currency,
    });
  }
  
  for (const i of instructions) {
    priorityItems.push({
      type: 'instruction',
      name: i.name,
      path: `../instructions/${i.name}.instructions.md`,
      pass: i.pass,
      currency: i.currency,
    });
  }
  
  for (const p of prompts) {
    priorityItems.push({
      type: 'prompt',
      name: p.name,
      path: `../prompts/${p.name}.prompt.md`,
      pass: p.pass,
      currency: p.currency,
    });
  }

  for (const m of muscles) {
    priorityItems.push({
      type: 'muscle',
      name: m.name,
      path: `../muscles/${m.name}`,
      pass: m.pass,
      currency: m.currency,
    });
  }

  for (const h of hooks) {
    priorityItems.push({
      type: 'hook',
      name: h.name,
      path: `../muscles/hooks/${h.name}`,
      pass: h.pass,
      currency: h.currency,
    });
  }

  // Sort: failing first, then no currency date, then oldest currency, then alphabetical
  priorityItems.sort((a, b) => {
    if (!a.pass && b.pass) return -1;
    if (a.pass && !b.pass) return 1;
    if (a.currency === '-' && b.currency !== '-') return -1;
    if (a.currency !== '-' && b.currency === '-') return 1;
    if (a.currency !== '-' && b.currency !== '-') {
      if (a.currency < b.currency) return -1;
      if (a.currency > b.currency) return 1;
    }
    return a.name.localeCompare(b.name);
  });

  // Show top 20 items from the sorted list
  const topItems = priorityItems.slice(0, 20);
  
  if (topItems.length > 0) {
    lines.push("| # | Type | File | Pass | Currency | Action |");
    lines.push("|--:|:----:|------|:----:|:--------:|--------|");
    
    topItems.forEach((item, idx) => {
      const nameLink = `[${item.name}](${item.path})`;
      const passIcon = item.pass ? "✓" : "✗";
      const action = !item.pass ? "Fix defects" : (item.currency === '-' ? "Currency audit" : "Re-audit");
      lines.push(`| ${idx + 1} | ${item.type} | ${nameLink} | ${passIcon} | ${item.currency} | ${action} |`);
    });
    
    const totalFailing = priorityItems.filter(i => !i.pass).length;
    const totalNoCurrency = priorityItems.filter(i => i.pass && i.currency === '-').length;
    const totalWithCurrency = priorityItems.filter(i => i.currency !== '-').length;
    // Currency staleness: flag items with currency dates >180 days old
    const now = new Date();
    const STALE_DAYS = 180;
    const staleItems = priorityItems.filter(i => {
      if (i.currency === '-') return false;
      const currDate = new Date(i.currency);
      if (isNaN(currDate.getTime())) return false;
      const daysSince = Math.floor((now - currDate) / (1000 * 60 * 60 * 24));
      return daysSince > STALE_DAYS;
    });
    lines.push("");
    lines.push(`**Queue depth**: ${totalFailing} failing | ${totalNoCurrency} no currency | ${totalWithCurrency} with currency | ${priorityItems.length} total`);
    if (staleItems.length > 0) {
      lines.push(`**Stale currency**: ${staleItems.length} items have currency dates older than ${STALE_DAYS} days — audit recommended`);
    }
  } else {
    lines.push("**Status**: ✅ All brain files passing and reviewed");
  }
  lines.push("");

  // Skills table
  lines.push("## Skills");
  lines.push("");
  lines.push("| Skill | Tier | Lines | fm | tri | Pass | inh | Currency |");
  lines.push("|-------|:----:|------:|:--:|:---:|:----:|:---:|:--------:|");

  for (const s of skills) {
    const f = s.flags;
    const tierAbbr = s.tier.substring(0, 4);
    const passIcon = s.pass ? "✓" : "✗";
    const nameLink = `[${s.name}](../skills/${s.name}/SKILL.md)`;
    lines.push(`| ${nameLink} | ${tierAbbr} | ${s.lines} | ${f.fm} | ${f.tri} | ${passIcon} | ${f.inh} | ${s.currency} |`);
  }

  // Skills summary
  const passing = skills.filter(s => s.pass).length;
  const failing = skills.filter(s => !s.pass).length;

  lines.push("");
  lines.push(`**Summary**: ${skills.length} skills | Passing: ${passing} | Failing: ${failing}`);
  lines.push("");

  // Agents table
  lines.push("## Agents");
  lines.push("");
  lines.push("| Agent | Lines | fm | handoffs | persona | Pass | Currency |");
  lines.push("|-------|------:|:--:|:--------:|:-------:|:----:|:--------:|");

  for (const a of agents) {
    const f = a.flags;
    const passIcon = a.pass ? "✓" : "✗";
    const nameLink = `[${a.name}](../agents/${a.name}.agent.md)`;
    lines.push(`| ${nameLink} | ${a.lines} | ${f.fm} | ${f.handoffs} | ${f.persona} | ${passIcon} | ${a.currency} |`);
  }

  // Agents summary
  const agentsPassing = agents.filter(a => a.pass).length;
  const agentsFailing = agents.filter(a => !a.pass).length;
  lines.push("");
  lines.push(`**Summary**: ${agents.length} agents | Passing: ${agentsPassing} | Failing: ${agentsFailing}`);

  lines.push("");

  // Instructions table
  lines.push("## Instructions");
  lines.push("");
  lines.push("| Instruction | Lines | fm | depth | sect | skill | Pass | Currency |");
  lines.push("|-------------|------:|:--:|:-----:|:----:|:-----:|:----:|:--------:|");

  for (const i of instructions) {
    const f = i.flags;
    const passIcon = i.pass ? "✓" : "✗";
    const nameLink = `[${i.name}](../instructions/${i.name}.instructions.md)`;
    lines.push(`| ${nameLink} | ${i.lines} | ${f.fm} | ${f.depth} | ${f.sect} | ${f.skill} | ${passIcon} | ${i.currency} |`);
  }

  // Instructions summary
  const instrPassing = instructions.filter(i => i.pass).length;
  const instrFailing = instructions.filter(i => !i.pass).length;
  lines.push("");
  lines.push(`**Summary**: ${instructions.length} instructions | Passing: ${instrPassing} | Failing: ${instrFailing}`);

  lines.push("");

  // Prompts table
  lines.push("## Prompts");
  lines.push("");
  lines.push("| Prompt | Lines | desc | app | agent | >20L | Pass | Currency |");
  lines.push("|--------|------:|:----:|:---:|:-----:|:----:|:----:|:--------:|");

  for (const p of prompts) {
    const f = p.flags;
    const passIcon = p.pass ? "✓" : "✗";
    const relPath = p.subdir
      ? `../prompts/${p.subdir}/${p.name}.prompt.md`
      : `../prompts/${p.name}.prompt.md`;
    const nameLink = `[${p.name}](${relPath})`;
    lines.push(`| ${nameLink} | ${p.lines} | ${f.desc} | ${f.app} | ${f.agent} | ${f.over20} | ${passIcon} | ${p.currency} |`);
  }

  // Prompts summary
  const promptsPassing = prompts.filter(p => p.pass).length;
  const promptsFailing = prompts.filter(p => !p.pass).length;
  lines.push("");
  lines.push(`**Summary**: ${prompts.length} prompts | Passing: ${promptsPassing} | Failing: ${promptsFailing}`);

  lines.push("");

  // Muscles table
  lines.push("## Muscles");
  lines.push("");
  lines.push("| Muscle | Lines | Lang | Category | comments | err | compat | Pass | inh | Currency |");
  lines.push("|--------|------:|:----:|----------|:--------:|:---:|:------:|:----:|:---:|:--------:|");

  for (const m of muscles) {
    const f = m.flags;
    const passIcon = m.pass ? "✓" : "✗";
    const nameLink = `[${m.name}](../muscles/${m.name})`;
    lines.push(`| ${nameLink} | ${m.lines} | ${m.lang} | ${m.category} | ${f.comments} | ${f.err} | ${f.compat} | ${passIcon} | ${m.inh} | ${m.currency} |`);
  }

  // Muscles summary
  const musclesPassing = muscles.filter(m => m.pass).length;
  const musclesFailing = muscles.filter(m => !m.pass).length;
  const musclesMasterOnly = muscles.filter(m => m.inh === 1).length;
  const musclesInheritable = muscles.filter(m => m.inh === 0).length;
  const musclesWithStdHeader = muscles.filter(m => m.hasStandardHeader).length;
  const musclesWithSkillLink = muscles.filter(m => m.meta && m.meta.skill).length;
  lines.push("");
  lines.push(`**Summary**: ${muscles.length} muscles | Passing: ${musclesPassing} | Failing: ${musclesFailing}`);
  lines.push("");
  lines.push(`**Inheritance**: Master-only(1): ${musclesMasterOnly} | Inheritable(0): ${musclesInheritable}`);
  lines.push("");
  lines.push(`**Metadata Adoption**: ${musclesWithStdHeader}/${muscles.length} have standard header | ${musclesWithSkillLink}/${muscles.length} linked to skills`);

  // Muscles by category
  const categories = [...new Set(muscles.map(m => m.category))];
  const categoryStats = categories.map(cat => {
    const count = muscles.filter(m => m.category === cat).length;
    return `${cat}: ${count}`;
  }).join(' | ');
  lines.push("");
  lines.push(`**Categories**: ${categoryStats}`);

  // Hooks table
  lines.push("");
  lines.push("## Hooks");
  lines.push("");
  lines.push("| Hook | Lines | Event | header | stdin | stdout | err | Pass | Currency |");
  lines.push("|------|------:|-------|:------:|:-----:|:------:|:---:|:----:|:--------:|");

  for (const h of hooks) {
    const f = h.flags;
    const passIcon = h.pass ? "✓" : "✗";
    const nameLink = `[${h.name}](../muscles/hooks/${h.name})`;
    lines.push(`| ${nameLink} | ${h.lines} | ${h.event} | ${f.header} | ${f.stdin} | ${f.stdout} | ${f.err} | ${passIcon} | ${h.currency} |`);
  }

  // Hooks summary
  const hooksPassing = hooks.filter(h => h.pass).length;
  const hooksFailing = hooks.filter(h => !h.pass).length;
  lines.push("");
  lines.push(`**Summary**: ${hooks.length} hooks | Passing: ${hooksPassing} | Failing: ${hooksFailing}`);

  // Overall summary
  const totalItems = skills.length + agents.length + instructions.length + prompts.length + muscles.length + hooks.length;
  lines.push("");
  lines.push("## Overall");
  lines.push("");
  lines.push(`| Category | Count |`);
  lines.push(`|----------|------:|`);
  lines.push(`| Skills | ${skills.length} |`);
  lines.push(`| Agents | ${agents.length} |`);
  lines.push(`| Instructions | ${instructions.length} |`);
  lines.push(`| Prompts | ${prompts.length} |`);
  lines.push(`| Muscles | ${muscles.length} |`);
  lines.push(`| Hooks | ${hooks.length} |`);
  lines.push(`| **Total** | **${totalItems}** |`);

  // Token Waste Report
  lines.push("");
  lines.push("## Token Waste");
  lines.push("");
  lines.push("> **Philosophy**: Brain files are LLM-consumed. Mermaid diagrams render for humans but waste tokens for LLMs (who see raw syntax like `flowchart LR` and `style X fill:#...`). Use concise prose descriptions instead.");
  lines.push("");
  
  // Collect all waste findings
  const wasteFindings = [];
  
  for (const s of skills) {
    if (s.waste && s.waste.mermaidBlocks > 0) {
      wasteFindings.push({
        type: 'skill',
        name: s.name,
        path: `../skills/${s.name}/SKILL.md`,
        ...s.waste
      });
    }
  }
  
  for (const i of instructions) {
    if (i.waste && i.waste.mermaidBlocks > 0) {
      wasteFindings.push({
        type: 'instruction',
        name: i.name,
        path: `../instructions/${i.name}.instructions.md`,
        ...i.waste
      });
    }
  }
  
  if (wasteFindings.length === 0) {
    lines.push("**Status**: ✅ No Mermaid blocks found in brain files");
  } else {
    // Sort by waste score (highest first)
    wasteFindings.sort((a, b) => b.wasteScore - a.wasteScore);
    
    const totalMermaid = wasteFindings.reduce((sum, f) => sum + f.mermaidBlocks, 0);
    const totalMermaidLines = wasteFindings.reduce((sum, f) => sum + f.mermaidLines, 0);
    const totalStyleLines = wasteFindings.reduce((sum, f) => sum + f.styleLines, 0);
    
    lines.push(`**Status**: ⚠️ Found ${totalMermaid} Mermaid blocks across ${wasteFindings.length} files (~${totalMermaidLines} lines of waste)`);
    lines.push("");
    lines.push("| File | Type | Mermaid | Lines | Style | Score | Fix |");
    lines.push("|------|:----:|--------:|------:|------:|------:|-----|");
    
    for (const f of wasteFindings) {
      const nameLink = `[${f.name}](${f.path})`;
      lines.push(`| ${nameLink} | ${f.type} | ${f.mermaidBlocks} | ${f.mermaidLines} | ${f.styleLines} | ${f.wasteScore} | Replace with prose |`);
    }
    
    lines.push("");
    lines.push("**Fix**: Replace Mermaid diagrams with concise prose, e.g.:");
    lines.push("- `flowchart LR: A --> B --> C` → `**A → B → C**`");
    lines.push("- Complex workflows → Numbered steps or bullet list");
  }

  return lines.join("\n");
}

// --- Exports for testing ---
if (typeof module !== 'undefined') {
  module.exports = {
    detectTokenWaste,
    isWorkflowSkill,
    hasMatchingInstruction,
    isCurrencyRecent,
    scanSkills,
    scanAgents,
    scanInstructions,
    scanPrompts,
    scanMuscles,
    scanHooks,
    generateGrid,
    CURRENCY_MAX_DAYS,
  };
}

// --- Main ---
if (require.main === module) {
  const grid = generateGrid();

  if (STDOUT_MODE) {
    console.log(grid);
  } else {
    const outputPath = path.join(QUALITY_DIR, "brain-health-grid.md");
    fs.writeFileSync(outputPath, grid);
    console.log(`Brain health grid written to ${path.relative(ROOT, outputPath)}`);
  }
}
