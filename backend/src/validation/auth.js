const { z } = require('zod');

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .max(254, 'Email must be at most 254 characters');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be at most 80 characters'),
    email: emailSchema,
    password: passwordSchema,
    college: z
      .string()
      .trim()
      .min(2, 'College must be at least 2 characters')
      .max(120, 'College must be at most 120 characters')
      .optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
  params: z.object({}),
  query: z.object({}),
});

module.exports = { registerSchema, loginSchema };
