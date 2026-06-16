// ─────────────────────────────────────────────────────────────────────────────
// AUDIO MANAGER — expo-av wrapper
// ─────────────────────────────────────────────────────────────────────────────

import { Audio } from 'expo-av';

let _checkSound: Audio.Sound | null = null;
let _milestoneSound: Audio.Sound | null = null;

const AudioManager = {
  async init(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: cs } = await Audio.Sound.createAsync(
        require('../../assets/sounds/check.wav'),
        { shouldPlay: false }
      );
      _checkSound = cs;

      const { sound: ms } = await Audio.Sound.createAsync(
        require('../../assets/sounds/milestone.wav'),
        { shouldPlay: false }
      );
      _milestoneSound = ms;
    } catch (e) {
      console.warn('AudioManager.init error:', e);
    }
  },

  async playCheck(): Promise<void> {
    try {
      if (_checkSound) {
        await _checkSound.setPositionAsync(0);
        await _checkSound.playAsync();
      }
    } catch (e) {
      console.warn('AudioManager.playCheck error:', e);
    }
  },

  async playMilestone(): Promise<void> {
    try {
      if (_milestoneSound) {
        await _milestoneSound.setPositionAsync(0);
        await _milestoneSound.playAsync();
      }
    } catch (e) {
      console.warn('AudioManager.playMilestone error:', e);
    }
  },

  async dispose(): Promise<void> {
    try {
      await _checkSound?.unloadAsync();
      await _milestoneSound?.unloadAsync();
      _checkSound = null;
      _milestoneSound = null;
    } catch {}
  },
};

export default AudioManager;
