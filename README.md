# @pzarkov/module-cost [![version](https://img.shields.io/npm/v/@pzarkov/module-cost?label=version)](https://www.npmjs.com/package/@pzarkov/module-cost)

Find out which of your dependencies is slowing you down. Zero dependencies.

## Install

```bash
npm install -g @pzarkov/module-cost
```

Or use directly with npx:

```bash
npx @pzarkov/module-cost
```

## Usage

Run `module-cost` in the directory you want to analyze:

```bash
module-cost
```

### Options

| Flag | Description |
|---|---|
| `--path <dir>` | Directory to scan (default: current directory) |
| `--less` | Show only the top 10 modules |
| `--include-dev` | Include devDependencies |
| `--json` | Output as JSON |
| `--help, -h` | Show help |
| `--version, -v` | Show version |

### Example output

```
┌────────────────┬────────────┬─────────┐
│ name           │   children │    size │
├────────────────┼────────────┼─────────┤
│ typescript     │          0 │  22.53M │
├────────────────┼────────────┼─────────┤
│ @types/node    │          0 │   2.26M │
├────────────────┼────────────┼─────────┤
│ glob           │          0 │   1.53M │
├────────────────┼────────────┼─────────┤
│ @biomejs/biome │          0 │ 636.42K │
├────────────────┼────────────┼─────────┤
│ lint-staged    │          0 │ 145.28K │
├────────────────┼────────────┼─────────┤
│ husky          │          0 │   3.95K │
├────────────────┼────────────┼─────────┤
│ @types/bun     │          0 │   3.56K │
├────────────────┼────────────┼─────────┤
│ 7 modules      │ 0 children │  27.09M │
└────────────────┴────────────┴─────────┘
```

## Programmatic API

```typescript
import { scanModules, formatTable, formatJson } from '@pzarkov/module-cost';

const result = scanModules({
  path: process.cwd(),
  includeDev: false,
});

// Table output
console.log(formatTable(result));

// JSON output
console.log(formatJson(result));

// Access raw data
for (const pkg of result.packages) {
  console.log(pkg.name, pkg.version, pkg.size, pkg.children);
}
```

### API

#### `scanModules(options: ScanOptions): ScanResult`

Scans `node_modules` and returns cost data for each package.

- **`options.path`** - Directory containing `node_modules` (default: cwd)
- **`options.includeDev`** - Include devDependencies in results

Returns `ScanResult` with:
- **`packages`** - Array of `PackageCost` sorted by size descending
- **`totalSize`** - Sum of all package sizes in bytes
- **`totalChildren`** - Sum of all nested dependency counts
- **`totalPackages`** - Number of packages scanned

#### `formatTable(result: ScanResult): string`

Renders scan results as a Unicode box-drawing table.

#### `formatJson(result: ScanResult): string`

Renders scan results as formatted JSON with human-readable sizes.

#### `formatBytes(bytes: number): string`

Formats a byte count into a human-readable string (e.g. `22.50M`).

## How it works

1. Reads `dependencies` (and optionally `devDependencies`) from your `package.json`
2. Walks each package directory in `node_modules` recursively to compute disk size
3. Checks for nested `node_modules` within each package to count children
4. Handles scoped packages (`@scope/name`) correctly
5. Sorts by size descending and renders a summary table

## Development

```bash
bun install
bun run dev              # Watch mode
bun test                 # Run tests
bun run build            # Build CJS + ESM + types
bun run mod:cost         # Analyze prod dependencies
bun run mod:cost:dev     # Analyze all dependencies (incl. dev)
bun run mod:cost:json    # JSON output
bun run mod:cost:less    # Top 10 only
```

## License

[MIT](LICENSE)
