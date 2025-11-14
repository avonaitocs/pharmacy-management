
import React from 'react';
import { User, UserRole, TaskPriority } from '../types';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import InboxIcon from './icons/InboxIcon';
import UsersIcon from './icons/UsersIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';
import BellIcon from './icons/BellIcon';
import FlameIcon from './icons/FlameIcon';

type View = 'tasks' | 'users' | 'reports' | 'archives' | 'messages' | 'pending' | 'knowledgeBase';

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
  dailyProgress: {
      [TaskPriority.Urgent]: ProgressData;
      [TaskPriority.Important]: ProgressData;
      [TaskPriority.General]: ProgressData;
  };
  streakCount: number;
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
                : 'text-gray-600 hover:bg-brand-light hover:text-brand-dark'
        }`}
    >
        {icon}
        <span className="ml-3 flex-1 text-left">{label}</span>
        {count !== undefined && count > 0 && (
            <span className="ml-auto text-xs font-semibold bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full">{count}</span>
        )}
    </button>
);

const ProgressRing: React.FC<{ progress: number, color: string, bgColor: string, size?: number, strokeWidth?: number }> = ({ progress, color, bgColor, size=40, strokeWidth=4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
                stroke={bgColor}
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size/2}
                cy={size/2}
            />
            <circle
                stroke={color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                r={radius}
                cx={size/2}
                cy={size/2}
                className="transition-all duration-500"
            />
        </svg>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeView, onViewChange, pendingTasksCount, unreadMessagesCount, dailyProgress, streakCount }) => {
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
  
  const ringData = [
      { priority: TaskPriority.Urgent, color: "#F87171", bgColor: "#FEE2E2" },
      { priority: TaskPriority.Important, color: "#FBBF24", bgColor: "#FEF9C3" },
      { priority: TaskPriority.General, color: "#3B82F6", bgColor: "#DBEAFE" },
  ]

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex-grow">
            {/* Daily Progress Section */}
            <div className="mb-6">
                <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Daily Progress</h2>
                <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-around items-center">
                       {ringData.map(({ priority, color, bgColor }) => {
                           const { total, completed } = dailyProgress[priority];
                           const progress = total > 0 ? (completed / total) * 100 : 0;
                           return (
                               <div key={priority} className="relative" title={`${priority.toLowerCase()} tasks: ${completed}/${total}`}>
                                   <ProgressRing progress={progress} color={color} bgColor={bgColor} />
                                   <div className="absolute inset-0 flex items-center justify-center">
                                       <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: color }}></div>
                                   </div>
                               </div>
                           )
                       })}
                       <div className="text-center" title={`${streakCount} day streak`}>
                           <FlameIcon className={`w-7 h-7 ${streakCount > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
                           <p className={`text-xs font-bold ${streakCount > 0 ? 'text-gray-700' : 'text-gray-400'}`}>{streakCount}</p>
                       </div>
                    </div>
                </div>
            </div>

            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</h2>
            <nav className="space-y-1">
                {mainNavItems.map(item => (
                    <NavLink
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeView === item.view}
                        onClick={() => onViewChange(item.view as View)}
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
                                onClick={() => onViewChange(item.view as View)}
                                count={item.count}
                            />
                        ))}
                    </nav>
                </>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
