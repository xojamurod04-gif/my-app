// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM MANAGER TYPE DECLARATIONS — For TypeScript resolution of platform-specific files
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  email: string;
  name: string;
}

export const GOOGLE_CLIENT_ID_IOS: string;
export const GOOGLE_CLIENT_ID_ANDROID: string;
export const GOOGLE_CLIENT_ID_WEB: string;

declare const PremiumManager: {
  isPremium(): Promise<boolean>;
  unlockPremium(): Promise<void>;
  initIAP(): Promise<boolean>;
  getProduct(): Promise<any>;
  purchasePremium(): Promise<boolean>;
  restorePurchases(): Promise<boolean>;
  endIAP(): Promise<void>;
  signInWithGoogle(): Promise<UserProfile | null>;
  signInWithApple(): Promise<UserProfile | null>;
};

export default PremiumManager;
