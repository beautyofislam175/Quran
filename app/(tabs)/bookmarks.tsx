import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useQuran } from '@/context/QuranContext';
import { Bookmark } from '@/types/quran';

export default function BookmarksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookmarks, toggleBookmark } = useQuran();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const renderItem = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/surah/${item.surahNumber}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.badgeNum, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            {item.surahNumber}:{item.verseNumber}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.surahName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            {item.surahName}
          </Text>
          <Text
            style={[styles.arabicSnippet, { color: colors.accent, fontFamily: 'Amiri_400Regular' }]}
            numberOfLines={1}
          >
            {item.arabicText}
          </Text>
          <Text
            style={[styles.englishSnippet, { color: colors.mutedForeground, fontFamily: 'PlayfairDisplay_400Regular' }]}
            numberOfLines={2}
          >
            {item.englishText}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => toggleBookmark(item)} style={styles.removeBtn}>
        <Feather name="x" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Amiri_700Bold' }]}>
          Bookmarks
        </Text>
        {bookmarks.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.countText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              {bookmarks.length}
            </Text>
          </View>
        )}
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="bookmark" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            No bookmarks yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Tap the bookmark icon on any verse to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={item => `${item.surahNumber}-${item.verseNumber}`}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === 'web' ? 84 + 34 : 84 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 30 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText: { fontSize: 14 },
  listContent: { paddingTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 2 },
  badgeNum: { fontSize: 12 },
  cardInfo: { flex: 1, gap: 4 },
  surahName: { fontSize: 15 },
  arabicSnippet: { fontSize: 18, textAlign: 'right' },
  englishSnippet: { fontSize: 13 },
  removeBtn: { padding: 4 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
