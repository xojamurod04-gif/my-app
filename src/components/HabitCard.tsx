// ─────────────────────────────────────────────────────────────────────────────
// HABIT CARD — Flutter HabitCard komponenti (animatsiyalar bilan)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useCallback } from 'react';
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
  withSpring,
  SharedValue,
  SlideInDown,
  SlideOutUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HabitModel } from '../models/HabitModel';
import { kAccentColors } from '../constants/colors';
import CheckButton from './CheckButton';
import WeekDots from './WeekDots';

const { height: SCREEN_H } = Dimensions.get('window');

interface Props {
  habit: HabitModel;
  onToggle: () => void;
  onLongPress: () => void;
  isPremium: boolean;
}

// Particle ma'lumotlari
interface Particle {
  angle: number;
  speed: number;
  size: number;
}

function makeParticles(): Particle[] {
  return Array.from({ length: 14 }, () => ({
    angle: Math.random() * Math.PI * 2,
    speed: 40 + Math.random() * 60,
    size: 3 + Math.random() * 5,
  }));
}

export default function HabitCard({ habit, onToggle, onLongPress }: Props) {
  const accent = kAccentColors[Math.max(0, habit.colorIndex)] ?? '#9B5DE5';

  // Animatsiya qiymatlari
  const btnScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const particleProgress = useSharedValue(0);
  const particles = useRef<Particle[]>([]).current;

  const wasCompleted = useRef(habit.isCompletedToday);

  useEffect(() => {
    const nowCompleted = habit.isCompletedToday;
    if (!wasCompleted.current && nowCompleted) {
      triggerCheckAnim();
    }
    wasCompleted.current = nowCompleted;
  }, [habit.isCompletedToday]);

  function triggerCheckAnim() {
    // Tugma scale (tugma qadami)
    btnScale.value = withSequence(
      withTiming(1.22, { duration: 80 }),
      withSpring(1, { damping: 10 })
    );
    // Pulse (puls qadami)
    pulseOpacity.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 90 })
    );
    // Particles (zarracha qadami)
    particles.splice(0, particles.length, ...makeParticles());
    particleProgress.value = 0;
    particleProgress.value = withTiming(1, { duration: 600 });
  }

  const handleToggle = useCallback(() => {
    // Haptika Light (belgilash)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }, [onToggle]);

  const done = habit.isCompletedToday;

  // Background color
  const bgColor = done ? habit.colorHex : blend(habit.colorHex, '#000000', 0.32);

  // Pulse overlay style
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onLongPress={onLongPress}
      style={[styles.card, { height: SCREEN_H * 0.21, backgroundColor: bgColor }]}
    >
      {/* Pulse overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.pulseOverlay,
          { shadowColor: accent },
          pulseStyle,
        ]}
      />

      {/* Particle Overlay (Animated.View orqali) */}
      <ParticleOverlay
        particles={particles}
        progress={particleProgress}
        accent={accent}
      />

      {/* Card content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.left}>
            <Text style={styles.title} numberOfLines={1}>
              {habit.emoji ? `${habit.emoji} ${habit.name}` : habit.name}
            </Text>
            <View style={styles.streakRow}>
              {/* Slot animatsiyasi - raqam aylanib o'zgaradi */}
              <View style={styles.slotContainer}>
                <Animated.Text
                  key={habit.streak}
                  entering={SlideInDown.springify().damping(12)}
                  exiting={SlideOutUp.springify().damping(12)}
                  style={[styles.streakNum, { color: done ? accent : accent + '6B' }]}
                >
                  {habit.streak}
                </Animated.Text>
              </View>
              <Text style={styles.streakLabel}>{'KETMA-KET\nKUN'}</Text>
            </View>
          </View>

          <CheckButton done={done} accent={accent} scale={btnScale} />
        </View>

        <WeekDots history={habit.last7} accent={accent} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Particle overlay ────────────────────────────────────────────────────────

interface ParticleOverlayProps {
  particles: Particle[];
  progress: SharedValue<number>;
  accent: string;
}

function ParticleOverlay({ particles, progress, accent }: ParticleOverlayProps) {
  if (particles.length === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => {
        const style = useAnimatedStyle(() => {
          const prog = progress.value;
          // Ease-out effect for distance
          const dist = p.speed * prog * (2 - prog);
          const cx = Math.cos(p.angle) * dist;
          const cy = Math.sin(p.angle) * dist;
          return {
            opacity: prog > 0 && prog < 1 ? 1 - prog : 0,
            transform: [
              { translateX: cx },
              { translateY: cy },
              { scale: prog > 0.8 ? (1 - prog) * 5 : 1 }
            ],
          };
        });

        return (
          <Animated.View
            key={i}
            style={[
              {
                position: 'absolute',
                right: 36, // Tugma markaziga to'g'irlash
                top: 40,
                width: p.size * 2,
                height: p.size * 2,
                borderRadius: p.size,
                backgroundColor: accent,
              },
              style,
            ]}
          />
        );
      })}
    </View>
  );
}

// ─── Yordamchi: hex ranglarni aralashtirish ──────────────────────────────────
function blend(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 * (1 - t) + r2 * t);
  const g = Math.round(g1 * (1 - t) + g2 * t);
  const b = Math.round(b1 * (1 - t) + b2 * t);
  return `rgb(${r},${g},${b})`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    marginBottom: 10,
    overflow: 'hidden',
  },
  pulseOverlay: {
    borderRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: { flex: 1, marginRight: 12 },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  slotContainer: {
    height: 72,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  streakNum: {
    fontSize: 68,
    fontWeight: '900',
    lineHeight: 72,
  },
  streakLabel: {
    color: 'rgba(255,255,255,0.32)',
    fontSize: 9,
    letterSpacing: 1.1,
    lineHeight: 13,
    marginBottom: 10,
    marginLeft: 6,
  },
});

