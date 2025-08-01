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
    // Create Supabase client inside the function
    const supabase = createSupabaseClient();
    
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const category = formData.get('category') as string;
    const customerName = formData.get('customerName') as string;
    const customerId = formData.get('customerId') as string;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Delete old images for this customer if they exist
    try {
      const { data: oldFiles } = await supabase.storage
        .from('marketing-images')
        .list('', {
          search: `${category}-${customerId}-`
        });

      if (oldFiles) {
        for (const file of oldFiles) {
          await supabase.storage
            .from('marketing-images')
            .remove([file.name]);
        }
      }
    } catch (error) {
      // No old images to delete or error deleting
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${category}-${customerId}-${timestamp}.${image.name.split('.').pop()}`;

    // Convert File to Buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try to create bucket if it doesn't exist
    try {
      await supabase.storage.createBucket('marketing-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
    } catch (bucketError) {
      // Bucket might already exist
    }
    
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('marketing-images')
      .getPublicUrl(fileName);

    // Return the file path for PDF generation
    return NextResponse.json({ 
      success: true, 
      filePath: urlData.publicUrl,
      category,
      customerName,
      customerId
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 