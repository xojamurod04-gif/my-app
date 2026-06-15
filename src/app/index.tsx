// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN — Flutter HomeScreen ning to'liq React Native versiyasi
// ─────────────────────────────────────────────────────────────────────────────

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import AddButton from '../components/AddButton';
import HabitCard from '../components/HabitCard';
import UpgradeSheet from '../components/UpgradeSheet';
import { kFreeLimit } from '../constants/colors';
import AudioManager from '../managers/AudioManager';
import { HabitModel, fmtDate, generateId, todayStr } from '../models/HabitModel';
import HabitStorage from '../storage/HabitStorage';

const MILESTONE_STREAKS = [7, 14, 30, 60, 100];

// Demo ma'lumotlar
function pastDays(daysAgo: number[]): string[] {
  return daysAgo.map((n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return fmtDate(d);
  });
}

function seedDemo(): HabitModel[] {
  return [
    new HabitModel({
      id: generateId(),
      name: 'Ertalab yugurish',
      colorHex: '#1A0533',
      emoji: '🏃',
      createdAt: todayStr(),
      completions: pastDays([0, 1, 2, 4, 5, 6, 8]),
    }),
    new HabitModel({
      id: generateId(),
      name: "Kitob o'qish",
      colorHex: '#013A2E',
      emoji: '📚',
      createdAt: todayStr(),
      completions: pastDays([0, 2, 3, 5, 7]),
    }),
    new HabitModel({
      id: generateId(),
      name: 'Meditatsiya',
      colorHex: '#2B1500',
      emoji: '🧘',
      createdAt: todayStr(),
      completions: pastDays([1, 3, 4, 6]),
    }),
    new HabitModel({
      id: generateId(),
      name: '22 da uxlash',
      colorHex: '#1F0018',
      emoji: '🌙',
      createdAt: todayStr(),
      completions: pastDays([0, 1, 5]),
    }),
  ];
}

export default function HomeScreen() {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitModel[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);

  // All-done flash overlay
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    (async () => {
      await AudioManager.init();
      const loaded = await HabitStorage.loadAll();
      const premium = await HabitStorage.isPremium();
      setIsPremium(premium);
      if (loaded.length === 0) {
        const demo = seedDemo();
        await HabitStorage.saveAll(demo);
        setHabits(demo);
      } else {
        setHabits(loaded);
      }
    })();
    return () => { AudioManager.dispose(); };
  }, []);

  const allDone = habits.length > 0 && habits.every((h) => h.isCompletedToday);

  function triggerAllDoneFlash() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    flashOpacity.value = withSequence(
      withTiming(0.18, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
  }

  const handleToggle = useCallback(
    async (habit: HabitModel) => {
      const wasAllDone = habits.every((h) => h.isCompletedToday);
      const today = todayStr();

      if (habit.isCompletedToday) {
        habit.completions.delete(today);
      } else {
        habit.completions.add(today);
        AudioManager.playCheck();
      }

      const updated = [...habits];
      setHabits(updated);
      await HabitStorage.saveAll(updated);

      const nowAllDone = updated.every((h) => h.isCompletedToday);
      if (!wasAllDone && nowAllDone) triggerAllDoneFlash();

      // Milestone tekshirish
      if (habit.isCompletedToday) {
        const s = habit.streak;
        if (MILESTONE_STREAKS.includes(s)) {
          setTimeout(() => setMilestoneStreak(s), 600);
        }
      }
    },
    [habits]
  );

  function handleOpenAdd() {
    if (habits.length >= kFreeLimit && !isPremium) {
      setShowUpgrade(true);
      return;
    }
    router.push('/add-edit');
  }

  function handleOpenEdit(habit: HabitModel) {
    router.push({ pathname: '/add-edit', params: { id: habit.id } });
  }

  // Habits ni qayta yuklab refresh
  async function refreshHabits() {
    const loaded = await HabitStorage.loadAll();
    setHabits(loaded);
  }

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    pointerEvents: 'none' as any,
  }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>
        <FlatList
          data={habits}
          keyExtractor={(h) => h.id}
          contentContainerStyle={styles.list}
          onLayout={refreshHabits}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              onToggle={() => handleToggle(item)}
              onLongPress={() => handleOpenEdit(item)}
              isPremium={isPremium}
            />
          )}
          ListFooterComponent={<AddButton onPress={handleOpenAdd} />}
        />
      </SafeAreaView>

      {/* All-done flash */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.flash, flashStyle]}
        pointerEvents="none"
      />

      {/* Upgrade Modal */}
      <Modal
        visible={showUpgrade}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUpgrade(false)}
      >
        <View style={styles.modalOverlay}>
          <UpgradeSheet
            onPurchased={async () => {
              setIsPremium(true);
              setShowUpgrade(false);
            }}
            onDismiss={() => setShowUpgrade(false)}
          />
        </View>
      </Modal>

      {/* Milestone Modal */}
      <Modal
        visible={milestoneStreak !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMilestoneStreak(null)}
      >
        {milestoneStreak !== null && (
          <View style={styles.milestoneOverlay}>
            {/* MilestoneScreen inline */}
            <MilestoneInline
              streak={milestoneStreak}
              onClose={() => setMilestoneStreak(null)}
            />
          </View>
        )}
      </Modal>
    </View>
  );
}

// Milestone inline (modal ichida)
function MilestoneInline({ streak, onClose }: { streak: number; onClose: () => void }) {
  const { default: MilestoneScreen } = require('../components/MilestoneScreen');
  return (
    <View style={{ flex: 1 }}>
      <MilestoneScreen streak={streak} onClose={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080808' },
  safe: { flex: 1 },
  list: { paddingHorizontal: 14, paddingVertical: 8 },
  flash: { backgroundColor: '#fff' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  milestoneOverlay: { flex: 1 },
});