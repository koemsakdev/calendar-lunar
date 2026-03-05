// tab1.page.ts
import { Component, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import * as moment from 'moment';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../components/calendar/calendar.component';
import { HolidaysListComponent } from '../components/holidays-list/holidays-list.component';
import {
  CalendarStoreService,
  CalendarAttribute,
} from '../services/calendar-store.service';
import { KhmerDateService } from '../services/khmer-date.service';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  flagOutline,
  calendarOutline,
  moonOutline,
} from 'ionicons/icons';
import { FilterModalComponent } from '../shared/filter-modal/filter-modal.component';
import { AdService } from '../services/ad.service';
import { AdBannerComponent } from '../shared/ad-banner/ad-banner.component';

export interface DayDetail {
  date: moment.Moment;
  attributes: CalendarAttribute[];
}

// ── Attribute type helper ─────────────────────────────────────────
type AttrType = 'holiday' | 'traditional' | 'general';

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
    AdBannerComponent
  ],
})
export class Tab1Page {
  calendarStore = inject(CalendarStoreService);
  khmerDateService = inject(KhmerDateService);
  adSvc = inject(AdService);

  openModal = signal(false);
  detail = signal<DayDetail | null>(null);

  constructor() {
    addIcons({ closeOutline, flagOutline, calendarOutline, moonOutline });
  }

  // ── Day click ─────────────────────────────────────────────────────
  onDayClick(date: moment.Moment): void {
    // Filter out internal keys (Buddhist Holy Day watermark, 'today')
    const attrs = this.calendarStore.attributes().filter((item) => {
      if (!date.isSame(item.dates, 'day')) return false;
      const title = item.customData?.title as any;
      if (title?.en === 'today') return false;
      return true;
    });

    this.detail.set({ date, attributes: attrs });
    this.openModal.set(true);
  }

  closeModal(): void {
    this.openModal.set(false);
  }

  // ── Attribute type ────────────────────────────────────────────────
  getAttrType(attr: CalendarAttribute): AttrType {
    if (attr.customData.description === 'Holiday in Cambodia') return 'holiday';
    if (
      attr.customData.description === 'Buddhist Holy Day' ||
      attr.key.startsWith('traditional_events') ||
      attr.key.startsWith('traditional_holidays')
    )
      return 'traditional';
    return 'general';
  }

  getAttrBadgeLabel(attr: CalendarAttribute): string {
    const type = this.getAttrType(attr);
    if (type === 'holiday') return 'បុណ្យជាតិ';
    if (type === 'traditional') return 'ប្រពៃណី';
    return 'ទូទៅ';
  }

  // ── Keep isHoliday for template backward compat ───────────────────
  isHoliday(attr: CalendarAttribute): boolean {
    return this.getAttrType(attr) === 'holiday';
  }

  isModalBuddhistHolyDay(): boolean {
    return (
      this.modalDetail?.attributes?.some(
        (attr) => attr.customData?.description === 'Buddhist Holy Day',
      ) ?? false
    );
  }

  // ── Title helpers ─────────────────────────────────────────────────
  getTitleKh(attr: CalendarAttribute): string {
    const title = attr.customData.title as { kh: string; en: string };
    return title?.kh ?? '';
  }

  getTitleEn(attr: CalendarAttribute): string {
    const title = attr.customData.title as { kh: string; en: string };
    return title?.en ?? '';
  }

  // ── Date formatters ───────────────────────────────────────────────
  getDateKhmerLunar(date: moment.Moment): string {
    return this.khmerDateService.toLunarDate(date);
  }

  formatKhDate(date: moment.Moment): string {
    return date.clone().locale('km').format('LL');
  }

  formatEnDate(date: moment.Moment): string {
    return date.clone().locale('en').format('LL');
  }

  // ── Getters ───────────────────────────────────────────────────────
  get modalDetail(): DayDetail | null {
    return this.detail();
  }
  get isModalOpen(): boolean {
    return this.openModal();
  }
}
