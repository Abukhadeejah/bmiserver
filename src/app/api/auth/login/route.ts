import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const admin = await prisma.adminUser.findUnique({
      where: { username }
    });
    
    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = jwt.sign(
      { userId: admin.id, username: admin.username },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );
    
    return NextResponse.json({ 
      token, 
      user: { id: admin.id, username: admin.username } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
