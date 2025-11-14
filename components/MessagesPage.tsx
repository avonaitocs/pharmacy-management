

import React, { useState, useMemo, useEffect } from 'react';
import { User, Message } from '../types';
import InboxIcon from './icons/InboxIcon';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon';
import TrashIcon from './icons/TrashIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import ReplyIcon from './icons/ReplyIcon';
import ArrowUturnLeftIcon from './icons/ArrowUturnLeftIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import PaperclipIcon from './icons/PaperclipIcon';


type Folder = 'inbox' | 'sent' | 'archived' | 'trash';

interface MessageListItemProps {
  message: Message;
  senderName: string;
  isSelected: boolean;
  isUnread: boolean;
  onSelect: (messageId: string) => void;
}

const MessageListItem: React.FC<MessageListItemProps> = ({ message, senderName, isSelected, isUnread, onSelect }) => {
  // A simple regex to strip HTML for the preview
  const bodyPreview = message.body.replace(/<[^>]*>?/gm, ' ');

  return (
    <div
      onClick={() => onSelect(message.id)}
      className={`p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700 ${isSelected ? 'bg-brand-light dark:bg-brand-dark' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
    >
      <div className="flex justify-between items-center">
        <p className={`text-sm font-semibold truncate ${isUnread ? 'text-gray-900 dark:text-gray-50' : 'text-gray-600 dark:text-gray-400'}`}>
          {senderName}
        </p>
        <time className={`text-xs flex-shrink-0 ml-2 ${isUnread ? 'text-brand-primary dark:text-brand-secondary font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleDateString()}
        </time>
      </div>
      <p className={`text-sm truncate mt-1 ${isUnread ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
        {message.subject}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
        {bodyPreview}
      </p>
    </div>
  );
};

interface MessageDetailViewProps {
  message: Message;
  users: User[];
  onReply: (message: Message) => void;
  onArchive: (messageId: string, isArchived: boolean) => void;
  onDelete: (messageId: string, isDeleted: boolean) => void;
  onPermanentDelete: (messageId: string) => void;
  onBack: () => void;
  currentFolder: Folder;
}

const MessageDetailView: React.FC<MessageDetailViewProps> = ({ message, users, onReply, onArchive, onDelete, onPermanentDelete, onBack, currentFolder }) => {
    const sender = users.find(u => u.id === message.senderId);
    const recipients = users.filter(u => message.recipients.some(r => r.userId === u.id));

    if (!sender) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Message not found.</div>;

    return (
        <div className="p-4 sm:p-6 flex flex-col h-full">
            <div className="border-b dark:border-gray-700 pb-4 flex items-start">
                 <button onClick={onBack} className="md:hidden p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ArrowLeftIcon className="w-5 h-5"/>
                </button>
                <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{message.subject}</h2>
                    <div className="flex items-center mt-3">
                        <img src={sender.avatar} alt={sender.name} className="w-10 h-10 rounded-full"/>
                        <div className="ml-3">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{sender.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">To: {recipients.map(r => r.name).join(', ')}</p>
                        </div>
                        <time className="ml-auto text-xs text-gray-500 dark:text-gray-400">{new Date(message.timestamp).toLocaleString()}</time>
                    </div>
                </div>
            </div>
            <div 
                className="flex-grow py-4 my-4 prose max-w-none text-gray-700 dark:text-gray-300 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: message.body }}
            >
            </div>

            {message.attachments && message.attachments.length > 0 && (
                <div className="border-t dark:border-gray-700 pt-4 mt-2">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                        <PaperclipIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        Attachments ({message.attachments.length})
                    </h3>
                    <div className="mt-2 space-y-2">
                        {message.attachments.map(att => (
                            <a
                                href={att.content}
                                download={att.name}
                                key={att.name}
                                className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                            >
                                <DocumentTextIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
                                <span className="text-brand-primary dark:text-brand-light font-medium truncate">{att.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}


            <div className="flex items-center justify-between border-t dark:border-gray-700 pt-4 mt-auto">
                {currentFolder !== 'sent' && (
                    <button
                        onClick={() => onReply(message)}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-brand-primary dark:text-brand-light bg-brand-light dark:bg-gray-700 rounded-md hover:bg-blue-200 dark:hover:bg-gray-600"
                    >
                        <ReplyIcon className="w-5 h-5 mr-2"/>
                        Reply
                    </button>
                )}
                <div className="flex space-x-2">
                    {currentFolder === 'inbox' && (
                        <button onClick={() => onArchive(message.id, true)} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Archive"><ArchiveBoxIcon className="w-5 h-5"/></button>
                    )}
                    {currentFolder === 'archived' && (
                         <button onClick={() => onArchive(message.id, false)} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Move to Inbox"><InboxIcon className="w-5 h-5"/></button>
                    )}
                     {currentFolder !== 'trash' ? (
                        <button onClick={() => onDelete(message.id, true)} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-red-100 dark:hover:bg-red-800 hover:text-danger dark:hover:text-red-400" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                     ) : (
                        <>
                            <button onClick={() => onDelete(message.id, false)} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Restore"><ArrowUturnLeftIcon className="w-5 h-5"/></button>
                            <button onClick={() => window.confirm('Permanently delete this message?') && onPermanentDelete(message.id)} className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-red-100 dark:hover:bg-red-800 hover:text-danger dark:hover:text-red-400" title="Delete Forever"><TrashIcon className="w-5 h-5"/></button>
                        </>
                     )}
                </div>
            </div>
        </div>
    );
};


interface MessagesPageProps {
  currentUser: User;
  users: User[];
  messages: Message[];
  onCompose: () => void;
  onReply: (message: Message) => void;
  onUpdateMessageStatus: (messageId: string, userId: string, updates: { isRead?: boolean, isArchived?: boolean, isDeleted?: boolean }) => void;
  onPermanentlyDeleteMessage: (messageId: string, userId: string) => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ currentUser, users, messages, onCompose, onReply, onUpdateMessageStatus, onPermanentlyDeleteMessage }) => {
  const [selectedFolder, setSelectedFolder] = useState<Folder>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const folderCounts = useMemo(() => {
    const counts = { inbox: 0, sent: 0, archived: 0, trash: 0 };
    messages.forEach(msg => {
      const recipientData = msg.recipients.find(r => r.userId === currentUser.id);
      if (recipientData && !recipientData.isArchived && !recipientData.isDeleted) {
        counts.inbox++;
      }
      if (msg.senderId === currentUser.id && !msg.senderDeleted) {
        counts.sent++;
      }
      if (recipientData && recipientData.isArchived && !recipientData.isDeleted) {
        counts.archived++;
      }
      if ((recipientData && recipientData.isDeleted) || (msg.senderId === currentUser.id && msg.senderDeleted)) {
        counts.trash++;
      }
    });
    return counts;
  }, [messages, currentUser.id]);

  const filteredMessages = useMemo(() => {
    let folderFiltered = [];
    switch (selectedFolder) {
      case 'inbox':
        folderFiltered = messages.filter(msg => msg.recipients.some(r => r.userId === currentUser.id && !r.isArchived && !r.isDeleted));
        break;
      case 'sent':
        folderFiltered = messages.filter(msg => msg.senderId === currentUser.id && !msg.senderDeleted);
        break;
      case 'archived':
        folderFiltered = messages.filter(msg => msg.recipients.some(r => r.userId === currentUser.id && r.isArchived && !r.isDeleted));
        break;
      case 'trash':
        folderFiltered = messages.filter(msg => 
            (msg.recipients.some(r => r.userId === currentUser.id && r.isDeleted)) ||
            (msg.senderId === currentUser.id && msg.senderDeleted)
        );
        break;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    
    const finalFiltered = folderFiltered.filter(msg => {
      const sender = users.find(u => u.id === msg.senderId);
      const searchMatch = !searchQuery || (
        sender?.name.toLowerCase().includes(lowercasedQuery) ||
        msg.subject.toLowerCase().includes(lowercasedQuery) ||
        msg.body.toLowerCase().includes(lowercasedQuery)
      );
      const unreadMatch = !showUnreadOnly || (selectedFolder === 'inbox' && msg.recipients.some(r => r.userId === currentUser.id && !r.isRead));
      
      return searchMatch && unreadMatch;
    });

    return finalFiltered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedFolder, messages, currentUser.id, searchQuery, showUnreadOnly, users]);

  useEffect(() => {
    if (filteredMessages.length > 0 && !filteredMessages.find(m => m.id === selectedMessageId)) {
      setSelectedMessageId(filteredMessages[0].id);
    } else if (filteredMessages.length === 0) {
      setSelectedMessageId(null);
    }
  }, [selectedFolder, filteredMessages, selectedMessageId]);

  useEffect(() => {
    if (selectedMessageId) {
      const message = messages.find(m => m.id === selectedMessageId);
      const recipientData = message?.recipients.find(r => r.userId === currentUser.id);
      if (recipientData && !recipientData.isRead) {
        onUpdateMessageStatus(selectedMessageId, currentUser.id, { isRead: true });
      }
    }
  }, [selectedMessageId, messages, currentUser.id, onUpdateMessageStatus]);

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
  };
  
  const selectedMessage = messages.find(m => m.id === selectedMessageId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex h-full animate-fade-in overflow-hidden">
      <div className={`
        w-full md:w-2/5 lg:w-2/5 border-r border-gray-200 dark:border-gray-700 flex-col 
        ${selectedMessageId ? 'hidden md:flex' : 'flex'}
      `}>
          <aside className="w-full border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 p-4 flex-col">
            <button
              onClick={onCompose}
              className="w-full flex items-center justify-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              <PencilSquareIcon className="w-5 h-5 mr-2" />
              Compose
            </button>
            <nav className="mt-6 space-y-2">
                {(Object.keys(folderCounts) as Folder[]).map(folder => {
                    const icons: Record<Folder, React.FC<any>> = { inbox: InboxIcon, sent: PaperAirplaneIcon, archived: ArchiveBoxIcon, trash: TrashIcon };
                    const Icon = icons[folder];
                    return (
                         <button
                            key={folder}
                            onClick={() => setSelectedFolder(folder)}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${selectedFolder === folder ? 'bg-brand-light dark:bg-brand-dark text-brand-primary dark:text-brand-light' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <Icon className="w-5 h-5 mr-3"/>
                            <span className="capitalize">{folder}</span>
                            {folderCounts[folder] > 0 && <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${selectedFolder === folder ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}>{folderCounts[folder]}</span>}
                        </button>
                    )
                })}
            </nav>
          </aside>
          
          <div className="w-full overflow-y-auto flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mail..."
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
                {selectedFolder === 'inbox' && (
                    <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showUnreadOnly}
                            onChange={(e) => setShowUnreadOnly(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-brand-primary focus:ring-brand-primary"
                        />
                        <span>Unread only</span>
                    </label>
                )}
            </div>
            <div className="overflow-y-auto flex-grow">
              {filteredMessages.length > 0 ? (
                filteredMessages.map(msg => {
                  const sender = users.find(u => u.id === msg.senderId);
                  const recipientData = msg.recipients.find(r => r.userId === currentUser.id);
                  const isUnread = !!recipientData && !recipientData.isRead;
                  return (
                    <MessageListItem
                      key={msg.id}
                      message={msg}
                      senderName={sender?.name || 'Unknown'}
                      isSelected={selectedMessageId === msg.id}
                      isUnread={isUnread && selectedFolder === 'inbox'}
                      onSelect={handleSelectMessage}
                    />
                  );
                })
              ) : (
                  <div className="p-6 text-center text-gray-500 h-full flex items-center justify-center">
                      <p>No messages found.</p>
                  </div>
              )}
            </div>
          </div>
      </div>
      <div className={`
        flex-1 
        ${selectedMessageId ? 'block' : 'hidden'} md:block
      `}>
        {selectedMessage ? (
          <MessageDetailView 
            message={selectedMessage} 
            users={users} 
            onReply={onReply}
            currentFolder={selectedFolder}
            onBack={() => setSelectedMessageId(null)}
            onArchive={(messageId, isArchived) => onUpdateMessageStatus(messageId, currentUser.id, { isArchived })}
            onDelete={(messageId, isDeleted) => {
                 if(selectedMessage.senderId === currentUser.id) {
                     onUpdateMessageStatus(messageId, currentUser.id, { isDeleted })
                 } else {
                     onUpdateMessageStatus(messageId, currentUser.id, { isDeleted })
                 }
            }}
            onPermanentDelete={(messageId) => onPermanentlyDeleteMessage(messageId, currentUser.id)}
          />
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 h-full hidden md:flex items-center justify-center">
            <p>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;