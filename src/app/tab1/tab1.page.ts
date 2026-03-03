import { Component, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';
import * as moment from 'moment';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../components/calendar/calendar.component';
import { HolidaysListComponent } from '../components/holidays-list/holidays-list.component';
import { CalendarStoreService, CalendarAttribute, CalendarDay } from '../services/calendar-store.service';
import { KhmerDateService } from '../services/khmer-date.service';
import { addIcons } from 'ionicons';
import { closeOutline, flagOutline, calendarOutline } from 'ionicons/icons';
import { FilterModalComponent } from '../shared/filter-modal/filter-modal.component';

export interface DayDetail {
  date: moment.Moment;
  attributes: CalendarAttribute[];
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
    CalendarComponent,
    HolidaysListComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    FilterModalComponent,
  ],
})
export class Tab1Page {
  calendarStore = inject(CalendarStoreService);
  khmerDateService = inject(KhmerDateService);

  openModal = signal(false);
  detail = signal<DayDetail | null>(null);

  constructor() {
    addIcons({ closeOutline, flagOutline, calendarOutline });
  }

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
    return this.khmerDateService.toLunarDate(date);
  }

  getAttributeKhTitle(attr: CalendarAttribute): string {
    const title = attr.customData.title as { kh: string; en: string };
    return title?.kh ?? '';
  }

  getTitleKh(attr: CalendarAttribute): string {
    const title = attr.customData.title as { kh: string; en: string };
    return title?.kh ?? '';
  }

  getTitleEn(attr: CalendarAttribute): string {
    const title = attr.customData.title as { kh: string; en: string };
    return title?.en ?? '';
  }

  isHoliday(attr: CalendarAttribute): boolean {
    return attr.customData.description === 'Holiday in Cambodia';
  }

  isModalBuddhistHolyDay(): boolean {
    if (!this.modalDetail?.attributes?.length) return false;

    return this.modalDetail.attributes.some(
      attr => attr.customData?.description === 'Buddhist Holy Day'
    );
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
