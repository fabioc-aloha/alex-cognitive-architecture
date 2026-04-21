/**
 * CL1: Agent Activity Dashboard — TreeView provider.
 *
 * Shows agent metrics and activity in the secondary sidebar or explorer.
 */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// ── Types ─────────────────────────────────────────────────────────

interface AgentMetricConfig {
  id: string;
  name: string;
  description: string;
  unit: string;
  higherIsBetter?: boolean;
}

interface ThresholdEntry {
  warning: number;
  critical: number;
}

interface AgentMetricsFile {
  metrics: AgentMetricConfig[];
  thresholds: Record<string, ThresholdEntry>;
}

interface MetricsState {
  [metricId: string]: {
    value: number;
    lastUpdated: string;
  };
}

// ── TreeView Items ────────────────────────────────────────────────

export class AgentActivityItem extends vscode.TreeItem {
  constructor(
    label: string,
    description: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly metricId?: string,
    public readonly children?: AgentActivityItem[],
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.tooltip = `${label}: ${description}`;
  }
}

// ── Formatting ────────────────────────────────────────────────────

function formatMetricValue(value: number, unit: string): string {
  switch (unit) {
    case "percent": return `${value}%`;
    case "seconds": return `${value}s`;
    case "count": return `${value}`;
    default: return `${value} ${unit}`;
  }
}

// ── TreeView Provider ─────────────────────────────────────────────

export class AgentActivityProvider implements vscode.TreeDataProvider<AgentActivityItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AgentActivityItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: AgentActivityItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AgentActivityItem): AgentActivityItem[] {
    if (!this.workspaceRoot) {
      return [new AgentActivityItem("No workspace", "Open a folder", vscode.TreeItemCollapsibleState.None)];
    }

    if (element?.children) {
      return element.children;
    }

    if (!element) {
      return this.getRootItems();
    }

    return [];
  }

  private getRootItems(): AgentActivityItem[] {
    const items: AgentActivityItem[] = [];

    // Load metric definitions
    const configPath = path.join(this.workspaceRoot!, ".github", "config", "agent-metrics.json");
    if (!fs.existsSync(configPath)) {
      return [new AgentActivityItem("Not configured", "No agent-metrics.json found", vscode.TreeItemCollapsibleState.None)];
    }

    let config: AgentMetricsFile;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch {
      return [new AgentActivityItem("Config error", "Invalid agent-metrics.json", vscode.TreeItemCollapsibleState.None)];
    }

    // Load current state
    const statePath = path.join(this.workspaceRoot!, ".agent-metrics-state.json");
    let state: MetricsState = {};
    if (fs.existsSync(statePath)) {
      try {
        state = JSON.parse(fs.readFileSync(statePath, "utf-8"));
      } catch {
        // Start fresh if corrupted
      }
    }

    // Build metric tree items
    const thresholds = config.thresholds ?? {};
    for (const metric of config.metrics) {
      const current = state[metric.id];
      const value = current ? formatMetricValue(current.value, metric.unit) : "—";
      const threshold = thresholds[metric.id];
      const iconName = this.getStatusIcon(metric, current?.value, threshold);

      const item = new AgentActivityItem(
        metric.name,
        value,
        vscode.TreeItemCollapsibleState.None,
        metric.id,
      );
      item.iconPath = new vscode.ThemeIcon(iconName);
      const thresholdInfo = threshold
        ? `\n\nWarning: ${formatMetricValue(threshold.warning, metric.unit)} · Critical: ${formatMetricValue(threshold.critical, metric.unit)}`
        : "";
      item.tooltip = new vscode.MarkdownString(
        `**${metric.name}**\n\n${metric.description}\n\nCurrent: ${value}${thresholdInfo}`,
      );
      items.push(item);
    }

    return items;
  }

  private getStatusIcon(metric: AgentMetricConfig, value?: number, threshold?: ThresholdEntry): string {
    if (value === undefined || !threshold) return "circle-outline";

    // Explicit config field takes priority; fall back to naming heuristic
    const isHigherBetter = metric.higherIsBetter === true
      || metric.id.includes("rate") || metric.id === "tasks-run-count";

    if (isHigherBetter) {
      if (value < threshold.critical) return "error";
      if (value < threshold.warning) return "warning";
      return "check";
    } else {
      if (value > threshold.critical) return "error";
      if (value > threshold.warning) return "warning";
      return "check";
    }
  }
}
