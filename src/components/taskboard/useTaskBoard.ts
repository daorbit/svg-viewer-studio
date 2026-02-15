import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, Column, STORAGE_KEY_TASKS, STORAGE_KEY_COLUMNS, defaultColumns } from './types';

export const useTaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const addColumn = (columnData: Omit<Column, 'id'>) => {
    const newColumn: Column = {
      ...columnData,
      id: Date.now().toString(),
    };
    setColumns([...columns, newColumn]);
  };

  const deleteColumn = (id: string) => {
    setColumns(columns.filter((c) => c.id !== id));
    // Also remove tasks in that column
    setTasks(tasks.filter((t) => t.status !== id));
  };

  return {
    tasks,
    columns,
    activeTask,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    addTask,
    deleteTask,
    addColumn,
    deleteColumn,
  };
};