import { Component, inject } from '@angular/core';
import moment from 'moment';
import { CalendarStoreService, CalendarAttribute } from '../../services/calendar-store.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-holidays-list',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './holidays-list.component.html',
  styleUrls: ['./holidays-list.component.scss'],
})
export class HolidaysListComponent {
  calendarStore = inject(CalendarStoreService);

  get monthLabel(): string {
    return this.calendarStore.initDate().locale('km').format('MMMM');
  }

  get filteredAttributes(): CalendarAttribute[] {
    const initDate = this.calendarStore.initDate();
    return this.calendarStore.attributes().filter((holiday) => {
      if (!holiday.customData?.title) return false;
      const titleObj = holiday.customData.title as { kh: string; en: string };
      if (titleObj.en === 'today' || titleObj.en === 'Holy Day') return false;
      return initDate.isSame(holiday.dates, 'months');
    });
  }

  formatDate(dateStr: string): string {
    return moment(dateStr).locale('km').format('dddd ll');
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

  isToday(attr: CalendarAttribute): boolean {
    return attr.customData.description === 'today';
  }
}