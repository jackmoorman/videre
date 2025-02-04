import { Command } from 'commander';
import { getConfig } from '../config';
import { handleError } from '../error';
import concurrently from 'concurrently';
import { Logger } from '@videre/core';

export const start = new Command()
  .command('start')
  .description('Start the Videre GUI')
  .option('-f, --filter <filter>', 'Specify a process ID')
  .action(async (opts) => {
    try {
      const config = await getConfig(opts);

      concurrently(
        [
          {
            command: 'npm run start',
            name: 'SERVER',
            cwd: config.packageDirs.server,
            env: { ...config.env.server },
          },
          {
            command: 'npm run start',
            name: 'APP',
            cwd: config.packageDirs.app,
            env: { ...config.env.app },
          },
        ],
        { ...config.logs }
      );

      const { logger } = config;
      logger.title('Videre - CLI');
      logger.break();

      logger.primary(
        `Videre - ${config.name} -- ${logger.secondaryColor.bold.italic(
          config.processId
        )}`
      );

      logger.break();
      logger.primary(
        `Videre API Server running on ${logger.secondaryColor.bold.italic(
          `http://localhost:${config.process.serverPort}`
        )}`
      );
      logger.primary(
        `Videre API Server running on ${logger.secondaryColor.bold.italic(
          `http://localhost:${config.process.clientPort}`
        )}`
      );
    } catch (e) {
      handleError(e);
    }
  });
