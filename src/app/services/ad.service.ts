// src/app/services/ad.service.ts
import { Injectable, signal } from '@angular/core';

export interface Ad {
  id: string;
  type: 'banner' | 'card';
  brand: string;
  tagline: string; 
  taglineEn: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  bgGradient: string;
  accentColor: string;
  emoji: string;
  imageUrl?: string;
}

// ── Mock ad pool — replace with your real API later ───────────────
const AD_POOL: Ad[] = [
  {
    id: 'ad_001',
    type: 'card',
    brand: 'ABA Bank',
    tagline: 'ផ្ញើប្រាក់ងាយស្រួល',
    taglineEn: 'Send Money Easily',
    description: 'Transfer instantly with zero fees inside Cambodia',
    ctaText: 'ចុចមើល',
    ctaUrl: 'https://ababank.com',
    bgGradient: 'from-[#0FC8C0] to-[$#005B7A]',
    accentColor: '#005B7A',
    emoji: '🏦',
  },
  {
    id: 'ad_002',
    type: 'banner',
    brand: 'Wing Bank',
    tagline: 'ដំណើរការលឿន ២៤/៧',
    taglineEn: 'Fast & Always On',
    description: 'Pay bills, top-up, transfer — all in one app',
    ctaText: 'ទាញយក',
    ctaUrl: 'https://wingbank.com.kh',
    bgGradient: 'from-[#0077FF] to-[#9FC136]',
    accentColor: '#9FC136',
    emoji: '🏦',
  },
  {
    id: 'ad_003',
    type: 'card',
    brand: 'Smart Axiata',
    tagline: 'អ៊ីនធឺណិតលឿន',
    taglineEn: 'Lightning Fast Internet',
    description: '4G/5G coverage across all provinces',
    ctaText: 'ជ្រើសរើស',
    ctaUrl: 'https://smart.com.kh',
    bgGradient: 'from-[#009639] to-[#32AE7D]',
    accentColor: '#009639',
    emoji: '📶',
  },
  {
    id: 'ad_004',
    type: 'banner',
    brand: 'Cellcard',
    tagline: 'ការតភ្ជាប់គ្រប់ទីកន្លែង',
    taglineEn: 'Connected Everywhere',
    description: 'Best roaming rates across Southeast Asia',
    ctaText: 'មើលផែនការ',
    ctaUrl: 'https://cellcard.com.kh',
    bgGradient: 'from-[#FEED6D] to-[#F6A227]',
    accentColor: '#F6A227',
    emoji: '🌏',
  },
  {
    id: 'ad_005',
    type: 'card',
    brand: 'Phillip Bank',
    tagline: 'ប្រាក់កម្ចីអត្រាទាប',
    taglineEn: 'Low Interest Loans',
    description: 'Personal & business loans approved in 24 hours',
    ctaText: 'ដាក់ពាក្យ',
    ctaUrl: 'https://phillipbank.com.kh',
    bgGradient: 'from-[#FAB770] to-[#05357D]',
    accentColor: '#05357D',
    emoji: '💰',
  },
  {
    id: 'ad_006',
    type: 'banner',
    brand: 'Khmer Foods',
    tagline: 'អាហារខ្មែរពិតប្រាកដ',
    taglineEn: 'Authentic Khmer Cuisine',
    description: 'Order fresh traditional Khmer food delivered to your door',
    ctaText: 'កម្ម៉ង់ឥឡូវ',
    ctaUrl: '#',
    bgGradient: 'from-amber-500 to-orange-400',
    accentColor: '#f59e0b',
    emoji: '🍲',
  },
];

@Injectable({ providedIn: 'root' })
export class AdService {
  activeAds = signal<Ad[]>([]);

  private lastShownId: string | null = null;

  constructor() {
    this.initSession(2);
  }

  initSession(count: 1 | 2 = 2): void {
    const shuffled = [...AD_POOL].sort(() => Math.random() - 0.5);
    this.activeAds.set(shuffled.slice(0, count));
  }

  // Returns a random ad — avoids showing the same ad twice in a row
  getRandomAd(): Ad | null {
    if (AD_POOL.length === 0) return null;
    const pool = this.lastShownId
      ? AD_POOL.filter(a => a.id !== this.lastShownId)
      : AD_POOL;
    const ad = pool[Math.floor(Math.random() * pool.length)];
    this.lastShownId = ad.id;
    return ad;
  }

  refreshAds(): void {
    this.initSession(Math.random() > 0.5 ? 1 : 2);
  }
}