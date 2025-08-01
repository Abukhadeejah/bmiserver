import { NextRequest, NextResponse } from 'next/server';
import { generateHealthReportPDF } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting PDF generation API...');
    
    const { bmiRecordId, uploadedImageInfo } = await request.json();

    // Get BMI record
    const { data: bmiRecord, error } = await supabase
      .from('BMIRecord')
      .select(`
        *,
        member:Member(*)
      `)
      .eq('id', parseInt(bmiRecordId))
      .single();

    if (error || !bmiRecord) {
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

    console.log('PDF generated successfully');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${bmiRecord.member.name.replace(/\s+/g, '-')}-Health-Report.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ 
      error: 'PDF generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
