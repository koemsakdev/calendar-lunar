// src/typings/momentkh.d.ts
// Type declaration for @thyrith/momentkh which lacks official TS typings

declare module '@thyrith/momentkh' {
  import * as moment from 'moment';

  export interface KhmerMoment extends moment.Moment {
    /** Returns a Khmer-formatted date string using a format pattern */
    toKhDate(format: string): string;
    /** Returns the full Khmer lunar date string */
    toLunarDate(): string;
    /** Returns the day index within the Khmer lunar month (0 = first day) */
    khDay(): number;
  }

  function momentkh(momentInstance: typeof moment): {
    /** Wraps a moment object with Khmer lunar date methods */
    Moment: (m: moment.Moment) => KhmerMoment;
    /** Returns Khmer New Year dates for a given year */
    getKhNewYearMoment2: (year: number) => { days: Date[] };
  };

  export = momentkh;
}