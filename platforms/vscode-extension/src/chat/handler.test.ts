import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock vscode module before importing handler
vi.mock("vscode", () => ({
  workspace: {
    workspaceFolders: [{ uri: { fsPath: "/test/workspace" } }],
  },
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
});
