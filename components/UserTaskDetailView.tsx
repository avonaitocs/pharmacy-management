
import React, { useState, useMemo } from 'react';
import { User, Task, TaskPriority } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface UserTaskDetailViewProps {
  user: User;
  completedTasks: Task[];
  onBack: () => void;
}

type SortKey = 'deadline' | 'priority';
type SortOrder = 'asc' | 'desc';

const priorityConfig = {
    [TaskPriority.Urgent]: { label: 'Urgent', classes: 'bg-red-500 text-white', order: 1 },
    [TaskPriority.Important]: { label: 'Important', classes: 'bg-yellow-400 text-yellow-900', order: 2 },
    [TaskPriority.General]: { label: 'General', classes: 'bg-blue-500 text-white', order: 3 },
};

const UserTaskDetailView: React.FC<UserTaskDetailViewProps> = ({ user, completedTasks, onBack }) => {
    const [sortKey, setSortKey] = useState<SortKey>('deadline');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    
    const sortedTasks = useMemo(() => {
        return [...completedTasks].sort((a, b) => {
            if (sortKey === 'deadline') {
                const dateA = new Date(a.deadline).getTime();
                const dateB = new Date(b.deadline).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            if (sortKey === 'priority') {
                const priorityA = priorityConfig[a.priority].order;
                const priorityB = priorityConfig[b.priority].order;
                return sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
            }
            return 0;
        });
    }, [completedTasks, sortKey, sortOrder]);
    
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [key, order] = e.target.value.split('-') as [SortKey, SortOrder];
        setSortKey(key);
        setSortOrder(order);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center text-sm font-semibold text-brand-primary hover:text-brand-dark mb-4 sm:mb-0"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Reports
                </button>
                <div className="flex items-center">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-gray-500">Completed Task History</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <div className="relative">
                    <select
                        onChange={handleSortChange}
                        value={`${sortKey}-${sortOrder}`}
                        className="appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-brand-primary"
                    >
                        <option value="deadline-desc">Sort by Date (Newest)</option>
                        <option value="deadline-asc">Sort by Date (Oldest)</option>
                        <option value="priority-asc">Sort by Priority (Urgent First)</option>
                        <option value="priority-desc">Sort by Priority (General First)</option>
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDownIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => (
                        <div key={task.id} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-800 flex-1 pr-2">{task.title}</h3>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityConfig[task.priority].classes}`}>
                                    {priorityConfig[task.priority].label}
                                </span>
                            </div>
                            {task.checklist && task.checklist.length > 0 && (
                                <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                                    {task.checklist.map(item => (
                                        <li key={item.id} className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="text-xs text-gray-500 mt-3 text-right">
                                Completed on: {new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <h3 className="mt-4 text-lg font-medium text-gray-700">No Completed Tasks</h3>
                        <p className="mt-1 text-sm text-gray-500">This user has not completed any tasks yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTaskDetailView;
