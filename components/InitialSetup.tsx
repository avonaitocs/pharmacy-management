// components/InitialSetup.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, getOrganizationId } from '../firebase';
import { UserRole, UserStatus } from '../types';

export const InitialSetup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUserId = userCredential.user.uid;

      await setDoc(doc(db, 'users', newUserId), {
        name,
        email,
        role: UserRole.Admin,
        status: UserStatus.Active,
        organizationId: getOrganizationId(),
        forcePasswordChange: false,
        theme: 'light',
        avatar: `https://i.pravatar.cc/150?u=${newUserId}`,
        lastLogin: new Date().toISOString(),
      });

      setSuccess(true);
      setUserId(newUserId);
      console.log('Admin user created:', newUserId);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">✓ Admin User Created!</h2>
          <p className="text-gray-700 mb-2">Your admin account has been created successfully.</p>
          <p className="text-sm text-gray-600 mb-2">Email: {email}</p>
          <p className="text-sm text-gray-600 mb-4">User ID: {userId}</p>
          <p className="text-sm text-red-600 font-bold">
            IMPORTANT: Copy this User ID and update the organization ownerId in Firestore!
          </p>
          <p className="text-sm text-gray-600 mt-4">Then refresh the page to log in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-brand-primary mb-6">Create Admin Account</h2>
        <p className="text-gray-600 mb-6">This is a one-time setup to create your admin user.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              minLength={6}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
};