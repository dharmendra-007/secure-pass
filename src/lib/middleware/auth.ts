import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/utils/jwt';

export async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
}