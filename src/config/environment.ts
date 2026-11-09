import Joi from 'joi';

export interface Environment {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  DATABASE_POOL_MAX: number;
  DATABASE_CONNECTION_TIMEOUT_MS: number;
  DATABASE_IDLE_TIMEOUT_MS: number;
}

export const environmentSchema = Joi.object<Environment>({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
  PORT: Joi.number().integer().min(1).max(65535).required(),
  DATABASE_URL: Joi.string()
    .custom((value: string, helpers) => {
      try {
        const url = new URL(value);
        const database = decodeURIComponent(url.pathname.slice(1));
        if (
          !['postgres:', 'postgresql:'].includes(url.protocol) ||
          !url.hostname ||
          !database ||
          /[\s/]/.test(database) ||
          /\s/.test(value) ||
          url.hash ||
          (url.port && (Number(url.port) < 1 || Number(url.port) > 65535))
        ) {
          return helpers.error('any.invalid');
        }
        return value;
      } catch {
        return helpers.error('any.invalid');
      }
    })
    .required(),
  DATABASE_POOL_MAX: Joi.number().integer().min(1).default(10),
  DATABASE_CONNECTION_TIMEOUT_MS: Joi.number().integer().min(1).default(5000),
  DATABASE_IDLE_TIMEOUT_MS: Joi.number().integer().min(1).default(30000),
}).unknown(true);

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  const result = environmentSchema.validate(input, { abortEarly: false });
  if (result.error) {
    const keys = [
      ...new Set(result.error.details.map((detail) => detail.path[0])),
    ];
    throw new Error(`Invalid environment variables: ${keys.join(', ')}`);
  }
  return result.value as Environment;
}
