import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Calendar, Tag, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from './types';

interface SortableTaskProps {
  task: Task;
  onDelete: (id: string) => void;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'medium':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'low':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    default:
      return null;
  }
};

export const SortableTask = ({ task, onDelete }: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-sm">{task.title}</CardTitle>
              {getPriorityIcon(task.priority)}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(task.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {task.endDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(task.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div
            className="text-sm text-muted-foreground prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};