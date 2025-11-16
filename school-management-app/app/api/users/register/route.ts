import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';
import { verifyToken } from '@/lib/auth';
import { createUser, getUserByUserId } from '@/lib/db';
import { hashPassword, validateKVSEmail } from '@/lib/auth';
import type { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies['auth-token'];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const authUser = verifyToken(token);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { userId, password, name, role, house } = await request.json();

    // Validate input
    if (!userId || !password || !name || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate KVS email format
    if (!validateKVSEmail(userId)) {
      return NextResponse.json(
        { error: 'User ID must end with @kvs' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = getUserByUserId(userId);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      password: hashedPassword,
      name,
      role,
      house: house || 'none',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    createUser(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        userId: newUser.userId,
        name: newUser.name,
        role: newUser.role,
        house: newUser.house,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
