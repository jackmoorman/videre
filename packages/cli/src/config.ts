import path from 'path';
import fs from 'fs';
import { getPackageDir } from './dir';
import {
  defineConfigSchema,
  type ProcessOptions,
  type DefineConfigOptions,
  Logger,
  type Engine,
} from '@videre/core';
import { isEmpty } from './utils';
import prompts from 'prompts';

const configName = 'videre.config';

type Opts = { filter?: string };
type CLIConfig = {
  name: string;
  processId: string;
  process: ProcessOptions;
  logger: Logger;
  packageDirs: { server: string; app: string };
  env: {
    server: { [key: string]: any };
    app: { [key: string]: any };
  };
  logs: {
    prefix: string;
    hide?: string[];
  };
};

export async function getConfig(opts?: Opts): Promise<CLIConfig> {
  const logger = new Logger({ primary: 'white', secondary: 'white' });
  const configFile = getConfigFile({ logger });
  const definedConfig = defineConfigSchema.parse(configFile);

  if (isEmpty(definedConfig.processes)) {
    throw new Error(`No processed defined in the config!`);
  }

  const processId = await getProcessId({ opts, definedConfig, logger });
  const processConfig = definedConfig.processes[processId];
  const { engine } = processConfig;

  const packageDirs = resolvePackages({ engine, logger });

  if (engine === 'mongodb') {
    return {
      name: 'MongoDB',
      processId,
      process: processConfig,
      logger: new Logger({ primary: 'green', secondary: 'cyan' }),
      packageDirs: { ...packageDirs },
      env: {
        server: {
          ...process.env,
          VIDERE_MONGO_SERVER_PORT: processConfig.serverPort,
          VIDERE_MONGO_APP_PORT: processConfig.clientPort,
          VIDERE_MONGO_DATABASE_URL: processConfig.databaseUrl,
        },
        app: {
          ...process.env,
          VIDERE_MONGO_APP_PORT: processConfig.clientPort,
          VITE_VIDERE_MONGO_SERVER_PORT: processConfig.serverPort,
        },
      },
      logs: {
        prefix: 'name',
        hide: processConfig.showLogs === true ? [] : ['SERVER', 'APP'],
      },
    };
  }

  throw new Error(`Invalid engine "${engine}"`);
}

async function getConfigFile({
  logger,
}: {
  logger: Logger;
}): Promise<DefineConfigOptions | undefined> {
  const cwd = process.cwd();
  const tsPath = path.join(cwd, `${configName}.ts`);
  const jsPath = path.join(cwd, `${configName}.js`);

  const tsExists = fs.existsSync(tsPath);
  const jsExists = fs.existsSync(jsPath);

  if (tsExists) {
    logger.log(`Found ${configName}.ts, validating...`);
    const ts = await import('typescript');
    const tsContents = fs.readFileSync(tsPath, 'utf-8');

    const transpiled = ts.transpileModule(tsContents, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
    });

    const tmp = `./__${configName}.${new Date().getTime()}.js`;

    try {
      fs.writeFileSync(tmp, transpiled.outputText);

      const p = path.join(cwd, tmp);
      const mod = await import(p);

      fs.unlinkSync(tmp);

      return mod?.default;
    } catch (e: any) {
      fs.unlinkSync(tmp);
      throw new Error(e);
    }
  } else if (jsExists) {
    logger.log(`Found ${configName}.js, validating...`);
    const mod = await import(jsPath);
    return mod?.default;
  }

  throw new Error(`No ${configName} file found.`);
}

async function getProcessId({
  definedConfig,
  logger,
  opts,
}: {
  definedConfig: DefineConfigOptions;
  logger: Logger;
  opts?: Opts;
}): Promise<string> {
  const filter = opts?.filter;

  if (!!filter && !!definedConfig.processes[filter]) {
    return filter;
  }

  if (!!filter && !definedConfig.processes[filter]) {
    logger.warn(
      `Invalid process ID, "${filter}" does not exist in the config!`
    );
  }

  const availableProcessIds = Object.keys(definedConfig.processes);

  const result = await prompts({
    type: 'select',
    name: 'processId',
    message: 'Which process would you like to start?',
    choices: availableProcessIds.map((id) => ({
      title: `${id} - ${definedConfig.processes[id].engine}`,
      value: id,
    })),
  });

  return result.processId;
}

function resolvePackages({
  engine,
  logger,
}: {
  engine: Engine;
  logger: Logger;
}) {
  try {
    let root: string | undefined = undefined;
    let server: string | undefined = undefined;
    let app: string | undefined = undefined;

    if (engine === 'mongodb') {
      root = '@videre/mongo';
      server = '@videre/mongo-server';
      app = '@videre/mongo-app';
    }

    if (!root || !server || !app) {
      throw new Error(`Invalid "engine" ${engine}!`);
    }

    const serverDir = getPackageDir(server);
    const appDir = getPackageDir(app);

    return {
      server: serverDir,
      app: appDir,
    };
  } catch (e: any) {
    logger.error(
      `Could not resolve Videre packages, install the correct @videre package via the npm registry.`
    );
    throw new Error(e);
  }
}
