/**
 * Config-driven Scheduled Tasks — barrel re-export.
 *
 * The implementation is split across focused modules:
 *   - scheduledTasksTypes.ts — shared types
 *   - taskStore.ts           — CRUD, state, dependency resolution
 *   - workflowGenerator.ts   — GitHub Actions YAML generation
 *   - taskDispatcher.ts      — GitHub API dispatch, PAT management
 *   - scheduledTasksUI.ts    — HTML rendering, wizard UI
 *
 * This barrel preserves the original import path for all consumers.
 */

// Types
export type { ScheduledTask, RunStatus, RunInfo } from "./scheduledTasksTypes.js";

// Task store — CRUD, state, dependencies
export {
  getTaskState,
  recordTaskRun,
  initRunStore,
  getRunInfo,
  clearRunInfo,
  setRunInfo,
  checkDependencies,
  topologicalSort,
  loadScheduledTasks,
  toggleTask,
  deleteTask,
  addTask,
} from "./taskStore.js";

// Workflow generation
export {
  generateWorkflow,
  removeWorkflow,
  hasWorkflow,
  workflowPath,
} from "./workflowGenerator.js";

// GitHub API dispatch & PAT
export {
  hasCopilotPAT,
  setupCopilotPAT,
  getGitHubRepoUrl,
  dispatchAndMonitor,
} from "./taskDispatcher.js";

// UI rendering & wizard
export {
  renderScheduledTasks,
  addTaskWizard,
} from "./scheduledTasksUI.js";
