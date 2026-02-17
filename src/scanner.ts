import {
  existsSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { getDirectorySize } from './size.js';
import type {
  PackageCost,
  ScanOptions,
  ScanResult,
} from './types.js';

const readPackageJson = (
  pkgDir: string,
): { name?: string; version?: string } => {
  const pkgPath = join(pkgDir, 'package.json');
  if (!existsSync(pkgPath)) return {};

  try {
    const raw = readFileSync(pkgPath, 'utf-8');
    return JSON.parse(raw) as {
      name?: string;
      version?: string;
    };
  } catch {
    return {};
  }
};

const readRootDeps = (
  rootDir: string,
  includeDev: boolean,
): Set<string> | null => {
  const pkgPath = join(rootDir, 'package.json');
  if (!existsSync(pkgPath)) return null;

  try {
    const raw = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const deps = new Set<string>(
      Object.keys(pkg.dependencies ?? {}),
    );

    if (includeDev) {
      for (const dep of Object.keys(
        pkg.devDependencies ?? {},
      )) {
        deps.add(dep);
      }
    }

    return deps;
  } catch {
    return null;
  }
};

const countChildren = (pkgDir: string): number => {
  const nestedNm = join(pkgDir, 'node_modules');
  if (!existsSync(nestedNm)) return 0;

  let count = 0;
  const entries = readdirSync(nestedNm, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;

    if (entry.name.startsWith('@')) {
      const scopeDir = join(nestedNm, entry.name);
      const scopeEntries = readdirSync(scopeDir, {
        withFileTypes: true,
      });
      count += scopeEntries.filter(e =>
        e.isDirectory(),
      ).length;
    } else {
      count++;
    }
  }

  return count;
};

const collectPackage = (
  name: string,
  pkgDir: string,
): PackageCost => {
  const pkg = readPackageJson(pkgDir);
  return {
    name,
    version: pkg.version ?? '0.0.0',
    size: getDirectorySize(pkgDir),
    children: countChildren(pkgDir),
    path: pkgDir,
  };
};

const isAllowed = (
  name: string,
  allowedDeps: Set<string> | null,
): boolean => !allowedDeps || allowedDeps.has(name);

const collectScopedPackages = (
  scopeDir: string,
  scopeName: string,
  allowedDeps: Set<string> | null,
): PackageCost[] => {
  const results: PackageCost[] = [];
  const entries = readdirSync(scopeDir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = `${scopeName}/${entry.name}`;
    if (!isAllowed(name, allowedDeps)) continue;
    results.push(
      collectPackage(name, join(scopeDir, entry.name)),
    );
  }

  return results;
};

const collectTopLevelPackages = (
  nmDir: string,
  allowedDeps: Set<string> | null,
): PackageCost[] => {
  const packages: PackageCost[] = [];
  const entries = readdirSync(nmDir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;

    const fullPath = join(nmDir, entry.name);

    if (entry.name.startsWith('@')) {
      packages.push(
        ...collectScopedPackages(
          fullPath,
          entry.name,
          allowedDeps,
        ),
      );
    } else if (isAllowed(entry.name, allowedDeps)) {
      packages.push(collectPackage(entry.name, fullPath));
    }
  }

  return packages;
};

const emptyResult: ScanResult = {
  packages: [],
  totalSize: 0,
  totalChildren: 0,
  totalPackages: 0,
};

export const scanModules = (
  options: ScanOptions,
): ScanResult => {
  const nmDir = join(options.path, 'node_modules');
  if (!existsSync(nmDir)) return emptyResult;

  const allowedDeps = readRootDeps(
    options.path,
    options.includeDev,
  );

  const packages = collectTopLevelPackages(
    nmDir,
    allowedDeps,
  );

  packages.sort((a, b) => b.size - a.size);

  let totalSize = 0;
  let totalChildren = 0;

  for (const pkg of packages) {
    totalSize += pkg.size;
    totalChildren += pkg.children;
  }

  return {
    packages,
    totalSize,
    totalChildren,
    totalPackages: packages.length,
  };
};
