// DevTools.tsx - Temporary component to add sample data
// Add this to your app temporarily to populate test data

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface DevToolsProps {
  currentUserId: string;
  organizationId: string;
}

const DevTools: React.FC<DevToolsProps> = ({ currentUserId, organizationId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');

  const addSampleData = async () => {
    setIsAdding(true);
    setMessage('Adding sample data...');

    try {
      // Sample Tasks
      const sampleTasks = [
        {
          title: '📋 Inventory Check - High Value Meds',
          description: 'Verify stock levels for specialty medications and identify any that need reordering',
          organizationId,
          createdBy: currentUserId,
          assigneeIds: [currentUserId],
          status: 'TO_DO',
          priority: 'HIGH',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['inventory', 'high-priority'],
          isPrivate: false,
          isArchived: false,
          isRecurring: false,
          checklist: [
            { id: 'cl1', text: 'Check Humira stock', isCompleted: false },
            { id: 'cl2', text: 'Review Enbrel levels', isCompleted: false },
            { id: 'cl3', text: 'Update spreadsheet', isCompleted: false }
          ],
          comments: [],
          completedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: '💊 Process Prescription Refills',
          description: 'Handle all pending prescription refill requests from phone and online',
          organizationId,
          createdBy: currentUserId,
          assigneeIds: [currentUserId],
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['prescriptions', 'daily'],
          isPrivate: false,
          isArchived: false,
          isRecurring: true,
          recurrenceFrequency: 'DAILY',
          checklist: [
            { id: 'cl1', text: 'Review online requests', isCompleted: true },
            { id: 'cl2', text: 'Process phone requests', isCompleted: false },
            { id: 'cl3', text: 'Contact patients if needed', isCompleted: false }
          ],
          comments: [],
          completedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: '✅ Monthly Stock Take Completed',
          description: 'Successfully completed the monthly inventory audit for all controlled substances',
          organizationId,
          createdBy: currentUserId,
          assigneeIds: [currentUserId],
          status: 'DONE',
          priority: 'HIGH',
          deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['inventory', 'compliance', 'monthly'],
          isPrivate: false,
          isArchived: false,
          isRecurring: true,
          recurrenceFrequency: 'MONTHLY',
          checklist: [
            { id: 'cl1', text: 'Count controlled substances', isCompleted: true },
            { id: 'cl2', text: 'Update CADTH records', isCompleted: true },
            { id: 'cl3', text: 'File documentation', isCompleted: true }
          ],
          comments: [
            {
              id: 'com1',
              text: 'All controlled substances accounted for. No discrepancies found.',
              authorId: currentUserId,
              authorName: 'Mike Wyman',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: '📞 Follow up with Insurance Companies',
          description: 'Contact insurers regarding pending prior authorizations for specialty medications',
          organizationId,
          createdBy: currentUserId,
          assigneeIds: [currentUserId],
          status: 'TO_DO',
          priority: 'MEDIUM',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['insurance', 'admin'],
          isPrivate: false,
          isArchived: false,
          isRecurring: false,
          checklist: [
            { id: 'cl1', text: 'Call Blue Cross re: Patient A', isCompleted: false },
            { id: 'cl2', text: 'Email Medavie re: Patient B', isCompleted: false },
            { id: 'cl3', text: 'Follow up on pending cases', isCompleted: false }
          ],
          comments: [],
          completedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: '🔄 Update Medication Database',
          description: 'Add new medications to the system and update pricing information',
          organizationId,
          createdBy: currentUserId,
          assigneeIds: [currentUserId],
          status: 'TO_DO',
          priority: 'LOW',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['database', 'admin'],
          isPrivate: false,
          isArchived: false,
          isRecurring: false,
          checklist: [
            { id: 'cl1', text: 'Add 5 new products', isCompleted: false },
            { id: 'cl2', text: 'Update pricing', isCompleted: false }
          ],
          comments: [],
          completedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Add tasks
      for (const task of sampleTasks) {
        await addDoc(collection(db, 'tasks'), task);
      }
      
      // Sample Knowledge Resources
      const sampleResources = [
        {
          title: 'Pharmacy Standard Operating Procedures',
          description: 'Complete guide to our pharmacy operations, protocols, and best practices',
          type: 'document',
          url: 'https://docs.google.com/document/d/your-sop-doc',
          tags: ['procedures', 'operations', 'training'],
          folderId: null,
          organizationId,
          createdBy: currentUserId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: 'Controlled Substances Handling Guide',
          description: 'Provincial regulations and internal procedures for controlled substances',
          type: 'document',
          url: 'https://docs.google.com/document/d/controlled-guide',
          tags: ['compliance', 'controlled-substances', 'regulations'],
          folderId: null,
          organizationId,
          createdBy: currentUserId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: 'Insurance Prior Authorization Process',
          description: 'Step-by-step guide for handling prior authorizations with major insurers',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=example',
          tags: ['insurance', 'training', 'prior-auth'],
          folderId: null,
          organizationId,
          createdBy: currentUserId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Add knowledge resources
      for (const resource of sampleResources) {
        await addDoc(collection(db, 'knowledgeResources'), resource);
      }

      // Sample Message
      const sampleMessage = {
        subject: 'Welcome to Guardian Fall River Pharmacy Task Manager!',
        body: 'This is a test message to verify the messaging system is working correctly. You can send messages to team members, mark them as read, and organize your communications.',
        senderId: currentUserId,
        senderName: 'Mike Wyman',
        recipients: [
          {
            userId: currentUserId,
            userName: 'Mike Wyman',
            isRead: false,
            isStarred: false,
            isDeleted: false,
            isArchived: false
          }
        ],
        organizationId,
        timestamp: serverTimestamp(),
        senderDeleted: false
      };

      await addDoc(collection(db, 'messages'), sampleMessage);

      setMessage('✅ SUCCESS! All sample data added. Refresh your page!');
      
    } catch (error) {
      console.error('Error adding sample data:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-2xl border-4 border-blue-500 z-50">
      <h3 className="font-bold text-lg mb-2">🛠️ Dev Tools</h3>
      <p className="text-sm text-gray-600 mb-3">Add sample data to test your app</p>
      
      <button
        onClick={addSampleData}
        disabled={isAdding}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isAdding ? '⏳ Adding Data...' : '🚀 Add Sample Data'}
      </button>
      
      {message && (
        <p className={`mt-3 text-sm ${message.includes('SUCCESS') ? 'text-green-600' : message.includes('Error') ? 'text-red-600' : 'text-blue-600'}`}>
          {message}
        </p>
      )}
      
      <p className="text-xs text-gray-500 mt-3">
        Remove this component before production!
      </p>
    </div>
  );
};

export default DevTools;