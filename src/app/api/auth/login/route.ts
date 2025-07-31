import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const { data: admin, error } = await supabase
      .from('AdminUser')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !admin || !bcrypt.compareSync(password, admin.passwordHash)) {
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
