import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, DatePicker, Form } from 'antd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select as RadixSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor, Task, Column } from '@/components/taskboard';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  columns: Column[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const TaskForm = ({ columns, onAddTask }: TaskFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [newTaskStartDate, setNewTaskStartDate] = useState(null);
  const [newTaskEndDate, setNewTaskEndDate] = useState(null);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState('todo');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const tags = newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: newTaskTitle,
      description: newTaskDescription,
      status: newTaskStatus,
      tags,
      startDate: newTaskStartDate ? newTaskStartDate.format('YYYY-MM-DD') : undefined,
      endDate: newTaskEndDate ? newTaskEndDate.format('YYYY-MM-DD') : undefined,
      priority: newTaskPriority,
    };

    onAddTask(newTask);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskTags('');
    setNewTaskStartDate(null);
    setNewTaskEndDate(null);
    setNewTaskPriority('medium');
    setNewTaskStatus('todo');
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <Form layout="vertical" className="space-y-4">
          <Form.Item label="Title" required>
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </Form.Item>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <RadixSelect value={newTaskStatus} onValueChange={(value) => setNewTaskStatus(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </RadixSelect>
          </div>

          <Form.Item label="Description">
            <RichTextEditor
              content={newTaskDescription}
              onChange={setNewTaskDescription}
              placeholder="Describe the task..."
            />
          </Form.Item>

          <Form.Item label="Tags">
            <Input
              placeholder="urgent, feature, bug"
              value={newTaskTags}
              onChange={(e) => setNewTaskTags(e.target.value)}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                value={newTaskStartDate}
                onChange={(date) => setNewTaskStartDate(date)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                value={newTaskEndDate}
                onChange={(date) => setNewTaskEndDate(date)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <RadixSelect value={newTaskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </RadixSelect>
          </div>

          <Button onClick={addTask} className="w-full">
            Add Task
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};