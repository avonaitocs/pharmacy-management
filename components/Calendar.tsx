import React, { useState, useMemo } from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const firstDayOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1), [viewDate]);
  const daysInMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate(), [viewDate]);

  const startingDayIndex = firstDayOfMonth.getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Add blank days for the first week
    for (let i = 0; i < startingDayIndex; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
    }
    return days;
  }, [startingDayIndex, daysInMonth, viewDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isSameDay = (date1: Date, date2: Date | null) => {
    if (!date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const today = new Date();

  return (
    <div className="absolute top-full mt-2 w-full max-w-xs bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-10">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="font-semibold text-gray-800">
          {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium mb-2">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div key={index} className="flex justify-center items-center">
            {day ? (
              <button
                type="button"
                onClick={() => onSelectDate(day)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
                  ${isSameDay(day, selectedDate) ? 'bg-brand-primary text-white font-bold' : ''}
                  ${!isSameDay(day, selectedDate) && isSameDay(day, today) ? 'bg-brand-light text-brand-dark' : ''}
                  ${!isSameDay(day, selectedDate) ? 'hover:bg-gray-100' : ''}
                  ${day.getMonth() !== viewDate.getMonth() ? 'text-gray-300' : 'text-gray-700'}
                `}
              >
                {day.getDate()}
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;