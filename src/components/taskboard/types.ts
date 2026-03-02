export interface Task {
  id: string;
  key: string; // e.g. "TASK-1"
  title: string;
  description: string;
  status: string;
  tags: string[];
  assignee?: string;
  startDate?: string;
  endDate?: string;
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  type: 'task' | 'bug' | 'story' | 'epic';
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  limit?: number; // WIP limit
}

export const STORAGE_KEY_TASKS = 'task-board-tasks';
export const STORAGE_KEY_COLUMNS = 'task-board-columns';
export const STORAGE_KEY_COUNTER = 'task-board-counter';

export const defaultColumns: Column[] = [
  { id: 'backlog', title: 'BACKLOG', color: 'bg-muted/50' },
  { id: 'todo', title: 'TO DO', color: 'bg-muted/50' },
  { id: 'inprogress', title: 'IN PROGRESS', color: 'bg-muted/50' },
  { id: 'review', title: 'IN REVIEW', color: 'bg-muted/50' },
  { id: 'done', title: 'DONE', color: 'bg-muted/50' },
];

export const PRIORITY_CONFIG = {
  highest: { label: 'Highest', color: 'text-red-600', bg: 'bg-red-500/10' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  medium: { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  low: { label: 'Low', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  lowest: { label: 'Lowest', color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

export const TYPE_CONFIG = {
  epic: { label: 'Epic', color: 'bg-purple-500', icon: '⚡' },
  story: { label: 'Story', color: 'bg-green-500', icon: '📖' },
  task: { label: 'Task', color: 'bg-blue-500', icon: '✓' },
  bug: { label: 'Bug', color: 'bg-red-500', icon: '🐛' },
};
