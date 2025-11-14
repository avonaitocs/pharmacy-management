
import React from 'react';
import { User, Task, UserRole } from '../types';
import ArrowUturnLeftIcon from './icons/ArrowUturnLeftIcon';
import TrashIcon from './icons/TrashIcon';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';

interface ArchivedTasksPageProps {
  archivedTasks: Task[];
  users: User[];
  currentUser: User;
  onUnarchiveTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const ArchivedTasksPage: React.FC<ArchivedTasksPageProps> = ({ archivedTasks, users, currentUser, onUnarchiveTask, onDeleteTask }) => {

  const handleDelete = (task: Task) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE the task: "${task.title}"? This action cannot be undone.`)) {
        onDeleteTask(task.id);
    }
  };

  const getAssigneesForTask = (task: Task) => users.filter(u => task.assigneeIds.includes(u.id));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="space-y-4">
        {archivedTasks.length > 0 ? (
          archivedTasks
            .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
            .map(task => {
                const assignees = getAssigneesForTask(task);
                const completionDate = new Date(task.deadline).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                return (
                    <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1 mb-4 sm:mb-0">
                            <p className="font-semibold text-lg text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600 mt-1 italic">
                              {task.checklist.length > 0 ? `${task.checklist.length} checklist item(s)` : 'No checklist items.'}
                            </p>
                            <div className="text-xs text-gray-500 mt-2">
                                <span>Completed on {completionDate} by </span>
                                <span className="font-medium">{assignees.map(a => a.name).join(', ') || 'Unassigned'}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                           <button
                                onClick={() => onUnarchiveTask(task.id)}
                                className="flex items-center px-3 py-1.5 text-sm font-semibold rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                           >
                                <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5"/>
                                Unarchive
                           </button>
                           {currentUser.role === UserRole.Admin && (
                                <button
                                    onClick={() => handleDelete(task)}
                                    className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-danger focus:outline-none"
                                >
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                           )}
                        </div>
                    </div>
                );
            })
        ) : (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-700">No Archived Tasks</h3>
            <p className="mt-1 text-sm text-gray-500">Completed tasks that you archive will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedTasksPage;