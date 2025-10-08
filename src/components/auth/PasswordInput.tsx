'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PasswordStrength } from './PasswordStrength';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
  value?: string;
}

export function PasswordInput({ 
  showStrength = false, 
  value = '',
  className,
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordRequirements = (password: string) => [
    {
      label: 'min. 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'capital letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'small letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'special character',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const requirements = getPasswordRequirements(value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          value={value}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showStrength && (
        <PasswordStrength requirements={requirements} />
      )}
    </div>
  );
}