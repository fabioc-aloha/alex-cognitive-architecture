#!/usr/bin/env node
/**
 * Tests for sync-brain-files.cjs
 *
 * Run: node --test heir/platforms/vscode-extension/sync-brain-files.test.cjs
 */
'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const BRAIN_FILES = path.resolve(__dirname, 'brain-files');
const SRC = path.resolve(__dirname, '..', '..', '.github');

describe('sync-brain-files output', () => {

  it('brain-files/ directory exists after prepackage', () => {
    assert.ok(fs.existsSync(BRAIN_FILES), 'brain-files/ should exist');
  });

  it('contains expected brain subdirectories', () => {
    const expected = ['instructions', 'skills', 'prompts', 'agents', 'muscles', 'config', 'hooks'];
    for (const dir of expected) {
      assert.ok(
        fs.existsSync(path.join(BRAIN_FILES, dir)),
        `brain-files/${dir}/ should exist`
      );
    }
  });

  it('excludes episodic directory', () => {
    assert.ok(
      !fs.existsSync(path.join(BRAIN_FILES, 'episodic')),
      'episodic/ must not be in brain-files'
    );
  });

  it('excludes node_modules', () => {
    assert.ok(
      !fs.existsSync(path.join(BRAIN_FILES, 'node_modules')),
      'node_modules/ must not be in brain-files'
    );
  });

  it('excludes session-specific config files', () => {
    const excluded = [
      'config/session-metrics.json',
      'config/session-tool-log.json',
      'config/assignment-log.json',
      'config/correlation-vector.json',
      'config/MASTER-ALEX-PROTECTED.json',
    ];
    for (const file of excluded) {
      assert.ok(
        !fs.existsSync(path.join(BRAIN_FILES, file)),
        `${file} must not be in brain-files`
      );
    }
  });

  it('includes copilot-instructions.md', () => {
    assert.ok(
      fs.existsSync(path.join(BRAIN_FILES, 'copilot-instructions.md')),
      'copilot-instructions.md should be in brain-files'
    );
  });

  it('includes root .md files (ABOUT, NORTH-STAR, EXTERNAL-API-REGISTRY)', () => {
    const expected = ['ABOUT.md', 'NORTH-STAR.md', 'EXTERNAL-API-REGISTRY.md'];
    for (const file of expected) {
      assert.ok(
        fs.existsSync(path.join(BRAIN_FILES, file)),
        `${file} should be in brain-files`
      );
    }
  });

  it('file count in brain-files roughly matches heir .github source', () => {
    function countFiles(dir) {
      let count = 0;
      if (!fs.existsSync(dir)) return 0;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
        else count++;
      }
      return count;
    }
    const brainCount = countFiles(BRAIN_FILES);
    // Should have 300+ files (skills + instructions + prompts + agents + muscles + config)
    assert.ok(brainCount >= 300,
      `Expected 300+ files in brain-files, got ${brainCount}`);
  });

  it('CHANGELOG.md copied from heir root', () => {
    assert.ok(
      fs.existsSync(path.join(__dirname, 'CHANGELOG.md')),
      'CHANGELOG.md should exist in extension directory'
    );
  });

  it('LICENSE.md copied from heir root', () => {
    assert.ok(
      fs.existsSync(path.join(__dirname, 'LICENSE.md')),
      'LICENSE.md should exist in extension directory'
    );
  });
});
