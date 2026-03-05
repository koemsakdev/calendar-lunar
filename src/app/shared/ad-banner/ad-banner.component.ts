// src/app/shared/ad-banner/ad-banner.component.ts
import {
    Component, Input, signal, inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, openOutline } from 'ionicons/icons';
import { Ad, AdService } from '../../services/ad.service';

@Component({
    selector: 'app-ad-banner',
    standalone: true,
    imports: [CommonModule, IonIcon],
    template: `
    <div *ngIf="ad && !dismissed()"
         class="relative mx-4 my-3 rounded-2xl overflow-hidden shadow-sm"
         [style.background]="'linear-gradient(135deg, ' + gradientStart() + ', ' + gradientEnd() + ')'">

      <!-- Dismiss button -->
      <button
        (click)="dismiss()"
        class="absolute top-2 right-2 z-10 w-6 h-6 rounded-full
               bg-white/20 flex items-center justify-center
               hover:bg-white/30 transition-colors"
      >
        <ion-icon name="close-outline" class="text-white text-sm"></ion-icon>
      </button>

      <!-- Ad label -->
      <div class="absolute top-2 left-3">
        <span class="font-siemreap text-[9px] text-white/60 uppercase tracking-widest">
          ពាណិជ្ជកម្ម
        </span>
      </div>

      <!-- Content -->
      <div class="flex items-center gap-3 px-4 pt-6 pb-4">

        <!-- Emoji icon box -->
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center
                    justify-center flex-shrink-0 text-2xl">
          {{ ad.emoji }}
        </div>

        <!-- Text -->
        <div class="flex-1 min-w-0">
          <p class="font-siemreap text-[10px] text-white/70"
             style="line-height:1.6">{{ ad.brand }}</p>
          <h3 class="font-moul text-sm text-white leading-loose overflow-visible">
            {{ ad.tagline }}
          </h3>
          <p class="font-siemreap text-xs text-white/80 mt-0.5 truncate"
             style="line-height:1.6">{{ ad.description }}</p>
        </div>

        <!-- CTA button -->
        <a [href]="ad.ctaUrl" target="_blank"
           class="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl
                  bg-white text-xs font-siemreap font-semibold
                  active:scale-95 transition-all shadow-sm"
           [style.color]="ad.accentColor"
           style="line-height:1.8">
          {{ ad.ctaText }}
          <ion-icon name="open-outline" class="text-xs"></ion-icon>
        </a>
      </div>

      <!-- Subtle bottom decoration -->
      <div class="absolute bottom-0 right-0 w-24 h-24 rounded-full
                  bg-white/5 translate-x-8 translate-y-8 pointer-events-none">
      </div>
      <div class="absolute top-0 left-16 w-16 h-16 rounded-full
                  bg-white/5 -translate-y-8 pointer-events-none">
      </div>
    </div>
  `,
})
export class AdBannerComponent implements OnInit {
    @Input() ad!: Ad;

    dismissed = signal(false);

    // Parse gradient colors from Tailwind class string
    // Falls back to accent color if parsing fails
    gradientStart(): string {
        return this.parseGradient(0);
    }
    gradientEnd(): string {
        return this.parseGradient(1);
    }

    private GRADIENT_MAP: Record<string, string> = {
        'from-blue-600': '#2563eb', 'to-blue-400': '#60a5fa',
        'from-orange-500': '#f97316', 'to-yellow-400': '#facc15',
        'from-red-500': '#ef4444', 'to-pink-400': '#f472b6',
        'from-green-500': '#22c55e', 'to-emerald-400': '#34d399',
        'from-violet-600': '#7c3aed', 'to-purple-400': '#c084fc',
        'from-amber-500': '#f59e0b', 'to-orange-400': '#fb923c',
    };

    private parseGradient(index: 0 | 1): string {
        const parts = this.ad?.bgGradient?.split(' ') ?? [];
        const key = parts[index];
        return this.GRADIENT_MAP[key] ?? (index === 0 ? this.ad?.accentColor : '#999');
    }

    constructor() {
        addIcons({ closeOutline, openOutline });
    }

    ngOnInit(): void { }

    dismiss(): void {
        this.dismissed.set(true);
    }
}