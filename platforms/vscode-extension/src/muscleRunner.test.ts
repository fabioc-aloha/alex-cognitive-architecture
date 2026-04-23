import { describe, it, expect, vi, beforeEach } from "vitest";
import * as path from "path";

// Mock vscode (not available in test environment)
vi.mock("vscode", () => ({
  window: {
    createTerminal: vi.fn(() => ({ show: vi.fn(), sendText: vi.fn() })),
    createOutputChannel: vi.fn(() => ({
      show: vi.fn(),
      appendLine: vi.fn(),
    })),
    showInformationMessage: vi.fn(),
  },
  commands: { executeCommand: vi.fn() },
}));

// Mock settings (depends on vscode)
vi.mock("./settings.js", () => ({
  muscleTimeout: () => 120_000,
  muscleMaxBuffer: () => 10 * 1024 * 1024,
}));

// Mock fs.existsSync
vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  return { ...actual, existsSync: vi.fn(() => true) };
});

// Mock child_process.execFile
vi.mock("child_process", async () => {
  const actual =
    await vi.importActual<typeof import("child_process")>("child_process");
  return { ...actual, execFile: vi.fn() };
});

import * as fs from "fs";
import { execFile } from "child_process";
import { runMuscle, runMuscleInTerminal } from "./muscleRunner.js";
import * as vscode from "vscode";

const WORKSPACE = "/fake/workspace";

describe("runMuscle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  it("returns error when muscle file does not exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = await runMuscle(WORKSPACE, "missing.cjs");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Muscle not found: missing.cjs");
  });

  it("resolves correct muscle path", async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb: any) => {
        cb(null, "ok", "");
        return {} as any;
      },
    );
    await runMuscle(WORKSPACE, "brain-qa.cjs", ["--quick"]);
    const expectedPath = path.join(
      WORKSPACE,
      ".github",
      "muscles",
      "brain-qa.cjs",
    );
    expect(vi.mocked(execFile)).toHaveBeenCalledWith(
      "node",
      [expectedPath, "--quick"],
      expect.objectContaining({ cwd: WORKSPACE, timeout: 120_000 }),
      expect.any(Function),
    );
  });

  it("returns stdout and stderr on success", async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb: any) => {
        cb(null, "output here", "warnings here");
        return {} as any;
      },
    );
    const result = await runMuscle(WORKSPACE, "test.cjs");
    expect(result.code).toBe(0);
    expect(result.stdout).toBe("output here");
    expect(result.stderr).toBe("warnings here");
  });

  it("handles numeric error code", async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb: any) => {
        const err = Object.assign(new Error("fail"), { code: 2 });
        cb(err, "", "error output");
        return {} as any;
      },
    );
    const result = await runMuscle(WORKSPACE, "test.cjs");
    expect(result.code).toBe(2);
  });

  it("handles signal kill (returns 137)", async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb: any) => {
        const err = Object.assign(new Error("killed"), {
          signal: "SIGKILL",
          code: null,
        });
        cb(err, "", "");
        return {} as any;
      },
    );
    const result = await runMuscle(WORKSPACE, "test.cjs");
    expect(result.code).toBe(137);
  });

  it("handles string error code (e.g., maxbuffer)", async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb: any) => {
        const err = Object.assign(new Error("stdout maxBuffer exceeded"), {
          code: "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
        });
        cb(err, "partial", "");
        return {} as any;
      },
    );
    const result = await runMuscle(WORKSPACE, "test.cjs");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("ERR_CHILD_PROCESS_STDIO_MAXBUFFER");
    expect(result.stderr).toContain("stdout maxBuffer exceeded");
  });

  it("handles error with no code and no signal", async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb: any) => {
        cb(new Error("unknown"), "", "");
        return {} as any;
      },
    );
    const result = await runMuscle(WORKSPACE, "test.cjs");
    expect(result.code).toBe(1);
  });

  it("handles null stdout/stderr from callback", async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb: any) => {
        cb(null, null, null);
        return {} as any;
      },
    );
    const result = await runMuscle(WORKSPACE, "test.cjs");
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });

  it("uses 10MB maxBuffer", async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: any, _args: any, _opts: any, cb: any) => {
        cb(null, "", "");
        return {} as any;
      },
    );
    await runMuscle(WORKSPACE, "test.cjs");
    expect(vi.mocked(execFile)).toHaveBeenCalledWith(
      "node",
      expect.any(Array),
      expect.objectContaining({ maxBuffer: 10 * 1024 * 1024 }),
      expect.any(Function),
    );
  });
});

describe("runMuscleInTerminal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a terminal with the label", () => {
    const mockTerminal = { show: vi.fn(), sendText: vi.fn() };
    vi.mocked(vscode.window.createTerminal).mockReturnValue(
      mockTerminal as any,
    );
    runMuscleInTerminal(WORKSPACE, "qa.cjs", [], "Brain QA");
    expect(vscode.window.createTerminal).toHaveBeenCalledWith(
      "Alex: Brain QA",
    );
    expect(mockTerminal.show).toHaveBeenCalled();
  });

  it("sends command with properly quoted args", () => {
    const mockTerminal = { show: vi.fn(), sendText: vi.fn() };
    vi.mocked(vscode.window.createTerminal).mockReturnValue(
      mockTerminal as any,
    );
    runMuscleInTerminal(WORKSPACE, "qa.cjs", ["--mode", "full"], "QA");
    const sentCmd = mockTerminal.sendText.mock.calls[0][0] as string;
    expect(sentCmd).toContain('"--mode"');
    expect(sentCmd).toContain('"full"');
  });

  it("escapes backslashes and double quotes in args", () => {
    const mockTerminal = { show: vi.fn(), sendText: vi.fn() };
    vi.mocked(vscode.window.createTerminal).mockReturnValue(
      mockTerminal as any,
    );
    runMuscleInTerminal(
      WORKSPACE,
      "qa.cjs",
      ['arg with "quotes" and \\backslash'],
      "QA",
    );
    const sentCmd = mockTerminal.sendText.mock.calls[0][0] as string;
    expect(sentCmd).toContain('\\"quotes\\"');
    expect(sentCmd).toContain("\\\\backslash");
  });

  it("returns the terminal instance", () => {
    const mockTerminal = { show: vi.fn(), sendText: vi.fn() };
    vi.mocked(vscode.window.createTerminal).mockReturnValue(
      mockTerminal as any,
    );
    const result = runMuscleInTerminal(WORKSPACE, "qa.cjs", [], "QA");
    expect(result).toBe(mockTerminal);
  });
});
