import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { EventsPageComponent } from '../components/events-page/events-page.component';
import { AdBannerComponent } from '../shared/ad-banner/ad-banner.component';
import { AdService } from '../services/ad.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, EventsPageComponent, AdBannerComponent],
})
export class Tab2Page {
  adSvc = inject(AdService);

  constructor() { }

}
