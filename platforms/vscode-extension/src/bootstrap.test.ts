import { describe, it, expect, vi, beforeEach } from "vitest";
import * as path from "path";

// Mock vscode
const mockShowWarning = vi.fn();
const mockShowInfo = vi.fn();
const mockShowError = vi.fn();
vi.mock("vscode", () => ({
  window: {
    showWarningMessage: (...args: any[]) => mockShowWarning(...args),
    showInformationMessage: (...args: any[]) => mockShowInfo(...args),
    showErrorMessage: (...args: any[]) => mockShowError(...args),
  },
  workspace: {
    workspaceFolders: [{ uri: { fsPath: "/test/workspace" } }],
  },
  commands: { executeCommand: vi.fn() },
}));

// Mock sidebar/loopConfigGenerator
vi.mock("./sidebar/loopConfigGenerator.js", () => ({
  writeLoopConfig: vi.fn(),
}));

// Mock aiMemory
vi.mock("./aiMemory.js", () => ({
  resolveAIMemoryPath: vi.fn(() => "/some/path"),
  setupAIMemory: vi.fn(),
}));

// Track fs calls
const fsState: Record<string, string> = {};
const fsDirs: Set<string> = new Set();
vi.mock("fs", () => ({
  existsSync: vi.fn((p: string) => p in fsState || fsDirs.has(p)),
  readFileSync: vi.fn((p: string) => {
    if (p in fsState) return fsState[p];
    throw new Error(`ENOENT: ${p}`);
  }),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
  readdirSync: vi.fn(() => []),
  rmSync: vi.fn(),
  renameSync: vi.fn(),
}));

import * as fs from "fs";
import {
  bootstrapBrainFiles,
  getBrainStatus,
  checkAutoUpgrade,
} from "./bootstrap.js";

const WORKSPACE = "/test/workspace";

function makeContext(version = "8.3.0") {
  return {
    extension: { packageJSON: { version } },
    extensionUri: { fsPath: "/ext/path" },
  } as any;
}

describe("getBrainStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(fsState).forEach((k) => delete fsState[k]);
    fsDirs.clear();
  });

  it("returns not installed when no .github dir exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const status = getBrainStatus(makeContext("8.3.0"));
    expect(status.installed).toBe(false);
    expect(status.bundledVersion).toBe("8.3.0");
    expect(status.needsUpgrade).toBe(false);
  });

  it("returns installed with matching version (no upgrade needed)", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("8.3.0");
    const status = getBrainStatus(makeContext("8.3.0"));
    expect(status.installed).toBe(true);
    expect(status.version).toBe("8.3.0");
    expect(status.needsUpgrade).toBe(false);
  });

  it("detects upgrade needed when versions differ", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("8.2.3");
    const status = getBrainStatus(makeContext("8.3.0"));
    expect(status.installed).toBe(true);
    expect(status.version).toBe("8.2.3");
    expect(status.needsUpgrade).toBe(true);
  });

  it("handles missing version file gracefully", () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      // .github dir exists but version file doesn't
      return String(p).endsWith(".github");
    });
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    const status = getBrainStatus(makeContext("8.3.0"));
    expect(status.installed).toBe(true);
    expect(status.version).toBeUndefined();
    expect(status.needsUpgrade).toBe(true);
  });

  it("returns not installed when no workspace folders", async () => {
    const vscode = await import("vscode");
    const original = vscode.workspace.workspaceFolders;
    (vscode.workspace as any).workspaceFolders = undefined;

    const status = getBrainStatus(makeContext());
    expect(status.installed).toBe(false);

    (vscode.workspace as any).workspaceFolders = original;
  });
});

describe("bootstrapBrainFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(fsState).forEach((k) => delete fsState[k]);
    fsDirs.clear();
  });

  it("blocks deployment in protected workspace", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const result = await bootstrapBrainFiles(makeContext(), true);
    expect(result).toBe(false);
    expect(mockShowWarning).toHaveBeenCalledWith(
      expect.stringContaining("Protected mode"),
    );
  });

  it("shows up-to-date message when versions match", async () => {
    // No protected file, .github exists, version matches
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.includes("MASTER-ALEX-PROTECTED")) return false;
      if (s.endsWith(".github")) return true;
      return true;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("8.3.0");
    const result = await bootstrapBrainFiles(makeContext("8.3.0"));
    expect(result).toBe(false);
    expect(mockShowInfo).toHaveBeenCalledWith(
      expect.stringContaining("up to date"),
    );
  });

  it("returns false when no workspace folders", async () => {
    const vscode = await import("vscode");
    const original = vscode.workspace.workspaceFolders;
    (vscode.workspace as any).workspaceFolders = [];

    const result = await bootstrapBrainFiles(makeContext());
    expect(result).toBe(false);

    (vscode.workspace as any).workspaceFolders = original;
  });

  it("returns false when brain-files dir missing from bundle", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.includes("MASTER-ALEX-PROTECTED")) return false;
      if (s.includes("brain-files")) return false; // source missing
      if (s.endsWith(".github")) return false; // fresh install
      return false;
    });
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    const result = await bootstrapBrainFiles(makeContext());
    expect(result).toBe(false);
    expect(mockShowWarning).toHaveBeenCalledWith(
      expect.stringContaining("Brain files not found"),
    );
  });

  it("catches and reports deployment errors", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      const s = String(p);
      if (s.includes("MASTER-ALEX-PROTECTED")) return false;
      if (s.includes("brain-files")) return true;
      if (s.endsWith(".github")) return false;
      return false;
    });
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });
    vi.mocked(fs.mkdirSync).mockImplementation(() => {
      throw new Error("EPERM: permission denied");
    });

    const result = await bootstrapBrainFiles(makeContext());
    expect(result).toBe(false);
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining("EPERM"),
    );
  });
});

describe("checkAutoUpgrade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when no upgrade needed", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("8.3.0");
    await checkAutoUpgrade(makeContext("8.3.0"));
    expect(mockShowInfo).not.toHaveBeenCalled();
  });

  it("does nothing in protected workspace", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true); // all exist including protected
    vi.mocked(fs.readFileSync).mockReturnValue("8.2.0"); // version mismatch
    await checkAutoUpgrade(makeContext("8.3.0"));
    // Protected workspace → no prompt shown
    expect(mockShowInfo).not.toHaveBeenCalled();
  });

  it("prompts when upgrade available", async () => {
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      if (String(p).includes("MASTER-ALEX-PROTECTED")) return false;
      return true;
    });
    vi.mocked(fs.readFileSync).mockReturnValue("8.2.0");
    mockShowInfo.mockResolvedValue("Later");

    await checkAutoUpgrade(makeContext("8.3.0"));
    expect(mockShowInfo).toHaveBeenCalledWith(
      expect.stringContaining("8.2.0"),
      "Upgrade Now",
      "Later",
    );
  });
});
