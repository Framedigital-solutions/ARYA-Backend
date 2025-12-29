const { z } = require('zod');

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal('')),
  message: z.string().trim().min(3).max(2000),
});

module.exports = { ContactSchema };
