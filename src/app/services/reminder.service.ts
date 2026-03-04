// reminder.service.ts
import { Injectable, inject } from '@angular/core';
import {
  CalendarStoreService,
  CalendarAttribute,
} from './calendar-store.service';
import moment from 'moment';
import { LocalNotifications } from '@capacitor/local-notifications';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'yearly';

export interface Reminder {
  id: string;
  title: string; // single title field
  titleKh: string; // same as title — kept for CalendarAttribute compat
  titleEn: string; // same as title — kept for CalendarAttribute compat
  note: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  repeat: RepeatType;
  createdAt: string;
}

const STORAGE_KEY = 'kh_calendar_reminders';

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private calendarStore = inject(CalendarStoreService);
  private audio: HTMLAudioElement | null = null;

  playAlarm(): void {
    this.audio = new Audio('assets/sounds/alarm.wav');
    this.audio.loop = false;
    this.audio.volume = 1.0;
    this.audio.play().catch((e) => console.warn('Audio play blocked:', e));
  }

  stopAlarm(): void {
    this.audio?.pause();
    this.audio = null;
  }

  getAll(): Reminder[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async save(reminder: Reminder): Promise<void> {
    const all = this.getAll();
    const idx = all.findIndex((r) => r.id === reminder.id);
    if (idx >= 0) all[idx] = reminder;
    else all.push(reminder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    this.syncToStore();
    await this.scheduleNotification(reminder);
  }

  async delete(id: string): Promise<void> {
    const filtered = this.getAll().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    this.syncToStore();
    // Cancel any pending notification for this reminder
    await LocalNotifications.cancel({
      notifications: [{ id: this.notifId(id) }],
    });
  }

  generateId(): string {
    return (
      'reminder_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
    );
  }

  syncToStore(): void {
    const reminders = this.getAll();
    const cleaned = this.calendarStore
      .attributes()
      .filter((a) => !a.key.startsWith('reminder_'));

    const newAttrs: CalendarAttribute[] = [];
    for (const r of reminders) {
      for (const date of this.resolvedDates(r)) {
        newAttrs.push({
          key: `reminder_${r.id}_${date}`,
          customData: {
            title: { kh: r.title, en: r.title },
            description: 'Reminder',
            class: 'bg-violet-600 text-white',
          },
          dates: date,
        });
      }
    }
    this.calendarStore.attributes.set([...cleaned, ...newAttrs]);
  }

  getDueReminders(): Reminder[] {
    const now = moment();
    return this.getAll().filter((r) =>
      this.resolvedDates(r).some((d) => {
        const target = moment(`${d} ${r.time}`, 'YYYY-MM-DD HH:mm');
        return Math.abs(now.diff(target, 'minutes')) < 1;
      }),
    );
  }

  resolvedDates(r: Reminder): string[] {
    const base = moment(r.date, 'YYYY-MM-DD');
    const dates: string[] = [];
    switch (r.repeat) {
      case 'none':
        dates.push(r.date);
        break;
      case 'daily':
        for (let i = 0; i < 365; i++)
          dates.push(base.clone().add(i, 'days').format('YYYY-MM-DD'));
        break;
      case 'weekly':
        for (let i = 0; i < 52; i++)
          dates.push(base.clone().add(i, 'weeks').format('YYYY-MM-DD'));
        break;
      case 'yearly':
        for (let i = -5; i <= 5; i++)
          dates.push(base.clone().add(i, 'years').format('YYYY-MM-DD'));
        break;
    }
    return dates;
  }

  // Convert string id to numeric for LocalNotifications
  private notifId(id: string): number {
    // simple hash: take last 8 chars of timestamp portion
    return parseInt(id.replace('reminder_', '').split('_')[0].slice(-8), 10);
  }

  private async scheduleNotification(r: Reminder): Promise<void> {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    // Cancel existing first to avoid duplicates
    await LocalNotifications.cancel({
      notifications: [{ id: this.notifId(r.id) }],
    });

    const dates = this.resolvedDates(r);
    const now = moment();

    // Find the next upcoming date
    const nextDate = dates.find((d) =>
      moment(`${d} ${r.time}`, 'YYYY-MM-DD HH:mm').isAfter(now),
    );
    if (!nextDate) return;

    const scheduledAt = moment(
      `${nextDate} ${r.time}`,
      'YYYY-MM-DD HH:mm',
    ).toDate();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.notifId(r.id),
          title: '⏰ ការរំលឹក',
          body: r.note ? `${r.title}\n${r.note}` : r.title,
          schedule: { at: scheduledAt, allowWhileIdle: true },
          sound: 'default', // plays default notification sound
          smallIcon: 'ic_launcher',
          actionTypeId: '',
          extra: { reminderId: r.id },
        },
      ],
    });
  }
}
