import React, { useState, useEffect } from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
// Fix: Import UserStatus to check for active users correctly.
import { User, UserRole, UserStatus } from '../types';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import PrinterIcon from './icons/PrinterIcon';

interface DailyBriefingModalProps {
  report: string;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  currentUser: User;
  users: User[];
  onSendMessage: (recipientIds: string[], subject: string, body: string) => void;
}

const DailyBriefingModal: React.FC<DailyBriefingModalProps> = ({ report, isLoading, error, onClose, currentUser, users, onSendMessage }) => {
  const [isSelectingRecipients, setIsSelectingRecipients] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Fix: Filter employees based on their 'status' instead of a non-existent 'isArchived' property.
  const employees = users.filter(u => u.role === UserRole.Employee && u.status === UserStatus.Active);

  const handleToggleRecipient = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendMessage = () => {
    if (selectedUserIds.length > 0 && report) {
      const subject = `Daily Briefing for ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
      onSendMessage(selectedUserIds, subject, report);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setIsSelectingRecipients(false);
        setSelectedUserIds([]);
      }, 2500);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Enter') {
        // Prevent Enter from acting if loading or during success message display
        if (isLoading || sendSuccess) return;

        if (isSelectingRecipients) {
          // Trigger send only if there are recipients
          if (selectedUserIds.length > 0) {
            handleSendMessage();
          }
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isLoading, sendSuccess, isSelectingRecipients, selectedUserIds, report, onSendMessage]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      let htmlOutput = '';
      const lines = report.split('\n');
      let inList = false;

      for(const line of lines) {
          const trimmedLine = line.trim();
          const isListItem = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ') || trimmedLine.match(/^\d+\.\s/);
          
          if (isListItem && !inList) {
              htmlOutput += '<ul>';
              inList = true;
          }
          if (!isListItem && inList) {
              htmlOutput += '</ul>';
              inList = false;
          }

          if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
              htmlOutput += `<h2>${trimmedLine.replace(/\*\*/g, '')}</h2>`;
          } else if (isListItem) {
                const content = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ') ? trimmedLine.substring(2) : trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim();
                htmlOutput += `<li>${content}</li>`;
          } else if (trimmedLine === '') {
              // We can ignore empty lines for a cleaner print view
          } else {
              htmlOutput += `<p>${trimmedLine}</p>`;
          }
      }
      if (inList) {
          htmlOutput += '</ul>'; // Close any open list at the end
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Daily Briefing - ${today}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 0 20px; }
              h1 { color: #00294D; font-size: 24px; }
              h2 { font-size: 18px; color: #00529B; border-bottom: 2px solid #D0EFFF; padding-bottom: 8px; margin-top: 2em; }
              p { margin: 0 0 1em 0; }
              ul { padding-left: 20px; margin-bottom: 1em; }
              li { margin-bottom: 0.5em; }
            </style>
          </head>
          <body>
            <h1>AI Daily Briefing</h1>
            <p style="color: #666; font-size: 14px;">Report for ${today}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            ${htmlOutput}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
          printWindow.print();
          printWindow.close();
      }, 250);
    }
  };

  const formatReport = (text: string) => {
    return text
        .split('\n')
        .map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={index} className="font-bold text-lg text-gray-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</p>;
            }
            if (line.match(/^\d+\./)) {
                return <li key={index} className="text-gray-700 ml-4">{line.substring(line.indexOf('.') + 1).trim()}</li>;
            }
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                return <li key={index} className="text-gray-700 ml-4 list-disc">{line.trim().substring(2)}</li>;
            }
            return <p key={index} className="text-gray-700 mb-2">{line}</p>;
        });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <DocumentTextIcon className="w-7 h-7 text-brand-primary" />
          <h2 className="text-2xl font-bold text-gray-800">AI-Generated Daily Briefing</h2>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Generating your daily briefing...</p>
                <p className="text-sm text-gray-500">This may take a moment.</p>
            </div>
          )}
          {error && (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-lg font-semibold text-danger">Failed to Generate Briefing</p>
                <p className="mt-2 text-sm text-gray-600 bg-red-50 p-3 rounded-md">{error}</p>
            </div>
          )}
          {report && !isLoading && (
            <>
              <div className="prose max-w-none">
                {formatReport(report)}
              </div>
              {isSelectingRecipients && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Recipients</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {employees.map(user => (
                      <label key={user.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => handleToggleRecipient(user.id)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ml-3"/>
                        <span className="ml-3 text-sm text-gray-700">{user.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end p-4 bg-gray-50 border-t space-x-3">
          {isSelectingRecipients ? (
            <>
              <button
                onClick={() => setIsSelectingRecipients(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={selectedUserIds.length === 0 || sendSuccess}
                className={`flex items-center justify-center w-32 px-4 py-2 text-white font-semibold rounded-md transition-colors ${sendSuccess ? 'bg-green-500' : 'bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-300'}`}
              >
                {sendSuccess ? 'Sent!' : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                    Send
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {report && (
                <button
                  onClick={handlePrint}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700"
                >
                  <PrinterIcon className="w-5 h-5 mr-2" />
                  Print
                </button>
              )}
              {currentUser.role === UserRole.Admin && report && (
                <button
                  onClick={() => setIsSelectingRecipients(true)}
                  className="flex items-center px-4 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-blue-600"
                >
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  Send as Message
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyBriefingModal;