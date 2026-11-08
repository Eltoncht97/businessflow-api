import Joi from 'joi';

export interface Environment {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
}

export const environmentSchema = Joi.object<Environment>({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
  PORT: Joi.number().integer().min(1).max(65535).required(),
  DATABASE_URL: Joi.string()
    .pattern(/^postgres(?:ql)?:\/\/[^\s]+$/)
    .required(),
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
