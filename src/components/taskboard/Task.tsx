import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task, PRIORITY_CONFIG, TYPE_CONFIG } from './types';

interface SortableTaskProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  isOverlay?: boolean;
}

const PriorityIcon = ({ priority }: { priority: Task['priority'] }) => {
  const arrows: Record<string, string> = {
    highest: '⬆⬆', high: '⬆', medium: '—', low: '⬇', lowest: '⬇⬇',
  };
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`text-xs font-bold ${config.color}`} title={config.label}>
      {arrows[priority]}
    </span>
  );
};

export const SortableTask = ({ task, onDelete, onEdit, isOverlay }: SortableTaskProps) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: task.id, disabled: isOverlay });

  const style = isOverlay ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConf = TYPE_CONFIG[task.type];

  return (
    <Card
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`group cursor-grab active:cursor-grabbing border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-150 ${isDragging ? 'opacity-30 scale-95' : ''} ${isOverlay ? 'shadow-2xl ring-2 ring-primary/40 rotate-2 scale-105' : ''}`}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
    >
      <div className="p-3 space-y-2.5">
        {/* Type badge row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${typeConf.color}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {task.key}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <p className="text-sm font-medium leading-snug line-clamp-2">
          {task.title}
        </p>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 font-normal"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{task.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div className="flex items-center gap-2">
            <PriorityIcon priority={task.priority} />
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal gap-1">
              {typeConf.icon} {typeConf.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            {task.endDate && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
            {task.assignee && (
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[9px] font-bold text-primary">
                  {task.assignee.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
