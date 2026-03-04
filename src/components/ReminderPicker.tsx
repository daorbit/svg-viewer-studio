import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
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

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

const ReminderPicker = ({ type, referenceId, title, compact = false }: ReminderPickerProps) => {
  const [open, setOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

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
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      toast.error('Please allow notifications in your browser settings');
      return;
    }

    let hour24 = parseInt(selectedHour);
    if (selectedPeriod === 'AM' && hour24 === 12) hour24 = 0;
    if (selectedPeriod === 'PM' && hour24 !== 12) hour24 += 12;

    const triggerAt = new Date(selectedDate);
    triggerAt.setHours(hour24, parseInt(selectedMinute), 0, 0);

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

      <PopoverContent className="w-auto p-3" align="end" onClick={(e) => e.stopPropagation()}>
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

          {/* Custom date/time with proper calendar */}
          <div className="border-t border-border pt-2 space-y-3">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Custom date & time
            </Label>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className={cn("p-0 pointer-events-auto")}
              initialFocus
            />

            {selectedDate && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  <CalendarIcon className="w-3 h-3 inline mr-1" />
                  {format(selectedDate, 'PPP')}
                </p>
                <div className="flex items-center gap-1.5">
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger className="w-[68px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((h) => (
                        <SelectItem key={h} value={String(h)}>{String(h).padStart(2, '0')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm font-bold text-muted-foreground">:</span>
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger className="w-[68px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((m) => (
                        <SelectItem key={m} value={String(m)}>{String(m).padStart(2, '0')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as 'AM' | 'PM')}>
                    <SelectTrigger className="w-[68px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleSetCustomReminder}
              disabled={!selectedDate}
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
