// app/api/passwords/[id]/reveal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Password } from '@/lib/models/Password';
import { authenticate } from '@/lib/middleware/auth';
import { decryptPassword } from '@/lib/utils/encryption';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Await params in Next.js 15
    const { id: passwordId } = await params;

    if (!passwordId) {
      return NextResponse.json({ error: 'Password ID is required' }, { status: 400 });
    }

    const password = await Password.findOne({ 
      _id: passwordId, 
      userId: user.userId 
    });

    if (!password) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    // Check if IV is missing or invalid
    if (!password.iv || password.iv.length !== 32) {
      return NextResponse.json({ 
        error: 'ENCRYPTION_ISSUE',
        message: 'This password has encryption issues and needs to be updated.',
        passwordId: password._id.toString()
      }, { status: 400 });
    }

    // Try to decrypt
    try {
      const decryptedPassword = decryptPassword(password.password, password.iv);
      return NextResponse.json({ password: decryptedPassword });
    } catch (decryptError) {
      console.error('Decryption failed:', decryptError);
      return NextResponse.json({ 
        error: 'DECRYPTION_FAILED',
        message: 'Unable to decrypt this password. Please update it.',
        passwordId: password._id.toString()
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Reveal password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}