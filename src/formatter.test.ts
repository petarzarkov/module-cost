import { describe, expect, it } from 'bun:test';
import { formatJson, formatTable } from './formatter';
import type { ScanResult } from './types';

const mockResult: ScanResult = {
  packages: [
    {
      name: 'big-pkg',
      version: '2.0.0',
      size: 1024 * 1024 * 10,
      children: 3,
      path: '/node_modules/big-pkg',
    },
    {
      name: '@scope/small',
      version: '1.0.0',
      size: 1024 * 50,
      children: 0,
      path: '/node_modules/@scope/small',
    },
  ],
  totalSize: 1024 * 1024 * 10 + 1024 * 50,
  totalChildren: 3,
  totalPackages: 2,
};

const emptyResult: ScanResult = {
  packages: [],
  totalSize: 0,
  totalChildren: 0,
  totalPackages: 0,
};

describe('formatTable', () => {
  it('contains box-drawing characters', () => {
    const table = formatTable(mockResult);
    expect(table).toContain('\u250c');
    expect(table).toContain('\u2500');
    expect(table).toContain('\u2502');
    expect(table).toContain('\u2518');
  });

  it('contains column headers', () => {
    const table = formatTable(mockResult);
    expect(table).toContain('name');
    expect(table).toContain('children');
    expect(table).toContain('size');
  });

  it('contains package names', () => {
    const table = formatTable(mockResult);
    expect(table).toContain('big-pkg');
    expect(table).toContain('@scope/small');
  });

  it('contains summary row', () => {
    const table = formatTable(mockResult);
    expect(table).toContain('2 modules');
    expect(table).toContain('3 children');
  });

  it('handles empty results', () => {
    const table = formatTable(emptyResult);
    expect(table).toContain('0 modules');
    expect(table).toContain('0 children');
  });
});

describe('formatJson', () => {
  it('returns valid JSON', () => {
    const json = formatJson(mockResult);
    const parsed = JSON.parse(json);
    expect(parsed).toBeDefined();
  });

  it('contains expected fields', () => {
    const json = formatJson(mockResult);
    const parsed = JSON.parse(json);
    expect(parsed.packages).toHaveLength(2);
    expect(parsed.totalPackages).toBe(2);
    expect(parsed.totalChildren).toBe(3);
    expect(parsed.totalSize).toBe(
      1024 * 1024 * 10 + 1024 * 50,
    );
    expect(parsed.totalSizeFormatted).toBe('10.05M');
  });

  it('includes sizeFormatted per package', () => {
    const json = formatJson(mockResult);
    const parsed = JSON.parse(json);
    expect(parsed.packages[0].sizeFormatted).toBe('10.00M');
    expect(parsed.packages[1].sizeFormatted).toBe('50.00K');
  });

  it('handles empty results', () => {
    const json = formatJson(emptyResult);
    const parsed = JSON.parse(json);
    expect(parsed.packages).toHaveLength(0);
    expect(parsed.totalPackages).toBe(0);
  });
});
