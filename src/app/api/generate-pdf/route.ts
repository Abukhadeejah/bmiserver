import { NextRequest, NextResponse } from 'next/server';
import { generateHealthReportPDF } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { bmiRecordId, uploadedImageInfo } = await request.json();

    // Get BMI record
    const bmiRecord = await prisma.bMIRecord.findUnique({
      where: { id: parseInt(bmiRecordId) },
      include: {
        member: true
      }
    });

    if (!bmiRecord) {
      return NextResponse.json({ error: 'BMI record not found' }, { status: 404 });
    }

    // Set uploaded image info as environment variable for PDF generation
    if (uploadedImageInfo) {
      process.env.UPLOADED_IMAGE_INFO = JSON.stringify(uploadedImageInfo);
    }

    // Generate PDF
    const pdfBuffer = await generateHealthReportPDF(bmiRecord, true);

    // Clear the environment variable
    delete process.env.UPLOADED_IMAGE_INFO;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${bmiRecord.member.name.replace(/\s+/g, '-')}-Health-Report.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF generation error');
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
} 