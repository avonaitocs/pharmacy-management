


export interface Attachment {
  name: string;
  type: string;
  content: string; // data URL
}

// Fix: Add and export the View type for consistent use across components.
export type View = 'tasks' | 'users' | 'reports' | 'archives' | 'messages' | 'pending' | 'knowledgeBase' | 'account';

export enum UserRole {
  Admin = 'ADMIN',
  Employee = 'EMPLOYEE',
}

export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Archived = 'ARCHIVED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  password: string;  // This will be removed later (Firebase handles it)
  forcePasswordChange: boolean;
  theme?: 'light' | 'dark';
  lastLogin?: string;
  organizationId: string;  // ← ADD THIS LINE if it's not there
}

export enum TaskStatus {
  ToDo = 'TO_DO',
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
  PendingApproval = 'PENDING_APPROVAL',
}

export enum TaskPriority {
  Urgent = 'URGENT',
  Important = 'IMPORTANT',
  General = 'GENERAL',
}

export enum RecurrenceFrequency {
  Daily = 'DAILY',
  Weekly = 'WEEKLY',
  Biweekly = 'BIWEEKLY',
  Monthly = 'MONTHLY',
}

export interface TaskComment {
  id: string;
  authorId: string;
  timestamp: string; // ISO string
  text?: string;
  audio?: {
    url: string; // Blob URL
    transcription: string;
  };
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Task {
  id:string;
  title: string;
  checklist: ChecklistItem[];
  assigneeIds: string[];
  deadline: string; // ISO string format
  status: TaskStatus;
  isPrivate: boolean;
  priority: TaskPriority;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceEndDate: string | null; // ISO string format
  isArchived: boolean;
  createdBy: string;
  comments: TaskComment[];
  completedAt?: string | null;
}

export interface MessageRecipient {
  userId: string;
  isRead: boolean;
  isArchived: boolean;
  isDeleted: boolean; // Soft delete
}

export interface Message {
  id: string;
  senderId: string;
  senderDeleted?: boolean; // If sender deletes from their "Sent"
  recipients: MessageRecipient[];
  subject: string;
  body: string;
  timestamp: string; // ISO string
  attachments?: Attachment[];
}

export interface Folder {
  id: string;
  name: string;
}

export interface KnowledgeResource {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tags?: string[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}