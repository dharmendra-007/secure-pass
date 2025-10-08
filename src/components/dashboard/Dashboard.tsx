'use client';

import { useState, useEffect, useRef } from 'react';
import { passwordService, type Password } from '@/services/passwordService';
import { AddPasswordForm } from './AddPasswordForm';
import { SearchBar } from './SearchBar';
import { PasswordCard } from './PasswordCard';
import { PasswordGenerator } from './PasswordGenerator';
import { EditPasswordForm } from './EditPasswordForm';
import { toast } from 'sonner';
import { LoaderCircle, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const auth = useAuth();
  const router = useRouter();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPasswords, setLoadingPasswords] = useState(false); 
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
        router.replace('/login'); 
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);
  
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    const fetchPasswords = async () => {
      console.log(`Final API call initiated with: ${searchQuery}`);
      try {
        setLoadingPasswords(true);
        const data = await passwordService.getAllPasswords(searchQuery);
        
        // Only update if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setPasswords(data);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        
        console.error('Failed to fetch passwords:', error);
        
        if (error.message.includes('Authentication required') || error.message.includes('Unauthorized')) {
          toast.error('Session expired. Please log in again.');
          auth.logout(); 
        } else {
          toast.error('Failed to load passwords');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingPasswords(false);
        }
      }
    };
    
    fetchPasswords();
    
    // Cleanup function to abort on unmount or when dependencies change
    return () => {
      abortController.abort();
    };
  }, [searchQuery, refreshTrigger, auth.isAuthenticated]);

  const handleLogout = () => {
    auth.logout(); 
    toast.info('Logged out successfully');
  };
  
  const handleSearchExecute = (query: string) => {
    // This updates the Dashboard's state only when the SearchBar's debounce completes
    setSearchQuery(query); 
  };
  
  const handleRevealPassword = async (passwordId: string): Promise<string> => {
    try {
      return await passwordService.revealPassword(passwordId);
    } catch (error) {
      console.error('Error revealing password:', error);
      throw error;
    }
  };

  const handleDeletePassword = async (passwordId: string) => {
    try {
      await passwordService.deletePassword(passwordId);
      setRefreshTrigger(prev => prev + 1);
      toast.success('Password deleted successfully');
    } catch (error) {
      console.error('Failed to delete password:', error);
      toast.error('Failed to delete password');
      throw error;
    }
  };

  const handleUpdatePassword = (passwordId: string) => {
    const password = passwords.find(p => p.id === passwordId);
    if (password) {
      setEditingPassword(password);
    }
  };

  const handlePasswordUpdated = () => {
    setEditingPassword(null);
    setRefreshTrigger(prev => prev + 1);
    toast.success('Password updated successfully');
  };

  const handlePasswordAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Password added successfully');
  };

  
  if (auth.isLoading || !auth.isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">
            {auth.isLoading ? 'Loading session...' : 'Redirecting to login...'}
          </div>
        </div>
      </div>
    );
  }

  const currentUser = auth.user; 

  return (
    <div className="container mx-auto p-6 space-y-6 h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#111479]">Your Passwords</h1>
        <div className="flex items-center space-x-4">
          <AddPasswordForm onPasswordAdded={handlePasswordAdded} />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 bg-black">
                <Avatar className="h-11 w-11 bg-[#111479]">
                  <AvatarImage src="/avatar.png" alt="Profile" />
                  <AvatarFallback className="text-white font-semibold">
                    {/* Display the first letter of the full name */}
                    {currentUser?.fullName ? currentUser.fullName[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal mt-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className='flex flex-col justify-center items-center gap-2'>
        <SearchBar 
            currentSearchTerm={searchQuery} 
            onSearch={handleSearchExecute}
            debounceDelay={300}
        />
        <span className='text-muted-foreground text-sm'>(use site:, user:, tags: for specific searches)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-2/3 rounded-md">
        <div className="lg:col-span-2 space-y-6 border p-2 rounded-md relative min-h-[300px]"> 
          
          {loadingPasswords && ( 
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-10 rounded-md">
              <div className="text-[#3d42bb]"><LoaderCircle className='h-11 w-11 animate-spin'/> Loading</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passwords.map((password) => (
              <PasswordCard
                key={password.id}
                password={password}
                onRevealPassword={handleRevealPassword}
                onUpdatePassword={handleUpdatePassword}
                onDeletePassword={handleDeletePassword}
              />
            ))}
          </div>
          {passwords.length === 0 && !loadingPasswords && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No passwords found</p>
              <p className="text-gray-400 mt-2">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first password entry!'}
              </p>
            </div>
          )}
        </div>
        <div>
          <PasswordGenerator />
        </div>
      </div>
      {editingPassword && (
        <EditPasswordForm
          password={editingPassword}
          onPasswordUpdated={handlePasswordUpdated}
          onCancel={() => setEditingPassword(null)}
        />
      )}
    </div>
  );
}