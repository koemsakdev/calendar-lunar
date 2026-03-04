import {
  Component, OnInit, computed, signal, inject, HostListener,
  ElementRef,
  ViewChild,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, searchOutline, checkmarkOutline, closeOutline, chevronDownOutline } from 'ionicons/icons';
import moment from 'moment';
import 'moment/locale/km';

// ── Reuse your existing services & components ─────────────────────
import { CalendarStoreService } from '../../services/calendar-store.service';       // adjust path
import { KhmerDateService } from '../../services/khmer-date.service';               // adjust path
import { PublicHolidaysService } from '../../services/public-holidays.service';     // adjust path
import { FilterModalComponent } from '../../shared/filter-modal/filter-modal.component'; // adjust path

// ── Types ─────────────────────────────────────────────────────────
type FilterType = 'all' | 'holiday' | 'traditional' | 'general';

interface FlatEvent {
  type: 'holiday' | 'traditional' | 'general';
  date: moment.Moment;
  month: number;
  titleKh: string;
  titleEn: string;
}

interface MonthGroup {
  month: number;
  khmerMonth: string;
  englishMonth: string;
  events: FlatEvent[];
}

const KH_MONTHS: Record<number, string> = {
  1: 'មករា',    2: 'កុម្ភៈ',   3: 'មីនា',
  4: 'មេសា',    5: 'ឧសភា',    6: 'មិថុនា',
  7: 'កក្កដា',  8: 'សីហា',    9: 'កញ្ញា',
  10: 'តុលា',  11: 'វិច្ឆិកា', 12: 'ធ្នូ',
};

const ALL_YEARS = Array.from({ length: 51 }, (_, i) => 2000 + i);

@Component({
  selector: 'app-events-page',
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, FilterModalComponent]
})
export class EventsPageComponent implements OnInit {
  @ViewChild('yearList') yearListRef!: ElementRef;

  // ── Inject your existing services ────────────────────────────────
  private calendarStore = inject(CalendarStoreService);
  private kh            = inject(KhmerDateService);
  private holidaysSvc   = inject(PublicHolidaysService);

  // ── State ─────────────────────────────────────────────────────────
  selectedYear    = signal<number>(moment().year());
  activeFilter    = signal<FilterType>('all');
  yearInput       = signal<string>(moment().year().toString());
  showSuggestions = signal<boolean>(false);

  // Year picker modal (reuses your FilterModalComponent)
  yearModalOpen = signal<boolean>(false);
  yearSearchQuery = signal<string>('');

  // ── Year suggestions ──────────────────────────────────────────────
  filteredYears = computed(() => {
    const q = this.yearSearchQuery().toLowerCase();
    return ALL_YEARS.filter(y => y.toString().includes(q));
  });

  // ── Filter chip definitions ───────────────────────────────────────
  readonly filters: {
    value: FilterType; label: string; activeClass: string; dotClass: string;
  }[] = [
    {
      value: 'all',
      label: 'ទាំងអស់',
      activeClass: 'bg-lime-100 dark:bg-lime-100 text-lime-600 dark:text-lime-900 border-lime-800',
      dotClass: 'bg-lime-400',
    },
    {
      value: 'holiday',
      label: 'បុណ្យជាតិ',
      activeClass: 'bg-[#F04923]/10 text-[#F04923] border-[#F04923]/40',
      dotClass: 'bg-[#F04923]',
    },
    {
      value: 'traditional',
      label: 'ប្រពៃណី',
      activeClass: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-300',
      dotClass: 'bg-amber-500',
    },
    {
      value: 'general',
      label: 'ទូទៅ',
      activeClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300',
      dotClass: 'bg-blue-400',
    },
  ];

  // ── Resolve all events for the selected year ──────────────────────
  private allEvents = computed<FlatEvent[]>(() => {
    const year = this.selectedYear();
    const result: FlatEvent[] = [];

    // 1. Fixed Gregorian public holidays & general events
    for (const ev of this.holidaysSvc.events) {
      const date = moment({ year, month: ev.start_date.month - 1, day: ev.start_date.day });
      if (!date.isValid()) continue;
      result.push({
        type: ev.description === 'Holiday in Cambodia' ? 'holiday' : 'general',
        date,
        month: date.month() + 1,
        titleKh: typeof ev.summary === 'string' ? ev.summary : ev.summary.kh,
        titleEn: typeof ev.summary === 'string' ? ev.summary : ev.summary.en,
      });
    }

    // 2. Khmer New Year (3 days) — uses your KhmerDateService.getKhmerNewYearDates()
    try {
      const nyDates = this.kh.getKhmerNewYearDates(year);
      const nyTitles = [
        { kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មី (មហាសង្រ្កាន្ត)', en: 'Khmer New Year - Moha Sangkranta' },
        { kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មី (វារៈវ័នបត)',      en: 'Khmer New Year - Veareak Vanabat' },
        { kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មី (វារៈឡើងស័ក)',    en: 'Khmer New Year - Veareak Laeung Sak' },
      ];
      nyDates.forEach((d, i) => {
        const date = moment(d);
        result.push({
          type: 'holiday',
          date,
          month: date.month() + 1,
          titleKh: nyTitles[i].kh,
          titleEn: nyTitles[i].en,
        });
      });
    } catch (_) {}

    // 3. Traditional/lunar events — uses KhmerDateService.fromMoment() + toKhDateDN()
    //    Same logic your CalendarStoreService uses in applyTraditionalEvents()
    for (const ev of this.holidaysSvc.traditionalEvents) {
      const resolved = this.resolveLunarDate(ev.start_date.day, ev.start_date.month, year);
      if (!resolved) continue;
      result.push({
        type: 'traditional',
        date: resolved,
        month: resolved.month() + 1,
        titleKh: ev.summary.kh,
        titleEn: ev.summary.en,
      });
    }

    return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
  });

  // ── All 12 months always rendered ────────────────────────────────
  groupedEvents = computed<MonthGroup[]>(() => {
    const filter = this.activeFilter();
    const events = filter === 'all'
      ? this.allEvents()
      : this.allEvents().filter(e => e.type === filter);

    const map = new Map<number, FlatEvent[]>();
    for (const ev of events) {
      const arr = map.get(ev.month) ?? [];
      arr.push(ev);
      map.set(ev.month, arr);
    }

    // Always return all 12 months — empty = show "no events" placeholder
    return Array.from({ length: 12 }, (_, i) => i + 1).map(month => ({
      month,
      khmerMonth:   KH_MONTHS[month],
      englishMonth: moment({ month: month - 1 }).locale('en').format('MMMM'),
      events:       map.get(month) ?? [],
    }));
  });

  totalEvents = computed(() =>
    this.groupedEvents().reduce((sum, g) => sum + g.events.length, 0)
  );

  constructor() {
    addIcons({calendarOutline,chevronDownOutline,searchOutline,checkmarkOutline,closeOutline});

    effect(() => {
      if (this.yearModalOpen()) {
        setTimeout(() => this.scrollToActiveYear(), 150);
      }
    });
  }

  ngOnInit(): void {}

  private scrollToActiveYear(): void {
    if (!this.yearListRef) return;
    const container: HTMLElement = this.yearListRef.nativeElement;
    const active = container.querySelector(
      `[data-year="${this.selectedYear()}"]`
    ) as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ── Actions ───────────────────────────────────────────────────────
  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.yearModalOpen.set(false);
    this.yearSearchQuery.set('');
  }

  setFilter(f: FilterType): void { this.activeFilter.set(f); }

  toggleYearModal(): void { this.yearModalOpen.set(!this.yearModalOpen()); }

  // ── Template helpers ──────────────────────────────────────────────
  formatEventDate(ev: FlatEvent): string {
    return ev.date.clone().locale('km').format('dddd, DD MMMM YYYY');
  }

  getCardClass(ev: FlatEvent): string {
    if (ev.type === 'holiday')     return 'bg-red-50 dark:bg-red-950 ring-1 ring-red-100 dark:ring-red-900';
    if (ev.type === 'traditional') return 'bg-amber-50 dark:bg-amber-950 ring-1 ring-amber-100 dark:ring-amber-900';
    return 'bg-blue-50 dark:bg-blue-950 ring-1 ring-blue-100 dark:ring-blue-900';
  }

  getStripeClass(ev: FlatEvent): string {
    if (ev.type === 'holiday')     return 'bg-[#F04923]';
    if (ev.type === 'traditional') return 'bg-amber-500';
    return 'bg-blue-400';
  }

  getDateColor(ev: FlatEvent): string {
    if (ev.type === 'holiday')     return 'text-[#F04923] dark:text-[#FF7A52]';
    if (ev.type === 'traditional') return 'text-amber-600 dark:text-amber-400';
    return 'text-blue-500 dark:text-blue-400';
  }

  getTitleColor(ev: FlatEvent): string {
    if (ev.type === 'holiday')     return 'text-[#F04923] dark:text-[#FF7A52]';
    if (ev.type === 'traditional') return 'text-amber-700 dark:text-amber-300';
    return 'text-blue-700 dark:text-blue-300';
  }

  getBadgeClass(ev: FlatEvent): string {
    if (ev.type === 'holiday')
      return 'bg-[#F04923]/10 text-[#F04923] dark:bg-[#F04923]/20 dark:text-[#FF7A52]';
    if (ev.type === 'traditional')
      return 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400';
    return 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400';
  }

  getBadgeLabel(ev: FlatEvent): string {
    if (ev.type === 'holiday')     return 'បុណ្យជាតិ';
    if (ev.type === 'traditional') return 'ប្រពៃណី';
    return 'ទូទៅ';
  }

  // ── Resolve Khmer lunar date → Gregorian ──────────────────────────
  // Mirrors your CalendarStoreService.applyTraditionalEvents() approach
  // Uses kh.fromMoment() and kh.toKhDateDN() — your own KhmerDateService methods
  private resolveLunarDate(
    khDay: string,
    khMonth: string,
    year: number
  ): moment.Moment | null {
    const start = moment({ year, month: 0,  day: 1 });
    const end   = moment({ year, month: 11, day: 31 });

    for (const d = start.clone(); d.isSameOrBefore(end); d.add(1, 'day')) {
      try {
        const result = this.kh.fromMoment(d);
        if (
          result.khmer.monthName === khMonth &&
          this.kh.toKhDateDN(d)  === khDay
        ) {
          return d.clone();
        }
      } catch (_) { continue; }
    }
    return null;
  }
}
