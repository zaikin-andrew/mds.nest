import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('local', 'dev', 'test', 'prod').default('local'),

  SERVER_PORT: Joi.number().default(3000),

  // Database
  MONGO_URL: Joi.string().uri().required(),

  // Firebase
  SERVICE_ACCOUNT_ACCESS_KEY_ID: Joi.string().required(),
  SERVICE_ACCOUNT_ACCESS_KEY: Joi.string().required(),

  // VK
  VK_CLIENT_ID: Joi.string().required(),

  // Storage
  BUCKET_NAME: Joi.string().required(),
  STORAGE_URL: Joi.string().uri().required(),

  // OpenAI
  OPENAI_TOKEN: Joi.string().required(),

  // Admin credentials
  ADDISON_CREDENTIALS: Joi.string().required(),
  AZAIKIN_CREDENTIALS: Joi.string().required(),

  // Telegram
  TG_SUPPORT_USER_ID: Joi.string().required(),

  // Rustore
  RUSTORE_PUSH_SERVICE_URL: Joi.string().uri().optional(),
  RUSTORE_PUSH_SERVICE_PROJECT_ID: Joi.string().optional(),
  RUSTORE_PUSH_SERVICE_TOKEN: Joi.string().optional(),

  // AI
  AI_URL: Joi.string().uri().optional(),
});
