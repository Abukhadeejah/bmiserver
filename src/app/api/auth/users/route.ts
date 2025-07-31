import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEnvironment } from '@/lib/env-validation';

export const dynamic = 'force-dynamic';

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.userPass.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    if (!validateEnvironment()) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { username, password, role } = await request.json();

    // Input validation
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Username, password, and role are required' }, { status: 400 });
    }

    if (!['admin', 'staff', 'ADMIN', 'STAFF'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin, staff, ADMIN, or STAFF' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json({ error: 'Username must be 3-50 characters' }, { status: 400 });
    }

    if (password.length < 1) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await prisma.userPass.findUnique({
      where: { username: username }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Store password as plain text
    const newUser = await prisma.userPass.create({
      data: {
        username: username,
        password: password,
        role,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Create user error');
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 