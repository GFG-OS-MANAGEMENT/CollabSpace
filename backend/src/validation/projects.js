const { z } = require('zod');

const projectKind = z.enum(['ACADEMIC', 'PERSONAL', 'HACKATHON']);
const projectStatus = z.enum(['OPEN', 'CLOSED']);

const title = z
  .string()
  .trim()
  .min(3, 'Title must be at least 3 characters')
  .max(120, 'Title must be at most 120 characters');

const description = z
  .string()
  .trim()
  .min(20, 'Description must be at least 20 characters')
  .max(2000, 'Description must be at most 2000 characters');

const tagList = z
  .array(z.string().trim().min(1, 'Tags cannot be empty').max(40, 'Tags must be at most 40 characters'))
  .max(15, 'List at most 15 tags');

const idParams = z.object({ id: z.string().uuid('Invalid project id') });

const createProjectSchema = z.object({
  body: z.object({
    title,
    description,
    kind: projectKind.default('PERSONAL'),
    skills: tagList.default([]),
    roles: tagList.default([]),
  }),
  params: z.object({}),
  query: z.object({}),
});

const updateProjectSchema = z.object({
  body: z
    .object({
      title: title.optional(),
      description: description.optional(),
      kind: projectKind.optional(),
      status: projectStatus.optional(),
      skills: tagList.optional(),
      roles: tagList.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Provide at least one field to update',
    }),
  params: idParams,
  query: z.object({}),
});

const listProjectsSchema = z.object({
  body: z.any().optional(),
  params: z.object({}),
  query: z.object({
    search: z.string().trim().max(120).optional(),
    skill: z.string().trim().max(40).optional(),
    kind: projectKind.optional(),
    status: projectStatus.optional(),
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(50, 'Limit must be at most 50')
      .default(20),
  }),
});

const projectParamsSchema = z.object({
  body: z.any().optional(),
  params: idParams,
  query: z.object({}),
});

const createRequestSchema = z.object({
  body: z.object({
    message: z
      .string()
      .trim()
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message must be at most 1000 characters')
      .optional(),
  }),
  params: idParams,
  query: z.object({}),
});

const decideRequestSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'], {
      errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' }),
    }),
  }),
  params: z.object({
    id: z.string().uuid('Invalid project id'),
    requestId: z.string().uuid('Invalid join request id'),
  }),
  query: z.object({}),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  projectParamsSchema,
  createRequestSchema,
  decideRequestSchema,
};
