import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, DatePicker, Form, message } from 'antd';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select as RadixSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DroppableColumn, SortableTask, RichTextEditor, Task, Column, STORAGE_KEY_TASKS, STORAGE_KEY_COLUMNS, defaultColumns } from '@/components/taskboard';

const TaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [newTaskStartDate, setNewTaskStartDate] = useState(null);
  const [newTaskEndDate, setNewTaskEndDate] = useState(null);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState('todo');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('bg-gray-100');
 

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Ensure backward compatibility by adding default values for new fields
      const updatedTasks = parsedTasks.map((task) => ({
        ...task,
        tags: task.tags || [],
        priority: task.priority || 'medium',
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString(),
      }));
      setTasks(updatedTasks);
    }
    const savedColumns = localStorage.getItem(STORAGE_KEY_COLUMNS);
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveATask = tasks.some((t) => t.id === activeId);
    const isOverATask = tasks.some((t) => t.id === overId);
    const isOverAColumn = columns.some((c) => c.id === overId);

    if (!isActiveATask) return;

    // Dropping on a column
    if (isOverAColumn) {
      setTasks((tasks) =>
        tasks.map((t) =>
          t.id === activeId ? { ...t, status: overId as Task['status'] } : t
        )
      );
    }
    // Dropping on another task
    else if (isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          // Moving to different column
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        } else {
          // Reordering within same column
          return arrayMove(tasks, activeIndex, overIndex);
        }
      });
    }
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const tags = newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      status: newTaskStatus,
      tags,
      startDate: newTaskStartDate ? newTaskStartDate.format('YYYY-MM-DD') : undefined,
      endDate: newTaskEndDate ? newTaskEndDate.format('YYYY-MM-DD') : undefined,
      priority: newTaskPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskTags('');
    setNewTaskStartDate(null);
    setNewTaskEndDate(null);
    setNewTaskPriority('medium');
    setNewTaskStatus('todo');
    setIsDialogOpen(false);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: Column = {
      id: Date.now().toString(),
      title: newColumnTitle,
      color: newColumnColor,
    };

    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setNewColumnColor('bg-gray-100');
    setIsColumnDialogOpen(false);
  };

  const deleteColumn = (id: string) => {
    setColumns(columns.filter((c) => c.id !== id));
    // Also remove tasks in that column
    setTasks(tasks.filter((t) => t.status !== id));
  };

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <div className="flex gap-2">
          <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Column</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Column name"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                >
                  <option value="bg-gray-100">Gray</option>
                  <option value="bg-blue-100">Blue</option>
                  <option value="bg-green-100">Green</option>
                  <option value="bg-yellow-100">Yellow</option>
                  <option value="bg-red-100">Red</option>
                  <option value="bg-purple-100">Purple</option>
                </select>
                <Button onClick={addColumn} className="w-full">
                  Add Column
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 h-full">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={tasks}
              onDeleteTask={deleteTask}
              onDeleteColumn={deleteColumn}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <Card className="cursor-move">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{activeTask.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {activeTask.description}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default TaskBoard;