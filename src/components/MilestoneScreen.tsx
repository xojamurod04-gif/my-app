// ─────────────────────────────────────────────────────────────────────────────
// MILESTONE SCREEN — Flutter MilestoneScreen komponenti
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import AudioManager from '../managers/AudioManager';

const { width: W, height: H } = Dimensions.get('window');

interface Props {
  streak: number;
}

export default function MilestoneScreen({ streak }: Props) {
  const router = useRouter();

  // Animatsiyalar
  const numScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0.12);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    AudioManager.playMilestone();

    // Raqam scale
    numScale.value = withSequence(
      withTiming(1.18, { duration: 350, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 350, easing: Easing.out(Easing.cubic) })
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withTiming(0.22, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const numStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  function caption() {
    if (streak >= 100) return `${streak} kun. Afsona!`;
    if (streak >= 60) return `${streak} kun. Zo'r natija!`;
    if (streak >= 30) return `${streak} kun. Bir oy!`;
    if (streak >= 14) return `${streak} kun. Ikki hafta!`;
    return `${streak} kun. Davom eting.`;
  }

  return (
    <TouchableOpacity
      style={styles.root}
      activeOpacity={1}
      onPress={() => router.back()}
    >
      {/* Glow */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Number */}
      <View style={styles.center}>
        <Animated.Text style={[styles.number, numStyle]}>
          {streak}
        </Animated.Text>
        <Text style={styles.caption}>{caption()}</Text>
      </View>

      {/* Hint */}
      <Text style={styles.hint}>YOPISH UCHUN BOSING</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#04040C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#9B5DE5',
    shadowColor: '#9B5DE5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 120,
    elevation: 30,
  },
  center: { alignItems: 'center' },
  number: {
    color: '#B87BF5',
    fontSize: 120,
    fontWeight: '900',
    lineHeight: 120,
  },
  caption: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 20,
  },
  hint: {
    position: 'absolute',
    bottom: 52,
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    letterSpacing: 2.5,
  },
});
