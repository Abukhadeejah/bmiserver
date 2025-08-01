import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readdir } from 'fs/promises';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const category = formData.get('category') as string;
    const customerName = formData.get('customerName') as string;
    const customerId = formData.get('customerId') as string;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Delete old images for this customer if they exist
    try {
      const existingFiles = await readdir(uploadsDir);
      const oldImages = existingFiles.filter(file => 
        file.startsWith(`${category}-${customerId}-`) && 
        file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );
      
      for (const oldImage of oldImages) {
        const oldImagePath = path.join(uploadsDir, oldImage);
        await unlink(oldImagePath);
        console.log(`Deleted old image: ${oldImage}`);
      }
    } catch (error) {
      console.log('No old images to delete or error deleting:', error);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${category}-${customerId}-${timestamp}.${image.name.split('.').pop()}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert File to Buffer and save
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the file path for PDF generation
    return NextResponse.json({ 
      success: true, 
      filePath: `/uploads/${fileName}`,
      category,
      customerName,
      customerId
    });

  } catch (error) {
    console.error('Upload error');
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 