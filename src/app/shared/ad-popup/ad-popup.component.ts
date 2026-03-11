// src/app/shared/ad-popup/ad-popup.component.ts
import {
  Component, signal, inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, openOutline } from 'ionicons/icons';
import { AdService, Ad } from '../../services/ad.service';

@Component({
  selector: 'app-ad-popup',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <!-- Backdrop (subtle) -->
    <div
      *ngIf="visible()"
      class="fixed inset-0 z-[8888] pointer-events-none"
      style="background: rgba(0,0,0,0.08)"
    ></div>

    <!-- Floating Ad Card -->
    <div
      *ngIf="visible()"
      class="fixed bottom-28 left-4 right-4 z-[8999]"
      [class.ad-slide-in]="animateIn()"
      [class.ad-slide-out]="animateOut()"
    >
      <div class="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
           [style]="cardStyle()">

        <!-- Top bar: Ad label + close -->
        <div class="flex items-center justify-between px-4 pt-3 pb-1">
          <div class="flex items-center gap-1.5">
            <div class="w-1.5 h-1.5 rounded-full bg-white/60"></div>
            <span class="font-siemreap text-[10px] text-white/70 uppercase tracking-widest">
              ពាណិជ្ជកម្ម
            </span>
          </div>
          <button
            (click)="close()"
            class="w-7 h-7 rounded-full bg-black/20 flex items-center
                   justify-center active:scale-90 transition-all"
          >
            <ion-icon name="close-outline" class="text-white text-base"></ion-icon>
          </button>
        </div>

        <!-- Main content -->
        <div class="px-4 pb-4 pt-2 flex items-center gap-4">

          <!-- Big emoji -->
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center
                      justify-center flex-shrink-0 text-3xl shadow-inner">
            {{ ad()?.emoji }}
          </div>

          <!-- Text block -->
          <div class="flex-1 min-w-0">
            <p class="font-siemreap text-[11px] text-white/60 mb-0.5"
               style="line-height:1.6">{{ ad()?.brand }}</p>
            <h3 class="font-moul text-base text-white leading-loose
                       overflow-visible">
              {{ ad()?.tagline }}
            </h3>
            <p class="font-siemreap text-xs text-white/75 mt-0.5 line-clamp-2"
               style="line-height:1.6">
              {{ ad()?.description }}
            </p>
          </div>
        </div>

        <!-- CTA button full width -->
        <div class="px-4 pb-5">
          <a
            [href]="ad()?.ctaUrl"
            target="_blank"
            (click)="onCtaClick()"
            class="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                   bg-white font-siemreap text-sm font-semibold
                   active:scale-[0.98] transition-all shadow-md"
            [style.color]="ad()?.accentColor"
            style="line-height:1.8"
          >
            {{ ad()?.ctaText }}
            <ion-icon name="open-outline" class="text-base"></ion-icon>
          </a>
        </div>

        <!-- Decorative circles -->
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full
                    bg-white/5 translate-x-12 -translate-y-12 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 rounded-full
                    bg-white/5 -translate-x-8 translate-y-8 pointer-events-none"></div>
      </div>

      <!-- Timer bar -->
      <div class="mt-2 mx-2 h-1 rounded-full bg-white/20 overflow-hidden">
        <div
          class="h-full rounded-full bg-white/60"
          [class.timer-shrink]="timerActive()"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .ad-slide-in {
      animation: slideInRight 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
    }
    .ad-slide-out {
      animation: slideOutLeft 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
    }
    .timer-shrink {
      animation: timerShrink 8s linear forwards;
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100%) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes slideOutLeft {
      from { opacity: 1; transform: translateX(0) scale(1); }
      to   { opacity: 0; transform: translateX(-100%) scale(0.95); }
    }
    @keyframes timerShrink {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `],
})
export class AdPopupComponent implements OnInit, OnDestroy {
  private adSvc = inject(AdService);

  visible     = signal(false);
  animateIn   = signal(false);
  animateOut  = signal(false);
  timerActive = signal(false);
  ad          = signal<Ad | null>(null);

  private showTimer?: ReturnType<typeof setTimeout>;
  private autoCloseTimer?: ReturnType<typeof setTimeout>;

  // Gradient background style
  cardStyle = () => {
    const a = this.ad();
    if (!a) return {};
    const map: Record<string, string> = {
      'from-blue-600': '#2563eb',   'to-blue-400': '#60a5fa',
      'from-orange-500': '#f97316', 'to-yellow-400': '#facc15',
      'from-red-500': '#ef4444',    'to-pink-400': '#f472b6',
      'from-green-500': '#22c55e',  'to-emerald-400': '#34d399',
      'from-violet-600': '#7c3aed', 'to-purple-400': '#c084fc',
      'from-amber-500': '#f59e0b',  'to-orange-400': '#fb923c',
    };
    const parts = a.bgGradient.split(' ');
    const from  = map[parts[0]] ?? a.accentColor;
    const to    = map[parts[1]] ?? '#999';
    return { background: `linear-gradient(135deg, ${from}, ${to})` };
  };

  constructor() {
    addIcons({ closeOutline, openOutline });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.autoCloseTimer);
  }

  // Call this from the page — delay in ms before showing
  scheduleShow(delayMs: number = 30000): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.autoCloseTimer);

    const randomAd = this.adSvc.getRandomAd();
    if (!randomAd) return;

    this.showTimer = setTimeout(() => {
      this.ad.set(randomAd);
      this.visible.set(true);

      // Trigger slide-in after DOM renders
      setTimeout(() => {
        this.animateIn.set(true);
        this.timerActive.set(true);
      }, 50);

      // Auto-close after 8 seconds
      this.autoCloseTimer = setTimeout(() => this.close(), 8000);
    }, delayMs);
  }

  close(): void {
    this.animateIn.set(false);
    this.animateOut.set(true);
    setTimeout(() => {
      this.visible.set(false);
      this.animateOut.set(false);
      this.timerActive.set(false);
    }, 300);
  }

  onCtaClick(): void {
    this.close();
  }
}