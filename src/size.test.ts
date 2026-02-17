import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'bun:test';
import {
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getDirectorySize } from './size';

const fixtureDir = join(
  tmpdir(),
  `module-cost-size-test-${Date.now()}`,
);

beforeAll(() => {
  mkdirSync(join(fixtureDir, 'sub'), {
    recursive: true,
  });
  writeFileSync(join(fixtureDir, 'a.txt'), 'hello');
  writeFileSync(join(fixtureDir, 'sub', 'b.txt'), 'world!');
  symlinkSync(
    join(fixtureDir, 'a.txt'),
    join(fixtureDir, 'link.txt'),
  );
});

afterAll(() => {
  rmSync(fixtureDir, {
    recursive: true,
    force: true,
  });
});

describe('getDirectorySize', () => {
  it('calculates size of files recursively', () => {
    const size = getDirectorySize(fixtureDir);
    expect(size).toBe(11);
  });

  it('does not follow symlinks', () => {
    const size = getDirectorySize(fixtureDir);
    expect(size).toBe(11);
  });

  it('handles empty directories', () => {
    const emptyDir = join(fixtureDir, 'empty');
    mkdirSync(emptyDir, { recursive: true });
    expect(getDirectorySize(emptyDir)).toBe(0);
  });
});
