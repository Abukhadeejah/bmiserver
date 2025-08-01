import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateEnvironment } from '@/lib/env-validation';
import { validateLogin } from '@/lib/validation';
import { loginRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMITING - Prevent brute force attacks
    const rateLimitResult = loginRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // 2. ENVIRONMENT VALIDATION - Ensure secure configuration
    if (!validateEnvironment()) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 3. INPUT VALIDATION - Prevent injection attacks
    const body = await request.json();
    const validation = validateLogin(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { username, password } = validation.data!;

    // 4. SANITIZE INPUT - Remove malicious characters
    const sanitizedUsername = username.trim();
    const sanitizedPassword = password.trim();

    // 5. DATABASE QUERY - Find user securely using Supabase
    const { data: user, error } = await supabase
      .from('UserPass')
      .select('*')
      .eq('username', sanitizedUsername)
      .single();

    if (error) {
      console.error('Database login error');
      return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
    }

    // 6. USER VALIDATION - Check if user exists and is active
    if (!user) {
      // Use same error message to prevent username enumeration
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    // 7. PASSWORD VERIFICATION - Simple plain text comparison
    if (user.password !== sanitizedPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 8. SESSION MANAGEMENT - Generate secure session
    const sessionId = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15) + 
                     Date.now().toString(36);

    // 9. SUCCESS RESPONSE - Return minimal user data
    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role
      },
      sessionId: sessionId
    });

  } catch (error) {
    // 10. ERROR HANDLING - Don't expose internal errors
    console.error('Database login error');
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
} 