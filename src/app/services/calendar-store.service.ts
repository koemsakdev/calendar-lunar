// calendar-store.service.ts
import { Injectable, signal, computed } from '@angular/core';
import moment from 'moment';
import { KhmerDateService, KhmerDateResult } from './khmer-date.service';
import { PublicHolidaysService } from './public-holidays.service';

export interface CalendarAttribute {
  key: string;
  customData: {
    title: { kh: string; en: string } | string;
    description: string;
    class: string;
  };
  dates: string;
}

export interface CalendarDay {
  prevMonth: boolean;
  nextMonth: boolean;
  day: number;
  date: moment.Moment;
  khResult: KhmerDateResult; // replaces the old KhmerMoment
  attributes: CalendarAttribute[];
}

@Injectable({ providedIn: 'root' })
export class CalendarStoreService {
  currentMonth = signal<number>(moment().month() + 1);
  currentYear = signal<number>(moment().year());

  days = signal<CalendarDay[]>([]);
  daysOfWeek = signal<Array<{ en: moment.Moment; km: moment.Moment }>>([]);
  attributes = signal<CalendarAttribute[]>([]);
  currentKhmerMonths = signal<string[]>([]);
  initKhDate = signal<string[]>([]);

  readonly initDate = computed(() =>
    moment({ y: this.currentYear(), M: this.currentMonth() - 1, D: 1 }).locale(
      'en',
    ),
  );

  constructor(
    private kh: KhmerDateService,
    private publicHolidaysService: PublicHolidaysService,
  ) {}

  initDay(): void {
    const date = this.initDate();

    this.attributes.set([]);
    this.currentKhmerMonths.set([]);

    // Khmer New Year attrs (April only)
    if (date.clone().month() + 1 === 4) {
      this.attributes.update((a) => [
        ...a,
        ...this.getKhmerNewYearAttrs(date.clone().year()),
      ]);
    }

    // Regular public holidays for this month
    const monthEvents = this.publicHolidaysService.events
      .filter((item) => item.start_date.month === date.clone().month() + 1)
      .map((element) => ({
        key:
          'events' +
          moment({
            y: date.clone().year(),
            M: date.clone().month(),
            D: element.start_date.day,
          })
            .locale('en')
            .format('YYYY-MM-DD'),
        customData: {
          title: element.summary,
          description: element.description,
          class: 'bg-red-600 text-white',
        },
        dates: moment({
          y: date.clone().year(),
          M: date.clone().month(),
          D: element.start_date.day,
        })
          .locale('en')
          .format('YYYY-MM-DD'),
      }));
    this.attributes.update((a) => [...a, ...monthEvents]);

    // Days of week (Sun–Sat)
    this.daysOfWeek.set(
      Array.from({ length: 7 }, (_, w) => ({
        en: moment().locale('en').day(w),
        km: moment().clone().day(w),
      })),
    );

    const currentDaysInMonth = date.clone().daysInMonth();
    const firstDayIndex = date.day();
    const lastDayIndex = moment(
      date.format('YYYY-MM-') + currentDaysInMonth,
    ).day();
    const nextDaysCount = 7 - lastDayIndex - 1;
    const lastDayOfPrevMonth = date.clone().subtract(1, 'months').daysInMonth();

    const newDays: CalendarDay[] = [];

    // Prev month overflow
    for (let x = firstDayIndex; x > 0; x--) {
      const day = lastDayOfPrevMonth - x + 1;
      const prevDate = moment(
        date.clone().subtract(1, 'months').format('YYYY-MM-') + day,
        'YYYY-MM-D',
      );
      const khResult = this.kh.fromMoment(prevDate);
      this.applyTraditionalEvents(prevDate, khResult);
      newDays.push({
        prevMonth: true,
        nextMonth: false,
        day,
        date: prevDate,
        khResult,
        attributes: this.attributes().filter((item) =>
          prevDate.isSame(item.dates, 'day'),
        ), // ← change here
      });
    }

    // Current month
    const currentKhMonth: string[] = [];
    for (let i = 1; i <= currentDaysInMonth; i++) {
      const currentDate = moment(date.format('YYYY-MM-') + i, 'YYYY-MM-D');
      const khResult = this.kh.fromMoment(currentDate);
      this.applyTraditionalEvents(currentDate, khResult);
      newDays.push({
        prevMonth: false,
        nextMonth: false,
        day: i,
        date: currentDate,
        khResult,
        attributes: this.attributes().filter((item) =>
          currentDate.isSame(item.dates, 'day'),
        ), // ← change here
      });
      currentKhMonth.push(khResult.khmer.monthName);
    }

    // Next month overflow
    for (let y = 1; y <= nextDaysCount; y++) {
      const nextDate = moment(
        date.clone().add(1, 'months').format('YYYY-MM-') + y,
        'YYYY-MM-D',
      );
      const khResult = this.kh.fromMoment(nextDate);
      this.applyTraditionalEvents(nextDate, khResult);
      newDays.push({
        prevMonth: false,
        nextMonth: true,
        day: y,
        date: nextDate,
        khResult,
        attributes: this.attributes().filter((item) =>
          nextDate.isSame(item.dates, 'day'),
        ), // ← change here
      });
    }

    this.days.set(newDays);
    this.currentKhmerMonths.set([...new Set(currentKhMonth)]);

    // BE year header
    const beYear =
      date.clone().month() + 1 <= 4
        ? date.clone().add(543, 'years').locale('km').format('YYYY')
        : date.clone().add(544, 'years').locale('km').format('YYYY');
    const khBeYear = this.kh.toKhmerNumber(beYear);
    const raw = this.kh.format(date.clone(), 'ឆ្នាំa_e_ព.ស');
    const khDateStr = raw.split('_').join(', ') + ' ' + khBeYear;
    this.initKhDate.set(khDateStr.split('_'));

    // Sort attrs
    this.attributes.update((attrs) =>
      [...attrs].sort(
        (a, b) => new Date(a.dates).getTime() - new Date(b.dates).getTime(),
      ),
    );
  }

  private applyTraditionalEvents(
    date: moment.Moment,
    khResult: KhmerDateResult,
  ): void {
    const dn = this.kh.toKhDateDN(date); // e.g. '១៥កើត'
    const monthName = khResult.khmer.monthName; // e.g. 'ពិសាខ'

    // Match traditional events
    const matchingEvents = this.publicHolidaysService.traditionalEvents.filter(
      (item) =>
        item.start_date.day === dn && item.start_date.month === monthName,
    );

    matchingEvents.forEach((element) => {
      this.attributes.update((attrs) => [
        ...attrs,
        {
          key: 'traditional_events' + date.toString(),
          customData: {
            title: element.summary,
            description: element.description,
            class: 'bg-red-600 text-white',
          },
          dates: date.locale('en').format('YYYY-MM-DD'),
        },
      ]);
    });

    // Buddhist Holy Day
    if (this.getBuddhistHolyDay(dn, date)) {
      this.attributes.update((attrs) => [
        ...attrs,
        {
          key: 'holy-day' + date.toString(),
          customData: {
            title: { kh: 'ថ្ងៃ​សីល', en: 'Holy Day' },
            description: 'Buddhist Holy Day',
            class: 'text-yellow-600',
          },
          dates: date.locale('en').format('YYYY-MM-DD'),
        },
      ]);
    }
  }

  getBuddhistHolyDay(dn: string, date: moment.Moment): boolean {
    if (['៨រោច', '៨កើត', '១៥កើត', '១៥រោច'].includes(dn)) return true;
    if (
      dn === '១៤រោច' &&
      this.kh.toKhDateDN(date.clone().add(1, 'days')) !== '១៥រោច'
    )
      return true;
    return false;
  }

  private getKhmerNewYearAttrs(year: number): CalendarAttribute[] {
    const days = this.kh.getKhmerNewYearDates(year);
    const titles = [
      {
        kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិ (មហាសង្រ្កាន្ត)',
        en: "Khmer New Year's Day (Moha Sangkranta)",
      },
      {
        kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិ (វារៈវ័នបត)',
        en: "Khmer New Year's Day (Veareak Vanabat)",
      },
      {
        kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិ (វារៈឡើងស័ក)',
        en: "Khmer New Year's Day (Veareak Laeung Sak)",
      },
    ];
    return days.map((date, i) => ({
      key:
        'traditional_holidays' + moment(date).locale('en').format('YYYY-MM-DD'),
      customData: {
        title: titles[i] ?? titles[1],
        description: 'Holiday in Cambodia',
        class: 'bg-red-600 text-white',
      },
      dates: moment(date).locale('en').format('YYYY-MM-DD'),
    }));
  }

  prevMonth(): void {
    this.currentMonth.update((m) => {
      if (m === 1) {
        this.currentYear.update((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  }
  nextMonth(): void {
    this.currentMonth.update((m) => {
      if (m === 12) {
        this.currentYear.update((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  }
  prevYear(): void {
    this.currentYear.update((y) => y - 1);
  }
  nextYear(): void {
    this.currentYear.update((y) => y + 1);
  }
  reset(): void {
    this.currentMonth.set(moment().month() + 1);
    this.currentYear.set(moment().year());
  }
}
