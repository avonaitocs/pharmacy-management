
import React, { useState } from 'react';
import { Task, TaskPriority } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const priorityConfig = {
    [TaskPriority.Urgent]: { label: 'Urgent', classes: 'border-l-4 border-red-500 bg-red-50 hover:bg-red-100' },
    [TaskPriority.Important]: { label: 'Important', classes: 'border-l-4 border-yellow-400 bg-yellow-50 hover:bg-yellow-100' },
    [TaskPriority.General]: { label: 'General', classes: 'border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100' },
};

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDayOfWeek = startOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysInMonth = endOfMonth.getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  // Add blank days for the start of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const tasksByDate: { [key: string]: Task[] } = {};
  tasks.forEach(task => {
    const deadline = new Date(task.deadline);
    // Ignore time part for grouping
    const dateKey = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()).toISOString();
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center space-x-2">
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
            Today
          </button>
          <button onClick={handlePrevMonth} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button onClick={handleNextMonth} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-grow min-h-0">
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-xs sm:text-sm text-gray-500 dark:text-gray-400 py-2 border-b dark:border-gray-700">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="border-r border-b dark:border-gray-700"></div>;
          }
          const isToday = day.getTime() === today.getTime();
          const dayTasks = tasksByDate[day.toISOString()] || [];

          return (
            <div
              key={index}
              className="border-r border-b dark:border-gray-700 p-1 sm:p-2 flex flex-col min-h-[100px] sm:min-h-[120px]"
            >
              <span className={`self-end text-xs sm:text-sm font-medium ${isToday ? 'bg-brand-primary text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center' : 'text-gray-700 dark:text-gray-200'}`}>
                {day.getDate()}
              </span>
              <div className="flex-grow overflow-y-auto space-y-1 mt-1 pr-1">
                {dayTasks.sort((a,b) => (a.priority === TaskPriority.Urgent ? -1 : 1)).map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`w-full text-left p-1.5 rounded-md text-xs transition-colors ${priorityConfig[task.priority].classes}`}
                  >
                    <p className="font-semibold text-gray-800 dark:text-gray-900 truncate">{task.title}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;