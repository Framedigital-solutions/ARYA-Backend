const { z } = require('zod');

const PhoneSchema = z.string().trim().min(7).max(30);
const LineSchema = z.string().trim().min(1).max(200);

const ClinicProfileUpsertSchema = z.object({
  id: z.string().trim().min(1).max(80).optional().default('clinic_main'),
  name: z.string().trim().min(2).max(200),
  tagline: z.string().trim().min(1).max(200),
  logoUrl: z.string().trim().max(5000).optional().or(z.literal('')),
  since: z.string().trim().min(2).max(40).optional().or(z.literal('')),
  establishedYear: z.string().trim().min(2).max(40).optional().or(z.literal('')),
  establishedYears: z.string().trim().min(2).max(60).optional().or(z.literal('')),
  founders: z.array(LineSchema).max(20).optional(),
  workingDoctors: z.array(LineSchema).max(40).optional(),
  specializations: z.array(LineSchema).max(40).optional(),
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
