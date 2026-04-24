import * as vscode from "vscode";

/**
 * Lightweight diagnostic logger for the Alex extension. Writes to a
 * dedicated OutputChannel ("Alex Diagnostics") so users and support
 * can see a timestamped event trail — especially useful when the
 * Welcome view fails to render in an heir workspace.
 *
 * Keep logging cheap and allocation-free on the hot path; avoid PII
 * (file names, workspace paths are OK; file *contents* are not).
 */

let channel: vscode.OutputChannel | undefined;

export function initDiagnostics(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel("Alex Diagnostics");
  }
  return channel;
}

export function getDiagnostics(): vscode.OutputChannel | undefined {
  return channel;
}

export function disposeDiagnostics(): void {
  channel?.dispose();
  channel = undefined;
}

function stamp(): string {
  return new Date().toISOString();
}

function safeError(err: unknown): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}${err.stack ? "\n" + err.stack : ""}`;
  }
  try {
    return String(err);
  } catch {
    return "<unserializable error>";
  }
}

export function logInfo(scope: string, message: string): void {
  channel?.appendLine(`[${stamp()}] [INFO ] [${scope}] ${message}`);
}

export function logWarn(scope: string, message: string): void {
  channel?.appendLine(`[${stamp()}] [WARN ] [${scope}] ${message}`);
}

export function logError(scope: string, message: string, err?: unknown): void {
  const base = `[${stamp()}] [ERROR] [${scope}] ${message}`;
  if (err !== undefined) {
    channel?.appendLine(`${base}\n    ${safeError(err)}`);
  } else {
    channel?.appendLine(base);
  }
}

/**
 * Measure a sync operation and log its duration. Errors are logged and
 * rethrown so callers control the recovery path.
 */
export function timed<T>(scope: string, label: string, fn: () => T): T {
  const start = Date.now();
  try {
    const result = fn();
    logInfo(scope, `${label} ok (${Date.now() - start}ms)`);
    return result;
  } catch (err) {
    logError(scope, `${label} failed (${Date.now() - start}ms)`, err);
    throw err;
  }
}
