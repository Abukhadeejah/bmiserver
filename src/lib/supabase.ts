import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Create a mock client if environment variables are missing (for build time)
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using mock client for build.');
    return {
      from: () => ({
        select: () => ({ 
          eq: () => ({ 
            neq: () => ({ single: () => ({ data: null, error: null }) }),
            single: () => ({ data: null, error: null }) 
          }),
          neq: () => ({ single: () => ({ data: null, error: null }) }),
          single: () => ({ data: null, error: null }),
          insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
          order: () => ({ limit: () => ({ single: () => ({ data: null, error: null }) }) }),
          // Return data and error directly for queries that don't chain
          data: null,
          error: null
        }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ 
          eq: () => ({ 
            select: () => ({ single: () => ({ data: null, error: null }) }) 
          }) 
        }),
        delete: () => ({ eq: () => ({ data: null, error: null }) }),
        order: () => ({ limit: () => ({ single: () => ({ data: null, error: null }) }) })
      })
    };
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Database types
export interface Member {
  id: number;
  memberId: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  relationshipStatus?: string;
  serviceLooking?: string;
  platform?: string;
  customerType: string;
  createdAt: string;
  updatedAt: string;
}

export interface BMIRecord {
  id: number;
  memberId: number;
  height: number;
  weight: number;
  bmi: number;
  category: string;
  age?: number;
  idealBodyWeight?: number;
  totalFatPercentage?: number;
  subcutaneousFat?: number;
  visceralFat?: number;
  muscleMass?: number;
  restingMetabolism?: number;
  biologicalAge?: number;
  healthConclusion?: string;
  recordedAt: string;
  attendedBy?: string;
}

export interface Notification {
  id: number;
  memberId: number;
  bmiRecordId: number;
  whatsappSent: boolean;
  emailSent: boolean;
  whatsappStatus?: string;
  emailStatus?: string;
  sentAt: string;
}

export interface UserPass {
  id: number;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
  createdAt: string;
} 