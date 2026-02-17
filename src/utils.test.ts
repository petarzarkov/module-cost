import { describe, expect, it } from 'bun:test';
import { formatBytes, padLeft, padRight } from './utils';

describe('formatBytes', () => {
  it('formats bytes', () => {
    expect(formatBytes(0)).toBe('0B');
    expect(formatBytes(512)).toBe('512B');
    expect(formatBytes(1023)).toBe('1023B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.00K');
    expect(formatBytes(1536)).toBe('1.50K');
    expect(formatBytes(1024 * 500)).toBe('500.00K');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00M');
    expect(formatBytes(1024 * 1024 * 22.5)).toBe('22.50M');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00G');
    expect(formatBytes(1024 * 1024 * 1024 * 2.5)).toBe(
      '2.50G',
    );
  });
});

describe('padRight', () => {
  it('pads string to the right', () => {
    expect(padRight('abc', 6)).toBe('abc   ');
  });

  it('returns original if already long enough', () => {
    expect(padRight('abcdef', 3)).toBe('abcdef');
  });
});

describe('padLeft', () => {
  it('pads string to the left', () => {
    expect(padLeft('abc', 6)).toBe('   abc');
  });

  it('returns original if already long enough', () => {
    expect(padLeft('abcdef', 3)).toBe('abcdef');
  });
});
