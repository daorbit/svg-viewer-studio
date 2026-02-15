import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DroppableColumn, TaskForm, ColumnForm, useTaskBoard } from '@/components/taskboard';

const TaskBoard = () => {
  const {
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
  } = useTaskBoard();

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <div className="flex gap-2">
          <ColumnForm onAddColumn={addColumn} />
          <TaskForm columns={columns} onAddTask={addTask} />
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