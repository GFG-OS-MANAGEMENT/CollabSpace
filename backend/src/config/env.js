const path = require('node:path');
const { z } = require('zod');

require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env'),
  quiet: true,
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    const field = issue.path.join('.') || 'environment';
    console.error(`  - ${field}: ${issue.message}`);
  }
  console.error('Copy backend/.env.example to backend/.env and fill in the values.');
  process.exit(1);
}

const env = parsed.data;

module.exports = {
  ...env,
  isTest: env.NODE_ENV === 'test',
  isProduction: env.NODE_ENV === 'production',
  corsOrigins: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean),
};
