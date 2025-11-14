import React, { useState, useRef, useEffect } from 'react';
// Fix: Import the shared View type.
import { User, View } from '../types';
import ArrowRightOnRectangleIcon from './icons/ArrowRightOnRectangleIcon';
import Bars3Icon from './icons/Bars3Icon';
import UserCircleIcon from './icons/UserCircleIcon';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  // Fix: Use the shared View type for the onNavigate prop to ensure compatibility.
  onNavigate: (view: View) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onNavigate, onToggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <button onClick={onToggleSidebar} className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
               <Bars3Icon className="w-6 h-6" />
             </button>
             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-brand-primary hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold text-brand-dark dark:text-white hidden sm:block">Pharmacy Management</h1>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="flex items-center space-x-4 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20 animate-fade-in">
                {/* Fix: Add a link to the 'account' page in the user dropdown. */}
                <button
                  onClick={() => { onNavigate('account'); setIsDropdownOpen(false); }}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <UserCircleIcon className="w-5 h-5 mr-3" />
                  My Account
                </button>
                <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                <button
                  onClick={onLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;