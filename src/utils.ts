export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)}K`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)}M`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)}G`;
};

export const padRight = (
  str: string,
  len: number,
): string =>
  str + ' '.repeat(Math.max(0, len - str.length));

export const padLeft = (str: string, len: number): string =>
  ' '.repeat(Math.max(0, len - str.length)) + str;
