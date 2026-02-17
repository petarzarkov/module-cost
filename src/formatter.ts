import type { ScanResult } from './types.js';
import { formatBytes, padLeft, padRight } from './utils.js';

const TOP_LEFT = '\u250c';
const TOP_RIGHT = '\u2510';
const BOTTOM_LEFT = '\u2514';
const BOTTOM_RIGHT = '\u2518';
const HORIZONTAL = '\u2500';
const VERTICAL = '\u2502';
const T_DOWN = '\u252c';
const T_UP = '\u2534';
const T_RIGHT = '\u251c';
const T_LEFT = '\u2524';
const CROSS = '\u253c';

const horizontalLine = (
  widths: number[],
  left: string,
  mid: string,
  right: string,
): string => {
  const segments = widths.map(w =>
    HORIZONTAL.repeat(w + 2),
  );
  return left + segments.join(mid) + right;
};

const row = (cells: string[], widths: number[]): string => {
  const padded = cells.map((cell, i) =>
    i === 0
      ? ` ${padRight(cell, widths[i])} `
      : ` ${padLeft(cell, widths[i])} `,
  );
  return VERTICAL + padded.join(VERTICAL) + VERTICAL;
};

export const formatTable = (result: ScanResult): string => {
  const headers = ['name', 'children', 'size'];

  const rows = result.packages.map(pkg => [
    pkg.name,
    String(pkg.children),
    formatBytes(pkg.size),
  ]);

  const summary = [
    `${result.totalPackages} modules`,
    `${result.totalChildren} children`,
    formatBytes(result.totalSize),
  ];

  const allRows = [headers, ...rows, summary];

  const widths = headers.map((_, col) =>
    Math.max(...allRows.map(r => r[col].length)),
  );

  const lines: string[] = [];

  lines.push(
    horizontalLine(widths, TOP_LEFT, T_DOWN, TOP_RIGHT),
  );
  lines.push(row(headers, widths));
  lines.push(
    horizontalLine(widths, T_RIGHT, CROSS, T_LEFT),
  );

  for (const r of rows) {
    lines.push(row(r, widths));
    lines.push(
      horizontalLine(widths, T_RIGHT, CROSS, T_LEFT),
    );
  }

  lines[lines.length - 1] = horizontalLine(
    widths,
    T_RIGHT,
    CROSS,
    T_LEFT,
  );
  lines.push(row(summary, widths));
  lines.push(
    horizontalLine(widths, BOTTOM_LEFT, T_UP, BOTTOM_RIGHT),
  );

  return lines.join('\n');
};

export const formatJson = (result: ScanResult): string =>
  JSON.stringify(
    {
      packages: result.packages.map(pkg => ({
        name: pkg.name,
        version: pkg.version,
        size: pkg.size,
        sizeFormatted: formatBytes(pkg.size),
        children: pkg.children,
        path: pkg.path,
      })),
      totalSize: result.totalSize,
      totalSizeFormatted: formatBytes(result.totalSize),
      totalChildren: result.totalChildren,
      totalPackages: result.totalPackages,
    },
    null,
    2,
  );
