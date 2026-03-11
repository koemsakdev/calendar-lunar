import { Component, ViewChild, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonIcon } from '@ionic/angular/standalone';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { alarmOutline, calendarOutline, listOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonIcon, NgClass],
})
export class TabsPage {
  @ViewChild('tabs') tabs!: IonTabs;

  activeTab = 'tab1';
  public environmentInjector = inject(EnvironmentInjector);
  private router = inject(Router);

  constructor() {
    addIcons({ calendarOutline, listOutline, alarmOutline });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([`/tabs/${tab}`]);
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  }
}