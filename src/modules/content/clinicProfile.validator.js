const { z } = require('zod');

const PhoneSchema = z.string().trim().min(7).max(30);

const ClinicProfileUpsertSchema = z.object({
  id: z.string().trim().min(1).max(80).optional().default('clinic_main'),
  name: z.string().trim().min(2).max(200),
  tagline: z.string().trim().min(1).max(200),
  primaryPhone: PhoneSchema,
  secondaryPhone: PhoneSchema.optional().or(z.literal('')),
  whatsappNumber: z.string().trim().min(7).max(30).optional().or(z.literal('')),
  addressText: z.string().trim().min(3).max(500),
  hoursText: z.string().trim().min(3).max(500),
  googleMapsUrl: z.string().trim().max(5000).optional().or(z.literal('')),
});

const ClinicProfilePatchSchema = ClinicProfileUpsertSchema.partial();

module.exports = {
  ClinicProfileUpsertSchema,
  ClinicProfilePatchSchema,
};
