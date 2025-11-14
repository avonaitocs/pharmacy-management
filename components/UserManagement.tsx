import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, UserRole, UserStatus } from '../types';
import AddUserModal from './AddUserModal';
import PlusIcon from './icons/PlusIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import EllipsisVerticalIcon from './icons/EllipsisVerticalIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import XCircleIcon from './icons/XCircleIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface UserManagementProps {
    users: User[];
    currentUser: User;
    onAddUser: (newUser: Omit<User, 'id'>) => void;
    onUpdateUserStatus: (userId: string, status: UserStatus) => void;
    onSelectUser: (user: User) => void;
    onSendMessageClick: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onAddUser, onUpdateUserStatus, onSelectUser, onSendMessageClick }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

    const activeUsers = useMemo(() => users.filter(u => u.status === UserStatus.Active), [users]);
    const inactiveUsers = useMemo(() => users.filter(u => u.status === UserStatus.Inactive), [users]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const toggleMenu = (userId: string) => {
        setOpenMenuId(prev => (prev === userId ? null : userId));
    };

    const TabButton: React.FC<{ tab: 'active' | 'inactive', label: string, count: number }> = ({ tab, label, count }) => (
        <button
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
            activeTab === tab 
              ? 'bg-brand-primary text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {label}
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-white text-brand-primary' : 'bg-gray-200 text-gray-700'}`}>{count}</span>
        </button>
      );

    const usersToList = activeTab === 'active' ? activeUsers : inactiveUsers;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Manage Team Members
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add User
                </button>
            </div>
            <div className="flex space-x-2 mb-4">
                <TabButton tab="active" label="Active" count={activeUsers.length} />
                <TabButton tab="inactive" label="Inactive" count={inactiveUsers.length} />
            </div>
            <div className="space-y-4">
                {usersToList.map(user => (
                    <div 
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                        <div className="flex items-center">
                            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                            <div className="ml-4">
                                <p className="font-semibold text-lg text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                           {activeTab === 'active' ? (
                                user.id !== currentUser.id && (
                                    <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
                                        <button onClick={() => toggleMenu(user.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title="Actions">
                                            <EllipsisVerticalIcon className="w-5 h-5"/>
                                        </button>
                                        {openMenuId === user.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20 animate-fade-in">
                                                <button onClick={() => { onSelectUser(user); setOpenMenuId(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                    <ClipboardDocumentListIcon className="w-5 h-5 mr-3"/> View Tasks
                                                </button>
                                                <button onClick={() => { onSendMessageClick(user); setOpenMenuId(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                    <EnvelopeIcon className="w-5 h-5 mr-3"/> Send Message
                                                </button>
                                                <div className="border-t my-1"></div>
                                                <button 
                                                    onClick={() => onUpdateUserStatus(user.id, UserStatus.Inactive)} 
                                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                    <XCircleIcon className="w-5 h-5 mr-3"/> Deactivate
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                           ) : (
                                <button
                                    onClick={() => onUpdateUserStatus(user.id, UserStatus.Active)}
                                    className="flex items-center px-4 py-2 text-sm font-semibold text-green-800 bg-green-100 rounded-md hover:bg-green-200"
                                >
                                    <CheckCircleIcon className="w-5 h-5 mr-2"/> Reactivate
                                </button>
                           )}
                        </div>
                    </div>
                ))}
                {usersToList.length === 0 && (
                     <div className="text-center py-12">
                        <p className="mt-1 text-sm text-gray-500">
                             No users in this category.
                        </p>
                    </div>
                )}
            </div>
            {isModalOpen && (
                <AddUserModal
                    onClose={() => setIsModalOpen(false)}
                    onAddUser={onAddUser}
                />
            )}
        </div>
    );
}

export default UserManagement;