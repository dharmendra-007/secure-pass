'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, ExternalLink, AlertTriangle, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PasswordCardProps {
  password: {
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
  };
  onRevealPassword: (id: string) => Promise<string>;
  onUpdatePassword: (id: string) => void;
  onDeletePassword: (id: string) => Promise<void>;
}

export function PasswordCard({ password, onRevealPassword, onUpdatePassword, onDeletePassword }: PasswordCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [actualPassword, setActualPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReveal = async () => {
    if (!isRevealed) {
      try {
        setIsLoading(true);
        setError('');
        const revealedPassword = await onRevealPassword(password.id);
        setActualPassword(revealedPassword);
        setIsRevealed(true);
      } catch (error) {
        console.error('Failed to reveal password:', error);
        setError(error instanceof Error ? error.message : 'Failed to reveal password');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsRevealed(false);
      setActualPassword('');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeletePassword(password.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete password:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete password');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const copyUsername = () => {
    copyToClipboard(password.username);
  };

  const copyPassword = () => {
    if (isRevealed) {
      copyToClipboard(actualPassword);
    } else {
      copyToClipboard(password.password);
    }
  };

  const copySite = () => {
    copyToClipboard(password.site);
  };

  const hasEncryptionIssue = password.hasValidEncryption === false;

  return (
    <>
      <Card className={`w-full max-w-md ${hasEncryptionIssue ? 'border-yellow-200 bg-yellow-50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <span className={hasEncryptionIssue ? 'text-yellow-800' : ''}>
              {password.title}
              {hasEncryptionIssue && (
                <span className="text-xs text-yellow-600 block mt-1">
                  ⚠️ Needs update
                </span>
              )}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(password.site, '_blank')}
                title="Visit site"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUpdatePassword(password.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {hasEncryptionIssue && (
            <Alert variant="destructive" className="bg-yellow-100 border-yellow-300">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-sm">
                This password has encryption issues. Please update it to ensure security.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {/* Username Field */}
            <div className="flex items-center gap-4 group">
              <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">Username:</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 truncate">
                  {password.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyUsername}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex items-center gap-4 group">
              <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">Password:</span>
              <div className="flex items-center gap-2 flex-1 min-w-0 ">
                <div className='bg-gray-100 w-full flex justify-between items-center'>
                  <span className="text-sm font-mono px-3 py-2 rounded flex-1 truncate">
                    {isRevealed ? actualPassword : '••••••••'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReveal}
                    disabled={isLoading || hasEncryptionIssue}
                    title={hasEncryptionIssue ? "Cannot reveal - encryption issue" : ""}
                    className="transition-opacity"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    ) : isRevealed ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPassword}
                    disabled={hasEncryptionIssue}
                    title={hasEncryptionIssue ? "Cannot copy - encryption issue" : ""}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Site Field */}
            <div className="flex items-center gap-4 group">
              <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">Site:</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className="text-sm text-blue-600 truncate flex-1 hover:underline cursor-pointer bg-gray-100 px-3 py-2 rounded"
                  onClick={() => window.open(password.site, '_blank')}
                  title={password.site}
                >
                  {password.site.replace(/^https?:\/\//, '')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySite}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notes */}
          {password.notes && (
            <div className="pt-3 border-t">
              <span className="text-sm font-medium text-gray-700">Notes:</span>
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{password.notes}</p>
            </div>
          )}

          {/* Tags */}
          {password.tags.length > 0 && (
            <div className="pt-3 border-t">
              <span className="text-sm font-medium text-gray-700">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {password.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the password for <strong>&quot;{password.title}&quot;</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}