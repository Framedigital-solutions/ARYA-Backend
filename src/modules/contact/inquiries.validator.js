 const { z } = require('zod');
 
 const InquiryStatusSchema = z.enum(['new', 'open', 'closed', 'resolved']).optional().or(z.string().trim().min(1).max(40));
 
 const ContactInquiryCreateSchema = z.object({
   name: z.string().trim().min(2).max(80),
   email: z.string().trim().email().max(120),
   phone: z.string().trim().min(7).max(20).optional().or(z.literal('')),
   message: z.string().trim().min(3).max(2000),
   source: z.string().trim().min(0).max(80).optional().or(z.literal('')),
   status: InquiryStatusSchema.optional(),
   assigned_to_user_id: z.string().trim().min(0).max(80).optional().or(z.literal('')),
 });
 
 const ContactInquiryPatchSchema = ContactInquiryCreateSchema.partial();
 
 module.exports = {
   ContactInquiryCreateSchema,
   ContactInquiryPatchSchema,
 };
