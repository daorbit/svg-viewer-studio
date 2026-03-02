import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Column } from './types';
import { Columns } from 'lucide-react';

interface ColumnFormProps {
  onAddColumn: (column: Omit<Column, 'id'>) => void;
}

export const ColumnForm = ({ onAddColumn }: ColumnFormProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAddColumn({ title: title.toUpperCase(), color: 'bg-muted/50' });
    setTitle('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Columns className="w-4 h-4" />
          Column
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Add Column</DialogTitle>
          <DialogDescription className="sr-only">Add a new column to the board</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Column Name</Label>
            <Input
              placeholder="e.g. QA Testing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">Add Column</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
