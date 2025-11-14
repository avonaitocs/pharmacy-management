

import React, { useState, useRef, useEffect } from 'react';
import { User, Task, TaskPriority, RecurrenceFrequency, TaskComment, ChecklistItem } from '../types';
import Calendar from './Calendar';
import CalendarIcon from './icons/CalendarIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import TaskCommentInput from './TaskCommentInput';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface EditTaskModalProps {
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  taskToEdit: Task;
  employees: User[];
  onRemind: (task: Task) => void;
  currentUser: User;
  users: User[];
  onAddTaskComment: (taskId: string, commentData: Omit<TaskComment, 'id'>) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
    onClose, 
    onUpdateTask, 
    taskToEdit, 
    employees, 
    onRemind,
    currentUser,
    users,
    onAddTaskComment 
}) => {
  const [title, setTitle] = useState(taskToEdit.title);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(taskToEdit.checklist);
  const [newItemText, setNewItemText] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(taskToEdit.assigneeIds);
  const [deadline, setDeadline] = useState<Date | null>(taskToEdit.deadline ? new Date(taskToEdit.deadline) : null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const assigneeContainerRef = useRef<HTMLDivElement>(null);
  const commentListRef = useRef<HTMLDivElement>(null);
  
  const handleAddChecklistItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: `ci-${Date.now()}`,
        text: newItemText.trim(),
        isCompleted: false,
      };
      setChecklist(prev => [...prev, newItem]);
      setNewItemText('');
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };
  
  const handleUpdateChecklistItem = (id: string, newText: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, text: newText } : item));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || assigneeIds.length === 0 || !deadline) {
        alert('Please fill in all required fields: Title, Assignee, and Deadline.');
        return;
    }
    const updatedTask: Task = {
      ...taskToEdit,
      title,
      checklist,
      assigneeIds,
      deadline: deadline.toISOString(),
      // The properties below are not editable in this modal but should be preserved
      priority: taskToEdit.priority,
      isPrivate: taskToEdit.isPrivate,
      isRecurring: taskToEdit.isRecurring,
      recurrenceFrequency: taskToEdit.recurrenceFrequency,
      recurrenceEndDate: taskToEdit.recurrenceEndDate,
      comments: taskToEdit.comments,
    };
    onUpdateTask(updatedTask);
    onClose();
  };
  
  // Scroll to bottom of comment list when new comments are added
  useEffect(() => {
    if (commentListRef.current) {
        commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
    }
  }, [taskToEdit.comments]);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarContainerRef.current && !calendarContainerRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (assigneeContainerRef.current && !assigneeContainerRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarContainerRef, assigneeContainerRef]);

  const handleAssigneeToggle = (employeeId: string) => {
    setAssigneeIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectedAssigneesText = employees
    .filter(e => assigneeIds.includes(e.id))
    .map(e => e.name)
    .join(', ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* --- Form Section --- */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Checklist</label>
                 <div className="mt-1 space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <input 
                        type="text" 
                        value={item.text} 
                        onChange={(e) => handleUpdateChecklistItem(item.id, e.target.value)}
                        className="flex-grow px-2 py-1 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                      />
                      <button type="button" onClick={() => handleRemoveChecklistItem(item.id)} className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded-full">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                    placeholder="Add a checklist item"
                    className="flex-grow px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                  />
                  <button type="button" onClick={handleAddChecklistItem} className="px-4 py-2 bg-gray-200 text-gray-700 border-t border-b border-r border-gray-300 rounded-r-md hover:bg-gray-300">
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="assignee-button" className="block text-sm font-medium text-gray-700">Assign To</label>
                    <div className="relative mt-1" ref={assigneeContainerRef}>
                        <button
                            type="button"
                            id="assignee-button"
                            onClick={() => setIsAssigneeDropdownOpen(prev => !prev)}
                            className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <span className={`block truncate ${assigneeIds.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                {assigneeIds.length > 0 ? selectedAssigneesText : 'Select employee(s)'}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isAssigneeDropdownOpen ? 'rotate-180' : ''}`} />
                            </span>
                        </button>
                        {isAssigneeDropdownOpen && (
                            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                                <ul>
                                    {employees.map(emp => (
                                        <li key={emp.id} className="p-2 hover:bg-gray-100">
                                            <label className="flex items-center w-full cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={assigneeIds.includes(emp.id)}
                                                    onChange={() => handleAssigneeToggle(emp.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{emp.name}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <label htmlFor="deadline-button" className="block text-sm font-medium text-gray-700">Deadline</label>
                    <div className="relative mt-1" ref={calendarContainerRef}>
                        <button
                            type="button"
                            id="deadline-button"
                            onClick={() => setIsCalendarOpen(prev => !prev)}
                            className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-gray-900"
                            aria-haspopup="true"
                            aria-expanded={isCalendarOpen}
                        >
                            <span className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                                <span className={`ml-3 block truncate ${deadline ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {deadline 
                                        ? deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                                        : 'Select a date'}
                                </span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                            </span>
                        </button>
                        {isCalendarOpen && (
                            <Calendar
                                selectedDate={deadline}
                                onSelectDate={(date) => {
                                    setDeadline(date);
                                    setIsCalendarOpen(false);
                                }}
                            />
                        )}
                    </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          
          {/* --- Communication Section --- */}
          <div className="p-6 pt-0">
             <div className="border-t pt-4">
                 <h3 className="text-xl font-bold text-gray-800 mb-4">Task Communication</h3>
                 <div ref={commentListRef} className="space-y-4 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg border">
                    {(taskToEdit.comments || []).length > 0 ? [...taskToEdit.comments].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(comment => {
                        const author = users.find(u => u.id === comment.authorId);
                        return (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <img src={author?.avatar} alt={author?.name} className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-baseline space-x-2">
                                        <p className="font-semibold text-sm text-gray-800">{author?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleString()}</p>
                                    </div>
                                    {comment.text && <p className="text-sm text-gray-700 bg-white p-2 rounded-md border whitespace-pre-wrap">{comment.text}</p>}
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-sm text-center text-gray-500 py-4">No comments yet. Start the conversation!</p>
                    )}
                 </div>
                 
                 <TaskCommentInput 
                    currentUser={currentUser}
                    taskId={taskToEdit.id}
                    onAddTaskComment={onAddTaskComment}
                 />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;