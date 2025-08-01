import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create client with service role key for storage operations
let supabase: any;

const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD API START ===');
    
    // Create Supabase client inside the function
    const supabase = createSupabaseClient();
    console.log('Supabase client created successfully');
    
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const category = formData.get('category') as string;
    const customerName = formData.get('customerName') as string;
    const customerId = formData.get('customerId') as string;

    console.log('Form data received:', { 
      hasImage: !!image, 
      imageSize: image?.size, 
      category, 
      customerName, 
      customerId 
    });

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Delete old images for this category only
    try {
      console.log('Deleting old images for category:', category);
      
      const { data: oldFiles } = await supabase.storage
        .from('marketing-images')
        .list('', {
          search: `${category}-` // Only search for files in this category
        });

      if (oldFiles && oldFiles.length > 0) {
        console.log('Found old files to delete:', oldFiles.map(f => f.name));
        
        for (const file of oldFiles) {
          await supabase.storage
            .from('marketing-images')
            .remove([file.name]);
          console.log('Deleted old file:', file.name);
        }
      } else {
        console.log('No old files found for category:', category);
      }
    } catch (error) {
      console.log('Error deleting old images:', error);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${category}-${customerId}-${timestamp}.${image.name.split('.').pop()}`;

    // Convert File to Buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Attempting to create bucket...');
    // Try to create bucket if it doesn't exist
    try {
      await supabase.storage.createBucket('marketing-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      console.log('Bucket created successfully');
    } catch (bucketError) {
      console.log('Bucket creation error (might already exist):', bucketError);
    }
    
    console.log('Starting file upload to Supabase...');
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('marketing-images')
      .upload(fileName, buffer, {
        contentType: image.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    console.log('File uploaded successfully:', data);

    console.log('Getting public URL...');
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('marketing-images')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', urlData.publicUrl);

    // Return the file path for PDF generation
    const response = { 
      success: true, 
      filePath: urlData.publicUrl,
      category,
      customerName,
      customerId
    };

    console.log('=== UPLOAD API SUCCESS ===');
    return NextResponse.json(response);

  } catch (error) {
    console.error('=== UPLOAD API ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 