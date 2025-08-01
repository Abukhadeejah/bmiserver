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
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Create Supabase client inside the function
    const supabase = createSupabaseClient();
    console.log('Supabase client created successfully');
    
    let formData;
    try {
      formData = await request.formData();
    } catch (formDataError) {
      console.error('FormData parsing error:', formDataError);
      return NextResponse.json({ 
        error: 'Failed to parse form data',
        details: formDataError instanceof Error ? formDataError.message : 'Unknown error'
      }, { status: 400 });
    }
    
    const image = formData.get('image') as File;
    const category = formData.get('category') as string;
    const customerName = formData.get('customerName') as string;
    const customerId = formData.get('customerId') as string;

    console.log('Form data received:', { 
      hasImage: !!image, 
      imageSize: image?.size, 
      imageType: image?.type,
      imageName: image?.name,
      category, 
      customerName, 
      customerId 
    });

    if (!image) {
      console.error('No image in form data');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    
    if (!(image instanceof File)) {
      console.error('Image is not a File object:', typeof image);
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      console.error('File too large:', image.size);
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      console.error('Invalid file type:', image.type);
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' 
      }, { status: 400 });
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
    let bytes, buffer;
    try {
      bytes = await image.arrayBuffer();
      buffer = Buffer.from(bytes);
    } catch (bufferError) {
      console.error('Buffer creation error:', bufferError);
      return NextResponse.json({ 
        error: 'Failed to process image',
        details: bufferError instanceof Error ? bufferError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    console.log('Buffer created:', {
      bufferLength: buffer.length,
      originalSize: image.size
    });

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
    console.log('Upload parameters:', {
      fileName,
      contentType: image.type,
      bufferLength: buffer.length
    });
    
    // Upload to Supabase Storage
    let uploadResult;
    try {
      uploadResult = await supabase.storage
        .from('marketing-images')
        .upload(fileName, buffer, {
          contentType: image.type,
          cacheControl: '3600',
          upsert: false
        });
    } catch (uploadError) {
      console.error('Upload exception:', uploadError);
      return NextResponse.json({ 
        error: 'Upload failed',
        details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
      }, { status: 500 });
    }

    if (uploadResult.error) {
      console.error('Supabase upload error:', uploadResult.error);
      console.error('Error details:', {
        message: uploadResult.error.message,
        statusCode: uploadResult.error.statusCode,
        error: uploadResult.error.error
      });
      return NextResponse.json({ error: `Upload failed: ${uploadResult.error.message}` }, { status: 500 });
    }

    console.log('File uploaded successfully:', uploadResult.data);

    console.log('Getting public URL...');
    // Get public URL
    let urlData;
    try {
      urlData = supabase.storage
        .from('marketing-images')
        .getPublicUrl(fileName);
    } catch (urlError) {
      console.error('URL generation error:', urlError);
      return NextResponse.json({ 
        error: 'Failed to generate public URL',
        details: urlError instanceof Error ? urlError.message : 'Unknown error'
      }, { status: 500 });
    }

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