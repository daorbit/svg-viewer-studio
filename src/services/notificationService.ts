// Browser Notification + Timer service for Tasks & Notes reminders
// Uses Service Worker for OS-level push notifications that show outside the browser
import { toast } from 'sonner';

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

let swRegistration: ServiceWorkerRegistration | null = null;

/** Register the notification service worker for OS-level notifications */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/notification-sw.js');
      console.log('Notification Service Worker registered');
    } catch (e) {
      console.warn('SW registration failed:', e);
    }
  }
}

/** Request browser notification permission */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return true;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') {
    toast.error('Notifications are blocked. Please enable them in your browser settings (click the lock icon in the address bar).');
    return false;
  }
  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      await registerServiceWorker();
      return true;
    }
    toast.error('Please allow notifications to receive reminders.');
    return false;
  } catch {
    return true;
  }
}

/** Play a notification sound */
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

/** Show a real OS-level notification via Service Worker + in-app toast fallback */
function showNotification(title: string, body: string) {
  // Always play sound and show in-app toast
  playNotificationSound();
  toast(title, {
    description: body,
    duration: 10000,
    icon: '🔔',
  });

  // Try Service Worker notification first (works outside browser/when minimized)
  if (swRegistration) {
    const options: NotificationOptions & { vibrate?: number[] } = {
      body,
      icon: '/coding.png',
      badge: '/coding.png',
      tag: `reminder-${Date.now()}`,
      requireInteraction: true,
    };
    (options as any).vibrate = [200, 100, 200];
    swRegistration.showNotification(title, options).catch(() => {
      // Fallback to regular Notification API
      tryBasicNotification(title, body);
    });
  } else {
    tryBasicNotification(title, body);
  }
}

/** Fallback: try basic Notification API */
function tryBasicNotification(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/coding.png',
        badge: '/coding.png',
        requireInteraction: true,
      });
    }
  } catch {
    // Not supported in this context
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

  const existing = activeTimers.get(reminder.id);
  if (existing) clearTimeout(existing);

  const timerId = setTimeout(() => {
    showNotification(reminder.title, reminder.message);
    const reminders = getReminders().map(r =>
      r.id === reminder.id ? { ...r, fired: true } : r
    );
    saveReminders(reminders);
    activeTimers.delete(reminder.id);
  }, Math.min(delay, 2147483647));

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

/** Initialize — register SW, reschedule all pending reminders */
export function initNotificationService() {
  // Register service worker for OS-level notifications
  registerServiceWorker();

  // Request permission proactively
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  const reminders = getReminders();
  const now = Date.now();

  reminders.forEach(reminder => {
    if (reminder.fired) return;
    const triggerTime = new Date(reminder.triggerAt).getTime();
    if (triggerTime <= now) {
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
