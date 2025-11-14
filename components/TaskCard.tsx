

import React from 'react';
import { Task, TaskStatus, User, UserRole, TaskPriority } from '../types';
import UserIcon from './icons/UserIcon';
import ClockIcon from './icons/ClockIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import TrashIcon from './icons/TrashIcon';
import LockIcon from './icons/LockIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import PencilIcon from './icons/PencilIcon';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';
import BellIcon from './icons/BellIcon';
import ChatBubbleLeftEllipsisIcon from './icons/ChatBubbleLeftEllipsisIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onToggleChecklistItem: (taskId: string, checklistItemId: string) => void;
  onDelete: (taskId: string) => void;
  onPrivacyChange: (taskId: string, isPrivate: boolean) => void;
  onPriorityChange: (taskId: string, newPriority: TaskPriority) => void;
  onArchiveTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onRemind: (task: Task) => void;
  currentUser: User;
  users: User[];
  isExpanded: boolean;
  onToggleExpand: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onToggleChecklistItem, onDelete, onPrivacyChange, onPriorityChange, onArchiveTask, onEditTask, onRemind, currentUser, users, isExpanded, onToggleExpand }) => {
  const assignees = users.filter(user => task.assigneeIds.includes(user.id));
  
  const deadline = new Date(task.deadline);
  const isOverdue = deadline < new Date() && task.status !== TaskStatus.Done;
  
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const priorityConfig = {
    [TaskPriority.Urgent]: { label: 'Urgent', classes: 'bg-red-500 text-white' },
    [TaskPriority.Important]: { label: 'Important', classes: 'bg-yellow-400 text-yellow-900' },
    [TaskPriority.General]: { label: 'General', classes: 'bg-blue-500 text-white' },
  };

  const completedItems = task.checklist.filter(item => item.isCompleted).length;
  const totalItems = task.checklist.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const canInteract = currentUser.role === UserRole.Admin || task.assigneeIds.includes(currentUser.id);

  const handleStatusSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(task.id, e.target.value as TaskStatus);
  };
  
  const handlePrioritySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPriorityChange(task.id, e.target.value as TaskPriority);
  };
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the task: "${task.title}"?`)) {
        onDelete(task.id);
    }
  }
  
  const cardBaseClasses = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow";
  const cardBorderClasses = isOverdue ? "border-2 border-danger" : "border border-gray-200 dark:border-gray-700";

  return (
    <div className={`${cardBaseClasses} ${cardBorderClasses}`}>
      <div 
        className="flex justify-between items-start cursor-pointer"
        onClick={() => onToggleExpand(task.id)}
        aria-expanded={isExpanded}
        aria-controls={`task-details-${task.id}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleExpand(task.id); }}
      >
        <div className="flex-1 pr-2">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            {task.title}
            </h3>
            {totalItems > 0 && (
                 <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{completedItems}/{totalItems}</span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 ml-2">
                        <div className="bg-brand-secondary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
            {isOverdue && (
              <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                OVERDUE
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityConfig[task.priority].classes}`}>
                {priorityConfig[task.priority].label}
            </span>
            {task.isPrivate && (
                <div title="Private Task">
                    <LockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
            )}
            {task.isRecurring && (
                <div title={`Recurs ${task.recurrenceFrequency?.toLowerCase()}`}>
                    <ArrowPathIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
            )}
            <ChevronDownIcon className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isExpanded && (
        <div id={`task-details-${task.id}`} className="animate-fade-in mt-3 pt-3 border-t dark:border-gray-700">
          {/* Checklist */}
          {task.checklist.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-2 mb-3">
              {task.checklist.map(item => (
                <label key={item.id} className="flex items-center cursor-pointer p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={(e) => { e.stopPropagation(); onToggleChecklistItem(task.id, item.id); }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={!canInteract || task.status === TaskStatus.Done}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                  />
                  <span className={`ml-2 text-sm ${item.isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              {assignees.length > 0 ? (
                <div className="flex -space-x-2">
                  {assignees.slice(0, 3).map(assignee => (
                    <img key={assignee.id} src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" title={assignee.name} />
                  ))}
                  {assignees.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800">
                      +{assignees.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <UserIcon className="w-6 h-6 text-gray-400" />
              )}
              <span className="ml-2">{assignees.map(a => a.name).join(', ') || 'Unassigned'}</span>
            </div>
            <div className="flex items-center space-x-3">
                {task.comments && task.comments.length > 0 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEditTask(task); }} 
                        className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-brand-primary" 
                        title={`${task.comments.length} comments`}
                    >
                        <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                        <span>{task.comments.length}</span>
                    </button>
                )}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${isOverdue ? 'bg-red-100 dark:bg-red-900/50 text-danger' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  {isOverdue && <ExclamationTriangleIcon className="w-4 h-4" title="Overdue"/>}
                  <ClockIcon className="w-4 h-4" />
                  <span>{deadlineFormatted}</span>
                </div>
            </div>
          </div>
          
          {task.status === TaskStatus.Done ? (
            canInteract && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                    <label htmlFor={`status-${task.id}`} className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
                    <div className="relative w-1/2">
                        <select
                            id={`status-${task.id}`}
                            value={task.status}
                            onChange={(e) => { e.stopPropagation(); handleStatusSelectChange(e); }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1.5 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-brand-primary"
                        >
                            <option value={TaskStatus.ToDo}>To Do</option>
                            <option value={TaskStatus.InProgress}>In Progress</option>
                            <option value={TaskStatus.Done}>Done</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                            <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                {currentUser.role === UserRole.Admin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onArchiveTask(task.id); }}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                      <ArchiveBoxIcon className="w-5 h-5 mr-2" />
                      Archive Task
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                    <label htmlFor={`status-${task.id}`} className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
                    <div className="relative w-1/2">
                        <select
                            id={`status-${task.id}`}
                            value={task.status}
                            onChange={(e) => { e.stopPropagation(); handleStatusSelectChange(e); }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={!canInteract}
                            className="w-full appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1.5 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-brand-primary disabled:opacity-70"
                        >
                            <option value={TaskStatus.ToDo}>To Do</option>
                            <option value={TaskStatus.InProgress}>In Progress</option>
                            <option value={TaskStatus.Done}>Done</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                            <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {currentUser.role === UserRole.Admin && (
                    <>
                        <div className="flex items-center justify-between">
                            <label htmlFor={`priority-${task.id}`} className="text-sm font-medium text-gray-600 dark:text-gray-300">Priority</label>
                            <div className="relative w-1/2">
                                <select
                                    id={`priority-${task.id}`}
                                    value={task.priority}
                                    onChange={(e) => { e.stopPropagation(); handlePrioritySelectChange(e); }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1.5 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-brand-primary"
                                >
                                    <option value={TaskPriority.General}>General</option>
                                    <option value={TaskPriority.Important}>Important</option>
                                    <option value={TaskPriority.Urgent}>Urgent</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <label htmlFor={`private-toggle-${task.id}`} className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    id={`private-toggle-${task.id}`}
                                    checked={task.isPrivate}
                                    onChange={(e) => onPrivacyChange(task.id, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Private
                                </span>
                            </label>
                            
                            <div className="flex items-center space-x-1">
                                {assignees.length > 0 && assignees.some(a => a.email) && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemind(task); }}
                                        className="p-2 text-gray-400 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/50 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        aria-label="Send reminder"
                                    >
                                        <BellIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                    className="p-2 text-gray-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-brand-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Edit task"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                    className="p-2 text-gray-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-danger focus:outline-none focus:ring-2 focus:ring-red-500"
                                    aria-label="Delete task"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>

                        </div>
                    </>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;