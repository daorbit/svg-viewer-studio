import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DroppableColumn, TaskForm, ColumnForm, useTaskBoard, PRIORITY_CONFIG, TYPE_CONFIG } from '@/components/taskboard';
import { TaskCard } from '@/components/taskboard/Task';
import { Search, LayoutGrid, Filter } from 'lucide-react';
import type { Task } from '@/components/taskboard/types';

const TaskBoard = () => {
  const {
    tasks, allTasks, columns, activeTask, sensors,
    searchQuery, setSearchQuery, filterPriority, setFilterPriority, filterType, setFilterType,
    handleDragStart, handleDragEnd, handleDragOver,
    addTask, updateTask, deleteTask, addColumn, deleteColumn,
  } = useTaskBoard();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === 'done').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Board</h1>
              <p className="text-xs text-muted-foreground">
                {totalTasks} issues · {doneTasks} done
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColumnForm onAddColumn={addColumn} />
            <TaskForm columns={columns} onAddTask={addTask} />
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-background"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    <span className={v.color}>{v.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(filterType !== 'all' || filterPriority !== 'all' || searchQuery) && (
            <Badge
              variant="secondary"
              className="text-[10px] cursor-pointer hover:bg-destructive/10"
              onClick={() => { setFilterType('all'); setFilterPriority('all'); setSearchQuery(''); }}
            >
              Clear filters ×
            </Badge>
          )}
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 p-4 h-full min-w-max">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={tasks}
                onDeleteTask={deleteTask}
                onDeleteColumn={deleteColumn}
                onEditTask={setEditingTask}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="w-[260px]">
              <TaskCard task={activeTask} className="shadow-2xl ring-2 ring-primary/40 opacity-90" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit dialog */}
      {editingTask && (
        <TaskForm
          columns={columns}
          onAddTask={addTask}
          editingTask={editingTask}
          onUpdateTask={updateTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default TaskBoard;
