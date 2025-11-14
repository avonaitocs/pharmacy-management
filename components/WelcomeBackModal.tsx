import React, { useEffect } from 'react';
import { Task, User } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface WelcomeBackModalProps {
  tasks: Task[];
  users: User[];
  onClose: () => void;
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({ tasks, users, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const getAssigneeNames = (assigneeIds: string[]) => {
    return assigneeIds
      .map(id => users.find(u => u.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const formatCompletionTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-brand-primary" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-sm text-gray-500">Here's what the team accomplished since you were last here.</p>
          </div>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                      <p className="font-semibold text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                          Completed by <span className="font-medium text-gray-600">{getAssigneeNames(task.assigneeIds) || 'Unassigned'}</span>
                          {task.completedAt && (
                            <> on <span className="font-medium text-gray-600">{formatCompletionTime(task.completedAt)}</span></>
                          )}
                      </p>
                  </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end p-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          >
            Great, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;