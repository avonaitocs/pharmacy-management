

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { User, UserRole, KnowledgeResource, Folder } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import FolderIcon from './icons/FolderIcon';
import PencilIcon from './icons/PencilIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import { askKnowledgeBase } from '../services/knowledgeBaseService';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import XCircleIcon from './icons/XCircleIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import EllipsisVerticalIcon from './icons/EllipsisVerticalIcon';
import DisclaimerModal from './DisclaimerModal';


pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

interface KnowledgeBasePageProps {
  currentUser: User;
  knowledgeResources: KnowledgeResource[];
  folders: Folder[];
  onAddResource: (resource: Omit<KnowledgeResource, 'id'>) => void;
  onUpdateResource: (resource: KnowledgeResource) => void;
  onDeleteResource: (resourceId: string) => void;
  onAddFolder: (name: string) => void;
  onUpdateFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
}

const ResourceEditModal: React.FC<{
    resource: KnowledgeResource;
    folders: Folder[];
    onClose: () => void;
    onSave: (resource: KnowledgeResource) => void;
}> = ({ resource, folders, onClose, onSave }) => {
    const [title, setTitle] = useState(resource.title);
    const [content, setContent] = useState(resource.content);
    const [folderId, setFolderId] = useState(resource.folderId || '');
    const [tags, setTags] = useState(resource.tags || []);
    const [tagInput, setTagInput] = useState('');

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

    const handleAddTag = () => {
        const newTag = tagInput.trim().toLowerCase();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please provide a title.');
            return;
        }
        onSave({ ...resource, title, content, folderId: folderId || undefined, tags, updatedAt: new Date().toISOString() });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Resource</h2>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="res-title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input id="res-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="res-content" className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea id="res-content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="res-folder" className="block text-sm font-medium text-gray-700">Folder</label>
                        <select id="res-folder" value={folderId} onChange={(e) => setFolderId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md">
                            <option value="">Uncategorized</option>
                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div>
                      <label htmlFor="res-tags" className="block text-sm font-medium text-gray-700">Tags</label>
                      <div className="mt-1 flex">
                        <input 
                          id="res-tags" 
                          type="text" 
                          value={tagInput} 
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add a tag and press Enter"
                          className="flex-grow px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                        <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-200 text-gray-700 border-t border-b border-r border-gray-300 rounded-r-md hover:bg-gray-300">Add</button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <span key={tag} className="flex items-center bg-brand-light text-brand-dark text-xs font-medium px-2.5 py-1 rounded-full">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-brand-dark hover:text-brand-primary">
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 bg-gray-50 border-t space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const FolderModal: React.FC<{
    folder?: Folder;
    onClose: () => void;
    onSave: (name: string) => void;
}> = ({ folder, onClose, onSave }) => {
    const [name, setName] = useState(folder?.name || '');

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

    const handleSave = () => {
        if (!name.trim()) {
            alert('Please provide a folder name.');
            return;
        }
        onSave(name);
        onClose();
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold p-6 border-b">{folder ? 'Rename' : 'New'} Folder</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="p-6">
                      <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700">Folder Name</label>
                      <input id="folder-name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" autoFocus />
                  </div>
                  <div className="flex justify-end p-4 bg-gray-50 border-t space-x-2">
                      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">Save</button>
                  </div>
                </form>
            </div>
        </div>
    );
};


const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = (props) => {
  const { currentUser, knowledgeResources, folders, onAddResource, onUpdateResource, onDeleteResource, onAddFolder, onUpdateFolder, onDeleteFolder } = props;
  const [selectedResource, setSelectedResource] = useState<KnowledgeResource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<KnowledgeResource | null>(null);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [currentFolderForModal, setCurrentFolderForModal] = useState<Folder | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  const currentFolderObject = useMemo(() => folders.find(f => f.id === currentFolderId), [folders, currentFolderId]);
  
  const processFile = async (file: File) => {
    if (!file) return;

    try {
        let content: string;
        if (file.type === 'application/pdf') {
            const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map((s: any) => s.str).join(' ');
            }
            content = textContent;
        } else if (file.type.startsWith('text/')) {
            content = await file.text();
        } else {
            alert("Unsupported file type. Please upload a .txt, .md, or .pdf file.");
            return;
        }
        
        const title = file.name.replace(/\.[^/.]+$/, "");
        onAddResource({ 
            title, 
            content, 
            tags: [], 
            folderId: currentFolderId || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to read file. Please ensure it is a valid text or PDF file.");
    }
  };

  const handleBrowseClick = () => {
    setIsDisclaimerModalOpen(true);
  };
  
  const handleDisclaimerConfirm = () => {
    setIsDisclaimerModalOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    if(event.target) event.target.value = '';
  };

  const handleEditResource = (resource: KnowledgeResource) => {
    setCurrentResource(resource);
    setIsModalOpen(true);
  };
  
  const handleSaveResource = (resource: KnowledgeResource) => {
    onUpdateResource(resource);
    setIsModalOpen(false);
    setCurrentResource(null);
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Full document content copied to clipboard!');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const foldersInView = useMemo(() => {
      if(currentFolderId === null) {
        return folders.sort((a,b) => a.name.localeCompare(b.name));
      }
      return [];
  }, [folders, currentFolderId]);

  const resourcesInView = useMemo(() => {
    return knowledgeResources
      .filter(r => (r.folderId || null) === currentFolderId)
      .sort((a,b) => a.title.localeCompare(b.title));
  }, [knowledgeResources, currentFolderId]);


  const renderAdminView = () => {

    const ItemMenu: React.FC<{item: Folder | KnowledgeResource, type: 'folder' | 'resource'}> = ({item, type}) => (
      <div className="relative" ref={openMenuId === item.id ? menuRef : null}>
          <button onClick={() => setOpenMenuId(prev => prev === item.id ? null : item.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200">
              <EllipsisVerticalIcon className="w-5 h-5"/>
          </button>
          {openMenuId === item.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20 animate-fade-in">
                  <button 
                      onClick={() => { type === 'folder' ? setCurrentFolderForModal(item as Folder) : handleEditResource(item as KnowledgeResource); setOpenMenuId(null); type==='folder' && setIsFolderModalOpen(true) }} 
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <PencilIcon className="w-5 h-5 mr-3"/> {type === 'folder' ? 'Rename' : 'Edit'}
                  </button>
                  <button 
                      onClick={() => { window.confirm(`Delete ${type} "${item.name || item.title}"?`) && (type === 'folder' ? onDeleteFolder(item.id) : onDeleteResource(item.id)); setOpenMenuId(null);}} 
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <TrashIcon className="w-5 h-5 mr-3"/> Delete
                  </button>
              </div>
          )}
      </div>
    );
      
    return (
      <div className="bg-white p-4 rounded-lg border h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 flex-shrink-0">
            <div className="text-sm font-medium text-gray-500">
              <button onClick={() => setCurrentFolderId(null)} className="hover:underline hover:text-brand-primary">Knowledge Base</button>
              {currentFolderObject && <span> / {currentFolderObject.name}</span>}
            </div>
            <div className="relative" ref={addMenuRef}>
                <button 
                  onClick={() => setIsAddMenuOpen(prev => !prev)} 
                  className="flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add
                </button>
                {isAddMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20 animate-fade-in">
                      <button onClick={() => { handleBrowseClick(); setIsAddMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <ArrowUpTrayIcon className="w-5 h-5 mr-3"/> Upload File
                      </button>
                      <button onClick={() => { setCurrentFolderForModal(undefined); setIsFolderModalOpen(true); setIsAddMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FolderIcon className="w-5 h-5 mr-3"/> New Folder
                      </button>
                  </div>
                )}
            </div>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Last Modified</th>
                <th className="py-2 px-4 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Tags</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {foldersInView.map(folder => (
                <tr key={folder.id} className="group hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <button onClick={() => setCurrentFolderId(folder.id)} className="flex items-center text-left w-full">
                      <FolderIcon className="w-6 h-6 text-brand-primary mr-3 flex-shrink-0" />
                      <span className="font-medium text-gray-800 truncate">{folder.name}</span>
                    </button>
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-500 hidden sm:table-cell">--</td>
                  <td className="py-2 px-4 text-sm text-gray-500 hidden md:table-cell">--</td>
                  <td className="py-2 px-4 text-right"><ItemMenu item={folder} type="folder" /></td>
                </tr>
              ))}
              {resourcesInView.map(res => (
                <tr key={res.id} className="group hover:bg-gray-50">
                   <td className="py-2 px-4">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-6 h-6 text-gray-500 mr-3 flex-shrink-0" />
                        <span className="font-medium text-gray-800 truncate">{res.title}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-500 hidden sm:table-cell">{new Date(res.updatedAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(res.tags || []).map(tag => <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">#{tag}</span>)}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right"><ItemMenu item={res} type="resource" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {foldersInView.length === 0 && resourcesInView.length === 0 && (
             <div className="text-center py-12 text-gray-500">
                <p>This folder is empty.</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // USER VIEW related logic
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    if (selectedResource) {
      setChatHistory([{
        role: 'model',
        content: `I'm ready to answer questions about "${selectedResource.title}". How can I help?`
      }]);
      setUserInput('');
    }
  }, [selectedResource]);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !selectedResource) return;
    
    const userMessage: ChatMessage = { role: 'user', content: userInput.trim() };
    setChatHistory(prev => [...prev, userMessage]);
    const currentInput = userInput.trim();
    setUserInput('');
    setIsLoading(true);

    try {
      const answer = await askKnowledgeBase(currentInput, selectedResource.content);
      const modelMessage: ChatMessage = { role: 'model', content: answer };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Failed to get answer:", error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: "Sorry, I encountered an error while trying to answer your question. Please try again."
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
             {isModel && <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">AI</div>}
             <div className={`max-w-md lg:max-w-lg p-3 rounded-xl ${isModel ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-brand-primary text-white rounded-br-none'}`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
        </div>
    );
  };
  
  const foldersForUser = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return folders
      .filter(folder => {
          const folderNameMatches = searchTerm ? folder.name.toLowerCase().includes(lowercasedFilter) : true;
          const resourcesInside = knowledgeResources.some(res => res.folderId === folder.id && (!activeTag || (res.tags || []).includes(activeTag)));
          return folderNameMatches || (resourcesInside && !searchTerm);
      })
      .sort((a,b) => a.name.localeCompare(b.name));
  },[searchTerm, knowledgeResources, activeTag, folders]);

  const resourcesForUser = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return knowledgeResources
      .filter(res => {
        const matchesFolder = res.folderId === currentFolderId;
        const matchesSearch = !searchTerm || res.title.toLowerCase().includes(lowercasedFilter);
        const matchesTag = !activeTag || (res.tags && res.tags.includes(activeTag));
        // If in a folder, only show items inside. If not, show only uncategorized.
        return matchesFolder && matchesSearch && matchesTag;
      })
      .sort((a,b) => a.title.localeCompare(b.title));
  }, [searchTerm, knowledgeResources, currentFolderId, activeTag]);

  const allTags = useMemo(() => {
      const tags = new Set<string>();
      knowledgeResources.forEach(res => (res.tags || []).forEach(tag => tags.add(tag)));
      return Array.from(tags).sort();
  }, [knowledgeResources]);

  const renderUserView = () => {
    return (
        <div className="flex h-full overflow-hidden">
            {/* Left Panel */}
            <div className={`w-full md:w-2/5 lg:w-1/3 border-r bg-gray-50 p-4 flex flex-col transition-all duration-300 ${selectedResource && 'hidden md:flex'}`}>
                <input 
                  type="text" 
                  placeholder="Search resources..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 mb-4 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" 
                />
                
                <div className="flex-grow overflow-y-auto pr-1">
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    <button onClick={() => setCurrentFolderId(null)} className={`hover:underline ${currentFolderId === null ? 'text-brand-primary font-semibold' : 'hover:text-brand-primary'}`}>Knowledge Base</button>
                    {currentFolderObject && <span> / {currentFolderObject.name}</span>}
                  </div>
                  
                  {currentFolderId === null && foldersForUser.map(folder => (
                      <button key={folder.id} onClick={() => setCurrentFolderId(folder.id)} className="w-full flex items-center p-2 text-left font-semibold text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                        <FolderIcon className="w-5 h-5 mr-3 text-brand-primary flex-shrink-0" />
                        <span className="truncate flex-grow">{folder.name}</span>
                      </button>
                  ))}
                  
                  <div className="mt-2 space-y-1">
                      {resourcesForUser.map(res => (
                          <button key={res.id} onClick={() => setSelectedResource(res)} className={`w-full text-left p-2 rounded-md transition-colors ${selectedResource?.id === res.id ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-brand-light'}`}>
                              <p className="font-medium text-sm truncate">{res.title}</p>
                          </button>
                      ))}
                  </div>

                  {resourcesForUser.length === 0 && (currentFolderId !== null || foldersForUser.length === 0) && (
                      <div className="text-center text-sm text-gray-500 pt-8">No resources found.</div>
                  )}
                </div>

                {allTags.length > 0 && (
                  <div className="mt-4 pt-4 border-t flex-shrink-0">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Filter by Tag</h4>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button key={tag} onClick={() => setActiveTag(prev => prev === tag ? null : tag)} className={`text-xs px-2.5 py-1 rounded-full transition-colors ${activeTag === tag ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>

             {/* Right Panel (Chat) */}
            <div className={`w-full md:w-3/5 lg:w-2/3 p-4 sm:p-6 flex flex-col ${!selectedResource && 'hidden md:flex'}`}>
              {selectedResource ? (
                <>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <div className="flex items-center min-w-0">
                      <button onClick={() => setSelectedResource(null)} className="md:hidden p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100">
                          <ArrowLeftIcon className="w-5 h-5"/>
                      </button>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{selectedResource.title}</h2>
                    </div>
                    <button onClick={() => handleCopyContent(selectedResource.content)} className="flex items-center px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 flex-shrink-0 ml-2">
                        <DocumentDuplicateIcon className="w-4 h-4 mr-2"/> Copy Text
                    </button>
                  </div>
                  <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 space-y-6">
                    {chatHistory.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                    {isLoading && (
                        <div className="flex justify-start">
                           <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0 text-white font-bold text-xs mr-3">AI</div>
                            <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="relative">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            placeholder="Ask a question about this document..."
                            className="w-full pl-4 pr-12 py-3 bg-white text-gray-900 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !userInput.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-brand-primary hover:bg-brand-dark disabled:bg-gray-300 transition-colors"
                            aria-label="Send message"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                   <div className="text-center text-gray-500">
                      <ArrowLeftIcon className="w-12 h-12 mx-auto text-gray-300"/>
                      <h3 className="mt-2 text-lg font-medium">Select a resource</h3>
                      <p>Choose a document from the left to start a chat.</p>
                   </div>
                </div>
              )}
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white p-0 sm:p-6 rounded-xl shadow-lg h-full animate-fade-in overflow-hidden">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.pdf" />
        {currentUser.role === UserRole.Admin ? renderAdminView() : renderUserView()}
        {isModalOpen && currentResource && (
            <ResourceEditModal 
                resource={currentResource}
                folders={folders}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveResource}
            />
        )}
        {isFolderModalOpen && (
            <FolderModal 
                folder={currentFolderForModal}
                onClose={() => setIsFolderModalOpen(false)}
                onSave={(name) => {
                    if (currentFolderForModal) {
                        onUpdateFolder({ ...currentFolderForModal, name });
                    } else {
                        onAddFolder(name);
                    }
                }}
            />
        )}
        {isDisclaimerModalOpen && (
            <DisclaimerModal
                onClose={() => setIsDisclaimerModalOpen(false)}
                onConfirm={handleDisclaimerConfirm}
            />
        )}
    </div>
  );
};

export default KnowledgeBasePage;