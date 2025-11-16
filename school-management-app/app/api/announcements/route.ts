import { NextRequest, NextResponse } from 'next/server';
import { createAnnouncement, getAnnouncements } from '@/lib/db';
import { parse } from 'cookie';
import { verifyToken } from '@/lib/auth';
import type { Announcement } from '@/types';

// GET - Fetch announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const house = searchParams.get('house');
    
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies['auth-token'];
    
    let announcements = getAnnouncements();
    
    // Sort by date (newest first)
    announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // If authenticated, filter by house
    if (token) {
      const user = verifyToken(token);
      if (user && house) {
        announcements = announcements.filter(
          a => a.house === 'all' || a.house === house
        );
      }
    } else {
      // Public users only see school-wide important announcements
      announcements = announcements.filter(a => a.house === 'all' && a.isImportant);
    }
    
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create announcement
export async function POST(request: NextRequest) {
  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies['auth-token'];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins and teachers can create announcements.' },
        { status: 403 }
      );
    }

    const { title, content, house, isImportant } = await request.json();

    if (!title || !content || !house) {
      return NextResponse.json(
        { error: 'Title, content, and house are required' },
        { status: 400 }
      );
    }

    // Teachers can only post to their house or school-wide if admin approves
    if (user.role === 'teacher' && house !== user.house && house !== 'all') {
      return NextResponse.json(
        { error: 'Teachers can only post to their own house' },
        { status: 403 }
      );
    }

    const announcement: Announcement = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      authorId: user.id,
      authorName: user.name,
      house,
      isImportant: isImportant || false,
      createdAt: new Date().toISOString(),
    };

    createAnnouncement(announcement);

    return NextResponse.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
