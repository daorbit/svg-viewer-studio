import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from 'antd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Column } from '@/components/taskboard';
import { Plus } from 'lucide-react';

interface ColumnFormProps {
  onAddColumn: (column: Omit<Column, 'id'>) => void;
}

export const ColumnForm = ({ onAddColumn }: ColumnFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('bg-gray-100');

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: Omit<Column, 'id'> = {
      title: newColumnTitle,
      color: newColumnColor,
    };

    onAddColumn(newColumn);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNewColumnTitle('');
    setNewColumnColor('bg-gray-100');
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
  );
};