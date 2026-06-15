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
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
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
  offset: number;
}

function makeParticles(): Particle[] {
  return Array.from({ length: 12 }, () => ({
    angle: Math.random() * Math.PI * 2,
    speed: 60 + Math.random() * 80,
    size: 4 + Math.random() * 5,
    offset: Math.random() * 0.2,
  }));
}

export default function HabitCard({ habit, onToggle, onLongPress }: Props) {
  const accent = kAccentColors[Math.max(0, habit.colorIndex)] ?? '#9B5DE5';

  // Animatsiya qiymatlari
  const btnScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const particleProgress = useSharedValue(0);
  const streakDisplay = useSharedValue(habit.streak);
  const particles = useRef<Particle[]>([]).current;

  const wasCompleted = useRef(habit.isCompletedToday);

  useEffect(() => {
    const nowCompleted = habit.isCompletedToday;
    if (!wasCompleted.current && nowCompleted) {
      triggerCheckAnim();
    }
    wasCompleted.current = nowCompleted;
    streakDisplay.value = habit.streak;
  }, [habit.isCompletedToday, habit.streak]);

  function triggerCheckAnim() {
    // Tugma scale
    btnScale.value = withSequence(
      withTiming(1.22, { duration: 80 }),
      withSpring(1, { damping: 10 })
    );
    // Pulse
    pulseOpacity.value = withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 90 })
    );
    // Particles
    particles.splice(0, particles.length, ...makeParticles());
    particleProgress.value = 0;
    particleProgress.value = withTiming(1, { duration: 600 });
  }

  const handleToggle = useCallback(() => {
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

      {/* Particle SVG */}
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
              <Text style={[styles.streakNum, { color: done ? accent : accent + '6B' }]}>
                {habit.streak}
              </Text>
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
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  // SVG ni Reanimated bilan yangilash uchun
  const style = useAnimatedStyle(() => ({
    opacity: progress.value > 0 && progress.value < 1 ? 1 : 0,
  }));

  if (particles.length === 0) return null;

  // Particle pozitsiyalarini progress ga qarab hisoblash
  // (SVG static, real-time uchun Canvas/Skia kerak bo'ladi)
  // Bu yerda sodda ko'rsatish
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style]}
    >
      <Svg width="100%" height="100%">
        {particles.map((p, i) => {
          const prog = 0.5; // placeholder
          const dist = p.speed * prog;
          const cx = Math.cos(p.angle) * dist + 250;
          const cy = Math.sin(p.angle) * dist + 40;
          return (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={p.size}
              fill={accent}
              opacity={0.6}
            />
          );
        })}
      </Svg>
    </Animated.View>
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
