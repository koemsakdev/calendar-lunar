// calendar.component.ts
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  effect,
  signal,
  inject,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import moment from 'moment';
import 'moment/locale/km';
import { CalendarStoreService, CalendarDay } from '../../services/calendar-store.service';
import { KhmerDateService } from '../../services/khmer-date.service';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, calendarOutline, calendarNumberOutline, searchOutline, checkmarkOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { FilterModalComponent } from '../../shared/filter-modal/filter-modal.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, FilterModalComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  @Output() dayClicked = new EventEmitter<moment.Moment>();
  @Output() pageUpdated = new EventEmitter<{ month: number; year: number }>();

  @ViewChild('yearList') yearListRef!: ElementRef;

  monthModalOpen = signal(false);
  yearModalOpen = signal(false);

  activeDropdown = signal<'none' | 'month' | 'year'>('none');
  monthSearchQuery = signal('');
  yearSearchQuery = signal('');

  calendarStore = inject(CalendarStoreService);
  kh = inject(KhmerDateService);

  readonly monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: moment({ M: i }).format('MMMM'),
  }));

  readonly yearOptions = Array.from({ length: 51 }, (_, i) => ({
    value: 2000 + i,
    label: (2000 + i).toString(),
  }));

  filteredMonths = computed(() => {
    const q = this.monthSearchQuery().toLowerCase();
    return this.monthOptions.filter((m) =>
      m.label.toLowerCase().includes(q)
    );
  });

  filteredYears = computed(() => {
    const q = this.yearSearchQuery().toLowerCase();
    return this.yearOptions.filter((y) =>
      y.label.toLowerCase().includes(q)
    );
  });

  constructor() {
    addIcons({ calendarNumberOutline, chevronBackOutline, searchOutline, checkmarkOutline, chevronForwardOutline, calendarOutline, chevronDownOutline, chevronUpOutline });
    effect(() => {
      // keep selectors in sync when store changes externally
      void this.calendarStore.currentMonth();
      void this.calendarStore.currentYear();

      if (this.yearModalOpen()) {
        setTimeout(() => {
          this.scrollToActiveYear();
        }, 150);
      }
    });
  }

  private scrollToActiveYear(): void {
    if (!this.yearListRef) return;

    const container: HTMLElement = this.yearListRef.nativeElement;
    const active = container.querySelector(
      `[data-year="${this.currentYearValue}"]`
    ) as HTMLElement;

    if (active) {
      active.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  ngOnInit(): void {
    this.calendarStore.days.set([]);
    this.calendarStore.initDay();
    this.emitPageUpdate();
  }

  onPrev(): void { this.calendarStore.prevMonth(); this.refresh(); this.emitPageUpdate(); }
  onNext(): void { this.calendarStore.nextMonth(); this.refresh(); this.emitPageUpdate(); }
  onPrevYear(): void { this.calendarStore.prevYear(); this.refresh(); this.emitPageUpdate(); }
  onNextYear(): void { this.calendarStore.nextYear(); this.refresh(); this.emitPageUpdate(); }

  toggleMonthModal(): void {
    this.monthModalOpen.set(!this.monthModalOpen());
  }

  toggleYearModal(): void {
    this.yearModalOpen.set(!this.yearModalOpen());
  }

  onMonthChange(month: number): void {
    this.calendarStore.currentMonth.set(Number(month));
    this.refresh(); this.emitPageUpdate();
  }
  onYearChange(year: number): void {
    this.calendarStore.currentYear.set(Number(year));
    this.refresh(); this.emitPageUpdate();
  }
  // 👇 ADD HERE
  closeDropdown(): void {
    this.activeDropdown.set('none');
    this.monthSearchQuery.set('');
    this.yearSearchQuery.set('');
  }

  selectMonth(month: number): void {
    this.onMonthChange(month);
    this.closeDropdown();
  }

  selectYear(year: number): void {
    this.onYearChange(year);
    this.closeDropdown();
  }

  reset(): void { this.calendarStore.reset(); this.refresh(); this.emitPageUpdate(); }

  onDayClick(date: moment.Moment): void {
    this.dayClicked.emit(date);
    this.emitPageUpdate();
  }

  private refresh(): void {
    this.calendarStore.days.set([]);
    this.calendarStore.initDay();
  }
  private emitPageUpdate(): void {
    this.pageUpdated.emit({
      month: this.calendarStore.currentMonth(),
      year: this.calendarStore.currentYear(),
    });
  }

  // ─── Template helpers ──────────────────────────────────────────────────────

  getHolidayClass(day: CalendarDay): string {
    if (!day.attributes?.length) return '';
    if (day.attributes.some((a) => a.customData.description === 'Holiday in Cambodia')) return 'holiday-cambodia';
    if (day.attributes.some((a) => a.customData.description === 'General Event')) return 'general-event';
    return '';
  }

  /** e.g. '១៥កើត' */
  getKhDN(day: CalendarDay): string {
    return this.kh.toKhDateDN(day.date);
  }

  /** e.g. 'ពិសាខ' */
  getKhMonth(day: CalendarDay): string {
    return day.khResult.khmer.monthName;
  }

  /** Returns true on Buddhist holy days */
  isBuddhistHolyDay(day: CalendarDay): boolean {
    return this.calendarStore.getBuddhistHolyDay(this.getKhDN(day), day.date);
  }

  /** Show Khmer month label on first day of Khmer month or first of Gregorian month */
  showKhmerMonth(day: CalendarDay): boolean {
    return (this.kh.khDay(day.date) === 0 || day.day === 1) && !day.nextMonth;
  }

  isToday(date: moment.Moment): boolean { return moment().isSame(date, 'day'); }
  isSaturday(date: moment.Moment): boolean { return date.day() === 6; }
  isSunday(date: moment.Moment): boolean { return date.day() === 0; }

  // ─── Getters for template ──────────────────────────────────────────────────
  get days() { return this.calendarStore.days(); }
  get daysOfWeek() { return this.calendarStore.daysOfWeek(); }
  get initKhDate() { return this.calendarStore.initKhDate(); }
  get currentKhmerMonths() { return this.calendarStore.currentKhmerMonths(); }
  get initDateFormatted() {
    const date = this.calendarStore.initDate();

    const khMonth = date.clone().locale('km').format('MMMM');
    const enMonthYear = date.clone().locale('en').format('MMMM YYYY');

    return `${khMonth} ${enMonthYear}`;
  }
  get currentMonthValue() { return this.calendarStore.currentMonth(); }
  get currentYearValue() { return this.calendarStore.currentYear(); }

  get currentMonthLabel() {
    return (
      this.monthOptions.find(
        (m) => m.value === this.currentMonthValue
      )?.label ?? ''
    );
  }
}