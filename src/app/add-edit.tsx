// ─────────────────────────────────────────────────────────────────────────────
// ADD / EDIT SCREEN — Flutter AddEditScreen
// ─────────────────────────────────────────────────────────────────────────────

import { kAccentColors, kCardColors } from '@/constants/colors';
import { HabitModel, generateId, todayStr } from '@/models/HabitModel';
import { useHabitStore } from '@/store/useHabitStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const EMOJIS = ['🏃', '📚', '🧘', '🌙', '💪', '🥗', '🎯', '✍️', '🎸', '💧'];

export default function AddEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const habits = useHabitStore((s) => s.habits);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const [existing, setExisting] = useState<HabitModel | null>(null);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    if (id) {
      const found = habits.find((h) => h.id === id) ?? null;
      if (found) {
        setExisting(found);
        setName(found.name);
        setEmoji(found.emoji);
        setColorIdx(found.colorIndex);
      }
    }
  }, [id, habits]);

  function hexOf(color: string): string {
    return color.toUpperCase();
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (existing) {
      // Tahrirlash
      updateHabit(existing.id, {
        name: trimmed,
        colorHex: hexOf(kCardColors[colorIdx]),
        emoji,
      });
    } else {
      // Yangi odat
      const newHabit = new HabitModel({
        id: generateId(),
        name: trimmed,
        colorHex: hexOf(kCardColors[colorIdx]),
        emoji,
        createdAt: todayStr(),
      });
      addHabit(newHabit);
    }
    router.back();
  }

  function handleDelete() {
    Alert.alert(
      'O\'chirishni tasdiqlaysizmi?',
      '',
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: 'O\'chirish',
          style: 'destructive',
          onPress: () => {
            if (existing) deleteHabit(existing.id);
            router.back();
          },
        },
      ]
    );
  }

  const previewColor = kCardColors[colorIdx];

  return (
    <SafeAreaView style={styles.root}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {existing ? 'Tahrirlash' : 'Yangi odat'}
        </Text>
        {existing ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="#FF4444" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Name */}
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Odat nomi"
          placeholderTextColor="rgba(255,255,255,0.2)"
          autoFocus
          textAlign="center"
        />

        {/* Emoji */}
        <View style={styles.section}>
          <Text style={styles.label}>Emoji</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => setEmoji(emoji === e ? '' : e)}
                style={[
                  styles.emojiBtn,
                  emoji === e && styles.emojiBtnSelected,
                ]}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color */}
        <View style={styles.section}>
          <Text style={styles.label}>Rang</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorRow}>
              {kCardColors.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setColorIdx(i)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    colorIdx === i && {
                      borderWidth: 2,
                      borderColor: kAccentColors[i],
                    },
                  ]}
                >
                  {colorIdx === i && (
                    <Ionicons name="checkmark" size={14} color={kAccentColors[i]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: previewColor }]}>
          <Text style={styles.previewEmoji}>{emoji}</Text>
          <Text style={styles.previewName} numberOfLines={1}>
            {name || 'Odat nomi'}
          </Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: kAccentColors[colorIdx] }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Saqlash</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  nameInput: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginHorizontal: 22,
    marginTop: 20,
    marginBottom: 8,
    padding: 8,
  },
  section: { paddingHorizontal: 22, marginTop: 28 },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 10 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnSelected: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  emojiText: { fontSize: 22 },
  colorRow: { flexDirection: 'row', gap: 8 },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    marginHorizontal: 22,
    marginTop: 28,
    height: 80,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 8,
  },
  previewEmoji: { fontSize: 22 },
  previewName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  saveBtn: {
    marginHorizontal: 22,
    marginTop: 28,
    marginBottom: 40,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
