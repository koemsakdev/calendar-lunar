import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alarmOutline, timeOutline, locationOutline, pencilOutline } from 'ionicons/icons';
import { AlarmService } from '../../services/alarm.service';

export interface ReminderAlertData {
  title: string;
  note: string;
  time: string;   // already formatted e.g. "2:30 PM"
  date: string;   // already formatted e.g. "05 Mar 2026"
}
@Component({
  selector: 'app-reminder-alert',
  templateUrl: './reminder-alert.component.html',
  styleUrls: ['./reminder-alert.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class ReminderAlertComponent {
  private alarmSvc = inject(AlarmService);

  visible = signal(false);
  data = signal<ReminderAlertData>({ title: '', note: '', time: '', date: '' });

  private onSnooze?: () => void;
  private onEdit?: () => void;

  constructor() {
    addIcons({ alarmOutline, timeOutline, locationOutline, pencilOutline });
  }

  show(d: ReminderAlertData, options?: {
    onSnooze?: () => void;
    onEdit?: () => void;
  }): void {
    this.data.set(d);
    this.onSnooze = options?.onSnooze;
    this.onEdit = options?.onEdit;
    this.visible.set(true);
  }

  dismiss(): void {
    this.alarmSvc.stopAlarm();
    this.visible.set(false);
  }

  snooze(): void {
    this.alarmSvc.stopAlarm();
    this.visible.set(false);
    this.onSnooze?.();
  }

  edit(): void {
    this.alarmSvc.stopAlarm();
    this.visible.set(false);
    this.onEdit?.();
  }

  onBackdropClick(event: MouseEvent): void {
    // Don't dismiss on backdrop tap — backdropDismiss: false equivalent
  }
}
