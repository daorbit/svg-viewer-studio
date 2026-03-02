import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortableTask } from './Task';
import { Column, Task } from './types';

interface DroppableColumnProps {
  column: Column;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onDeleteColumn: (id: string) => void;
  onEditTask?: (task: Task) => void;
}

export const DroppableColumn = ({ column, tasks, onDeleteTask, onDeleteColumn, onEditTask }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const columnTasks = tasks.filter((t) => t.status === column.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[240px] flex-1 rounded-xl transition-all duration-200 ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : 'bg-muted/30'}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {column.title}
          </h3>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
            {columnTasks.length}
          </span>
          {column.limit && columnTasks.length > column.limit && (
            <span className="text-[10px] text-destructive font-semibold">
              /{column.limit}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => onDeleteColumn(column.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tasks list */}
      <SortableContext
        items={columnTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
          {columnTasks.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-border/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Drop tasks here</p>
            </div>
          )}
          {columnTasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
