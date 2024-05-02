import * as Joi from 'joi';

export interface EnvironmentVariables {
  DATABASE_URL: string;
  OAUTH_DISCORD_CLIENT_ID: string;
  OAUTH_DISCORD_CLIENT_SECRET: string;
  OAUTH_DISCORD_CALLBACK_URL: string;
  JWT_SECRET_KEY: string;
}

export const validationSchemaForEnv = Joi.object<EnvironmentVariables, true>({
  DATABASE_URL: Joi.string().required(),
  OAUTH_DISCORD_CLIENT_ID: Joi.string().required(),
  OAUTH_DISCORD_CLIENT_SECRET: Joi.string().required(),
  OAUTH_DISCORD_CALLBACK_URL: Joi.string().required(),
  JWT_SECRET_KEY: Joi.string().required(),
});
