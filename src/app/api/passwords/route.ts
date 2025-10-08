
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Password } from '@/lib/models/Password';
import { authenticate } from '@/lib/middleware/auth';
import { encryptPassword } from '@/lib/utils/encryption';
import { FilterQuery } from 'mongoose'; 


interface MongoQuery extends FilterQuery<typeof Password> {
  userId: string;
  $or?: Array<Record<string, RegExp>>; 
  site?: RegExp;
  username?: RegExp;
  tags?: RegExp;
  title?: RegExp;
}

function buildSearchQuery(userId: string, search: string): MongoQuery {
  
  const query: MongoQuery = { userId }; 

  if (!search) return query;

  const searchRegex = new RegExp(search, 'i');
  
  if (search.startsWith('site:')) {
    const siteSearch = search.replace('site:', '').trim();
    query.site = new RegExp(siteSearch, 'i');
  } else if (search.startsWith('user:')) {
    const userSearch = search.replace('user:', '').trim();
    query.username = new RegExp(userSearch, 'i');
  } else if (search.startsWith('tags:')) {
    const tagsSearch = search.replace('tags:', '').trim();
    query.tags = new RegExp(tagsSearch, 'i');
  } else {
    
    query.$or = [
      { title: searchRegex },
      { site: searchRegex },
      { username: searchRegex },
      { tags: searchRegex }
    ];
  }

  return query;
}

export async function GET(request: NextRequest) {
  try {
    
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const query: MongoQuery = buildSearchQuery(user.userId, search); 

    const passwords = await Password.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    const safePasswords = passwords.map(pass => ({
      id: pass._id.toString(),
      title: pass.title,
      username: pass.username,
      password: '••••••••',
      site: pass.site,
      notes: pass.notes,
      tags: pass.tags,
      createdAt: pass.createdAt,
      updatedAt: pass.updatedAt,
      encryptedData: {
        encrypted: pass.password,
        iv: pass.iv,
      }
    }));

    return NextResponse.json(safePasswords);

  } catch (error) {
    console.error('Get passwords error:', error);

    if (error instanceof Error) {
      if (error.name === 'MongoNetworkError') {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch passwords'},
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { title, username, password, site, notes, tags } = await request.json();

    if (!title || !username || !password || !site) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const encrypted = encryptPassword(password);

    const newPassword = new Password({
      title: title.trim(),
      username: username.trim(),
      password: encrypted.encrypted,
      iv: encrypted.iv,
      site: site.trim(),
      notes: (notes || '').trim(),
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      userId: user.userId
    });

    
    await newPassword.save();

    return NextResponse.json(
      { 
        message: 'Password created successfully', 
        id: newPassword._id 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Create password error:', error);

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A password with this title already exists' },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create password' },
      { status: 500 }
    );
  }
}