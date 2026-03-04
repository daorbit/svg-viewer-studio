import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  addReminder,
  removeReminder,
  getActiveReminder,
  requestNotificationPermission,
  Reminder,
} from '@/services/notificationService';
import { toast } from 'sonner';

interface ReminderPickerProps {
  type: 'task' | 'note';
  referenceId: string;
  title: string;
  compact?: boolean;
}

const QUICK_OPTIONS = [
  { label: '5 min', minutes: 5 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '3 hours', minutes: 180 },
  { label: 'Tomorrow 9 AM', minutes: -1 },
];

const ReminderPicker = ({ type, referenceId, title, compact = false }: ReminderPickerProps) => {
  const [open, setOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  useEffect(() => {
    setActiveReminder(getActiveReminder(referenceId, type));
  }, [referenceId, type, open]);

  const handleSetReminder = async (minutes: number) => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      toast.error('Please allow notifications in your browser settings');
      return;
    }

    let triggerAt: Date;
    if (minutes === -1) {
      // Tomorrow 9 AM
      triggerAt = new Date();
      triggerAt.setDate(triggerAt.getDate() + 1);
      triggerAt.setHours(9, 0, 0, 0);
    } else {
      triggerAt = new Date(Date.now() + minutes * 60 * 1000);
    }

    const reminder = addReminder(
      type,
      referenceId,
      `⏰ Reminder: ${title}`,
      `Your ${type} "${title}" needs attention!`,
      triggerAt
    );
    setActiveReminder(reminder);
    setOpen(false);
    toast.success(`Reminder set for ${triggerAt.toLocaleString()}`);
  };

  const handleSetCustomReminder = async () => {
    if (!customDate || !customTime) {
      toast.error('Please select both date and time');
      return;
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      toast.error('Please allow notifications in your browser settings');
      return;
    }

    const triggerAt = new Date(`${customDate}T${customTime}`);
    if (triggerAt <= new Date()) {
      toast.error('Please select a future date and time');
      return;
    }

    const reminder = addReminder(
      type,
      referenceId,
      `⏰ Reminder: ${title}`,
      `Your ${type} "${title}" needs attention!`,
      triggerAt
    );
    setActiveReminder(reminder);
    setOpen(false);
    toast.success(`Reminder set for ${triggerAt.toLocaleString()}`);
  };

  const handleCancelReminder = () => {
    removeReminder(referenceId, type);
    setActiveReminder(null);
    toast.info('Reminder cancelled');
  };

  const formatReminderTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'any moment';
    if (diffMins < 60) return `in ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `in ${diffHours}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              {compact ? (
                <button
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                    activeReminder
                      ? 'text-amber-500 hover:bg-amber-500/10'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeReminder ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                </button>
              ) : (
                <Button
                  variant={activeReminder ? 'default' : 'outline'}
                  size="sm"
                  className={`gap-1.5 text-xs ${activeReminder ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeReminder ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  {activeReminder ? formatReminderTime(activeReminder.triggerAt) : 'Remind me'}
                </Button>
              )}
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {activeReminder
              ? `Reminder set ${formatReminderTime(activeReminder.triggerAt)}`
              : 'Set a reminder'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-72 p-3" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              Set Reminder
            </h4>
            {activeReminder && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-destructive hover:text-destructive gap-1"
                onClick={handleCancelReminder}
              >
                <BellOff className="w-3 h-3" />
                Cancel
              </Button>
            )}
          </div>

          {activeReminder && (
            <Badge variant="secondary" className="w-full justify-center gap-1.5 py-1">
              <BellRing className="w-3 h-3 text-amber-500" />
              Reminder: {new Date(activeReminder.triggerAt).toLocaleString()}
            </Badge>
          )}

          {/* Quick options */}
          <div className="grid grid-cols-3 gap-1.5">
            {QUICK_OPTIONS.map((opt) => (
              <Button
                key={opt.label}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleSetReminder(opt.minutes)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Custom date/time */}
          <div className="border-t border-border pt-2 space-y-2">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Custom date & time
            </Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="text-xs h-8 flex-1"
                min={new Date().toISOString().split('T')[0]}
              />
              <Input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="text-xs h-8 w-24"
              />
            </div>
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleSetCustomReminder}
              disabled={!customDate || !customTime}
            >
              Set Custom Reminder
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReminderPicker;
