import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useQuran } from '@/context/QuranContext';
import { RECITERS } from '@/types/quran';

function SizeControl({
  label,
  value,
  onDecrement,
  onIncrement,
  min,
  max,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min: number;
  max: number;
}) {
  const colors = useColors();
  return (
    <View style={styles.sizeRow}>
      <Text style={[styles.sizeLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
        {label}
      </Text>
      <View style={styles.sizeControls}>
        <TouchableOpacity
          onPress={onDecrement}
          disabled={value <= min}
          style={[styles.sizeBtn, { borderColor: colors.border, opacity: value <= min ? 0.4 : 1 }]}
        >
          <Feather name="minus" size={16} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.sizeValue, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          {value}
        </Text>
        <TouchableOpacity
          onPress={onIncrement}
          disabled={value >= max}
          style={[styles.sizeBtn, { borderColor: colors.border, opacity: value >= max ? 0.4 : 1 }]}
        >
          <Feather name="plus" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useQuran();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 12,
          paddingBottom: Platform.OS === 'web' ? 84 + 34 : 84,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Amiri_700Bold' }]}>
        Settings
      </Text>

      {/* Font Sizes */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
          FONT SIZE
        </Text>

        {/* Preview */}
        <View style={[styles.previewBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.previewArabic, { color: colors.arabicText, fontFamily: 'Amiri_400Regular', fontSize: settings.arabicFontSize }]}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </Text>
          <Text style={[styles.previewEnglish, { color: colors.translationText, fontFamily: 'PlayfairDisplay_400Regular', fontSize: settings.translationFontSize }]}>
            In the name of Allah, the Most Gracious, the Most Merciful.
          </Text>
        </View>

        <SizeControl
          label="Arabic"
          value={settings.arabicFontSize}
          onDecrement={() => updateSettings({ arabicFontSize: settings.arabicFontSize - 2 })}
          onIncrement={() => updateSettings({ arabicFontSize: settings.arabicFontSize + 2 })}
          min={20}
          max={44}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SizeControl
          label="Translation"
          value={settings.translationFontSize}
          onDecrement={() => updateSettings({ translationFontSize: settings.translationFontSize - 1 })}
          onIncrement={() => updateSettings({ translationFontSize: settings.translationFontSize + 1 })}
          min={12}
          max={22}
        />
      </View>

      {/* Reciter */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
          ARABIC RECITER
        </Text>
        {RECITERS.map((reciter, index) => (
          <React.Fragment key={reciter.id}>
            <TouchableOpacity
              style={styles.reciterRow}
              onPress={() => updateSettings({ reciter: reciter.id })}
              activeOpacity={0.7}
            >
              <View style={styles.reciterInfo}>
                <Text style={[styles.reciterName, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                  {reciter.name}
                </Text>
                <Text style={[styles.reciterArabic, { color: colors.mutedForeground, fontFamily: 'Amiri_400Regular' }]}>
                  {reciter.arabicName}
                </Text>
              </View>
              {settings.reciter === reciter.id && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                  <Feather name="check" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            {index < RECITERS.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Audio Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
          AUDIO PLAYBACK
        </Text>
        <View style={styles.infoRow}>
          <Feather name="volume-2" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
            Arabic verse audio plays first, followed by the Saheeh International English translation audio automatically.
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoRow}>
          <Feather name="book-open" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
            Translation: Saheeh International
          </Text>
        </View>
      </View>

      {/* About */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
          ABOUT
        </Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.bismillah, { color: colors.accent, fontFamily: 'Amiri_700Bold' }]}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </Text>
          <Text style={[styles.aboutText, { color: colors.mutedForeground, fontFamily: 'PlayfairDisplay_400Regular' }]}>
            Quran text provided by AlQuran.cloud. Audio by Saheeh International and selected reciters. May Allah accept this from us.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 20 },
  title: { fontSize: 30, marginBottom: 4 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  previewBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  previewArabic: { textAlign: 'right', writingDirection: 'rtl' },
  previewEnglish: { textAlign: 'left' },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sizeLabel: { fontSize: 15 },
  sizeControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sizeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeValue: { fontSize: 17, minWidth: 28, textAlign: 'center' },
  divider: { height: 1, marginHorizontal: 16 },
  reciterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  reciterInfo: { flex: 1 },
  reciterName: { fontSize: 15 },
  reciterArabic: { fontSize: 16, marginTop: 2 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 14, lineHeight: 21 },
  aboutRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    alignItems: 'center',
  },
  bismillah: { fontSize: 22 },
  aboutText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
