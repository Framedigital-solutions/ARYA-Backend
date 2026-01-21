const { z } = require('zod');

const ClinicLocationStatusSchema = z.enum(['active', 'inactive']);

const ClinicLocationCreateSchema = z
  .object({
    clinicName: z.string().trim().min(1).max(200).optional().or(z.literal('')),
    googleMapLink: z.string().trim().min(5).max(5000),
    addressText: z.string().trim().max(500).optional().or(z.literal('')),
  })
  .strict();

const ClinicLocationPatchSchema = z
  .object({
    clinicName: z.string().trim().min(1).max(200).optional().or(z.literal('')),
    googleMapLink: z.string().trim().min(5).max(5000).optional(),
    embedMapUrl: z.string().trim().max(5000).optional().or(z.literal('')),
    latitude: z.number().finite().optional(),
    longitude: z.number().finite().optional(),
    addressText: z.string().trim().max(500).optional().or(z.literal('')),
    status: ClinicLocationStatusSchema.optional(),
  })
  .strict();

const ParseLinkSchema = z
  .object({
    googleMapLink: z.string().trim().min(5).max(5000),
  })
  .strict();

module.exports = { ClinicLocationCreateSchema, ClinicLocationPatchSchema, ParseLinkSchema, ClinicLocationStatusSchema };
