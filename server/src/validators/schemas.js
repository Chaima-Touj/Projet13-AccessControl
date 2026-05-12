const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const userSchema = z.object({
  fullName: z.string().min(2, 'Le nom est trop court'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
  role: z.enum(['admin', 'student', 'teacher', 'security']),
  department: z.string().optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

const badgeSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID utilisateur invalide'),
  expiresAt: z.string().optional().or(z.date().optional()),
  status: z.enum(['active', 'blocked', 'expired']).optional(),
});

const buildingSchema = z.object({
  name: z.string().min(2, 'Le nom est trop court'),
  code: z.string().min(2, 'Le code est trop court'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const doorSchema = z.object({
  name: z.string().min(2, 'Le nom est trop court'),
  code: z.string().min(2, 'Le code est trop court'),
  buildingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID bâtiment invalide'),
  location: z.string().optional(),
  securityLevel: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const permissionSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID utilisateur invalide').nullable().optional(),
  role: z.enum(['admin', 'student', 'teacher', 'security']).nullable().optional(),
  buildingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID bâtiment invalide').nullable().optional(),
  doorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID porte invalide').nullable().optional(),
  allowedDays: z.array(z.number().min(0).max(6)).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm invalide').optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm invalide').optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const incidentSchema = z.object({
  title: z.string().min(5, 'Le titre est trop court'),
  description: z.string().min(10, 'La description est trop courte'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  relatedAccessLogId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID log invalide').nullable().optional(),
  status: z.enum(['open', 'investigating', 'resolved']).optional(),
});

const simulationSchema = z.object({
  badgeId: z.string().min(3, 'ID badge invalide'),
  doorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID porte invalide'),
});

module.exports = {
  loginSchema,
  userSchema,
  badgeSchema,
  buildingSchema,
  doorSchema,
  permissionSchema,
  incidentSchema,
  simulationSchema
};
