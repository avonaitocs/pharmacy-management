



import React, { useState, useRef, useEffect } from 'react';
import { User, Message, Attachment } from '../types';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import BoldIcon from './icons/BoldIcon';
import ItalicIcon from './icons/ItalicIcon';
import UnderlineIcon from './icons/UnderlineIcon';
import ListBulletIcon from './icons/ListBulletIcon';
import ListOrderedIcon from './icons/ListOrderedIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ComposeMessageModalProps {
  currentUser: User;
  allUsers: User[];
  initialRecipients?: User[];
  replyToMessage?: Message | null;
  onClose: () => void;
  onSendMessage: (newMessage: Omit<Message, 'id' | 'timestamp'>) => void;
}

const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        type="button"
        onMouseDown={e => e.preventDefault()} // Prevent editor from losing focus
        onClick={onClick}
        className="p-2 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
    >
        {children}
    </button>
);

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  currentUser,
  allUsers,
  initialRecipients = [],
  replyToMessage = null,
  onClose,
  onSendMessage
}) => {
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);
  const recipientContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (replyToMessage) {
      const sender = allUsers.find(u => u.id === replyToMessage.senderId);
      if (sender) {
        setRecipientIds([sender.id]);
      }
      setSubject(replyToMessage.subject.startsWith('Re: ') ? replyToMessage.subject : `Re: ${replyToMessage.subject}`);
      const replyBody = `<br/><br/><hr/><p><strong>From:</strong> ${sender?.name}<br/><strong>Sent:</strong> ${new Date(replyToMessage.timestamp).toLocaleString()}<br/><strong>To:</strong> You<br/><strong>Subject:</strong> ${replyToMessage.subject}</p>${replyToMessage.body}`;
      setBody(replyBody);
      if (bodyRef.current) {
        bodyRef.current.innerHTML = replyBody;
      }
    } else {
        setRecipientIds(initialRecipients.map(u => u.id));
    }
  }, [replyToMessage, initialRecipients, allUsers]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentBody = bodyRef.current?.innerHTML || '';
    if (recipientIds.length === 0 || !subject.trim() || !currentBody.trim()) {
      alert('Please fill in all fields: To, Subject, and Message.');
      return;
    }
    onSendMessage({
      senderId: currentUser.id,
      recipients: recipientIds.map(id => ({
        userId: id,
        isRead: false,
        isArchived: false,
        isDeleted: false,
      })),
      subject,
      body: currentBody,
      attachments,
    });
    onClose();
  };
  
  const handleRecipientToggle = (userId: string) => {
    setRecipientIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const selectedRecipientsText = allUsers
    .filter(u => recipientIds.includes(u.id))
    .map(u => u.name)
    .join(', ');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Explicitly type 'file' as 'File' to prevent TypeScript from inferring it as 'unknown'.
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newAttachment: Attachment = {
            name: file.name,
            type: file.type,
            content: event.target?.result as string,
          };
          setAttachments(prev => [...prev, newAttachment]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveAttachment = (name: string) => {
    setAttachments(prev => prev.filter(att => att.name !== name));
  };
  
  const applyFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    bodyRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recipientContainerRef.current && !recipientContainerRef.current.contains(event.target as Node)) {
        setIsRecipientDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
          <PaperAirplaneIcon className="w-7 h-7 text-brand-primary" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{replyToMessage ? 'Reply to Message' : 'New Message'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label htmlFor="recipient-button" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
              <div className="relative mt-1" ref={recipientContainerRef}>
                  <button
                      type="button"
                      id="recipient-button"
                      onClick={() => setIsRecipientDropdownOpen(prev => !prev)}
                      disabled={!!replyToMessage}
                      className="relative w-full cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                  >
                      <span className={`block truncate ${recipientIds.length > 0 ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500'}`}>
                          {recipientIds.length > 0 ? selectedRecipientsText : 'Select recipient(s)'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isRecipientDropdownOpen ? 'rotate-180' : ''}`} />
                      </span>
                  </button>
                  {isRecipientDropdownOpen && !replyToMessage && (
                      <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                          <ul>
                              {allUsers.filter(u => u.id !== currentUser.id).map(user => (
                                  <li key={user.id} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                      <label className="flex items-center w-full cursor-pointer">
                                          <input
                                              type="checkbox"
                                              checked={recipientIds.includes(user.id)}
                                              onChange={() => handleRecipientToggle(user.id)}
                                              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                          />
                                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                                      </label>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
              </div>
            </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                <div className="flex items-center p-2 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-700 space-x-1">
                    <ToolbarButton onClick={() => applyFormat('bold')}><BoldIcon className="w-5 h-5"/></ToolbarButton>
                    <ToolbarButton onClick={() => applyFormat('italic')}><ItalicIcon className="w-5 h-5"/></ToolbarButton>
                    <ToolbarButton onClick={() => applyFormat('underline')}><UnderlineIcon className="w-5 h-5"/></ToolbarButton>
                    <ToolbarButton onClick={() => applyFormat('insertUnorderedList')}><ListBulletIcon className="w-5 h-5"/></ToolbarButton>
                    <ToolbarButton onClick={() => applyFormat('insertOrderedList')}><ListOrderedIcon className="w-5 h-5"/></ToolbarButton>
                    <ToolbarButton onClick={() => fileInputRef.current?.click()}><PaperclipIcon className="w-5 h-5"/></ToolbarButton>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden"/>
                </div>
                <div
                    ref={bodyRef}
                    contentEditable
                    onInput={(e) => setBody(e.currentTarget.innerHTML)}
                    className="w-full h-48 p-3 overflow-y-auto focus:outline-none prose max-w-none dark:prose-invert dark:text-gray-300"
                />
            </div>
          </div>
          {attachments.length > 0 && (
              <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments:</h4>
                  <div className="flex flex-wrap gap-2">
                      {attachments.map(att => (
                          <div key={att.name} className="flex items-center bg-gray-100 dark:bg-gray-700 text-sm rounded-full pl-3 pr-1 py-1">
                              <span className="text-gray-800 dark:text-gray-200">{att.name}</span>
                              <button type="button" onClick={() => handleRemoveAttachment(att.name)} className="ml-2 p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full">
                                  <XCircleIcon className="w-4 h-4"/>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
          <div className="flex justify-end pt-4 space-x-2 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
              Cancel
            </button>
            <button type="submit" className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">
              <PaperAirplaneIcon className="w-5 h-5 mr-2" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeMessageModal;