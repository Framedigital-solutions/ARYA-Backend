const { z } = require('zod');

const TestimonialCreateSchema = z.object({
  patientDisplayName: z.string().trim().min(2).max(80),
  age: z.number().int().min(0).max(120).optional(),
  category: z.string().trim().min(2).max(80),
  quote: z.string().trim().min(10).max(1200),
  outcomeLabel: z.string().trim().min(0).max(120).optional().default(''),
  treatmentDuration: z.string().trim().min(0).max(60).optional().default(''),
  isPublished: z.boolean().optional().default(true),
});

const TestimonialUpdateSchema = TestimonialCreateSchema.partial();

module.exports = {
  TestimonialCreateSchema,
  TestimonialUpdateSchema,
};
