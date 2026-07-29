import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Surah } from '@/types/quran';

interface Props {
  surah: Surah;
  onPress: () => void;
}

export default function SurahCard({ surah, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Number badge */}
      <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
        <View style={[styles.numberInner, { borderColor: 'rgba(255,255,255,0.4)' }]}>
          <Text style={styles.numberText}>{surah.number}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.englishName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          {surah.englishName}
        </Text>
        <Text style={[styles.subInfo, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {surah.revelationType} · {surah.numberOfAyahs} verses
        </Text>
        <Text style={[styles.translation, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {surah.englishNameTranslation}
        </Text>
      </View>

      {/* Arabic name */}
      <View style={styles.arabicContainer}>
        <Text style={[styles.arabicName, { color: colors.accent, fontFamily: 'Amiri_700Bold' }]}>
          {surah.name}
        </Text>
      </View>

      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  englishName: {
    fontSize: 16,
  },
  subInfo: {
    fontSize: 12,
  },
  translation: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  arabicContainer: {
    alignItems: 'flex-end',
  },
  arabicName: {
    fontSize: 20,
  },
});
