import { describe, expect, it } from 'bun:test';
import { parseArgs } from './cli';

describe('parseArgs', () => {
  it('returns defaults with no args', () => {
    const opts = parseArgs(['node', 'cli.js']);
    expect(opts.less).toBe(false);
    expect(opts.includeDev).toBe(false);
    expect(opts.json).toBe(false);
    expect(opts.path).toBe(process.cwd());
  });

  it('parses --less', () => {
    const opts = parseArgs(['node', 'cli.js', '--less']);
    expect(opts.less).toBe(true);
  });

  it('parses --include-dev', () => {
    const opts = parseArgs([
      'node',
      'cli.js',
      '--include-dev',
    ]);
    expect(opts.includeDev).toBe(true);
  });

  it('parses --json', () => {
    const opts = parseArgs(['node', 'cli.js', '--json']);
    expect(opts.json).toBe(true);
  });

  it('parses --path', () => {
    const opts = parseArgs([
      'node',
      'cli.js',
      '--path',
      '/tmp/test',
    ]);
    expect(opts.path).toBe('/tmp/test');
  });

  it('combines multiple flags', () => {
    const opts = parseArgs([
      'node',
      'cli.js',
      '--less',
      '--json',
      '--include-dev',
      '--path',
      '/tmp',
    ]);
    expect(opts.less).toBe(true);
    expect(opts.json).toBe(true);
    expect(opts.includeDev).toBe(true);
    expect(opts.path).toBe('/tmp');
  });
});
