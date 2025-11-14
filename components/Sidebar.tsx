

import React from 'react';
import { User, UserRole, View, TaskPriority } from '../types';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import InboxIcon from './icons/InboxIcon';
import UsersIcon from './icons/UsersIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';
import BellIcon from './icons/BellIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import PlusIcon from './icons/PlusIcon';

interface ProgressData {
    total: number;
    completed: number;
}


interface SidebarProps {
    currentUser: User;
    activeView: View;
    onViewChange: (view: View) => void;
    pendingTasksCount: number;
    unreadMessagesCount: number;
    dailyProgress: Record<TaskPriority, ProgressData>;
    onClose: () => void;
    onAddTaskClick: () => void;
    streakCount: number;
    isOpen: boolean;  // ADD THIS LINE
  }

const NavLink: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    count?: number;
}> = ({ icon, label, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
            isActive
                ? 'bg-brand-primary text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-brand-light dark:hover:bg-gray-600 hover:text-brand-dark'
        }`}
    >
        {icon}
        <span className="ml-3 flex-1 text-left">{label}</span>
        {count !== undefined && count > 0 && (
            <span className={`ml-auto text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${isActive ? 'bg-white text-brand-primary' : 'bg-red-500 text-white'}`}>{count}</span>
        )}
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeView, onViewChange, pendingTasksCount, unreadMessagesCount, isOpen, onClose, onAddTaskClick }) => {
  const handleViewChange = (view: View) => {
    onViewChange(view);
    onClose();
  }

  const mainNavItems = [
    { view: 'tasks', label: 'Task Dashboard', icon: <ClipboardDocumentListIcon className="w-6 h-6" />, count: undefined },
    { view: 'messages', label: 'Messages', icon: <InboxIcon className="w-6 h-6" />, count: unreadMessagesCount },
    { view: 'knowledgeBase', label: 'Knowledge Base', icon: <BookOpenIcon className="w-6 h-6" />, count: undefined },
  ];

  const adminNavItems = [
    { view: 'users', label: 'Manage Users', icon: <UsersIcon className="w-6 h-6" />, count: undefined },
    { view: 'pending', label: 'Pending Tasks', icon: <BellIcon className="w-6 h-6" />, count: pendingTasksCount },
    { view: 'archives', label: 'Archived Tasks', icon: <ArchiveBoxIcon className="w-6 h-6" />, count: undefined },
    { view: 'reports', label: 'Reports', icon: <ChartBarIcon className="w-6 h-6" />, count: undefined },
  ];
  
  const accountNavItem = { view: 'account', label: 'My Account', icon: <UserCircleIcon className="w-6 h-6" />, count: undefined };
  
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex-grow">
            <div className="mb-4">
                <button
                    onClick={() => { onAddTaskClick(); onClose(); }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Task
                </button>
            </div>
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</h2>
            <nav className="space-y-1">
                {mainNavItems.map(item => (
                    <NavLink
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeView === item.view}
                        onClick={() => handleViewChange(item.view as View)}
                        count={item.count}
                    />
                ))}
            </nav>
            {currentUser.role === UserRole.Admin && (
                <>
                    <h2 className="mt-6 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Management</h2>
                     <nav className="space-y-1">
                        {adminNavItems.map(item => (
                            <NavLink
                                key={item.view}
                                icon={item.icon}
                                label={item.label}
                                isActive={activeView === item.view}
                                onClick={() => handleViewChange(item.view as View)}
                                count={item.count}
                            />
                        ))}
                    </nav>
                </>
            )}
        </div>
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-2">
            <nav>
                <NavLink
                    key={accountNavItem.view}
                    icon={accountNavItem.icon}
                    label={accountNavItem.label}
                    isActive={activeView === accountNavItem.view}
                    onClick={() => handleViewChange(accountNavItem.view as View)}
                    count={accountNavItem.count}
                />
            </nav>
        </div>
    </aside>
  );
};

export default Sidebar;