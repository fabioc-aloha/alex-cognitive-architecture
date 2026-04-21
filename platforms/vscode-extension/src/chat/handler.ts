import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { loadScheduledTasks, topologicalSort, dispatchAndMonitor, getGitHubRepoUrl, type ScheduledTask } from "../sidebar/scheduledTasks.js";

export const chatHandler: vscode.ChatRequestHandler = async (
  request,
  context,
  stream,
  token,
) => {
  if (request.command === "autopilot") {
    return handleAutopilot(request, stream);
  }

  if (request.command === "cloud") {
    return handleCloud(request, stream, token);
  }

  // The brain architecture (.github/) provides skills, instructions,
  // and prompts. The chat participant registers the entry point;
  // Copilot handles the response using the workspace context.
  return {};
};

async function handleAutopilot(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
): Promise<vscode.ChatResult> {
  const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!wsRoot) {
    stream.markdown("Open a workspace folder to use Autopilot.");
    return {};
  }

  const tasks = loadScheduledTasks(wsRoot);
  const query = request.prompt.trim().toLowerCase();

  if (query === "list" || query === "") {
    // List all tasks with status
    stream.markdown("## Autopilot Tasks\n\n");
    const sorted = topologicalSort(tasks);
    for (const t of sorted) {
      const icon = t.mode === "agent" ? "🤖" : "⚙️";
      const status = t.enabled ? "Active" : "Paused";
      const deps = t.dependsOn?.length ? ` ← depends on: ${t.dependsOn.join(", ")}` : "";
      stream.markdown(`- ${icon} **${t.name}** — ${status}${deps}\n`);
    }
    stream.markdown(`\n*${tasks.length} tasks configured. Use \`/autopilot status\` for run history.*`);
    return {};
  }

  if (query === "status") {
    // Show enabled tasks with schedule info
    stream.markdown("## Autopilot Status\n\n");
    const enabled = tasks.filter((t) => t.enabled);
    const disabled = tasks.filter((t) => !t.enabled);
    stream.markdown(`**${enabled.length}** active · **${disabled.length}** paused\n\n`);
    for (const t of enabled) {
      stream.markdown(`- **${t.name}** — \`${t.schedule}\`\n`);
    }
    return {};
  }

  if (query.startsWith("run ")) {
    const taskId = query.slice(4).trim();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      stream.markdown(`Task \`${taskId}\` not found. Use \`/autopilot list\` to see available tasks.`);
      return {};
    }
    if (task.mode === "agent" && task.promptFile) {
      const promptPath = path.join(wsRoot, task.promptFile);
      const resolved = path.resolve(promptPath);
      if (!resolved.toLowerCase().startsWith(wsRoot.toLowerCase())) {
        stream.markdown("Invalid prompt file path.");
        return {};
      }
      if (fs.existsSync(resolved)) {
        const promptContent = fs.readFileSync(resolved, "utf-8")
          .replace(/^---[\s\S]*?---\s*/, "").trim();
        stream.markdown(`Running **${task.name}**...\n\n${promptContent}`);
      } else {
        stream.markdown(`Prompt file not found: \`${task.promptFile}\``);
      }
    } else {
      stream.markdown(`Task **${task.name}** uses direct mode (script: \`${task.muscle ?? "n/a"}\`). Run it from the Autopilot tab or GitHub Actions.`);
    }
    return {};
  }

  // Default help
  stream.markdown("## Autopilot Commands\n\n");
  stream.markdown("- `/autopilot list` — Show all configured tasks\n");
  stream.markdown("- `/autopilot status` — Show active tasks and schedules\n");
  stream.markdown("- `/autopilot run <task-id>` — Run a specific task\n");
  return {};
}

// ── CL5: /cloud command — dispatch tasks to GitHub Actions ────────

async function handleCloud(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
): Promise<vscode.ChatResult> {
  const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!wsRoot) {
    stream.markdown("Open a workspace folder to use cloud dispatch.");
    return {};
  }

  const tasks = loadScheduledTasks(wsRoot);
  const query = request.prompt.trim().toLowerCase();

  if (query === "" || query === "help") {
    stream.markdown("## Cloud Dispatch\n\n");
    stream.markdown("Dispatch Autopilot tasks to GitHub Actions for cloud execution.\n\n");
    stream.markdown("- `/cloud list` — Show cloud-eligible tasks\n");
    stream.markdown("- `/cloud run <task-id>` — Dispatch a task to GitHub Actions\n");
    return {};
  }

  if (query === "list") {
    const cloudTasks = tasks.filter((t) => t.enabled && t.mode === "agent");
    if (cloudTasks.length === 0) {
      stream.markdown("No cloud-eligible tasks found. Enable agent-mode tasks in scheduled-tasks.json.");
      return {};
    }
    stream.markdown("## Cloud-Eligible Tasks\n\n");
    for (const t of cloudTasks) {
      stream.markdown(`- **${t.id}** — ${t.name}\n`);
    }
    stream.markdown(`\n*Use \`/cloud run <task-id>\` to dispatch.*`);
    return {};
  }

  if (query.startsWith("run ")) {
    const taskId = query.slice(4).trim();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      stream.markdown(`Task \`${taskId}\` not found. Use \`/cloud list\` to see eligible tasks.`);
      return {};
    }
    if (!task.enabled) {
      stream.markdown(`Task **${task.name}** is paused. Enable it first.`);
      return {};
    }

    const repoUrl = getGitHubRepoUrl(wsRoot);
    if (!repoUrl) {
      stream.markdown(`Could not determine GitHub repo URL from workspace.`);
      return {};
    }

    stream.markdown(`Dispatching **${task.name}** to GitHub Actions...\n\n`);
    try {
      const disposable = await dispatchAndMonitor(repoUrl, task.id, () => {});
      token.onCancellationRequested(() => disposable.dispose());
      stream.markdown(`Workflow dispatched. Check the Autopilot tab or GitHub Actions for progress.`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const msg = raw
        .replace(/[A-Z]:\\[\w\\.\.\-\s]+/gi, "[path]")
        .replace(/\/(?:home|usr|tmp|var|etc|Users|mnt)\/[\w/.\.\-]+/g, "[path]");
      stream.markdown(`Dispatch failed: ${msg}`);
    }
    return {};
  }

  stream.markdown("Unknown cloud command. Use `/cloud help` for usage.");
  return {};
}
