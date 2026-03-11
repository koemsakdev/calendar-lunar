import { Component, ViewChild, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonIcon } from '@ionic/angular/standalone';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { alarmOutline, calendarOutline, listOutline } from 'ionicons/icons';
import { AdPopupComponent } from '../shared/ad-popup/ad-popup.component';
import { AdService } from '../services/ad.service';

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

  @ViewChild('adPopup') adPopup!: AdPopupComponent;

  private adSvc = inject(AdService);
  private tabChangeCount = 0;

  private repeatTimer?: ReturnType<typeof setInterval>;
  private firstAdTimer?: ReturnType<typeof setTimeout>;

  // ── Config — tweak these to control ad frequency ─────────────────
  private readonly FIRST_AD_DELAY_MS = 30_000; // 30s after app opens
  private readonly TAB_SWITCH_EVERY = 3; // every N tab switches

  constructor() {
    addIcons({ calendarOutline, listOutline, alarmOutline });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([`/tabs/${tab}`]);
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  }
}
