export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  startDate?: string;
  endDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
}

export const STORAGE_KEY_TASKS = 'task-board-tasks';
export const STORAGE_KEY_COLUMNS = 'task-board-columns';

export const defaultColumns: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];