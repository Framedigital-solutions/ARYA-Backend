const { z } = require('zod');

const FeedbackCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(3).max(2000),
});

const FeedbackPatchSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    message: z.string().trim().min(3).max(2000).optional(),
    status: z.string().trim().min(1).max(40).optional().or(z.literal('')),
  })
  .strict();

module.exports = { FeedbackCreateSchema, FeedbackPatchSchema };
