'use client';

import { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw } from 'lucide-react';
import { generatePassword, type PasswordOptions } from '@/lib/utils/passwordGenerator';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
}

export function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const generateNewPassword = useCallback(() => {
    try {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
      onPasswordGenerated?.(newPassword);
    } catch (error) {
      alert('Please select at least one character type');
    }
  }, [options, onPasswordGenerated]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
  };

  const handleOptionChange = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 flex flex-col justify-center w-full">
      <div className="space-y-4 border p-4 rounded-md gap-4 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Password Length: {options.length}</span>
        </div>
        <Slider
          value={[options.length]}
          onValueChange={([value]) => handleOptionChange('length', value)}
          min={8}
          max={32}
          step={1}
          className="w-full"
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={options.includeUppercase}
              onCheckedChange={(checked) => 
                handleOptionChange('includeUppercase', checked as boolean)
              }
            />
            <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={options.includeLowercase}
              onCheckedChange={(checked) => 
                handleOptionChange('includeLowercase', checked as boolean)
              }
            />
            <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={options.includeNumbers}
              onCheckedChange={(checked) => 
                handleOptionChange('includeNumbers', checked as boolean)
              }
            />
            <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={options.includeSymbols}
              onCheckedChange={(checked) => 
                handleOptionChange('includeSymbols', checked as boolean)
              }
            />
            <Label htmlFor="symbols" className="text-sm">Symbols (!@#$%)</Label>
          </div>
        </div>

        {password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <code className="text-sm font-mono flex-1 truncate">{password}</code>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Button onClick={generateNewPassword} className="w-full bg-[#3d42bb] hover:bg-[#33369c]" type='button'>
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Password
        </Button>
      </div>
    </div>
  );
}