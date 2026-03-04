// public-holidays.service.ts
import { Injectable } from '@angular/core';

export interface EventSummary {
  kh: string;
  en: string;
}

export interface CalendarEvent {
  summary: EventSummary;
  description: string;
  start_date: {
    day: number;
    month: number;
  };
  date: null;
  image: string;
}

export interface TraditionalEvent {
  summary: EventSummary;
  description: string;
  start_date: {
    day: string; // Khmer lunar day e.g. '១៥កើត'
    month: string; // Khmer lunar month e.g. 'ពិសាខ'
  };
  image: string;
}

@Injectable({ providedIn: 'root' })
export class PublicHolidaysService {
  // ─────────────────────────────────────────────────────────────────────────
  // FIXED GREGORIAN PUBLIC HOLIDAYS
  // Source: Official Royal Government of Cambodia Prakas + NBC official list
  // These dates are fixed every year (same day/month regardless of year)
  // ─────────────────────────────────────────────────────────────────────────
  readonly events: CalendarEvent[] = [
    // ── JANUARY ────────────────────────────────────────────────────────────
    {
      summary: { kh: 'ទិវាចូលឆ្នាំសកល', en: "International New Year's Day" },
      description: 'Holiday in Cambodia',
      start_date: { day: 1, month: 1 },
      date: null,
      image: '',
    },
    {
      summary: {
        kh: 'ទិវាជ័យជំនះលើរបបប្រល័យពូជសាសន៍',
        en: 'Day of Victory over the Genocidal Regime',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: 7, month: 1 },
      date: null,
      image: '',
    },

    // ── FEBRUARY ───────────────────────────────────────────────────────────
    {
      summary: { kh: 'ថ្ងៃបុណ្យនៃសេចក្តីស្រលាញ់', en: "Valentine's Day" },
      description: 'General Event',
      start_date: { day: 14, month: 2 },
      date: null,
      image: '',
    },
    {
      summary: {
        kh: 'ទិវាជាតិសុខភាពមាតា និងទារក',
        en: 'National Day on Maternal, Newborn and Child Health',
      },
      description: 'General Event',
      start_date: { day: 21, month: 2 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវាជាតិយល់ដឹងពីមីន', en: 'National Mine Awareness Day' },
      description: 'General Event',
      start_date: { day: 24, month: 2 },
      date: null,
      image: '',
    },

    // ── MARCH ──────────────────────────────────────────────────────────────
    {
      summary: { kh: 'ទិវានារីអន្តរជាតិ', en: "International Women's Day" },
      description: 'Holiday in Cambodia',
      start_date: { day: 8, month: 3 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវាវប្បធម៌ជាតិ', en: 'National Culture Day' },
      description: 'General Event',
      start_date: { day: 3, month: 3 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវានយោបាយទឹក', en: 'Water Policy Day' },
      description: 'General Event',
      start_date: { day: 4, month: 3 },
      date: null,
      image: '',
    },
    {
      summary: {
        kh: 'ទិវាពិភពលោកទឹក និងឧតុនិយម',
        en: 'World Water and World Meteorological Day',
      },
      description: 'General Event',
      start_date: { day: 22, month: 3 },
      date: null,
      image: '',
    },
    {
      summary: {
        kh: 'ទិវាពិភពលោកកំចាត់ជម្ងឺរបេង',
        en: 'World Tuberculosis Day',
      },
      description: 'General Event',
      start_date: { day: 24, month: 3 },
      date: null,
      image: '',
    },

    // ── MAY ────────────────────────────────────────────────────────────────
    {
      summary: { kh: 'ទិវាពលកម្មអន្តរជាតិ', en: 'International Labour Day' },
      description: 'Holiday in Cambodia',
      start_date: { day: 1, month: 5 },
      date: null,
      image: '',
    },
    {
      summary: {
        kh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី ព្រះមហាក្សត្រ នៃព្រះរាជាណាចក្រកម្ពុជា',
        en: 'Birthday of His Majesty King Norodom Sihamoni',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: 14, month: 5 },
      date: null,
      image: '',
    },
    // King's Birthday Day 2 (May 15) — officially a 2-day holiday
    {
      summary: {
        kh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី (ថ្ងៃទី២)',
        en: 'Birthday of His Majesty King Norodom Sihamoni (Day 2)',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: 15, month: 5 },
      date: null,
      image: '',
    },

    // ── JUNE ───────────────────────────────────────────────────────────────
    {
      summary: {
        kh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ ព្រះវររាជមាតាជាតិខ្មែរ',
        en: 'Birthday of Her Majesty the Queen-Mother Norodom Monineath Sihanouk',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: 18, month: 6 },
      date: null,
      image: '',
    },

    // ── SEPTEMBER ──────────────────────────────────────────────────────────
    {
      summary: { kh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', en: 'Constitution Day' },
      description: 'Holiday in Cambodia',
      start_date: { day: 24, month: 9 },
      date: null,
      image: '',
    },

    // ── OCTOBER ────────────────────────────────────────────────────────────
    {
      summary: {
        kh: 'ទិវាប្រារព្ធពិធីគោរពព្រះវិញ្ញាណក្ខន្ធ ព្រះករុណា ព្រះបាទសម្តេច ព្រះនរោត្តម សីហនុ "ព្រះបរមរតនកោដ្ឋ"',
        en: 'Mourning Day of the Late King-Father Norodom Sihanouk',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: 15, month: 10 },
      date: null,
      image: '',
    },
    {
      summary: {
        kh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ ព្រះករុណា ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី',
        en: 'Coronation Day of His Majesty King Norodom Sihamoni',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: 29, month: 10 },
      date: null,
      image: '',
    },

    // ── NOVEMBER ───────────────────────────────────────────────────────────
    {
      summary: { kh: 'ពិធីបុណ្យឯករាជ្យជាតិ', en: 'National Independence Day' },
      description: 'Holiday in Cambodia',
      start_date: { day: 9, month: 11 },
      date: null,
      image: '',
    },

    // ── DECEMBER ───────────────────────────────────────────────────────────
    {
      summary: {
        kh: 'ទិវាសន្តិភាពជាតិ',
        en: 'National Peace Day / Paris Peace Agreement Day',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: 29, month: 12 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវាបុណ្យណូអែល', en: 'Christmas Day' },
      description: 'General Event',
      start_date: { day: 25, month: 12 },
      date: null,
      image: '',
    },

    // ── OTHER GENERAL / OBSERVANCE DAYS ────────────────────────────────────
    {
      summary: {
        kh: 'ទិវាសិទ្ធិអន្តរជាតិ',
        en: 'International Human Rights Day',
      },
      description: 'General Event',
      start_date: { day: 10, month: 12 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវាបរិស្ថានពិភពលោក', en: 'World Environment Day' },
      description: 'General Event',
      start_date: { day: 5, month: 6 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវាកុមារអន្តរជាតិ', en: "International Children's Day" },
      description: 'General Event',
      start_date: { day: 1, month: 6 },
      date: null,
      image: '',
    },
    {
      summary: {
        kh: 'ទិវាជនពិការអន្តរជាតិ',
        en: 'International Day of Persons with Disabilities',
      },
      description: 'General Event',
      start_date: { day: 3, month: 12 },
      date: null,
      image: '',
    },
    {
      summary: {
        kh: 'ទិវាប្រឆាំងអំពើពុករលួយអន្តរជាតិ',
        en: 'International Anti-Corruption Day',
      },
      description: 'General Event',
      start_date: { day: 9, month: 12 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវាជាតិប្រយុទ្ធប្រឆាំងជំងឺអេដស៍', en: 'World AIDS Day' },
      description: 'General Event',
      start_date: { day: 1, month: 12 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវាអប់រំអន្តរជាតិ', en: "World Teachers' Day" },
      description: 'General Event',
      start_date: { day: 5, month: 10 },
      date: null,
      image: '',
    },
    {
      summary: { kh: 'ទិវាអាហារពិភពលោក', en: 'World Food Day' },
      description: 'General Event',
      start_date: { day: 16, month: 10 },
      date: null,
      image: '',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // LUNAR / TRADITIONAL HOLIDAYS
  // These are calculated from the Khmer lunar calendar each year.
  // day = Khmer lunar day string, month = Khmer lunar month name
  // ─────────────────────────────────────────────────────────────────────────
  readonly traditionalEvents: TraditionalEvent[] = [
    // ── Visak Bochea ✅ Official holiday
    {
      summary: { kh: 'ពិធីបុណ្យវិសាខបូជា', en: 'Visak Bochea Day' },
      description: 'Holiday in Cambodia',
      start_date: { day: '១៥កើត', month: 'ពិសាខ' },
      image: '',
    },

    // ── Royal Ploughing Ceremony ✅ Official holiday
    {
      summary: {
        kh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',
        en: 'Royal Ploughing Ceremony',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: '៤កើត', month: 'ពិសាខ' },
      image: '',
    },

    // ── Pchum Ben ✅ Official holiday — 3 days
    {
      summary: {
        kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)',
        en: 'Pchum Ben Festival (Day 1)',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: '១៤រោច', month: 'ភទ្របទ' },
      image: '',
    },
    {
      summary: {
        kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)',
        en: 'Pchum Ben Festival (Day 2)',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: '១៥រោច', month: 'ភទ្របទ' },
      image: '',
    },
    {
      summary: {
        kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)',
        en: 'Pchum Ben Festival (Day 3)',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: '១កើត', month: 'អស្សុជ' },
      image: '',
    },

    // ── Water Festival ✅ Official holiday — 3 days — FIXED: កត្ដិក not កត្ដិក
    {
      summary: {
        kh: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ អកអំបុក (ថ្ងៃទី១)',
        en: 'Water Festival - Bon Om Touk (Day 1)',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: '១៤កើត', month: 'កត្ដិក' },
      image: '',
    },
    {
      summary: {
        kh: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ អកអំបុក (ថ្ងៃទី២)',
        en: 'Water Festival - Bon Om Touk (Day 2)',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: '១៥កើត', month: 'កត្ដិក' },
      image: '',
    },
    {
      summary: {
        kh: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ អកអំបុក (ថ្ងៃទី៣)',
        en: 'Water Festival - Bon Om Touk (Day 3)',
      },
      description: 'Holiday in Cambodia',
      start_date: { day: '១រោច', month: 'កត្ដិក' },
      image: '',
    },

    // ── Meak Bochea ✅ Official holiday
    {
      summary: { kh: 'ពិធីបុណ្យមាឃបូជា', en: 'Meak Bochea Day' },
      description: 'Holiday in Cambodia',
      start_date: { day: '១៥កើត', month: 'មាឃ' },
      image: '',
    },

    // ── Asala Bochea — observance only, NOT official paid holiday
    {
      summary: { kh: 'ពិធីបុណ្យអាសាឍបូជា', en: 'Asala Bochea Day' },
      description: 'General Event',
      start_date: { day: '១៥កើត', month: 'អាសាឍ' },
      image: '',
    },

    // ── Chol Vossa — religious observance only
    {
      summary: { kh: 'ចូលវស្សា', en: 'Chol Vossa (Buddhist Lent Begins)' },
      description: 'General Event',
      start_date: { day: '១រោច', month: 'អាសាឍ' },
      image: '',
    },

    // ── Chenh Vossa — religious observance only
    {
      summary: { kh: 'ចេញវស្សា', en: 'Chenh Vossa (Buddhist Lent Ends)' },
      description: 'General Event',
      start_date: { day: '១៥កើត', month: 'អស្សុជ' },
      image: '',
    },

    // ── Kathen — ceremony, not a public holiday
    {
      summary: { kh: 'ពិធីបុណ្យកឋិន', en: 'Kathen Ceremony (Robe Offering)' },
      description: 'General Event',
      start_date: { day: '១រោច', month: 'អស្សុជ' },
      image: '',
    },
  ];
}
