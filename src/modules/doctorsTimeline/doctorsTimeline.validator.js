const { z } = require('zod');

const LineSchema = z.string().trim().min(1).max(200);

const TimelineItemCreateSchema = z.object({
  doctorName: z.string().trim().min(2).max(120),
  qualification: z.string().trim().min(0).max(120).optional().default(''),
  position: z.number().int().min(0).max(100000).optional().default(0),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

const TimelineItemUpdateSchema = TimelineItemCreateSchema.partial();

const DoctorsTimelineUpsertSchema = z.object({
  title: z.string().trim().min(0).max(120).optional().default(''),
  tagline: z.string().trim().min(0).max(800).optional().default(''),
  yearLabel: z.string().trim().min(0).max(60).optional().default('Year of Establishment'),
  yearOfEstablishment: z.string().trim().min(0).max(40).optional().default(''),
  foundersLabel: z.string().trim().min(0).max(60).optional().default('Founder'),
  founders: z.array(LineSchema).max(20).optional().default([]),
});

const DoctorsTimelinePatchSchema = DoctorsTimelineUpsertSchema.partial();

const ReorderSchema = z.object({
  ids: z.array(z.string().trim().min(1).max(80)).min(1).max(200),
});

module.exports = {
  TimelineItemCreateSchema,
  TimelineItemUpdateSchema,
  DoctorsTimelineUpsertSchema,
  DoctorsTimelinePatchSchema,
  ReorderSchema,
};
