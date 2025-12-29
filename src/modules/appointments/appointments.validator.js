const { z } = require('zod');

const AppointmentRequestStatusSchema = z.enum(['new', 'confirmed', 'declined', 'completed']);

const AppointmentRequestCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  preferred_date: z.string().trim().min(4).max(30).optional().or(z.literal('')),
  preferred_time: z.string().trim().min(3).max(20).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  status: AppointmentRequestStatusSchema.optional(),
});

const AppointmentRequestPatchSchema = AppointmentRequestCreateSchema.partial();

const AppointmentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  preferred_date: z.string().trim().min(4).max(30).optional().or(z.literal('')),
  preferred_time: z.string().trim().min(3).max(20).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  date: z.string().trim().min(4).max(30).optional().or(z.literal('')),
  time: z.string().trim().min(3).max(20).optional().or(z.literal('')),
  reason: z.string().trim().min(3).max(500).optional().or(z.literal('')),
});

module.exports = {
  AppointmentSchema,
  AppointmentRequestStatusSchema,
  AppointmentRequestCreateSchema,
  AppointmentRequestPatchSchema,
};
