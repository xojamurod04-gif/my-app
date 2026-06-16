// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM MANAGER (WEB) — Mock/Web-compatible version of PremiumManager
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import HabitStorage from '../storage/HabitStorage';

export const GOOGLE_CLIENT_ID_IOS = 'YOUR_IOS_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
export const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_ANDROID_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
export const GOOGLE_CLIENT_ID_WEB = 'YOUR_WEB_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

const PremiumManager = {
  // ── Premium holati ──────────────────────────────────────────────────────────
  async isPremium(): Promise<boolean> {
    return HabitStorage.isPremium();
  },

  async unlockPremium(): Promise<void> {
    await HabitStorage.setPremium(true);
  },

  // ── IAP: Sotib olish (Web uchun mock) ────────────────────────────────────────
  async initIAP(): Promise<boolean> {
    return true;
  },

  async getProduct(): Promise<any> {
    return {
      productId: 'momentum_premium_upgrade',
      price: '$1.99',
      title: 'Premium Upgrade',
      description: 'Unlock all features',
    };
  },

  async purchasePremium(): Promise<boolean> {
    try {
      // Webda har doim xarid muvaffaqiyatli deb hisoblaymiz va premium imkoniyatlarini ochamiz
      await PremiumManager.unlockPremium();
      return true;
    } catch (e) {
      return false;
    }
  },

  async restorePurchases(): Promise<boolean> {
    await PremiumManager.unlockPremium();
    return true;
  },

  async endIAP(): Promise<void> {
    // No-op
  },

  // ── Google Sign-In (Web mock) ───────────────────────────────────
  async signInWithGoogle(): Promise<{ email: string; name: string } | null> {
    console.warn('signInWithGoogle is not fully implemented on Web without a backend');
    return null;
  },

  // ── Apple Sign-In (Web mock) ────────────────────────────────────
  async signInWithApple(): Promise<{ email: string; name: string } | null> {
    console.warn('signInWithApple is not fully implemented on Web without a backend');
    return null;
  },
};

export default PremiumManager;
