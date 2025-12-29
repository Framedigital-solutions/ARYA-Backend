const { z } = require('zod');

const SlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const ProgramCreateSchema = z.object({
  slug: SlugSchema,
  title: z.string().trim().min(2).max(200),
  shortDescription: z.string().trim().min(3).max(500),
  bullets: z.array(z.string().trim().min(1).max(120)).max(12).optional().default([]),
  iconKey: z.string().trim().min(1).max(60).optional().default(''),
  sortOrder: z.number().int().min(0).max(100000).optional().default(0),
  isPublished: z.boolean().optional().default(true),
});

const ProgramUpdateSchema = ProgramCreateSchema.partial();

module.exports = {
  ProgramCreateSchema,
  ProgramUpdateSchema,
};
