import React, { useMemo } from 'react';
import { User, Task, TaskStatus, TaskPriority } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ClockIcon from './icons/ClockIcon';

const priorityConfig = {
    [TaskPriority.Urgent]: { label: 'Urgent', classes: 'bg-red-500 text-white', order: 1 },
    [TaskPriority.Important]: { label: 'Important', classes: 'bg-yellow-400 text-yellow-900', order: 2 },
    [TaskPriority.General]: { label: 'General', classes: 'bg-blue-500 text-white', order: 3 },
};

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const deadline = new Date(task.deadline);
    const isOverdue = deadline < new Date() && task.status !== TaskStatus.Done;
    
    const deadlineFormatted = deadline.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className={`p-4 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-gray-800 flex-1 pr-2">{task.title}</h4>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityConfig[task.priority].classes}`}>
                    {priorityConfig[task.priority].label}
                </span>
            </div>
            {task.checklist && task.checklist.length > 0 ? (
                <ul className="text-sm text-gray-600 mt-1 mb-3 list-disc list-inside space-y-1">
                    {task.checklist.map(item => (
                        <li key={item.id} className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                            {item.text}
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-gray-500 italic mt-1 mb-3">No checklist items.</p>}
            <div className="flex items-center justify-end">
                 <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${isOverdue ? 'bg-red-100 text-danger' : 'bg-gray-100 text-gray-600'}`}>
                    <ClockIcon className="w-4 h-4" />
                    <span>
                        {task.status === TaskStatus.Done ? 'Completed: ' : 'Due: '} 
                        {deadlineFormatted}
                    </span>
                </div>
            </div>
        </div>
    );
};


interface UserDetailPageProps {
  user: User;
  tasks: Task[];
  onBack: () => void;
}

const UserDetailPage: React.FC<UserDetailPageProps> = ({ user, tasks, onBack }) => {
  const activeTasks = useMemo(() => tasks
    .filter(t => t.status !== TaskStatus.Done && !t.isArchived)
    .sort((a, b) => priorityConfig[a.priority].order - priorityConfig[b.priority].order),
    [tasks]);
    
  const completedTasks = useMemo(() => tasks
    .filter(t => t.status === TaskStatus.Done && !t.isArchived)
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()),
    [tasks]);


  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <button
          onClick={onBack}
          className="flex items-center text-sm font-semibold text-brand-primary hover:text-brand-dark"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to User List
        </button>
        <div className="flex items-center">
          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
          <div className="ml-4 text-right">
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Tasks Column */}
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-4">Assigned Tasks ({activeTasks.length})</h3>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {activeTasks.length > 0 ? (
                activeTasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p>No active tasks assigned.</p>
                </div>
            )}
          </div>
        </div>

        {/* Completed Tasks Column */}
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-4">Completed Tasks ({completedTasks.length})</h3>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {completedTasks.length > 0 ? (
                completedTasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p>No tasks completed yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;