// src/app/tab3/tab3.page.ts
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  ViewChild,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonDatetime,
  IonModal,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  trashOutline,
  createOutline,
  alarmOutline,
  calendarOutline,
  timeOutline,
  repeatOutline,
  notificationsOutline,
  banOutline,
  refreshOutline,
  calendarNumberOutline,
} from 'ionicons/icons';
import moment from 'moment';
import {
  ReminderService,
  Reminder,
  RepeatType,
} from '../services/reminder.service';
import { AlarmService } from '../services/alarm.service';
import { FilterModalComponent } from '../shared/filter-modal/filter-modal.component';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ReminderAlertComponent } from '../components/reminder-alert/reminder-alert.component';
import { AdService } from '../services/ad.service';
import { AdBannerComponent } from '../shared/ad-banner/ad-banner.component';

interface ReminderForm {
  id: string;
  title: string;
  note: string;
  date: string; // 'YYYY-MM-DD' always en-locale
  time: string; // 'HH:mm'
  repeat: RepeatType;
}

const EMPTY_FORM = (): ReminderForm => ({
  id: '',
  title: '',
  note: '',
  date: moment().locale('en').format('YYYY-MM-DD'),
  time: moment().locale('en').add(1, 'hour').startOf('hour').format('HH:mm'),
  repeat: 'none',
});

const REPEAT_LABELS: Record<RepeatType, { kh: string; en: string }> = {
  none: { kh: 'មិនដដែលៗ', en: 'No Repeat' },
  daily: { kh: 'រៀងរាល់ថ្ងៃ', en: 'Every Day' },
  weekly: { kh: 'រៀងរាល់សប្តាហ៍', en: 'Every Week' },
  yearly: { kh: 'រៀងរាល់ឆ្នាំ', en: 'Every Year' },
};

const REPEAT_ICONS: Record<RepeatType, string> = {
  none: 'ban-outline',
  daily: 'refresh-outline',
  weekly: 'repeat-outline',
  yearly: 'calendar-number-outline',
};

@Component({
  selector: 'app-tab3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonDatetime,
    IonModal,
    FilterModalComponent,
    ReminderAlertComponent,
    AdBannerComponent
  ],
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
})
export class Tab3Page implements OnInit, OnDestroy {
  private reminderSvc = inject(ReminderService);
  private alertCtrl = inject(AlertController);
  private ngZone = inject(NgZone);
  private alarmSvc = inject(AlarmService);

  adSvc = inject(AdService);

  @ViewChild('datePicker') datePicker?: IonDatetime;
  @ViewChild('timePicker') timePicker?: IonDatetime;

  @ViewChild('reminderAlert', { static: false }) reminderAlert?: ReminderAlertComponent;

  reminders = signal<Reminder[]>([]);
  formModalOpen = signal(false);
  isEditing = signal(false);
  form = signal<ReminderForm>(EMPTY_FORM());

  readonly repeatOptions: RepeatType[] = ['none', 'daily', 'weekly', 'yearly'];
  readonly repeatLabels = REPEAT_LABELS;

  private scheduledTimers: ReturnType<typeof setTimeout>[] = [];

  // ── Computed ──────────────────────────────────────────────────────
  todayReminders = computed(() =>
    this.reminders().filter((r) =>
      this.reminderSvc
        .resolvedDates(r)
        .includes(moment().locale('en').format('YYYY-MM-DD')),
    ),
  );

  isoDateTime = computed(() => {
    const f = this.form();
    return `${f.date}T${f.time}:00`;
  });

  constructor() {
    addIcons({
      addOutline,
      trashOutline,
      createOutline,
      alarmOutline,
      calendarOutline,
      timeOutline,
      repeatOutline,
      notificationsOutline,
      banOutline,
      refreshOutline,
      calendarNumberOutline,
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────
  ngOnInit(): void {
    this.load();
    this.reminderSvc.syncToStore();
    this.scheduleAllAlarms();

    if ('Notification' in window || Capacitor.isNativePlatform()) {
      Notification.requestPermission();
    }
  }

  ngOnDestroy(): void {
    this.scheduledTimers.forEach((t) => clearTimeout(t));
  }

  // ── Load reminders from storage ───────────────────────────────────
  load(): void {
    this.reminders.set(this.reminderSvc.getAll());
  }

  // ── Exact-time alarm scheduler ────────────────────────────────────
  private scheduleAllAlarms(): void {
    // Clear any existing timers first
    this.scheduledTimers.forEach((t) => clearTimeout(t));
    this.scheduledTimers = [];

    const now = moment();

    for (const r of this.reminderSvc.getAll()) {
      for (const date of this.reminderSvc.resolvedDates(r)) {
        const target = moment(`${date} ${r.time}`, 'YYYY-MM-DD HH:mm');
        const msUntil = target.diff(now);

        // Only schedule reminders within the next 24 hours
        if (msUntil > 0 && msUntil <= 24 * 60 * 60 * 1000) {
          const timer = setTimeout(() => {
            this.ngZone.run(() => {
              this.alarmSvc.playAlarm();
              this.showReminderAlert(r);
              this.showNotification(r);
            });
          }, msUntil);
          this.scheduledTimers.push(timer);
        }
      }
    }
  }

  // ── Browser notification (shows even when tab is in background) ───
  private async showNotification(r: Reminder): Promise<void> {
    const isNative = Capacitor.isNativePlatform(); // true on iOS/Android app

    if (isNative) {
      // ── Native iOS/Android notification ───────────────────────────
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') return;

      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: '⏰ ការរំលឹក',
          body: r.note
            ? `${r.title}\n${r.note}`
            : r.title,
          schedule: { at: new Date(Date.now() + 500) }, // fire immediately
          sound: 'default',
          smallIcon: 'ic_launcher',
        }],
      });

    } else {
      // ── Web browser notification ───────────────────────────────────
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ ការរំលឹក — ' + r.title, {
          body: r.note
            ? `${r.note}\n🕐 ${this.formatTime12h(r.time)} ${this.getAmPm(r.time)}`
            : `🕐 ${this.formatTime12h(r.time)} ${this.getAmPm(r.time)}`,
          icon: 'assets/calendar-khmer-logo.png',
          requireInteraction: true,
        });
      }
    }
  }

  // ── Form open/close ───────────────────────────────────────────────
  openCreate(): void {
    this.form.set({ ...EMPTY_FORM(), id: this.reminderSvc.generateId() });
    this.isEditing.set(false);
    this.formModalOpen.set(true);
  }

  openEdit(r: Reminder): void {
    this.form.set({
      id: r.id,
      title: r.title,
      note: r.note,
      date: r.date,
      time: r.time,
      repeat: r.repeat,
    });
    this.isEditing.set(true);
    this.formModalOpen.set(true);
  }

  closeForm(): void {
    this.formModalOpen.set(false);
  }

  updateForm<K extends keyof ReminderForm>(key: K, val: ReminderForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: val }));
  }

  // ── Picker modal open handlers ────────────────────────────────────
  async onDateModalOpen(): Promise<void> {
    await new Promise((r) => setTimeout(r, 80));
    if (this.datePicker) {
      const safeDate = moment(this.form().date)
        .locale('en')
        .format('YYYY-MM-DD');
      await this.datePicker.reset(safeDate);
    }
  }

  async onTimeModalOpen(): Promise<void> {
    await new Promise((r) => setTimeout(r, 80));
    if (this.timePicker) {
      const safeDate = moment(this.form().date)
        .locale('en')
        .format('YYYY-MM-DD');
      await this.timePicker.reset(`${safeDate}T${this.form().time}:00`);
    }
  }

  // ── Picker change handlers ────────────────────────────────────────
  onDateChange(event: CustomEvent): void {
    const val = event.detail.value as string;
    if (val) this.updateForm('date', val.split('T')[0]);
  }

  onTimeChange(event: CustomEvent): void {
    const val = event.detail.value as string;
    if (!val) return;
    const timePart = val.includes('T')
      ? val.split('T')[1].substring(0, 5)
      : val.substring(0, 5);
    this.updateForm('time', timePart);
  }

  // ── Save / Delete ─────────────────────────────────────────────────
  canSave(): boolean {
    const f = this.form();
    return !!f.title.trim() && !!f.date && !!f.time;
  }

  saveReminder(): void {
    if (!this.canSave()) return;
    const f = this.form();
    this.reminderSvc.save({
      id: f.id,
      title: f.title.trim(),
      titleKh: f.title.trim(),
      titleEn: f.title.trim(),
      note: f.note.trim(),
      date: f.date,
      time: f.time,
      repeat: f.repeat,
      createdAt: this.isEditing()
        ? (this.reminders().find((r) => r.id === f.id)?.createdAt ??
          new Date().toISOString())
        : new Date().toISOString(),
    });
    this.load();
    this.formModalOpen.set(false);
    this.scheduleAllAlarms(); // reschedule after save
  }

  async deleteReminder(r: Reminder): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'លុបការរំលឹក',
      message: `តើអ្នកចង់លុប "${r.title}" មែនទេ?`,
      cssClass: 'khmer-alert',
      buttons: [
        {
          text: 'បោះបង់',
          role: 'cancel',
          cssClass: 'alert-btn-cancel',
        },
        {
          text: 'លុប',
          role: 'destructive',
          cssClass: 'alert-btn-danger',
          handler: () => {
            this.reminderSvc.delete(r.id);
            this.load();
            this.scheduleAllAlarms(); // reschedule after delete
          },
        },
      ],
    });
    await alert.present();
  }

  showReminderDetails(r: Reminder): void {
    this.showReminderAlert(r);
  }

  // ── Reminder alert dialog ─────────────────────────────────────────
  private showReminderAlert(r: Reminder): void {
    if (!this.reminderAlert) {
      console.warn('reminderAlert not ready');
      return;
    }
    this.reminderAlert.show(
      {
        title: r.title,
        note: r.note,
        time: `${this.formatTime12h(r.time)} ${this.getAmPm(r.time)}`,
        date: this.formatDateEn(r.date),
      },
      {
        onSnooze: () => {
          const snoozeTime = moment().add(1, 'minutes');
          const msUntil = snoozeTime.diff(moment());
          setTimeout(() => {
            this.ngZone.run(() => {
              this.alarmSvc.playAlarm();
              this.showReminderAlert(r);
            });
          }, msUntil);
        },
        onEdit: () => this.openEdit(r),
      }
    );
  }

  // ── Display helpers ───────────────────────────────────────────────
  formatDateShort(date: string): string {
    return moment(date).locale('en').format('DD MMM');
  }

  formatDayName(date: string): string {
    return moment(date).locale('en').format('ddd, YYYY');
  }

  formatDateEn(date: string): string {
    return moment(date).locale('en').format('DD MMM YYYY');
  }

  formatTime12h(time: string): string {
    return moment(time, 'HH:mm').locale('en').format('h:mm');
  }

  getAmPm(time: string): string {
    return moment(time, 'HH:mm').locale('en').format('A');
  }

  repeatLabel(r: RepeatType): string {
    return REPEAT_LABELS[r].kh;
  }
  repeatIcon(r: RepeatType): string {
    return REPEAT_ICONS[r];
  }

  isPast(r: Reminder): boolean {
    if (r.repeat !== 'none') return false;

    const reminderDateTime = moment(`${r.date} ${r.time}`, 'YYYY-MM-DD HH:mm');
    return reminderDateTime.isBefore(moment()); // compares full date + time
  }
}
