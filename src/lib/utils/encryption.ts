import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key-here';
// Ensure the key is exactly 32 bytes
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);

export function encryptPassword(password: string): { encrypted: string; iv: string } {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
}

export function decryptPassword(encrypted: string, iv: string): string {
  try {
    // Validate inputs
    if (!encrypted || !iv) {
      throw new Error('Encrypted data and IV are required');
    }

    if (typeof iv !== 'string') {
      throw new Error('IV must be a string');
    }

    // Ensure IV is a valid hex string
    const ivBuffer = Buffer.from(iv, 'hex');
    if (ivBuffer.length !== 16) {
      throw new Error('Invalid IV length');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, ivBuffer);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt password');
  }
}