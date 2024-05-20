import * as Joi from 'joi';

export interface EnvironmentVariables {
  DATABASE_URL: string;
  OAUTH_DISCORD_CLIENT_ID: string;
  OAUTH_DISCORD_CLIENT_SECRET: string;
  OAUTH_DISCORD_CALLBACK_URL: string;
  APP_SECRET: string;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  S3_ACCESS_KEY_ID: string;
  S3_ACCESS_KEY_SECRET: string;
  S3_REGION: string;
}

export const validationSchemaForEnv = Joi.object<EnvironmentVariables, true>({
  DATABASE_URL: Joi.string().required(),
  OAUTH_DISCORD_CLIENT_ID: Joi.string().required(),
  OAUTH_DISCORD_CLIENT_SECRET: Joi.string().required(),
  OAUTH_DISCORD_CALLBACK_URL: Joi.string().required(),
  APP_SECRET: Joi.string().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  S3_ACCESS_KEY_ID: Joi.string().required(),
  S3_ACCESS_KEY_SECRET: Joi.string().required(),
  S3_REGION: Joi.string().required(),
});
