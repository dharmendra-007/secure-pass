import { z } from 'zod';

export const addPasswordSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  site: z.string().url('Please enter a valid URL').min(1, 'Site URL is required'),
  notes: z.string().optional(),
  tags: z.string().optional(), // Keep as string for form input
});

export type AddPasswordFormData = z.infer<typeof addPasswordSchema>;

// Separate type for API payload
export interface PasswordCreateData {
  title: string;
  username: string;
  password: string;
  site: string;
  notes?: string;
  tags: string[];
}