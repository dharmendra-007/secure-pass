import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { generateToken } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { fullName, email, password } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = generateToken({ 
      userId: user._id.toString(), 
      email: user.email 
    });

    return NextResponse.json({ 
      token, 
      user: { 
        id: user._id.toString(), 
        email: user.email, 
        fullName: user.fullName 
      } 
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}