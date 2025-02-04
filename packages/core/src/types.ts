const ENV = {
  DEV: 'development',
  PROD: 'production',
} as const;

type EnvKey = keyof typeof ENV;
type Env = (typeof ENV)[EnvKey];

export { ENV, type EnvKey, type Env };
