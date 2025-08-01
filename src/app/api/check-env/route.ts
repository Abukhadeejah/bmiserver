import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_KEY?.length || 0
  };
  
  return NextResponse.json({
    success: true,
    envVars,
    timestamp: new Date().toISOString()
  });
} 