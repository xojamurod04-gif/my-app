// ─────────────────────────────────────────────────────────────────────────────
// CHECK BUTTON — Flutter _CheckButton komponenti
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  done: boolean;
  accent: string;
  scale: SharedValue<number>;
}

export default function CheckButton({ done, accent, scale }: Props) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View
        style={[
          styles.btn,
          done
            ? { backgroundColor: '#fff', borderWidth: 0 }
            : { borderWidth: 2.5, borderColor: accent + '8C' },
        ]}
      >
        {done && (
          <Ionicons name="checkmark" size={30} color="#000" />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
