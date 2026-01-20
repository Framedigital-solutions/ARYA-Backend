const { z } = require('zod');

const AdminUserRoleSchema = z.enum(['super_admin', 'admin', 'editor', 'staff']);

const AdminUserPermissionsSchema = z.record(z.boolean()).optional();

const AdminUserCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(200),
  role: AdminUserRoleSchema,
  permissions: AdminUserPermissionsSchema,
  is_active: z.boolean().optional().default(true),
  status: z.string().trim().max(40).optional().or(z.literal('')),
});

const AdminUserPatchSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().email().max(120).optional(),
    password: z.string().min(8).max(200).optional(),
    role: AdminUserRoleSchema.optional(),
    permissions: AdminUserPermissionsSchema,
    is_active: z.boolean().optional(),
    status: z.string().trim().max(40).optional().or(z.literal('')),
    last_login_at: z.string().trim().max(40).optional().or(z.literal('')),
  })
  .strict();

module.exports = {
  AdminUserRoleSchema,
  AdminUserCreateSchema,
  AdminUserPatchSchema,
};
