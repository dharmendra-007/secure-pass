'use client';

import { useState, useEffect, useCallback } from 'react';
import { passwordService, type Password } from '@/services/passwordService';
import { AddPasswordForm } from './AddPasswordForm';
import { SearchBar } from './SearchBar';
import { PasswordCard } from './PasswordCard';
import { PasswordGenerator } from './PasswordGenerator';
import { EditPasswordForm } from './EditPasswordForm';
import { toast } from 'sonner';

export function Dashboard() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);

  const fetchPasswords = useCallback(async (query: string = '') => {
    console.log(`Final API call initiated with: ${query}`);
    try {
      setLoading(true);
      const data = await passwordService.getAllPasswords(query);
      setPasswords(data);
    } catch (error) {
      console.error('Failed to fetch passwords:', error);
      toast.error('Failed to load passwords');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPasswords(searchQuery); 
  }, [searchQuery, fetchPasswords, refreshTrigger]);

  const handleSearchExecute = (query: string) => {
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

  return (
    <div className="container mx-auto p-6 space-y-6 h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#111479]">Your Passwords</h1>
        <AddPasswordForm onPasswordAdded={handlePasswordAdded} />
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
          
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-10 rounded-md">
              <div className="text-lg text-[#111479]">Loading passwords...</div>
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
          {passwords.length === 0 && !loading && (
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