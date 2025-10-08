import { PasswordCreateData } from '@/schemas/passwordSchema';


export interface PasswordApiResponse {
  id: string;
  title: string;
  username: string;
  password: string; 
  site: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  encryptedData?: {
    encrypted: string;
    iv: string;
  };
}


export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  site: string;
  notes: string;
  tags: string[];
  encryptedData?: {
    encrypted: string;
    iv: string;
  };
  hasValidEncryption?: boolean;
}

export interface RevealPasswordResponse {
  password: string;
}

class PasswordService {
  private baseUrl = '/api/passwords';

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllPasswords(search?: string): Promise<Password[]> {
    const url = search ? `${this.baseUrl}?search=${encodeURIComponent(search)}` : this.baseUrl;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch passwords');
    }

    
    const passwords: PasswordApiResponse[] = await response.json();
    
    
    return passwords.map((pass: PasswordApiResponse) => ({
      ...pass,
      hasValidEncryption: !!(pass.encryptedData?.iv && pass.encryptedData.iv.length > 0)
    }));
  }

  async addPassword(data: PasswordCreateData): Promise<{ message: string; id: string }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result: { error?: string; message: string; id: string } = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to add password');
    }

    return result;
  }

  async updatePassword(passwordId: string, data: PasswordCreateData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${passwordId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result: { error?: string } = await response.json();
      throw new Error(result.error || 'Failed to update password');
    }
  }

  async revealPassword(passwordId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${passwordId}/reveal`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const result: { error?: string; password?: string; passwordId?: string } = await response.json();

    if (!response.ok) {
      
      if (result.error === 'ENCRYPTION_ISSUE' || result.error === 'DECRYPTION_FAILED') {
        throw new Error('ENCRYPTION_ISSUE:' + result.passwordId);
      }
      throw new Error(result.error || 'Failed to reveal password');
    }

    return result.password!;
  }

  async deletePassword(passwordId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${passwordId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const result: { error?: string } = await response.json();
      throw new Error(result.error || 'Failed to delete password');
    }
  }
}

export const passwordService = new PasswordService();