// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM MANAGER (NATIVE) — react-native-iap + Google + Apple Sign In
// ─────────────────────────────────────────────────────────────────────────────

import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import HabitStorage from '../storage/HabitStorage';
import { kProductId } from '../constants/colors';
import { supabase } from '../lib/supabase';

// ─── Google Sign-In (expo-auth-session orqali) ───────────────────────────────
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

export const GOOGLE_CLIENT_ID_IOS = 'YOUR_IOS_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
export const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_ANDROID_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
export const GOOGLE_CLIENT_ID_WEB = 'YOUR_WEB_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

let _isIAPReady = false;

const PremiumManager = {
  // ── Premium holati ──────────────────────────────────────────────────────────
  async isPremium(): Promise<boolean> {
    return HabitStorage.isPremium();
  },

  async unlockPremium(): Promise<void> {
    await HabitStorage.setPremium(true);
  },

  // ── IAP: Sotib olish ────────────────────────────────────────────────────────
  async initIAP(): Promise<boolean> {
    try {
      await RNIap.initConnection();
      _isIAPReady = true;
      return true;
    } catch (e) {
      console.warn('IAP init error:', e);
      return false;
    }
  },

  async getProduct(): Promise<RNIap.Product | null> {
    try {
      const products = await RNIap.fetchProducts({ skus: [kProductId] });
      if (!products || products.length === 0) return null;
      const prod = products.find((p) => p.type === 'in-app');
      return (prod as RNIap.Product) ?? null;
    } catch (e) {
      console.warn('getProduct error:', e);
      return null;
    }
  },

  async purchasePremium(): Promise<boolean> {
    try {
      if (!_isIAPReady) await PremiumManager.initIAP();
      await RNIap.requestPurchase({
        type: 'in-app',
        request: {
          apple: { sku: kProductId },
          google: { skus: [kProductId] },
        },
      });
      await PremiumManager.unlockPremium();
      return true;
    } catch (e: any) {
      // Foydalanuvchi bekor qildi
      if (e?.code === 'E_USER_CANCELLED') return false;
      console.warn('purchasePremium error:', e);
      return false;
    }
  },

  async restorePurchases(): Promise<boolean> {
    try {
      if (!_isIAPReady) await PremiumManager.initIAP();
      const purchases = await RNIap.getAvailablePurchases();
      const hasPremium = purchases.some((p) => p.productId === kProductId);
      if (hasPremium) await PremiumManager.unlockPremium();
      return hasPremium;
    } catch (e) {
      console.warn('restorePurchases error:', e);
      return false;
    }
  },

  async endIAP(): Promise<void> {
    try {
      await RNIap.endConnection();
    } catch {}
  },

  // ── Google Sign-In (expo-auth-session) ──────────────────────────
  async signInWithGoogle(): Promise<{ email: string; name: string } | null> {
    try {
      const clientId = Platform.select({
        ios: GOOGLE_CLIENT_ID_IOS,
        android: GOOGLE_CLIENT_ID_ANDROID,
        default: GOOGLE_CLIENT_ID_WEB,
      })!;

      const rawNonce = Math.random().toString(36).substring(2, 10);
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'myapp' });

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: { nonce },
      });

      const result = await request.promptAsync(discovery);

      if (result.type !== 'success') return null;

      const idToken = result.params.id_token;
      if (!idToken) throw new Error('No Google ID token returned');

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;

      return {
        email: data.user?.email || 'user@gmail.com',
        name: data.user?.user_metadata?.full_name || 'Google User',
      };
    } catch (e) {
      console.warn('signInWithGoogle error:', e);
      return null;
    }
  },

  // ── Apple Sign-In (expo-apple-authentication) ───────────────────
  async signInWithApple(): Promise<{ email: string; name: string } | null> {
    try {
      const AppleAuth = await import('expo-apple-authentication');
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No Apple identity token returned');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) throw error;

      return {
        email: data.user?.email || credential.email || 'apple@user.com',
        name: data.user?.user_metadata?.full_name || `${credential.fullName?.givenName ?? ''} ${credential.fullName?.familyName ?? ''}`.trim() || 'Apple User',
      };
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return null;
      console.warn('signInWithApple error:', e);
      return null;
    }
  },
};

export default PremiumManager;
