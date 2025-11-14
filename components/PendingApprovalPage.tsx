
import React from 'react';
import { Task, User } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ClockIcon from './icons/ClockIcon';

interface PendingApprovalPageProps {
  pendingTasks: Task[];
  users: User[];
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string) => void;
}

const PendingApprovalPage: React.FC<PendingApprovalPageProps> = ({ pendingTasks, users, onApproveTask, onRejectTask }) => {

  const getCreatorForTask = (task: Task) => users.find(u => u.id === task.createdBy);
  const getAssigneesForTask = (task: Task) => users.filter(u => task.assigneeIds.includes(u.id));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
        {pendingTasks.length > 0 ? (
            <div className="space-y-4">
            {pendingTasks.sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).map(task => {
                const creator = getCreatorForTask(task);
                const assignees = getAssigneesForTask(task);
                const deadline = new Date(task.deadline);
                const deadlineFormatted = deadline.toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                });

                return (
                    <div key={task.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                            <div className="flex-1 mb-4 sm:mb-0">
                                <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                                {task.checklist.length > 0 && (
                                  <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                                    {task.checklist.map(item => <li key={item.id}>{item.text}</li>)}
                                  </ul>
                                )}
                                <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                                    <p>Submitted by: <span className="font-medium">{creator?.name || 'Unknown'}</span></p>
                                    <p>Assigned to: <span className="font-medium">{assignees.map(a => a.name).join(', ') || 'Unassigned'}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>Due: {deadlineFormatted}</span>
                                </div>
                                <button onClick={() => onApproveTask(task.id)} className="flex items-center px-3 py-1.5 text-sm font-semibold rounded-md bg-green-100 text-green-800 hover:bg-green-200">
                                    <CheckCircleIcon className="w-5 h-5 mr-1.5"/> Approve
                                </button>
                                <button onClick={() => onRejectTask(task.id)} className="flex items-center px-3 py-1.5 text-sm font-semibold rounded-md bg-red-100 text-red-800 hover:bg-red-200">
                                    <XCircleIcon className="w-5 h-5 mr-1.5"/> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
        ) : (
             <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-700">No Tasks Pending Approval</h3>
                <p className="mt-1 text-sm text-gray-500">When employees submit new tasks, they will appear here for review.</p>
            </div>
        )}
    </div>
  );
};

export default PendingApprovalPage;