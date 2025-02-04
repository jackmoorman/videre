import { $, build } from 'bun';
import { Logger } from '@videre/core';
import { usePerformance } from '@videre/core';

const stop = usePerformance();

const logger = new Logger({
  primary: 'blueBright',
  secondary: 'cyanBright',
  name: 'Build -- CLI',
});

logger.title('Videre - CLI');
logger.log('Starting @videre/cli...');

logger.log('Cleaning "/dist" folder...');
await $`rm -rf dist`;

logger.log('Bundling for ES modules...');
await build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'node',
  format: 'esm',
});

logger.log('Adding executable permissions to entry file...');
await $`chmod -x ./dist/index.js`;

const perf = stop();
logger.success(`Build DONE in ${perf} seconds!`);
