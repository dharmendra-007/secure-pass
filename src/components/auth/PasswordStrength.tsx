import { cn } from '@/lib/utils';
import { CircleCheck } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthProps {
  requirements: PasswordRequirement[];
}

export function PasswordStrength({ requirements }: PasswordStrengthProps) {
  return (
    <div className="flex items-center justify-start gap-4 flex-wrap">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center text-xs',
              req.met ? 'bg-green-500' : 'bg-gray-300'
            )}
          >
            {req.met ? <CircleCheck className='h-4 w-4 text-white'/> : "!"}
          </div>
          <span
            className={cn(
              'text-sm',
              req.met ? 'text-green-600' : 'text-gray-500'
            )}
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}