import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { execFile } from "child_process";

/**
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
      maxBuffer: 10 * 1024 * 1024,
      timeout: 120_000,
    }, (err, stdout, stderr) => {
      const exitCode = typeof err?.code === "number" ? err.code : (err ? 1 : 0);
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
  const quotedArgs = args.map((a) => `"${a}"`).join(" ");
  terminal.sendText(`node "${musclePath}" ${quotedArgs}`.trim());
  return terminal;
}

/**
 * Run muscle, show output in an Output Channel, then optionally open chat
 * for AI-assisted follow-up.
 */
export async function muscleAndPrompt(
  workspaceRoot: string,
  muscle: string,
  muscleArgs: string[],
  channelName: string,
  chatPrompt?: string,
): Promise<void> {
  const channel = vscode.window.createOutputChannel(channelName);
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

  if (chatPrompt) {
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
