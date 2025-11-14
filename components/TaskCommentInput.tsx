
import React, { useState } from 'react';
import { User, TaskComment } from '../types';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';

interface TaskCommentInputProps {
    currentUser: User;
    taskId: string;
    onAddTaskComment: (taskId: string, commentData: Omit<TaskComment, 'id' | 'audio'>) => void;
}

const TaskCommentInput: React.FC<TaskCommentInputProps> = ({ currentUser, taskId, onAddTaskComment }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAddTaskComment(taskId, {
                authorId: currentUser.id,
                timestamp: new Date().toISOString(),
                text: text.trim(),
            });
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex items-start space-x-3">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 pr-12 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    placeholder="Add a comment... (Shift + Enter for new line)"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                />
                <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-brand-light hover:text-brand-primary disabled:hover:bg-transparent disabled:text-gray-300 transition-colors" 
                    disabled={!text.trim()}
                    aria-label="Send Comment"
                    title="Send Comment"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
};

export default TaskCommentInput;