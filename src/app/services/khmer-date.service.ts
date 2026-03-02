import { Injectable } from '@angular/core';
import moment from 'moment';
import * as momentkhLib from '@thyrith/momentkh';

// ─── The actual API of this version of @thyrith/momentkh ─────────────────────
// It is NOT a moment-wrapper. It is a standalone Khmer calendar library.
// Exported functions: fromGregorian, fromDate, getNewYear, format, fromKhmer, toDate
// There is no Moment() wrapper / no getKhNewYearMoment2.

export interface KhmerDateResult {
  gregorian: { year: number; month: number; day: number; dayOfWeek: number };
  khmer: {
    day: number;
    moonPhase: number;
    moonPhaseName: string;
    monthIndex: number;
    monthName: string;
    beYear: number;
    jsYear: number;
    animalYear: number;
    animalYearName: string;
    sak: number;
    sakName: string;
    dayOfWeek: number;
    dayOfWeekName: string;
  };
}



// Resolve lib — handles both ESM default-interop and direct named exports
const lib: any = (momentkhLib as any).default ?? momentkhLib;

@Injectable({ providedIn: 'root' })
export class KhmerDateService {
  private readonly khDigits: Record<string, string> = {
    '0': '០',
    '1': '១',
    '2': '២',
    '3': '៣',
    '4': '៤',
    '5': '៥',
    '6': '៦',
    '7': '៧',
    '8': '៨',
    '9': '៩',
  };

  fromMoment(m: moment.Moment): KhmerDateResult {
    return lib.fromGregorian(
      m.year(),
      m.month() + 1,
      m.date(),
      m.hours(),
      m.minutes(),
      m.seconds()
    );
  }

  format(m: moment.Moment, formatStr: string): string {
    const khDate = this.fromMoment(m);
    return lib.format(khDate, formatStr);
  }

  toLunarDate(m: moment.Moment): string {
    const khDate = this.fromMoment(m);
    return lib.format(khDate);
  }

  toKhDateDN(m: moment.Moment): string {
    return this.format(m, 'dN');
  }

  toKhDateMonth(m: moment.Moment): string {
    return this.format(m, 'm');
  }

  toKhDateMulti(m: moment.Moment, ...tokens: string[]): string[] {
    return tokens.map(t => this.format(m, t));
  }

  toKhmerNumber(input: string | number): string {
    return input
      .toString()
      .split('')
      .map(d => this.khDigits[d] ?? d)
      .join('');
  }

  khDay(m: moment.Moment): number {
    const result = this.fromMoment(m);
    const { day, moonPhase } = result.khmer;
    return moonPhase === 0 ? day - 1 : 14 + day;
  }

  getKhmerNewYearDates(year: number): Date[] {
    const nyInfo = lib.getNewYear(year) as {
      year: number; month: number; day: number; hour: number; minute: number;
    };
    return [0, 1, 2].map(
      (i) => new Date(nyInfo.year, nyInfo.month - 1, nyInfo.day + i)
    );
  }
}