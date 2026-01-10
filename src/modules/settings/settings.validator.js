const { z } = require('zod');

const SettingKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Key must contain only letters, numbers, dot, underscore, dash');

const SettingCreateSchema = z
  .object({
    key: SettingKeySchema,
    value: z.any(),
    description: z.string().trim().max(500).optional().or(z.literal('')),
  })
  .strict();

const SettingPatchSchema = z
  .object({
    key: SettingKeySchema.optional(),
    value: z.any().optional(),
    description: z.string().trim().max(500).optional().or(z.literal('')),
  })
  .strict();

module.exports = { SettingCreateSchema, SettingPatchSchema };
