const { z } = require('zod');

const TextLineSchema = z.string().trim().min(0).max(80);

const HomeHeroSchema = z.object({
  titleLines: z.array(TextLineSchema).max(6).optional().default([]),
  subtitle: z.string().trim().min(0).max(800).optional().default(''),
  ctaPrimary: z.string().trim().min(0).max(80).optional().default(''),
  ctaSecondary: z.string().trim().min(0).max(80).optional().default(''),
});

const HomeHeroStatSchema = z.object({
  value: z.string().trim().min(0).max(40).optional().default(''),
  label: z.string().trim().min(0).max(60).optional().default(''),
});

const HomeHeroTagSchema = z.object({
  title: z.string().trim().min(0).max(60).optional().default(''),
  subtitle: z.string().trim().min(0).max(80).optional().default(''),
});

const HomeLegacySchema = z.object({
  titlePrefix: z.string().trim().min(0).max(80).optional().default(''),
  titleHighlight: z.string().trim().min(0).max(80).optional().default(''),
  subtitle: z.string().trim().min(0).max(800).optional().default(''),
});

const HomeExperienceSchema = z.object({
  title: z.string().trim().min(0).max(120).optional().default(''),
  quote: z.string().trim().min(0).max(1200).optional().default(''),
  author: z.string().trim().min(0).max(120).optional().default(''),
});

const HomeUpsertSchema = z.object({
  hero: HomeHeroSchema.optional().default({}),
  heroImageUrl: z.string().trim().max(5000).optional().default(''),
  heroTag: HomeHeroTagSchema.optional().default({}),
  heroStats: z.array(HomeHeroStatSchema).max(6).optional().default([]),
  legacy: HomeLegacySchema.optional().default({}),
  experience: HomeExperienceSchema.optional().default({}),
});

const HomePatchSchema = HomeUpsertSchema.partial();

module.exports = {
  HomeUpsertSchema,
  HomePatchSchema,
};
