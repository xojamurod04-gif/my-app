// ─────────────────────────────────────────────────────────────────────────────
// WEEK DOTS — Flutter _WeekDots komponenti
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  history: boolean[];
  accent: string;
}

export default function WeekDots({ history, accent }: Props) {
  return (
    <View style={styles.row}>
      {history.map((done, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: done ? accent + 'D9' : '#ffffff1F' },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});
