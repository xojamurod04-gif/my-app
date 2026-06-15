// ─────────────────────────────────────────────────────────────────────────────
// UPGRADE SHEET — Flutter _UpgradeSheet komponenti
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumManager from '../managers/PremiumManager';

interface Props {
  onPurchased: () => void;
  onDismiss: () => void;
}

const FEATURES = [
  'Cheksiz odat qo\'shish',
  'Statistika va tahlil',
  'Maxsus rang va emojilar',
  'Bulutga saqlash (tez orada)',
];

export default function UpgradeSheet({ onPurchased, onDismiss }: Props) {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    const ok = await PremiumManager.purchasePremium();
    setLoading(false);
    if (ok) onPurchased();
  }

  async function handleRestore() {
    setRestoring(true);
    const ok = await PremiumManager.restorePurchases();
    setRestoring(false);
    if (ok) onPurchased();
  }

  async function handleGoogle() {
    const user = await PremiumManager.signInWithGoogle();
    if (user) console.log('Google signed in:', user);
  }

  async function handleApple() {
    if (Platform.OS !== 'ios') return;
    const user = await PremiumManager.signInWithApple();
    if (user) console.log('Apple signed in:', user);
  }

  return (
    <View style={styles.sheet}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
      </View>

      <Text style={styles.crown}>👑</Text>
      <Text style={styles.title}>Momentum Premium</Text>
      <Text style={styles.sub}>Hamma imkoniyatlar bir joyda</Text>

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color="#9B5DE5" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Purchase */}
      <TouchableOpacity
        style={styles.buyBtn}
        onPress={handlePurchase}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buyText}>$1.99 / bir martalik</Text>
        )}
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity onPress={handleRestore} disabled={restoring}>
        <Text style={styles.restoreText}>
          {restoring ? 'Tiklanmoqda...' : 'Xaridni tiklash'}
        </Text>
      </TouchableOpacity>

      {/* Sign-in buttons */}
      <View style={styles.signInRow}>
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle}>
          <Text style={styles.googleText}>🔑 Google</Text>
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.appleBtn} onPress={handleApple}>
            <Text style={styles.appleText}>🍎 Apple</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
        <Text style={styles.closeText}>Yopish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: { width: '100%', alignItems: 'center', paddingTop: 12, marginBottom: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#333' },
  crown: { fontSize: 48, marginTop: 16 },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  sub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
  },
  features: { width: '100%', gap: 12, marginBottom: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
  buyBtn: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    backgroundColor: '#9B5DE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  buyText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  restoreText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginBottom: 20,
  },
  signInRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  googleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  googleText: { color: '#fff', fontSize: 14 },
  appleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  appleText: { color: '#fff', fontSize: 14 },
  closeBtn: { paddingVertical: 8 },
  closeText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
});
