import { Component, inject, signal } from '@angular/core';
import * as moment from 'moment';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { HolidaysListComponent } from '../../components/holidays-list/holidays-list.component';
import { CalendarStoreService, CalendarAttribute } from '../../services/calendar-store.service';
import { KhmerDateService } from '../../services/khmer-date.service';

export interface DayDetail {
  date: moment.Moment;
  attributes: CalendarAttribute[];
}

@Component({
  selector: 'app-sp-calendar',
  standalone: true,
  imports: [IonicModule, CommonModule, CalendarComponent, HolidaysListComponent],
  templateUrl: './sp-calendar.page.html',
  styleUrls: ['./sp-calendar.page.scss'],
})
export class SpCalendarPage {
  calendarStore = inject(CalendarStoreService);
  khmerDateService = inject(KhmerDateService);

  openModal = signal(false);
  detail = signal<DayDetail | null>(null);

  onDayClick(date: moment.Moment): void {
    this.detail.set({
      date,
      attributes: this.calendarStore.attributes().filter((item) =>
        date.isSame(item.dates, 'day')
      ),
    });
    this.openModal.set(true);
  }

  closeModal(): void {
    this.openModal.set(false);
  }

  getDateKhmerLunar(date: moment.Moment): string {
    return this.khmerDateService.khmerDate(date).toLunarDate();
  }

  getAttributeKhTitle(attr: CalendarAttribute): string {
    const title = attr.customData.title as { kh: string; en: string };
    return title?.kh ?? '';
  }

  isHoliday(attr: CalendarAttribute): boolean {
    return attr.customData.description === 'Holiday in Cambodia';
  }

  formatKhDate(date: moment.Moment): string {
    return date.clone().format('LL');
  }

  formatEnDate(date: moment.Moment): string {
    return date.clone().locale('en').format('LL');
  }

  get modalDetail(): DayDetail | null {
    return this.detail();
  }

  get isModalOpen(): boolean {
    return this.openModal();
  }
}