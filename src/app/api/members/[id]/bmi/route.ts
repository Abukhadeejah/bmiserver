import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await params;
    const memberId = parseInt(id, 10);
    
    const { 
      height, 
      weight, 
      attendedBy,
      age,
      idealBodyWeight,
      totalFatPercentage,
      subcutaneousFat,
      visceralFat,
      muscleMass,
      restingMetabolism,
      biologicalAge,
      healthConclusion
    } = await request.json();
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Determine category
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal Weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    
    // Helper function to convert string to number or null
    const numOrNull = (value: string | number) => {
      if (typeof value === 'number') return value;
      return value?.toString().trim() === '' ? null : Number(value);
    };
    
    const bmiRecord = await prisma.bMIRecord.create({
      data: {
        memberId,
        height: Number(height),
        weight: Number(weight),
        bmi: parseFloat(bmi.toFixed(1)),
        category,
        attendedBy: attendedBy || null,
        age: numOrNull(age),
        idealBodyWeight: numOrNull(idealBodyWeight),
        totalFatPercentage: numOrNull(totalFatPercentage),
        subcutaneousFat: numOrNull(subcutaneousFat),
        visceralFat: numOrNull(visceralFat),
        muscleMass: numOrNull(muscleMass),
        restingMetabolism: numOrNull(restingMetabolism),
        biologicalAge: numOrNull(biologicalAge),
        healthConclusion: healthConclusion || null
      },
      include: {
        member: true
      }
    });
    
    // Send notifications
    sendNotifications(bmiRecord).catch(console.error);
    
    return NextResponse.json(bmiRecord);
  } catch (error) {
    console.error('BMI recording error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
