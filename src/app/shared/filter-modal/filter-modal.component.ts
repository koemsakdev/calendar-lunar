import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonModal, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonModal, IonIcon, IonButton]
})
export class FilterModalComponent {

  @Input() isOpen = false;
  @Input() title = 'Filter';

  @Output() closed = new EventEmitter<void>();

  constructor() {
    addIcons({ closeOutline });
  }

  onDismiss() {
    this.closed.emit();
  }
}
