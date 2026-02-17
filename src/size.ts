import { lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const getDirectorySize = (
  dirPath: string,
): number => {
  let total = 0;
  const entries = readdirSync(dirPath, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isSymbolicLink()) {
      continue;
    }

    if (entry.isDirectory()) {
      total += getDirectorySize(fullPath);
    } else if (entry.isFile()) {
      total += lstatSync(fullPath).size;
    }
  }

  return total;
};
