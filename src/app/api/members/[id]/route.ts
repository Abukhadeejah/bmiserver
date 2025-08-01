import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const memberId = parseInt(id);
    const { name, phone, email, dateOfBirth, relationshipStatus, serviceLooking, platform, customerType } = await request.json();
    
    const { data: updatedMember, error } = await supabase
      .from('Member')
      .update({
        name,
        phone,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        relationshipStatus,
        serviceLooking,
        platform,
        customerType
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.error('Update member error:', error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Update member error');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
