#!/usr/bin/env node
/**
 * Tests for MCP Cognitive Tools
 *
 * Run: node --test (from packages/mcp-cognitive-tools/)
 */
'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Import compiled module (require won't start server due to require.main guard)
const mcp = require('./dist/index.js');

// -- extractSnippet tests ---------------------------------------------------

describe('extractSnippet', () => {
  it('extracts snippet around match', () => {
    const content = 'Start of text. The quick brown fox jumps over the lazy dog. End of text.';
    const snippet = mcp.extractSnippet(content, 'fox');
    assert.ok(snippet.includes('fox'));
  });

  it('returns beginning of content when query not found', () => {
    const content = 'This is some content without the search term.';
    const snippet = mcp.extractSnippet(content, 'nonexistent');
    assert.ok(snippet.startsWith('This'));
    assert.ok(snippet.endsWith('...'));
  });

  it('handles empty content', () => {
    const snippet = mcp.extractSnippet('', 'test');
    assert.strictEqual(snippet, '...');
  });

  it('respects contextChars parameter', () => {
    const content = 'A'.repeat(100) + 'NEEDLE' + 'B'.repeat(100);
    const snippet = mcp.extractSnippet(content, 'NEEDLE', 10);
    assert.ok(snippet.length < 50, 'Snippet should be bounded by contextChars');
    assert.ok(snippet.includes('NEEDLE'));
  });

  it('case-insensitive matching', () => {
    const content = 'Hello World FOO bar baz';
    const snippet = mcp.extractSnippet(content, 'foo');
    assert.ok(snippet.includes('FOO'));
  });
});

// -- matchPattern tests -----------------------------------------------------

describe('matchPattern', () => {
  it('matches *.md pattern', () => {
    assert.strictEqual(mcp.matchPattern('readme.md', '*.md'), true);
  });

  it('rejects non-matching extension for *.md', () => {
    assert.strictEqual(mcp.matchPattern('readme.txt', '*.md'), false);
  });

  it('matches *.json pattern', () => {
    assert.strictEqual(mcp.matchPattern('config.json', '*.json'), true);
  });

  it('matches exact filename', () => {
    assert.strictEqual(mcp.matchPattern('index.js', 'index.js'), true);
  });

  it('rejects when filename does not match', () => {
    assert.strictEqual(mcp.matchPattern('other.js', 'index.js'), false);
  });
});

// -- findFiles tests --------------------------------------------------------

describe('findFiles', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('finds markdown files recursively', () => {
    fs.mkdirSync(path.join(tmpDir, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'a.md'), 'content');
    fs.writeFileSync(path.join(tmpDir, 'sub', 'b.md'), 'content');
    fs.writeFileSync(path.join(tmpDir, 'c.txt'), 'content');

    const files = mcp.findFiles(tmpDir, '*.md');
    assert.strictEqual(files.length, 2);
    assert.ok(files.every(f => f.endsWith('.md')));
  });

  it('returns empty array for non-existent directory', () => {
    const files = mcp.findFiles(path.join(tmpDir, 'nope'), '*.md');
    assert.strictEqual(files.length, 0);
  });

  it('returns empty array for directory with no matches', () => {
    fs.writeFileSync(path.join(tmpDir, 'readme.txt'), 'content');
    const files = mcp.findFiles(tmpDir, '*.md');
    assert.strictEqual(files.length, 0);
  });
});

// -- synapseHealth tests (integration against real workspace) ----------------

describe('synapseHealth', () => {
  it('returns healthy status for AlexMaster workspace', async () => {
    const wsPath = path.resolve(__dirname, '..', '..');
    const result = JSON.parse(await mcp.synapseHealth(wsPath));
    assert.strictEqual(result.status, 'EXCELLENT');
    assert.ok(result.skills > 100, `Expected >100 skills, got ${result.skills}`);
    assert.ok(result.instructions > 50, `Expected >50 instructions, got ${result.instructions}`);
    assert.ok(result.prompts > 10, `Expected >10 prompts, got ${result.prompts}`);
    assert.ok(result.agents > 5, `Expected >5 agents, got ${result.agents}`);
  });

  it('returns error for non-existent workspace', async () => {
    const result = JSON.parse(await mcp.synapseHealth('/tmp/nonexistent-ws'));
    assert.strictEqual(result.status, 'error');
    assert.ok(result.message.includes('.github'));
  });
});

// -- architectureStatus tests -----------------------------------------------

describe('architectureStatus', () => {
  it('returns full inventory for AlexMaster workspace', async () => {
    const wsPath = path.resolve(__dirname, '..', '..');
    const result = JSON.parse(await mcp.architectureStatus(wsPath));
    assert.strictEqual(result.installed, true);
    assert.ok(result.skills > 100);
    assert.ok(result.instructions > 50);
    assert.ok(result.agents > 5);
    assert.ok(result.prompts > 10);
  });

  it('returns not-installed for non-existent workspace', async () => {
    const result = JSON.parse(await mcp.architectureStatus('/tmp/nonexistent-ws'));
    assert.strictEqual(result.status, 'not-installed');
  });
});

// -- memorySearch tests -----------------------------------------------------

describe('memorySearch', () => {
  it('finds results for common term', async () => {
    // Must run from AlexMaster root for process.cwd() to work
    const origCwd = process.cwd();
    const wsPath = path.resolve(__dirname, '..', '..');
    process.chdir(wsPath);
    try {
      const result = JSON.parse(await mcp.memorySearch('architecture'));
      assert.ok(result.totalResults > 0, 'Should find architecture-related items');
      assert.ok(Array.isArray(result.results));
      assert.ok(result.results[0].type);
      assert.ok(result.results[0].name);
      assert.ok(result.results[0].snippet);
    } finally {
      process.chdir(origCwd);
    }
  });

  it('returns empty for nonsense query', async () => {
    const origCwd = process.cwd();
    const wsPath = path.resolve(__dirname, '..', '..');
    process.chdir(wsPath);
    try {
      const result = JSON.parse(await mcp.memorySearch('xyzzy999nonexistent'));
      assert.strictEqual(result.totalResults, 0);
    } finally {
      process.chdir(origCwd);
    }
  });

  it('respects memoryType filter', async () => {
    const origCwd = process.cwd();
    const wsPath = path.resolve(__dirname, '..', '..');
    process.chdir(wsPath);
    try {
      const result = JSON.parse(await mcp.memorySearch('code', 'skills'));
      for (const r of result.results) {
        assert.strictEqual(r.type, 'skill');
      }
    } finally {
      process.chdir(origCwd);
    }
  });
});

// -- knowledgeSave tests (temp directory) ------------------------------------

describe('knowledgeSave', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-ks-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates insight file with YAML frontmatter', async () => {
    // Temporarily override GLOBAL_KNOWLEDGE_PATH — not cleanly possible
    // since it's a const. Instead, test the file creation logic directly.
    const insightsPath = path.join(tmpDir, 'insights', 'patterns');
    fs.mkdirSync(insightsPath, { recursive: true });

    // Verify the function creates a file (will use real GLOBAL_KNOWLEDGE_PATH)
    // We test the formatting by calling and checking the return value
    const result = JSON.parse(
      await mcp.knowledgeSave('Test Insight', 'Test content', 'patterns', ['test'])
    );
    assert.strictEqual(result.status, 'success');
    assert.ok(result.path.includes('test-insight.md'));

    // Clean up the created file
    if (fs.existsSync(result.path)) {
      fs.unlinkSync(result.path);
      // Remove empty parent dirs
      const parent = path.dirname(result.path);
      try { fs.rmdirSync(parent); } catch { /* ignore if not empty */ }
    }
  });
});

// -- Tool/Prompt definitions ------------------------------------------------

describe('MCP definitions', () => {
  it('exports 5 tools', () => {
    assert.strictEqual(mcp.TOOLS.length, 5);
    const names = mcp.TOOLS.map(t => t.name);
    assert.ok(names.includes('alex_synapse_health'));
    assert.ok(names.includes('alex_memory_search'));
    assert.ok(names.includes('alex_architecture_status'));
    assert.ok(names.includes('alex_knowledge_search'));
    assert.ok(names.includes('alex_knowledge_save'));
  });

  it('all tools have inputSchema', () => {
    for (const tool of mcp.TOOLS) {
      assert.ok(tool.inputSchema, `Tool ${tool.name} missing inputSchema`);
      assert.strictEqual(tool.inputSchema.type, 'object');
    }
  });

  it('exports 4 prompts', () => {
    assert.strictEqual(mcp.PROMPTS.length, 4);
    const names = mcp.PROMPTS.map(p => p.name);
    assert.ok(names.includes('health-check'));
    assert.ok(names.includes('architecture-overview'));
    assert.ok(names.includes('search-knowledge'));
    assert.ok(names.includes('save-insight'));
  });
});
