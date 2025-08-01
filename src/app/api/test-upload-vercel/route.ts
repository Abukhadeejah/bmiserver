import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== VERCEL UPLOAD TEST ===');
    
    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_KEY?.length || 0
    };
    
    console.log('Environment variables:', envVars);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({
        error: 'Missing environment variables',
        envVars
      }, { status: 500 });
    }
    
    // Test Supabase client creation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    console.log('Supabase client created successfully');
    
    // Test bucket access
    const { data: files, error: listError } = await supabase.storage
      .from('marketing-images')
      .list('', { limit: 5 });
    
    if (listError) {
      console.error('Storage access error:', listError);
      return NextResponse.json({
        error: 'Storage access failed',
        listError: listError.message,
        envVars
      }, { status: 500 });
    }
    
    console.log('Storage access successful');
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working in Vercel',
      filesCount: files?.length || 0,
      files: files?.map(f => f.name) || [],
      envVars
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 