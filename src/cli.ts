#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatJson, formatTable } from './formatter.js';
import { scanModules } from './scanner.js';
import type { CliOptions } from './types.js';

const printHelp = (): void => {
  console.log(`
Usage: module-cost [options]

Options:
  --path <dir>     Directory to scan (default: cwd)
  --less           Show only the top 10 modules
  --include-dev    Include devDependencies
  --json           Output as JSON
  --help, -h       Show this help message
  --version, -v    Show version
`);
};

const printVersion = (): void => {
  try {
    const pkgPath = join(__dirname, '..', 'package.json');
    const raw = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw) as {
      version: string;
    };
    console.log(pkg.version);
  } catch {
    console.log('unknown');
  }
};

export const parseArgs = (argv: string[]): CliOptions => {
  const args = argv.slice(2);
  const options: CliOptions = {
    less: false,
    includeDev: false,
    json: false,
    path: process.cwd(),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--less':
        options.less = true;
        break;
      case '--include-dev':
        options.includeDev = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--path':
        i++;
        options.path = args[i] ?? process.cwd();
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      case '--version':
      case '-v':
        printVersion();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
};

const run = (): void => {
  const options = parseArgs(process.argv);

  console.log('\nCalculating...\n');

  const result = scanModules({
    path: options.path,
    includeDev: options.includeDev,
  });

  if (options.less) {
    result.packages = result.packages.slice(0, 10);
  }

  if (options.json) {
    console.log(formatJson(result));
  } else {
    console.log(formatTable(result));
  }
};

run();
