// Browser Notification + Timer service for Tasks & Notes reminders

const REMINDERS_KEY = 'app-reminders';

export interface Reminder {
  id: string;
  type: 'task' | 'note';
  referenceId: string;
  title: string;
  message: string;
  triggerAt: string; // ISO date string
  fired: boolean;
}

// Active timeout IDs keyed by reminder id
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Request browser notification permission */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/** Show a browser notification */
function showNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/coding.png',
      badge: '/coding.png',
    });
  }
}

/** Get all reminders from storage */
export function getReminders(): Reminder[] {
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Save reminders to storage */
function saveReminders(reminders: Reminder[]) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

/** Schedule a single reminder */
function scheduleReminder(reminder: Reminder) {
  const now = Date.now();
  const triggerTime = new Date(reminder.triggerAt).getTime();
  const delay = triggerTime - now;

  if (delay <= 0 || reminder.fired) return;

  // Clear existing timer if any
  const existing = activeTimers.get(reminder.id);
  if (existing) clearTimeout(existing);

  const timerId = setTimeout(() => {
    showNotification(reminder.title, reminder.message);
    // Mark as fired
    const reminders = getReminders().map(r =>
      r.id === reminder.id ? { ...r, fired: true } : r
    );
    saveReminders(reminders);
    activeTimers.delete(reminder.id);
  }, Math.min(delay, 2147483647)); // Max setTimeout value

  activeTimers.set(reminder.id, timerId);
}

/** Add a new reminder */
export function addReminder(
  type: 'task' | 'note',
  referenceId: string,
  title: string,
  message: string,
  triggerAt: Date
): Reminder {
  const reminder: Reminder = {
    id: `${type}-${referenceId}-${Date.now()}`,
    type,
    referenceId,
    title,
    message,
    triggerAt: triggerAt.toISOString(),
    fired: false,
  };
  const reminders = getReminders();
  // Remove existing unfired reminders for same reference
  const filtered = reminders.filter(
    r => !(r.referenceId === referenceId && r.type === type && !r.fired)
  );
  filtered.push(reminder);
  saveReminders(filtered);
  scheduleReminder(reminder);
  return reminder;
}

/** Remove a reminder */
export function removeReminder(referenceId: string, type: 'task' | 'note') {
  const reminders = getReminders().filter(
    r => !(r.referenceId === referenceId && r.type === type && !r.fired)
  );
  saveReminders(reminders);
  // Clear timer
  activeTimers.forEach((timer, key) => {
    if (key.startsWith(`${type}-${referenceId}`)) {
      clearTimeout(timer);
      activeTimers.delete(key);
    }
  });
}

/** Get active reminder for a reference */
export function getActiveReminder(referenceId: string, type: 'task' | 'note'): Reminder | null {
  const reminders = getReminders();
  return reminders.find(
    r => r.referenceId === referenceId && r.type === type && !r.fired
  ) || null;
}

/** Initialize — reschedule all pending reminders on page load */
export function initNotificationService() {
  const reminders = getReminders();
  const now = Date.now();

  reminders.forEach(reminder => {
    if (reminder.fired) return;
    const triggerTime = new Date(reminder.triggerAt).getTime();
    if (triggerTime <= now) {
      // Missed reminder — fire immediately
      showNotification(`⏰ Missed: ${reminder.title}`, reminder.message);
      reminder.fired = true;
    } else {
      scheduleReminder(reminder);
    }
  });

  saveReminders(reminders);
}

/** Cleanup all timers */
export function cleanupTimers() {
  activeTimers.forEach(timer => clearTimeout(timer));
  activeTimers.clear();
}
