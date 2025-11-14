import React, { useState } from 'react';
import { User } from '../types';

interface ForcePasswordChangePageProps {
  currentUser: User;
  onPasswordChange: (userId: string, newPassword: string) => void;
}

const ForcePasswordChangePage: React.FC<ForcePasswordChangePageProps> = ({ currentUser, onPasswordChange }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (newPassword === 'password') {
      setError('New password cannot be the default password.');
      return;
    }

    onPasswordChange(currentUser.id, newPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Create a New Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            For security, please create a new password for your account, {currentUser.name}.
          </p>
        </div>

        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="sr-only">New Password</label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 text-lg text-gray-900 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
              placeholder="New Password"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 text-lg text-gray-900 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
              placeholder="Confirm New Password"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          >
            Set New Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordChangePage;