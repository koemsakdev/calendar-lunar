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
    bgGradient: 'from-blue-600 to-blue-400',
    accentColor: '#2563eb',
    emoji: '🏦',
  },
  {
    id: 'ad_002',
    type: 'banner',
    brand: 'Wing Money',
    tagline: 'ដំណើរការលឿន ២៤/៧',
    taglineEn: 'Fast & Always On',
    description: 'Pay bills, top-up, transfer — all in one app',
    ctaText: 'ទាញយក',
    ctaUrl: 'https://wingmoney.com',
    bgGradient: 'from-orange-500 to-yellow-400',
    accentColor: '#f97316',
    emoji: '💸',
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
    bgGradient: 'from-red-500 to-pink-400',
    accentColor: '#ef4444',
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
    bgGradient: 'from-green-500 to-emerald-400',
    accentColor: '#22c55e',
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
    bgGradient: 'from-violet-600 to-purple-400',
    accentColor: '#7c3aed',
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

  constructor() {
    this.initSession(2);
  }

  initSession(count: 1 | 2 = 2): void {
    const shuffled = [...AD_POOL].sort(() => Math.random() - 0.5);
    this.activeAds.set(shuffled.slice(0, count));
  }

  refreshAds(): void {
    this.initSession(Math.random() > 0.5 ? 1 : 2);
  }

  getRandomAd(): Ad | null {
    if (this.activeAds().length === 0) return null;
    const ads = this.activeAds();
    return ads[Math.floor(Math.random() * ads.length)];
  }
}