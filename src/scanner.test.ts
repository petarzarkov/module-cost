import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanModules } from './scanner';

const fixtureDir = join(
  tmpdir(),
  `module-cost-scanner-test-${Date.now()}`,
);
const nm = join(fixtureDir, 'node_modules');

beforeAll(() => {
  mkdirSync(join(nm, 'pkg-a'), {
    recursive: true,
  });
  writeFileSync(
    join(nm, 'pkg-a', 'package.json'),
    JSON.stringify({
      name: 'pkg-a',
      version: '1.0.0',
    }),
  );
  writeFileSync(
    join(nm, 'pkg-a', 'index.js'),
    'module.exports = {};',
  );

  mkdirSync(join(nm, 'pkg-b', 'node_modules', 'nested'), {
    recursive: true,
  });
  writeFileSync(
    join(nm, 'pkg-b', 'package.json'),
    JSON.stringify({
      name: 'pkg-b',
      version: '2.0.0',
    }),
  );
  writeFileSync(
    join(nm, 'pkg-b', 'index.js'),
    'x'.repeat(500),
  );
  writeFileSync(
    join(
      nm,
      'pkg-b',
      'node_modules',
      'nested',
      'package.json',
    ),
    JSON.stringify({
      name: 'nested',
      version: '0.1.0',
    }),
  );
  writeFileSync(
    join(nm, 'pkg-b', 'node_modules', 'nested', 'index.js'),
    'module.exports = {};',
  );

  mkdirSync(join(nm, '@fake-scope', 'scoped-pkg'), {
    recursive: true,
  });
  writeFileSync(
    join(nm, '@fake-scope', 'scoped-pkg', 'package.json'),
    JSON.stringify({
      name: '@fake-scope/scoped-pkg',
      version: '3.0.0',
    }),
  );
  writeFileSync(
    join(nm, '@fake-scope', 'scoped-pkg', 'index.js'),
    'module.exports = {};',
  );

  writeFileSync(
    join(fixtureDir, 'package.json'),
    JSON.stringify({
      dependencies: {
        'pkg-a': '1.0.0',
        'pkg-b': '2.0.0',
      },
      devDependencies: {
        '@fake-scope/scoped-pkg': '3.0.0',
      },
    }),
  );
});

afterAll(() => {
  rmSync(fixtureDir, {
    recursive: true,
    force: true,
  });
});

describe('scanModules', () => {
  it('finds all packages with includeDev', () => {
    const result = scanModules({
      path: fixtureDir,
      includeDev: true,
    });
    expect(result.totalPackages).toBe(3);
  });

  it('excludes devDeps by default', () => {
    const result = scanModules({
      path: fixtureDir,
      includeDev: false,
    });
    expect(result.totalPackages).toBe(2);
    const names = result.packages.map(p => p.name);
    expect(names).toContain('pkg-a');
    expect(names).toContain('pkg-b');
    expect(names).not.toContain('@fake-scope/scoped-pkg');
  });

  it('correctly counts children', () => {
    const result = scanModules({
      path: fixtureDir,
      includeDev: true,
    });
    const pkgB = result.packages.find(
      p => p.name === 'pkg-b',
    );
    expect(pkgB?.children).toBe(1);

    const pkgA = result.packages.find(
      p => p.name === 'pkg-a',
    );
    expect(pkgA?.children).toBe(0);
  });

  it('sorts by size descending', () => {
    const result = scanModules({
      path: fixtureDir,
      includeDev: true,
    });
    for (let i = 1; i < result.packages.length; i++) {
      expect(
        result.packages[i - 1].size,
      ).toBeGreaterThanOrEqual(result.packages[i].size);
    }
  });

  it('reads versions correctly', () => {
    const result = scanModules({
      path: fixtureDir,
      includeDev: true,
    });
    const pkgA = result.packages.find(
      p => p.name === 'pkg-a',
    );
    expect(pkgA?.version).toBe('1.0.0');

    const scoped = result.packages.find(
      p => p.name === '@fake-scope/scoped-pkg',
    );
    expect(scoped?.version).toBe('3.0.0');
  });

  it('handles scoped packages', () => {
    const result = scanModules({
      path: fixtureDir,
      includeDev: true,
    });
    const names = result.packages.map(p => p.name);
    expect(names).toContain('@fake-scope/scoped-pkg');
  });

  it('returns empty for missing node_modules', () => {
    const result = scanModules({
      path: '/tmp/nonexistent-dir',
      includeDev: true,
    });
    expect(result.totalPackages).toBe(0);
    expect(result.packages).toEqual([]);
  });

  it('calculates correct totals', () => {
    const result = scanModules({
      path: fixtureDir,
      includeDev: true,
    });
    const sumSize = result.packages.reduce(
      (acc, p) => acc + p.size,
      0,
    );
    const sumChildren = result.packages.reduce(
      (acc, p) => acc + p.children,
      0,
    );
    expect(result.totalSize).toBe(sumSize);
    expect(result.totalChildren).toBe(sumChildren);
  });
});
