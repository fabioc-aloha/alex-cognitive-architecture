import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { execFile } from "child_process";
import { muscleTimeout, muscleMaxBuffer } from "./settings.js";

/**
 * Cache of OutputChannels keyed by channel name. VS Code dedupes channels
 * by name internally, but disposables are not tracked anywhere by default.
 * We cache and dispose explicitly from extension.deactivate().
 */
const channelCache = new Map<string, vscode.OutputChannel>();

function getOrCreateChannel(name: string): vscode.OutputChannel {
  let ch = channelCache.get(name);
  if (!ch) {
    ch = vscode.window.createOutputChannel(name);
    channelCache.set(name, ch);
  }
  return ch;
}

/** Dispose every cached muscle OutputChannel. Call from extension.deactivate. */
export function disposeMuscleChannels(): void {
  for (const ch of channelCache.values()) {
    try { ch.dispose(); } catch { /* ignore */ }
  }
  channelCache.clear();
}

/**
 * Build a standard Phase 2 chatPrompt that references a skill with decision tables.
 * Use this instead of hand-writing prompt strings to prevent drift (HI2).
 *
 * @param skillPath - Relative path to the SKILL.md (e.g., "brain-qa/SKILL.md")
 * @param action - What the LLM should do with the findings
 * @param tableName - Optional: name of the specific decision table to reference
 */
export function skillPrompt(
  skillPath: string,
  action: string,
  tableName?: string,
): string {
  const tableRef = tableName
    ? `Use the skill's ${tableName} to `
    : "Use the skill's decision tables to ";
  return `Read .github/skills/${skillPath} then ${action}. ${tableRef}guide your decisions.`;
}

/**
 * Muscle exit-code contract (HI5):
 *   0 = clean — no issues, no follow-up needed
 *   1 = error — something broke, surface stderr
 *   2 = semantic-review-required — muscle succeeded mechanically,
 *       findings need LLM-assisted review in chat
 *
 * Run a muscle script and return its output.
 * Uses execFile (not execSync via shell) to avoid shell injection.
 */
export function runMuscle(
  workspaceRoot: string,
  muscle: string,
  args: string[] = [],
): Promise<{ code: number; stdout: string; stderr: string }> {
  const musclePath = path.join(workspaceRoot, ".github", "muscles", muscle);
  if (!fs.existsSync(musclePath)) {
    return Promise.resolve({
      code: 1,
      stdout: "",
      stderr: `Muscle not found: ${muscle}`,
    });
  }

  return new Promise((resolve) => {
    execFile("node", [musclePath, ...args], {
      cwd: workspaceRoot,
      maxBuffer: muscleMaxBuffer(),
      timeout: muscleTimeout(),
    }, (err, stdout, stderr) => {
      let exitCode = 0;
      if (err) {
        if (typeof err.code === "number") {
          exitCode = err.code;
        } else if (err.signal) {
          // Process killed by signal (SIGTERM, SIGKILL, etc.)
          exitCode = 137;
        } else {
          exitCode = 1;
        }
        // Surface string error codes (e.g., ERR_CHILD_PROCESS_STDIO_MAXBUFFER)
        if (typeof err.code === "string") {
          stderr = `${err.code}: ${err.message}\n${stderr ?? ""}`;
        }
      }
      resolve({
        code: exitCode,
        stdout: stdout ?? "",
        stderr: stderr ?? "",
      });
    });
  });
}

/**
 * Run a muscle in a visible terminal (for interactive or long-running tasks).
 */
export function runMuscleInTerminal(
  workspaceRoot: string,
  muscle: string,
  args: string[],
  label: string,
): vscode.Terminal {
  const musclePath = path.join(workspaceRoot, ".github", "muscles", muscle);
  const terminal = vscode.window.createTerminal(`Alex: ${label}`);
  terminal.show();
  const quotedArgs = args.map((a) => {
    // Escape backslashes and double quotes to prevent shell injection
    const escaped = a.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
  }).join(" ");
  terminal.sendText(`node "${musclePath}" ${quotedArgs}`.trim());
  return terminal;
}

/**
 * Run muscle, show output in an Output Channel, then optionally open chat
 * for AI-assisted follow-up.
 *
 * ## chatPrompt Contract (EC8)
 *
 * A good Phase 2 chatPrompt:
 *   1. **Reads a skill**: "Read .github/skills/<name>/SKILL.md then..."
 *   2. **References decision tables**: "Use the skill's <table-name> to..."
 *   3. **Defines the action**: "...triage/classify/fix each finding"
 *   4. **Sets boundaries**: what to fix vs track vs ignore
 *
 * A bad chatPrompt: "Fix the issues found" (freeform — no skill, no table,
 * no criteria for what constitutes "fixed").
 *
 * When `code === 2` (semantic-review-required per HI5), the chatPrompt
 * is presented with warning-level urgency. The prompt should guide the
 * LLM through structured decision-making, not hand it a blank page.
 */
export async function muscleAndPrompt(
  workspaceRoot: string,
  muscle: string,
  muscleArgs: string[],
  channelName: string,
  chatPrompt?: string,
): Promise<void> {
  const channel = getOrCreateChannel(channelName);
  channel.show(true);
  channel.appendLine(`Running ${muscle}...`);
  channel.appendLine("");

  const result = await runMuscle(workspaceRoot, muscle, muscleArgs);

  if (result.stdout) {
    channel.appendLine(result.stdout);
  }
  if (result.stderr) {
    channel.appendLine(result.stderr);
  }

  if (result.code !== 0) {
    channel.appendLine(`\n[Exit code: ${result.code}]`);
  }

  channel.appendLine(`\n[Done]`);

  // Exit code 2 = semantic-review-required (HI5 contract).
  // Show an urgent prompt to open chat for LLM-assisted follow-up.
  if (result.code === 2 && chatPrompt) {
    const action = await vscode.window.showWarningMessage(
      `Alex: ${channelName} needs review. Open chat for AI-assisted follow-up?`,
      "Open Chat",
      "Dismiss",
    );
    if (action === "Open Chat") {
      await vscode.commands.executeCommand("workbench.action.chat.open", {
        query: chatPrompt,
      });
    }
  } else if (chatPrompt) {
    const action = await vscode.window.showInformationMessage(
      `Alex: ${channelName} complete. Open chat for follow-up?`,
      "Open Chat",
      "Done",
    );
    if (action === "Open Chat") {
      await vscode.commands.executeCommand("workbench.action.chat.open", {
        query: chatPrompt,
      });
    }
  }
}
