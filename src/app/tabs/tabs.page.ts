import { Component, ViewChild, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { alarmOutline, calendarOutline, listOutline } from 'ionicons/icons';
import { AdPopupComponent } from '../shared/ad-popup/ad-popup.component';
import { AdService } from '../services/ad.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonIcon, AdPopupComponent],
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

  ngOnInit(): void {
    // ── First ad: show after 30 seconds ──────────────────────────
    this.firstAdTimer = setTimeout(() => {
      this.showAd();

      // ── Repeat ad every 2 minutes after the first one ─────────
      this.repeatTimer = setInterval(() => {
        this.showAd();
        this.scheduleNextAd();
      }, this.FIRST_AD_DELAY_MS);
    }, this.FIRST_AD_DELAY_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.firstAdTimer);
    clearTimeout(this.repeatTimer);
  }

  onTabChange(): void {
    this.tabChangeCount++;
    // Also show ad every N tab switches (independent of the timer)
    if (this.tabChangeCount % this.TAB_SWITCH_EVERY === 0) {
      this.adSvc.refreshAds();
      setTimeout(() => this.showAd(), 1500); // small delay after tab switch
    }
  }

  private showAd(): void {
    this.adSvc.refreshAds();
    this.adPopup?.scheduleShow(0);
  }

  // Recursively schedules itself with a new random delay each time
  private scheduleNextAd(): void {
    const minMs = 1 * 60 * 1000; // 1 minute
    const maxMs = 10 * 60 * 1000; // 10 minutes
    const randomMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

    console.log(`Next ad in ${Math.round(randomMs / 60000)} min`);

    this.repeatTimer = setTimeout(() => {
      this.showAd();
      this.scheduleNextAd(); // schedule the next one after showing
    }, randomMs);
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([`/tabs/${tab}`]);
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  }
}
