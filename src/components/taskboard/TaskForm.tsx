import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Task, Column, TYPE_CONFIG, PRIORITY_CONFIG } from './types';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  columns: Column[];
  onAddTask: (task: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt'>) => void;
  editingTask?: Task | null;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onClose?: () => void;
}

export const TaskForm = ({ columns, onAddTask, editingTask, onUpdateTask, onClose }: TaskFormProps) => {
  const [open, setOpen] = useState(false);
  const isEdit = !!editingTask;

  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [tags, setTags] = useState(editingTask?.tags.join(', ') || '');
  const [priority, setPriority] = useState<Task['priority']>(editingTask?.priority || 'medium');
  const [type, setType] = useState<Task['type']>(editingTask?.type || 'task');
  const [status, setStatus] = useState(editingTask?.status || columns[0]?.id || 'todo');
  const [assignee, setAssignee] = useState(editingTask?.assignee || '');
  const [startDate, setStartDate] = useState(editingTask?.startDate || '');
  const [endDate, setEndDate] = useState(editingTask?.endDate || '');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    
    if (isEdit && onUpdateTask && editingTask) {
      onUpdateTask(editingTask.id, {
        title, description, tags: parsedTags, priority, type, status, assignee: assignee || undefined,
        startDate: startDate || undefined, endDate: endDate || undefined,
      });
      onClose?.();
    } else {
      onAddTask({
        title, description, tags: parsedTags, priority, type, status, assignee: assignee || undefined,
        startDate: startDate || undefined, endDate: endDate || undefined,
      });
      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setTags(''); setPriority('medium');
    setType('task'); setStatus(columns[0]?.id || 'todo'); setAssignee('');
    setStartDate(''); setEndDate('');
  };

  const formContent = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title *</Label>
        <Input placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</Label>
          <Select value={type} onValueChange={(v: Task['type']) => setType(v)}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</Label>
          <Select value={priority} onValueChange={(v: Task['priority']) => setPriority(v)}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  <span className={v.color}>{v.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
        <Textarea placeholder="Add a description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="text-sm resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignee</Label>
          <Input placeholder="Name" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Labels</Label>
          <Input placeholder="bug, urgent, frontend" value={tags} onChange={(e) => setTags(e.target.value)} className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm" />
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full">
        {isEdit ? 'Update Issue' : 'Create Issue'}
      </Button>
    </div>
  );

  // If editing, render inline (controlled by parent)
  if (isEdit) {
    return (
      <Dialog open={true} onOpenChange={() => onClose?.()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="text-xs font-mono text-muted-foreground">{editingTask?.key}</span>
              Edit Issue
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Create Issue</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};
