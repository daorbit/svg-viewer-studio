import { useState, useEffect, useMemo } from 'react';
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, Column, STORAGE_KEY_TASKS, STORAGE_KEY_COLUMNS, STORAGE_KEY_COUNTER, defaultColumns } from './types';

export const useTaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [counter, setCounter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks(parsed.map((t: any) => ({
        ...t,
        key: t.key || `TASK-${t.id}`,
        tags: t.tags || [],
        type: t.type || 'task',
        priority: t.priority || 'medium',
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString(),
      })));
    }
    const savedColumns = localStorage.getItem(STORAGE_KEY_COLUMNS);
    if (savedColumns) setColumns(JSON.parse(savedColumns));
    const savedCounter = localStorage.getItem(STORAGE_KEY_COUNTER);
    if (savedCounter) setCounter(parseInt(savedCounter));
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns)); }, [columns]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_COUNTER, counter.toString()); }, [counter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.key.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      return true;
    });
  }, [tasks, searchQuery, filterPriority, filterType]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === event.active.id) || null);
  };

  const handleDragEnd = () => { setActiveTask(null); };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isActiveATask = tasks.some((t) => t.id === activeId);
    if (!isActiveATask) return;

    const isOverAColumn = columns.some((c) => c.id === overId);
    const isOverATask = tasks.some((t) => t.id === overId);

    if (isOverAColumn) {
      setTasks((prev) => prev.map((t) => t.id === activeId ? { ...t, status: overId, updatedAt: new Date().toISOString() } : t));
    } else if (isOverATask) {
      setTasks((prev) => {
        const ai = prev.findIndex((t) => t.id === activeId);
        const oi = prev.findIndex((t) => t.id === overId);
        const newTasks = [...prev];
        if (newTasks[ai].status !== newTasks[oi].status) {
          newTasks[ai] = { ...newTasks[ai], status: prev[oi].status, updatedAt: new Date().toISOString() };
        }
        return arrayMove(newTasks, ai, oi);
      });
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      key: `TASK-${counter}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    setCounter((c) => c + 1);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (id: string) => { setTasks((prev) => prev.filter((t) => t.id !== id)); };

  const addColumn = (columnData: Omit<Column, 'id'>) => {
    setColumns((prev) => [...prev, { ...columnData, id: Date.now().toString() }]);
  };

  const deleteColumn = (id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.status !== id));
  };

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    columns,
    activeTask,
    sensors,
    searchQuery,
    setSearchQuery,
    filterPriority,
    setFilterPriority,
    filterType,
    setFilterType,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    addTask,
    updateTask,
    deleteTask,
    addColumn,
    deleteColumn,
  };
};
