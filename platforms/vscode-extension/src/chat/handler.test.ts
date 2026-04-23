import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock vscode module before importing handler
vi.mock("vscode", () => ({
  workspace: {
    workspaceFolders: [{ uri: { fsPath: "/test/workspace" } }],
  },
}));

// Mock fs to avoid file system access
vi.mock("fs", () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(() => ""),
}));

// Mock sidebar/scheduledTasks to avoid real task loading
vi.mock("../sidebar/scheduledTasks.js", () => ({
  loadScheduledTasks: vi.fn(() => []),
  topologicalSort: vi.fn((tasks: unknown[]) => tasks),
  dispatchAndMonitor: vi.fn(),
  getGitHubRepoUrl: vi.fn(() => null),
}));

import { chatHandler } from "./handler";

// -- Test helpers ------------------------------------------------------------

function createMockStream() {
  return {
    markdown: vi.fn(),
    button: vi.fn(),
    progress: vi.fn(),
    reference: vi.fn(),
    anchor: vi.fn(),
  };
}

function createMockRequest(command?: string, prompt = "") {
  return {
    command,
    prompt,
    references: [],
    toolReferences: [],
  };
}

// -- Tests -------------------------------------------------------------------

describe("chat handler: incremental rendering compatibility", () => {
  let mockStream: ReturnType<typeof createMockStream>;

  beforeEach(() => {
    mockStream = createMockStream();
  });

  it("returns a ChatResult object", async () => {
    const request = createMockRequest();
    const result = await chatHandler(
      request as any,
      { history: [] } as any,
      mockStream as any,
      { isCancellationRequested: false, onCancellationRequested: vi.fn() } as any,
    );
    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
  });

  it("autopilot list command uses stream.markdown()", async () => {
    const request = createMockRequest("autopilot", "list");
    await chatHandler(
      request as any,
      { history: [] } as any,
      mockStream as any,
      { isCancellationRequested: false, onCancellationRequested: vi.fn() } as any,
    );
    expect(mockStream.markdown).toHaveBeenCalled();
    // Incremental rendering requires each markdown call to be valid standalone
    for (const call of mockStream.markdown.mock.calls) {
      expect(typeof call[0]).toBe("string");
    }
  });

  it("autopilot status command uses stream.markdown()", async () => {
    const request = createMockRequest("autopilot", "status");
    await chatHandler(
      request as any,
      { history: [] } as any,
      mockStream as any,
      { isCancellationRequested: false, onCancellationRequested: vi.fn() } as any,
    );
    expect(mockStream.markdown).toHaveBeenCalled();
  });

  it("default handler returns empty object (delegates to Copilot)", async () => {
    const request = createMockRequest(undefined, "help me code");
    const result = await chatHandler(
      request as any,
      { history: [] } as any,
      mockStream as any,
      { isCancellationRequested: false, onCancellationRequested: vi.fn() } as any,
    );
    expect(result).toEqual({});
  });

  it("markdown calls produce string content (not objects)", async () => {
    const request = createMockRequest("autopilot", "");
    await chatHandler(
      request as any,
      { history: [] } as any,
      mockStream as any,
      { isCancellationRequested: false, onCancellationRequested: vi.fn() } as any,
    );
    // All markdown calls should pass strings — incremental rendering
    // animates individual chunks, so each must be valid markdown
    for (const call of mockStream.markdown.mock.calls) {
      expect(typeof call[0]).toBe("string");
      expect(call[0].length).toBeGreaterThan(0);
    }
  });
});
