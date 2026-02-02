import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
    // Server
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),

    // Database
    DATABASE_URL: Joi.string().required(),

    // Auth
    JWT_SECRET: Joi.string().required(),

    // MinIO
    MINIO_ENDPOINT: Joi.string().required(),
    MINIO_PORT: Joi.number().required(),
    MINIO_ACCESS_KEY: Joi.string().required(),
    MINIO_SECRET_KEY: Joi.string().required(),
    MINIO_BUCKET: Joi.string().default('uploads'),
    MINIO_USE_SSL: Joi.boolean().default(false),
});
