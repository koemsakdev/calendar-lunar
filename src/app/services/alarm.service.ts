// src/app/services/alarm.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AlarmService {
  private audio: HTMLAudioElement | null = null;

  playAlarm(): void {
    this.audio = new Audio('assets/sounds/alarm.wav');
    this.audio.loop = false;
    this.audio.volume = 1.0;
    this.audio.play().catch(e => console.warn('Audio play blocked:', e));
  }

  stopAlarm(): void {
    this.audio?.pause();
    this.audio?.remove();
    this.audio = null;
  }
}