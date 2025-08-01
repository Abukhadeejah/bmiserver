import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== VERCEL ENV TEST ===');
    
    // Check all environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_KEY?.length || 0,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    };
    
    console.log('Environment variables:', envVars);
    
    return NextResponse.json({
      success: true,
      message: 'Environment check completed',
      envVars,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 