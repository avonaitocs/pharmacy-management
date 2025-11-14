import React, { useState } from 'react';
import { User } from '../types';
import EnvelopeIcon from './icons/EnvelopeIcon';

interface EmailCapturePageProps {
  currentUser: User;
  onEmailSubmit: (userId: string, email: string) => void;
}

const EmailCapturePage: React.FC<EmailCapturePageProps> = ({ currentUser, onEmailSubmit }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    // Basic email format validation
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email address is required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    onEmailSubmit(currentUser.id, email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg animate-fade-in">
        <div className="text-center">
          <EnvelopeIcon className="w-16 h-16 mx-auto text-brand-primary" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            One Last Step, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Please provide your email address. We'll use it for task reminders and important communications.
          </p>
        </div>

        {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-lg text-gray-900 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
              placeholder="your.email@example.com"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          >
            Save and Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailCapturePage;