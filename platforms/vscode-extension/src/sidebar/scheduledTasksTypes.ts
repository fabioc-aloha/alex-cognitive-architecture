/**
 * Shared types for the scheduled tasks subsystem.
 */

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  skill?: string;
  mode: "agent" | "direct";
  schedule: string;
  enabled: boolean;
  promptFile?: string;
  muscle?: string;
  muscleArgs?: string[];
  target?: string;
  dependsOn?: string[];
}

export interface ScheduledTasksConfig {
  version: string;
  tasks: ScheduledTask[];
}

export interface TaskStateEntry {
  lastRun: string; // ISO 8601
}

export type TaskStateMap = Record<string, TaskStateEntry>;

export type RunStatus = "queued" | "in_progress" | "completed" | "failure" | "cancelled" | "error";

export interface RunInfo {
  status: RunStatus;
  runUrl?: string;
  conclusion?: string;
}
