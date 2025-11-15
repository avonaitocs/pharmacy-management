import React, { useState, useRef } from 'react';
import { User } from '../types';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface AccountPageProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onChangePassword: (userId: string, oldPass: string, newPass: string) => boolean;
}

const AccountPage: React.FC<AccountPageProps> = ({ currentUser, onBack, onUpdateUser }) => {  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile');

  // Profile state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...currentUser, name, email, avatar });
    setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    setTimeout(() => setProfileMessage(null), 3000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    const success = onChangePassword(currentUser.id, currentPassword, newPassword);
    if (success) {
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMessage({ type: 'error', text: 'Incorrect current password.' });
    }
    setTimeout(() => setPasswordMessage(null), 3000);
  };

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    if (!onUpdateUser) return;
    
    try {
      // Update user in Firestore
      await onUpdateUser(currentUser.id, { theme });
      
      // Immediately update DOM for instant feedback
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const TabButton: React.FC<{ tab: 'profile' | 'security' | 'appearance'; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        activeTab === tab 
          ? 'bg-brand-primary text-white' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-4xl mx-auto animate-fade-in">
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <TabButton tab="profile" label="Profile" />
        <TabButton tab="security" label="Security" />
        <TabButton tab="appearance" label="Appearance" />
      </div>
      <div>
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="flex items-center space-x-6">
              <img src={avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Change Photo
                </button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
              </div>
            </div>
            <div className="flex justify-end items-center">
              {profileMessage && <p className={`text-sm mr-4 ${profileMessage.type === 'success' ? 'text-green-600' : 'text-danger'}`}>{profileMessage.text}</p>}
              <button type="submit" className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-dark">Save Changes</button>
            </div>
          </form>
        )}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
              <input type="password" id="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" autoComplete="current-password" required />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <input type="password" id="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" autoComplete="new-password" required />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" autoComplete="new-password" required />
            </div>
            <div className="flex justify-end items-center pt-2">
              {passwordMessage && <p className={`text-sm mr-4 ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-danger'}`}>{passwordMessage.text}</p>}
              <button type="submit" className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-dark">Update Password</button>
            </div>
          </form>
        )}
        {activeTab === 'appearance' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how Pharmacy Management looks to you.</p>
            <div className="mt-4 flex space-x-4">
              <button onClick={() => handleThemeChange('light')} className={`flex flex-col items-center justify-center w-32 h-24 rounded-lg border-2 ${currentUser.theme === 'light' ? 'border-brand-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                <SunIcon className="w-8 h-8 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">Light</span>
              </button>
              <button onClick={() => handleThemeChange('dark')} className={`flex flex-col items-center justify-center w-32 h-24 rounded-lg border-2 ${currentUser.theme === 'dark' ? 'border-brand-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                <MoonIcon className="w-8 h-8 text-indigo-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">Dark</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;