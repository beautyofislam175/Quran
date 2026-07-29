import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AudioPhase } from '@/types/quran';

interface Props {
  surahName: string;
  surahArabicName: string;
  currentVerseIndex: number;
  totalVerses: number;
  audioPhase: AudioPhase;
  onPlayPause: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function AudioPlayerBar({
  surahName,
  surahArabicName,
  currentVerseIndex,
  totalVerses,
  audioPhase,
  onPlayPause,
  onStop,
  onPrev,
  onNext,
}: Props) {
  const colors = useColors();
  const isPaused = audioPhase === 'paused';
  const isLoading = audioPhase === 'loading';

  const phaseLabel = isLoading
    ? 'Loading…'
    : audioPhase === 'arabic'
    ? 'Arabic'
    : audioPhase === 'english'
    ? 'English Translation'
    : isPaused
    ? 'Paused'
    : '';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          paddingBottom: Platform.OS === 'web' ? 34 : 0,
        },
      ]}
    >
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.accent,
              width: `${((currentVerseIndex + 1) / totalVerses) * 100}%`,
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Left: info */}
        <View style={styles.info}>
          <View style={styles.phaseRow}>
            <View
              style={[
                styles.phaseIndicator,
                { backgroundColor: audioPhase === 'arabic' ? colors.accent : 'rgba(255,255,255,0.3)' },
              ]}
            />
            <View
              style={[
                styles.phaseIndicator,
                { backgroundColor: audioPhase === 'english' ? colors.accent : 'rgba(255,255,255,0.3)' },
              ]}
            />
            <Text style={styles.phaseLabel}>{phaseLabel}</Text>
          </View>
          <Text style={styles.surahName} numberOfLines={1}>
            {surahName}
          </Text>
          <Text style={styles.verseInfo}>
            Verse {currentVerseIndex + 1} of {totalVerses}
          </Text>
        </View>

        {/* Right: controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={onPrev}
            disabled={currentVerseIndex <= 0}
            style={[styles.controlBtn, { opacity: currentVerseIndex <= 0 ? 0.4 : 1 }]}
          >
            <Feather name="skip-back" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onPlayPause} style={[styles.playBtn, { backgroundColor: colors.accent }]}>
            <Feather
              name={isLoading ? 'loader' : isPaused ? 'play' : 'pause'}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            disabled={currentVerseIndex >= totalVerses - 1}
            style={[styles.controlBtn, { opacity: currentVerseIndex >= totalVerses - 1 ? 0.4 : 1 }]}
          >
            <Feather name="skip-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onStop} style={styles.controlBtn}>
            <Feather name="x" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phaseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  surahName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  verseInfo: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    padding: 8,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
