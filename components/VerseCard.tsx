import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { AudioPhase, Verse } from '@/types/quran';

interface Props {
  verse: Verse;
  surahNumber: number;
  surahName: string;
  surahArabicName: string;
  isBookmarked: boolean;
  isCurrentVerse: boolean;
  audioPhase: AudioPhase;
  arabicFontSize: number;
  translationFontSize: number;
  onPlay: () => void;
  onBookmark: () => void;
}

export default function VerseCard({
  verse,
  surahNumber,
  surahName,
  surahArabicName,
  isBookmarked,
  isCurrentVerse,
  audioPhase,
  arabicFontSize,
  translationFontSize,
  onPlay,
  onBookmark,
}: Props) {
  const colors = useColors();

  const isPlaying = isCurrentVerse && (audioPhase === 'arabic' || audioPhase === 'english');
  const isArabicPhase = isCurrentVerse && audioPhase === 'arabic';
  const isEnglishPhase = isCurrentVerse && audioPhase === 'english';

  const handleBookmark = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onBookmark();
  };

  const handlePlay = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPlay();
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isPlaying ? colors.playingBackground : colors.card,
          borderColor: isPlaying ? colors.primary : colors.border,
        },
      ]}
    >
      {/* Verse number + phase indicator */}
      <View style={styles.header}>
        <View style={[styles.verseNumBadge, { borderColor: colors.accent, backgroundColor: 'transparent' }]}>
          <Text style={[styles.verseNum, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>
            {verse.numberInSurah}
          </Text>
        </View>
        {isCurrentVerse && audioPhase !== 'idle' && audioPhase !== 'paused' && (
          <View style={[styles.phaseIndicator, { backgroundColor: colors.primary }]}>
            <Text style={styles.phaseText}>
              {audioPhase === 'loading' ? 'loading…' : audioPhase === 'arabic' ? 'Arabic' : 'English'}
            </Text>
          </View>
        )}
        {isCurrentVerse && audioPhase === 'paused' && (
          <View style={[styles.phaseIndicator, { backgroundColor: colors.mutedForeground }]}>
            <Text style={styles.phaseText}>paused</Text>
          </View>
        )}
      </View>

      {/* Arabic text */}
      <View style={[styles.arabicContainer, isArabicPhase && { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: 12 }]}>
        <Text
          style={[
            styles.arabicText,
            {
              fontSize: arabicFontSize,
              color: isArabicPhase ? colors.primary : colors.arabicText,
              fontFamily: 'Amiri_400Regular',
              lineHeight: arabicFontSize * 1.9,
            },
          ]}
        >
          {verse.arabic}
        </Text>
      </View>

      {/* Decorative divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerStar, { color: colors.accent }]}>✦</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* English translation */}
      <View style={[styles.englishContainer, isEnglishPhase && { borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 12 }]}>
        <Text
          style={[
            styles.englishText,
            {
              fontSize: translationFontSize,
              color: isEnglishPhase ? colors.accent : colors.translationText,
              fontFamily: 'PlayfairDisplay_400Regular',
              lineHeight: translationFontSize * 1.75,
            },
          ]}
        >
          {verse.english}
        </Text>
      </View>

      {/* Action row */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.playBtn,
            { backgroundColor: isCurrentVerse ? colors.primary : colors.secondary },
          ]}
          onPress={handlePlay}
          activeOpacity={0.7}
        >
          <Feather
            name={isPlaying ? 'pause' : 'play'}
            size={14}
            color={isCurrentVerse ? '#fff' : colors.primary}
          />
          <Text
            style={[
              styles.playBtnText,
              {
                color: isCurrentVerse ? '#fff' : colors.primary,
                fontFamily: 'Inter_500Medium',
              },
            ]}
          >
            {isPlaying ? 'Playing' : 'Play Verse'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleBookmark}
          activeOpacity={0.7}
        >
          <Feather
            name="bookmark"
            size={18}
            color={isBookmarked ? colors.accent : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verseNumBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNum: {
    fontSize: 13,
  },
  phaseIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  phaseText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  arabicContainer: {
    paddingVertical: 4,
  },
  arabicText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerStar: {
    fontSize: 10,
  },
  englishContainer: {
    paddingVertical: 2,
  },
  englishText: {
    textAlign: 'left',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playBtnText: {
    fontSize: 13,
  },
  iconBtn: {
    padding: 8,
  },
});
