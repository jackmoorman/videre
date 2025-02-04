import { z, ZodError } from 'zod';

const engineSchema = z.enum(['mongodb']);

const processSchema = z.object({
  engine: engineSchema,
  serverPort: z.number().int(),
  clientPort: z.number().int(),
  databaseUrl: z.string().url(),
  showLogs: z.boolean().optional(),
});

const defineConfigSchema = z.object({
  processes: z.record(processSchema),
});

type Engine = z.infer<typeof engineSchema>;
type ProcessOptions = z.infer<typeof processSchema>;
type DefineConfigOptions = z.infer<typeof defineConfigSchema>;

function defineConfig(config: DefineConfigOptions) {
  return config;
}

export {
  defineConfig,
  engineSchema,
  type Engine,
  processSchema,
  type ProcessOptions,
  defineConfigSchema,
  type DefineConfigOptions,
  ZodError,
};
