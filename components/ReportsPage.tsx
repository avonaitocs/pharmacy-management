
import React, { useState } from 'react';
import { User, Task, TaskStatus, TaskPriority, UserRole, UserStatus } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import UserTaskDetailView from './UserTaskDetailView';
import OverdueTasksView from './OverdueTasksView';

interface ReportsPageProps {
  users: User[];
  tasks: Task[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ users, tasks }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isViewingOverdue, setIsViewingOverdue] = useState<boolean>(false);

  const employees = users.filter(u => u.role === UserRole.Employee && u.status === UserStatus.Active);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Done);
  const completedCount = completedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  const overdueTasksList = tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== TaskStatus.Done);
  const overdueTasksCount = overdueTasksList.length;

  const completedByPriority = {
    [TaskPriority.Urgent]: completedTasks.filter(t => t.priority === TaskPriority.Urgent).length,
    [TaskPriority.Important]: completedTasks.filter(t => t.priority === TaskPriority.Important).length,
    [TaskPriority.General]: completedTasks.filter(t => t.priority === TaskPriority.General).length,
  };

  const employeeStats = employees.map(employee => {
    const assignedTasks = tasks.filter(t => t.assigneeIds.includes(employee.id));
    const completed = assignedTasks.filter(t => t.status === TaskStatus.Done);
    return {
      ...employee,
      completedCount: completed.length,
      completedUrgent: completed.filter(t => t.priority === TaskPriority.Urgent).length,
      completedImportant: completed.filter(t => t.priority === TaskPriority.Important).length,
      completedGeneral: completed.filter(t => t.priority === TaskPriority.General).length,
    };
  });

  const selectedUser = users.find(u => u.id === selectedUserId);
  const userCompletedTasks = completedTasks.filter(t => t.assigneeIds.includes(selectedUserId ?? ''));

  if (selectedUser) {
    return (
      <UserTaskDetailView 
        user={selectedUser} 
        completedTasks={userCompletedTasks} 
        onBack={() => setSelectedUserId(null)} 
      />
    );
  }

  if (isViewingOverdue) {
    return (
      <OverdueTasksView 
        overdueTasks={overdueTasksList} 
        users={users} 
        onBack={() => setIsViewingOverdue(false)} 
      />
    );
  }


  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Overall Progress */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Progress</h3>
          <p className="text-4xl font-bold text-brand-primary">{completionRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{completedCount} of {totalTasks} tasks completed</p>
        </div>
        {/* Overdue Tasks */}
        <div 
          className="bg-red-50 p-6 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => setIsViewingOverdue(true)}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-red-800">Overdue Tasks</h3>
                <ExclamationTriangleIcon className="w-7 h-7 text-red-500"/>
            </div>
            <p className="text-4xl font-bold text-danger mt-4">{overdueTasksCount}</p>
        </div>
        {/* Completed by Priority */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800">Completed by Priority</h3>
                <CheckCircleIcon className="w-7 h-7 text-green-500"/>
            </div>
            <div className="flex justify-around space-x-4">
                <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">{completedByPriority.URGENT}</p>
                    <p className="text-sm font-medium text-gray-600">Urgent</p>
                </div>
                 <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">{completedByPriority.IMPORTANT}</p>
                    <p className="text-sm font-medium text-gray-600">Important</p>
                </div>
                 <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{completedByPriority.GENERAL}</p>
                    <p className="text-sm font-medium text-gray-600">General</p>
                </div>
            </div>
        </div>
       </div>

      {/* User Performance Table */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">User Performance</h3>
        <p className="text-sm text-gray-500 mb-4">Click on a user to view their completed tasks.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completed (Total)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Urgent</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Important</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">General</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employeeStats.map(user => (
                <tr 
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className="hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-800">{user.completedCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{user.completedUrgent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{user.completedImportant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{user.completedGeneral}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;