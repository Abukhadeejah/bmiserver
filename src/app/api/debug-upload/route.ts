import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG UPLOAD START ===');
    
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
      serviceKeyLength: process.env.SUPABASE_SERVICE_KEY?.length || 0,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    };

    console.log('Environment check:', envCheck);

    if (!envCheck.hasSupabaseUrl || !envCheck.hasServiceKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        envCheck
      }, { status: 500 });
    }

    // Test Supabase client creation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    console.log('Supabase client created successfully');

    // Test bucket listing
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Bucket listing error:', bucketError);
      return NextResponse.json({
        error: 'Bucket listing failed',
        bucketError: bucketError.message
      }, { status: 500 });
    }

    console.log('Buckets found:', buckets?.map(b => b.name) || []);

    // Test marketing-images bucket
    const marketingBucket = buckets?.find(b => b.name === 'marketing-images');
    
    if (!marketingBucket) {
      console.log('Marketing-images bucket not found, attempting to create...');
      
      const { data: bucketData, error: createError } = await supabase.storage
        .createBucket('marketing-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });

      if (createError) {
        console.error('Bucket creation error:', createError);
        return NextResponse.json({
          error: 'Bucket creation failed',
          createError: createError.message
        }, { status: 500 });
      }

      console.log('Bucket created successfully');
    } else {
      console.log('Marketing-images bucket exists');
    }

    console.log('=== DEBUG UPLOAD SUCCESS ===');

    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      envCheck,
      buckets: buckets?.map(b => b.name) || []
    });

  } catch (error) {
    console.error('=== DEBUG UPLOAD ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json({
      error: 'Debug test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 