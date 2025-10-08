import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Password } from '@/lib/models/Password';
import { authenticate } from '@/lib/middleware/auth';
import { encryptPassword } from '@/lib/utils/encryption';

interface PasswordUpdateData {
  title?: string;
  username?: string;
  site?: string;
  notes?: string;
  tags?: string[];
  password?: string;
  iv?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    
    const { id: passwordId } = await params;

    if (!passwordId) {
      return NextResponse.json({ error: 'Password ID is required' }, { status: 400 });
    }

    const { title, username, password, site, notes, tags } = await request.json();

    const existingPassword = await Password.findOne({
      _id: passwordId,
      userId: user.userId
    });

    if (!existingPassword) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    const updateData: PasswordUpdateData = {
      title: title.trim(),
      username: username.trim(),
      site: site.trim(),
      notes: (notes || '').trim(),
      tags: Array.isArray(tags)
        ? tags.map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : (tags || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
    };

    if (password && password.trim()) {
      const encrypted = encryptPassword(password.trim());
      updateData.password = encrypted.encrypted;
      updateData.iv = encrypted.iv;
    }

    await Password.findByIdAndUpdate(passwordId, updateData);

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    
    const { id: passwordId } = await params;

    if (!passwordId) {
      return NextResponse.json({ error: 'Password ID is required' }, { status: 400 });
    }

    const result = await Password.deleteOne({
      _id: passwordId,
      userId: user.userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Delete password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}