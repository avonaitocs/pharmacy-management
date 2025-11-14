

import React, { useState, useEffect } from 'react';
import { Task, User } from '../types';
import BellIcon from './icons/BellIcon';

interface ReminderModalProps {
  task: Task;
  assignees: User[];
  onClose: () => void;
  onSendReminder: (taskId: string, note: string) => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ task, assignees, onClose, onSendReminder }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!assignees || assignees.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendReminder(task.id, note);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <BellIcon className="w-7 h-7 text-brand-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Send Reminder</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-600">Task:</p>
            <p className="text-lg font-semibold text-gray-900">{task.title}</p>
            <p className="text-sm font-medium text-gray-600 mt-2">To:</p>
            <div className="text-sm text-gray-800 space-y-1">
              {assignees.map(assignee => (
                <div key={assignee.id}>{assignee.name} <span className="text-gray-500">({assignee.email || 'No email'})</span></div>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">Add a note (optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="e.g., Hey, just a friendly reminder about this task..."
            />
          </div>
          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">
              Send Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;