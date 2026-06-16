// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN — Flutter HomeScreen ning to'liq React Native versiyasi
// ─────────────────────────────────────────────────────────────────────────────

import 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import MilestoneScreen from '../components/MilestoneScreen';
import { kFreeLimit } from '../constants/colors';
import AudioManager from '../managers/AudioManager';
import { HabitModel } from '../models/HabitModel';
import { useHabitStore } from '../store/useHabitStore';

export default function HomeScreen() {
  const router = useRouter();
  
  const habits = useHabitStore((s) => s.habits);
  const isPremium = useHabitStore((s) => s.isPremium);
  const milestoneStreak = useHabitStore((s) => s.milestoneStreak);
  const allDoneFlashTriggered = useHabitStore((s) => s.allDoneFlashTriggered);
  
  const init = useHabitStore((s) => s.init);
  const setPremium = useHabitStore((s) => s.setPremium);
  const setMilestoneStreak = useHabitStore((s) => s.setMilestoneStreak);
  const resetAllDoneFlash = useHabitStore((s) => s.resetAllDoneFlash);
  const toggleHabit = useHabitStore((s) => s.toggleHabit);

  const [showUpgrade, setShowUpgrade] = useState(false);
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    init();
    return () => { AudioManager.dispose(); };
  }, []);

  useEffect(() => {
    if (allDoneFlashTriggered) {
      triggerAllDoneFlash();
      resetAllDoneFlash();
    }
  }, [allDoneFlashTriggered]);

  function triggerAllDoneFlash() {
    flashOpacity.value = withSequence(
      withTiming(0.18, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
  }

  function handleToggle(habit: HabitModel) {
    toggleHabit(habit.id);
  }

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
            onPurchased={() => {
              setPremium(true);
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