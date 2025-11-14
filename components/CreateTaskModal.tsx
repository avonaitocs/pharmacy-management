import React, { useState, useCallback, useRef, useEffect } from 'react';
import { User, Task, TaskPriority, RecurrenceFrequency, UserRole, ChecklistItem } from '../types';
import Calendar from './Calendar';
import CalendarIcon from './icons/CalendarIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';


interface CreateTaskModalProps {
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'status' | 'isArchived' | 'comments'>) => void;
  employees: User[];
  currentUser: User;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onAddTask, employees, currentUser }) => {
  const [title, setTitle] = useState('');
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.General);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const assigneeContainerRef = useRef<HTMLDivElement>(null);
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(RecurrenceFrequency.Weekly);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const [isRecurrenceCalendarOpen, setIsRecurrenceCalendarOpen] = useState(false);
  const recurrenceCalendarRef = useRef<HTMLDivElement>(null);

  const handleAddChecklistItem = () => {
    if (newItemText.trim()) {
      setChecklist(prev => [...prev, newItemText.trim()]);
      setNewItemText('');
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklist(prev => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || assigneeIds.length === 0 || !deadline) {
        alert('Please fill in all required fields: Title, Assignee, and Deadline.');
        return;
    }
    onAddTask({
      title,
      checklist: checklist.map((text, index) => ({ id: `ci-${Date.now()}-${index}`, text, isCompleted: false })),
      assigneeIds,
      deadline: deadline.toISOString(),
      priority,
      isPrivate,
      isRecurring,
      recurrenceFrequency: isRecurring ? recurrenceFrequency : null,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate.toISOString() : null,
      createdBy: currentUser.id,
    });
    onClose();
  };
  
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
      if (recurrenceCalendarRef.current && !recurrenceCalendarRef.current.contains(event.target as Node)) {
        setIsRecurrenceCalendarOpen(false);
      }
      if (assigneeContainerRef.current && !assigneeContainerRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarContainerRef, recurrenceCalendarRef, assigneeContainerRef]);

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Create New Task</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
              {checklist.map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="flex-grow pl-3 text-gray-800">{item}</span>
                  <button type="button" onClick={() => handleRemoveChecklistItem(index)} className="p-1 text-gray-400 hover:text-red-600 rounded-full">
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

          <div className="space-y-4 rounded-md border p-4 bg-gray-50">
            <label htmlFor="isRecurring" className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Make this a recurring task</span>
            </label>
            <p className="text-xs text-gray-500 pl-7">When a recurring task is completed, a new one will be created for the next cycle.</p>
            {isRecurring && (
              <div className="pl-7 pt-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="recurrenceFrequency" className="block text-sm font-medium text-gray-700">Recurs</label>
                    <select
                      id="recurrenceFrequency"
                      value={recurrenceFrequency}
                      onChange={(e) => setRecurrenceFrequency(e.target.value as RecurrenceFrequency)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
                    >
                      <option value={RecurrenceFrequency.Daily}>Daily</option>
                      <option value={RecurrenceFrequency.Weekly}>Weekly</option>
                      <option value={RecurrenceFrequency.Biweekly}>Every 2 Weeks</option>
                      <option value={RecurrenceFrequency.Monthly}>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="recurrence-end-date-button" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                    <div className="relative mt-1" ref={recurrenceCalendarRef}>
                        <button
                            type="button"
                            id="recurrence-end-date-button"
                            onClick={() => setIsRecurrenceCalendarOpen(prev => !prev)}
                            className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-gray-900"
                        >
                            <span className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                                <span className={`ml-3 block truncate ${recurrenceEndDate ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {recurrenceEndDate 
                                        ? recurrenceEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) 
                                        : 'Never'}
                                </span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isRecurrenceCalendarOpen ? 'rotate-180' : ''}`} />
                            </span>
                        </button>
                        {isRecurrenceCalendarOpen && (
                            <Calendar
                                selectedDate={recurrenceEndDate}
                                onSelectDate={(date) => {
                                    setRecurrenceEndDate(date);
                                    setIsRecurrenceCalendarOpen(false);
                                }}
                            />
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex flex-wrap gap-4">
                {(Object.values(TaskPriority)).map((p) => (
                    <label key={p} className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="priority"
                            value={p}
                            checked={priority === p}
                            onChange={() => setPriority(p)}
                            className="h-4 w-4 text-brand-primary border-gray-300 focus:ring-brand-primary"
                        />
                        <span className="ml-2 text-sm text-gray-800 capitalize">{p.toLowerCase()}</span>
                    </label>
                ))}
            </div>
          </div>
          <div>
            <label htmlFor="isPrivate" className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Mark task as private</span>
            </label>
            <p className="text-xs text-gray-500 pl-7">If checked, this task will only be visible to the assignee and admins.</p>
          </div>
          <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">
              {currentUser.role === UserRole.Admin ? 'Add Task' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;