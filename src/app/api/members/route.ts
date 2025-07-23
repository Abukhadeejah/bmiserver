import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Prevent caching issues in Next.js 13+
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🔍 API Route: /api/members GET called');
    console.log('🔍 DATABASE_URL from env:', process.env.DATABASE_URL);
    
    const members = await prisma.member.findMany({
      include: {
        bmiRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    });
    
    console.log('✅ Query successful - Members found:', members.length);
    console.log('📋 Members data:', members.map(m => ({ id: m.id, name: m.name, memberId: m.memberId })));
    
    return NextResponse.json(members);
  } catch (error) {
    console.error('❌ Database query failed:', error);
    console.error('❌ Error details:', error.message);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route: /api/members POST called');
    
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
    
    console.log('✅ Member created:', member.memberId);
    return NextResponse.json(member);
  } catch (error) {
    console.error('❌ Create member error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
