const { z } = require('zod');

const ImageSchema = z
  .object({
    url: z.string().trim().max(5000).optional().default(''),
    publicId: z.string().trim().max(5000).optional().default(''),
  })
  .optional()
  .default({ url: '', publicId: '' });

const BulletSchema = z.string().trim().min(1).max(120);

const CareProgramCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  shortDescription: z.string().trim().min(0).max(500).optional().default(''),
  iconType: z.string().trim().min(0).max(60).optional().default(''),
  bulletPoints: z.array(BulletSchema).max(3).optional().default([]),
  image: ImageSchema,
  status: z.enum(['active', 'inactive']).optional().default('active'),
  displayOrder: z.number().int().min(0).max(100000).optional().default(0),
});

const CareProgramUpdateSchema = CareProgramCreateSchema.partial();

module.exports = {
  CareProgramCreateSchema,
  CareProgramUpdateSchema,
};
