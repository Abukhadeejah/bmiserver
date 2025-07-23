import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id);
    const { name, phone, email, dateOfBirth, relationshipStatus, serviceLooking, platform, customerType } = await request.json();
    
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        name,
        phone,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        relationshipStatus,
        serviceLooking,
        platform,
        customerType
      }
    });
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
