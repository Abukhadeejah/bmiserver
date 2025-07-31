import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Prevent caching issues in Next.js 13+
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all members
    const result = await supabase
      .from('Member')
      .select('*')
      .order('createdAt', { ascending: false });

    // Handle the response safely
    if (result && result.data) {
      const members = result.data;
      
      // Fetch BMI records for each member
      const membersWithBMI = await Promise.all(
        members.map(async (member) => {
          const bmiResult = await supabase
            .from('BMIRecord')
            .select('id, bmi, category, recordedAt')
            .eq('memberId', member.id)
            .order('recordedAt', { ascending: false })
            .limit(1);

          return {
            ...member,
            bmiRecords: bmiResult?.data || []
          };
        })
      );
      
      return NextResponse.json(membersWithBMI);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, dateOfBirth, relationshipStatus, serviceLooking, platform } = await request.json();
    
    // Generate member ID
    const lastMemberResult = await supabase
      .from('Member')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastMember = lastMemberResult?.data;
    const nextId = lastMember ? lastMember.id + 1 : 1;
    const memberId = `M${nextId.toString().padStart(3, '0')}`;
    
    const result = await supabase
      .from('Member')
      .insert({
        memberId,
        name,
        phone,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        relationshipStatus,
        serviceLooking,
        platform,
        customerType: 'new'
      })
      .select()
      .single();

    if (result && result.data) {
      return NextResponse.json(result.data);
    }
    
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  } catch (error) {
    console.error('Create member error');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 