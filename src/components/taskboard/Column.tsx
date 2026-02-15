import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortableTask } from './Task';
import { Column, Task } from './types';

interface DroppableColumnProps {
  column: Column;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onDeleteColumn: (id: string) => void;
}

export const DroppableColumn = ({ column, tasks, onDeleteTask, onDeleteColumn }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnTasks = tasks.filter((t) => t.status === column.id);

  return (
    <div
      ref={setNodeRef}
      className={`pl-4 pt-4 pb-4 pr-2 rounded-lg ${column.color} h-full min-w-[400px] flex flex-col ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{column.title}</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteColumn(column.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <SortableContext
        items={columnTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="space-y-2 flex-1 overflow-y-auto task-scroll"
          style={{
            paddingRight: '8px',
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              .task-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .task-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .task-scroll::-webkit-scrollbar-thumb {
                background: transparent;
                border-radius: 3px;
              }
              .task-scroll:hover::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.3);
              }
              .task-scroll {
                scrollbar-width: thin;
                scrollbar-color: transparent transparent;
              }
              .task-scroll:hover {
                scrollbar-color: auto;
              }
            `
          }} />
          {columnTasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};