import * as Joi from 'joi';

export interface EnvironmentVariables {
  DATABASE_URL: string;
  S3_ACCESS_KEY_ID: string;
  S3_ACCESS_KEY_SECRET: string;
  S3_REGION: string;
  REDIS_HOST: string;
  REDIS_USERNAME: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
}

export const validationSchemaForEnv = Joi.object<EnvironmentVariables, true>({
  DATABASE_URL: Joi.string().required(),
  S3_ACCESS_KEY_ID: Joi.string().required(),
  S3_ACCESS_KEY_SECRET: Joi.string().required(),
  S3_REGION: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_USERNAME: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
});
