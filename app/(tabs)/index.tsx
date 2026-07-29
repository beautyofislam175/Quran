import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SurahCard from '@/components/SurahCard';
import { useColors } from '@/hooks/useColors';
import { Surah } from '@/types/quran';

async function fetchSurahs(): Promise<Surah[]> {
  const res = await fetch('https://api.alquran.cloud/v1/surah');
  if (!res.ok) throw new Error('Failed to fetch surahs');
  const json = await res.json();
  return json.data as Surah[];
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const { data: surahs, isLoading, error, refetch } = useQuery({
    queryKey: ['surahs'],
    queryFn: fetchSurahs,
    staleTime: Infinity,
  });

  const filtered = surahs?.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
    String(s.number).includes(search)
  );

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              The Noble
            </Text>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Amiri_700Bold' }]}>
              القرآن الكريم
            </Text>
          </View>
          <View style={[styles.titleBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.titleBadgeText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              114 Surahs
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
            placeholder="Search surah…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Loading Surahs…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
            Failed to load
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryText, { fontFamily: 'Inter_500Medium' }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.number)}
          renderItem={({ item }) => (
            <SurahCard
              surah={item}
              onPress={() => router.push(`/surah/${item.number}`)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === 'web' ? 84 + 34 : 84 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Feather name="search" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                No surahs found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    marginTop: 2,
  },
  titleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  titleBadgeText: { fontSize: 13 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  listContent: { paddingTop: 8 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 60,
  },
  loadingText: { fontSize: 15 },
  errorText: { fontSize: 17 },
  emptyText: { fontSize: 15 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  retryText: { color: '#fff', fontSize: 15 },
});
