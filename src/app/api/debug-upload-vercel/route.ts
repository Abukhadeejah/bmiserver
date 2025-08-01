import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== COMPREHENSIVE VERCEL DEBUG ===');
    
    // Step 1: Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_KEY?.length || 0,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    };
    
    console.log('Environment check:', envVars);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({
        error: 'Missing environment variables',
        envVars,
        step: 'environment_check'
      }, { status: 500 });
    }
    
    // Step 2: Test Supabase client creation
    let supabase;
    try {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      console.log('Supabase client created successfully');
    } catch (clientError) {
      console.error('Supabase client creation error:', clientError);
      return NextResponse.json({
        error: 'Failed to create Supabase client',
        details: clientError instanceof Error ? clientError.message : 'Unknown error',
        envVars,
        step: 'client_creation'
      }, { status: 500 });
    }
    
    // Step 3: Test bucket listing
    let files;
    try {
      const { data: bucketFiles, error: listError } = await supabase.storage
        .from('marketing-images')
        .list('', { limit: 5 });
      
      if (listError) {
        console.error('Bucket listing error:', listError);
        return NextResponse.json({
          error: 'Bucket listing failed',
          listError: listError.message,
          envVars,
          step: 'bucket_listing'
        }, { status: 500 });
      }
      
      files = bucketFiles;
      console.log('Bucket listing successful');
    } catch (listException) {
      console.error('Bucket listing exception:', listException);
      return NextResponse.json({
        error: 'Bucket listing exception',
        details: listException instanceof Error ? listException.message : 'Unknown error',
        envVars,
        step: 'bucket_listing_exception'
      }, { status: 500 });
    }
    
    // Step 4: Test FormData parsing (if provided)
    let formDataResult = null;
    try {
      const contentType = request.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (contentType && contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const entries = Array.from(formData.entries());
        formDataResult = {
          hasFormData: true,
          entries: entries.map(([key, value]) => [key, typeof value])
        };
        console.log('FormData parsed successfully');
      } else {
        formDataResult = {
          hasFormData: false,
          contentType
        };
        console.log('No FormData in request');
      }
    } catch (formDataError) {
      console.error('FormData parsing error:', formDataError);
      formDataResult = {
        hasFormData: false,
        error: formDataError instanceof Error ? formDataError.message : 'Unknown error'
      };
    }
    
    return NextResponse.json({
      success: true,
      message: 'All tests completed',
      envVars,
      filesCount: files?.length || 0,
      files: files?.map(f => f.name) || [],
      formData: formDataResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('=== VERCEL DEBUG ERROR ===');
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 });
  }
} 