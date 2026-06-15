// ─────────────────────────────────────────────────────────────────────────────
// ADD BUTTON — Flutter _AddButton komponenti
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
}

export default function AddButton({ onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.btn}>
        <Ionicons name="add" size={20} color="rgba(255,255,255,0.3)" />
        <Text style={styles.label}>Odat qo'shish</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    marginTop: 4,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 15,
    fontWeight: '500',
  },
});
