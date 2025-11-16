import { NextRequest, NextResponse } from 'next/server';
import { getUserByUserId } from '@/lib/db';
import { comparePassword, generateToken, validateKVSEmail } from '@/lib/auth';
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json();

    // Validate input
    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
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

    // Find user
    const user = getUserByUserId(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
      house: user.house,
    });

    // Set cookie
    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        role: user.role,
        house: user.house,
      },
    });

    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
