import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Prevent caching issues in Next.js 13+
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        bmiRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    });
    
    return NextResponse.json(members);
  } catch (error) {
    console.error('Database query failed');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, dateOfBirth, relationshipStatus, serviceLooking, platform } = await request.json();
    
    // Generate member ID
    const lastMember = await prisma.member.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextId = lastMember ? lastMember.id + 1 : 1;
    const memberId = `M${nextId.toString().padStart(3, '0')}`;
    
    const member = await prisma.member.create({
      data: {
        memberId,
        name,
        phone,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        relationshipStatus,
        serviceLooking,
        platform,
        customerType: 'new'
      }
    });
    
    return NextResponse.json(member);
  } catch (error) {
    console.error('Create member error');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
