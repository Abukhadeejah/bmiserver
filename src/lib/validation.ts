import { z, ZodError } from 'zod';

// Validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  password: z.string().min(1, 'Password is required').max(100, 'Password too long')
});

export const memberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z.string().min(10, 'Phone number too short').max(15, 'Phone number too long'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  relationshipStatus: z.string().max(50).optional(),
  serviceLooking: z.string().max(100).optional(),
  platform: z.string().max(50).optional()
});

export const bmiRecordSchema = z.object({
  height: z.number().min(50, 'Height too low').max(300, 'Height too high'),
  weight: z.number().min(20, 'Weight too low').max(500, 'Weight too high'),
  attendedBy: z.string().max(100).optional(),
  age: z.number().min(0).max(150).optional(),
  idealBodyWeight: z.number().min(0).max(500).optional(),
  totalFatPercentage: z.number().min(0).max(100).optional(),
  subcutaneousFat: z.number().min(0).max(100).optional(),
  visceralFat: z.number().min(0).max(50).optional(),
  muscleMass: z.number().min(0).max(200).optional(),
  restingMetabolism: z.number().min(0).max(10000).optional(),
  biologicalAge: z.number().min(0).max(150).optional(),
  healthConclusion: z.string().max(500).optional()
});

// Validation functions
export function validateLogin(data: any) {
  try {
    return { success: true, data: loginSchema.parse(data) };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: (error as any).errors[0]?.message || 'Validation error' };
    }
    return { success: false, error: 'Invalid input data' };
  }
}

export function validateMember(data: any) {
  try {
    return { success: true, data: memberSchema.parse(data) };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: (error as any).errors[0]?.message || 'Validation error' };
    }
    return { success: false, error: 'Invalid input data' };
  }
}

export function validateBMIRecord(data: any) {
  try {
    return { success: true, data: bmiRecordSchema.parse(data) };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: (error as any).errors[0]?.message || 'Validation error' };
    }
    return { success: false, error: 'Invalid input data' };
  }
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
} 