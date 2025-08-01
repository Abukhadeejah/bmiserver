import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateEnvironment } from '@/lib/env-validation';

export const dynamic = 'force-dynamic';

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateEnvironment()) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { id } = await params;
    const userId = parseInt(id, 10);

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

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('UserPass')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if new username already exists (excluding current user)
    const { data: usernameExists } = await supabase
      .from('UserPass')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .single();

    if (usernameExists) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Update user with plain text password
    const { data: updatedUser, error: updateError } = await supabase
      .from('UserPass')
      .update({
        username: username,
        password: password,
        role: role
      })
      .eq('id', userId)
      .select('id, username, role, isActive, updatedAt')
      .single();

    if (updateError) {
      console.error('Update user error:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error');
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('UserPass')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user
    const { error: deleteError } = await supabase
      .from('UserPass')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Delete user error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error');
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 