
import React, { useState, useMemo } from 'react';
import { User, Task, TaskPriority } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ClockIcon from './icons/ClockIcon';

interface OverdueTasksViewProps {
  overdueTasks: Task[];
  users: User[];
  onBack: () => void;
}

type SortKey = 'deadline' | 'priority';
type SortOrder = 'asc' | 'desc';

const priorityConfig = {
    [TaskPriority.Urgent]: { label: 'Urgent', classes: 'bg-red-500 text-white', order: 1 },
    [TaskPriority.Important]: { label: 'Important', classes: 'bg-yellow-400 text-yellow-900', order: 2 },
    [TaskPriority.General]: { label: 'General', classes: 'bg-blue-500 text-white', order: 3 },
};

const calculateDaysOverdue = (deadline: string): number => {
    const overdueMilliseconds = new Date().getTime() - new Date(deadline).getTime();
    return Math.max(0, Math.floor(overdueMilliseconds / (1000 * 60 * 60 * 24)));
}

const OverdueTasksView: React.FC<OverdueTasksViewProps> = ({ overdueTasks, users, onBack }) => {
    const [sortKey, setSortKey] = useState<SortKey>('deadline');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const sortedTasks = useMemo(() => {
        return [...overdueTasks].sort((a, b) => {
            if (sortKey === 'deadline') {
                const dateA = new Date(a.deadline).getTime();
                const dateB = new Date(b.deadline).getTime();
                // 'asc' for deadline means most overdue first
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            if (sortKey === 'priority') {
                const priorityA = priorityConfig[a.priority].order;
                const priorityB = priorityConfig[b.priority].order;
                return sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
            }
            return 0;
        });
    }, [overdueTasks, sortKey, sortOrder]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [key, order] = e.target.value.split('-') as [SortKey, SortOrder];
        setSortKey(key);
        setSortOrder(order);
    };

    const getAssigneesForTask = (task: Task) => users.filter(u => task.assigneeIds.includes(u.id));


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
                <div className="sm:text-right">
                    <h2 className="text-2xl font-bold text-gray-800">Overdue Tasks</h2>
                    <p className="text-gray-500">{overdueTasks.length} tasks require attention</p>
                </div>
            </div>

             <div className="flex justify-end mb-4">
                <div className="relative">
                    <select
                        onChange={handleSortChange}
                        value={`${sortKey}-${sortOrder}`}
                        className="appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-brand-primary"
                    >
                        <option value="deadline-asc">Sort by Most Overdue</option>
                        <option value="deadline-desc">Sort by Least Overdue</option>
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
                    sortedTasks.map(task => {
                        const assignees = getAssigneesForTask(task);
                        const daysOverdue = calculateDaysOverdue(task.deadline);
                        return (
                            <div key={task.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-gray-800 flex-1 pr-2">{task.title}</h3>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityConfig[task.priority].classes}`}>
                                        {priorityConfig[task.priority].label}
                                    </span>
                                </div>
                                {task.checklist && task.checklist.length > 0 && (
                                    <ul className="text-sm text-gray-600 mt-2 mb-3 list-disc list-inside space-y-1">
                                        {task.checklist.map(item => (
                                            <li key={item.id} className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                                                {item.text}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mt-3">
                                    <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                                        {assignees.length > 0 ? (
                                            <div className="flex -space-x-2">
                                                {assignees.slice(0, 3).map(assignee => (
                                                    <img key={assignee.id} src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full border-2 border-white" title={assignee.name} />
                                                ))}
                                            </div>
                                        ) : null}
                                        <span className="ml-2">{assignees.map(a => a.name).join(', ') || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-red-100 text-danger font-semibold">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>
                                            {daysOverdue > 0 ? `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue` : 'Overdue today'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-12">
                        <h3 className="mt-4 text-lg font-medium text-gray-700">No Overdue Tasks</h3>
                        <p className="mt-1 text-sm text-gray-500">Great job, the team is all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverdueTasksView;
