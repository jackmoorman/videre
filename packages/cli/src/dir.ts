import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export function getPackageDir(p: string) {
  return path.dirname(require.resolve(`${p}/package.json`));
}
