import { NextRequest, NextResponse } from 'next/server';
import { createCommunityPost, getCommunityPosts, saveCommunityPosts } from '@/lib/db';
import { parse } from 'cookie';
import { verifyToken } from '@/lib/auth';
import type { CommunityPost, Comment } from '@/types';

// GET - Fetch community posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const house = searchParams.get('house');
    
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies['auth-token'];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    let posts = getCommunityPosts();
    
    // Filter by house
    if (house && house !== 'all') {
      posts = posts.filter(p => p.house === house);
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get community posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create community post
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
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { title, content, house } = await request.json();

    if (!title || !content || !house) {
      return NextResponse.json(
        { error: 'Title, content, and house are required' },
        { status: 400 }
      );
    }

    // Verify user belongs to the house (or is admin)
    if (user.role !== 'admin' && user.house !== house) {
      return NextResponse.json(
        { error: 'You can only post to your own house community' },
        { status: 403 }
      );
    }

    const post: CommunityPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      authorId: user.id,
      authorName: user.name,
      house,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    createCommunityPost(post);

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Create community post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Add comment to post
export async function PATCH(request: NextRequest) {
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
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { postId, content } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    const posts = getCommunityPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      postId,
      authorId: user.id,
      authorName: user.name,
      content,
      createdAt: new Date().toISOString(),
    };

    posts[postIndex].comments.push(comment);
    saveCommunityPosts(posts);

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
