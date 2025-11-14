// components/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;