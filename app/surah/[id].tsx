import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AudioPlayerBar from '@/components/AudioPlayerBar';
import VerseCard from '@/components/VerseCard';
import { useColors } from '@/hooks/useColors';
import { useQuran } from '@/context/QuranContext';
import { AudioPhase, Verse, getArabicAudioUrl, getEnglishAudioUrl } from '@/types/quran';

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  verses: Verse[];
}

async function fetchSurahWithEditions(id: string): Promise<SurahData> {
  const res = await fetch(
    `https://api.alquran.cloud/v1/surah/${id}/editions/ar.uthmani,en.sahih`
  );
  if (!res.ok) throw new Error('Failed to fetch surah');
  const json = await res.json();
  const arabic = json.data[0];
  const english = json.data[1];
  return {
    number: arabic.number,
    name: arabic.name,
    englishName: arabic.englishName,
    englishNameTranslation: arabic.englishNameTranslation,
    numberOfAyahs: arabic.numberOfAyahs,
    revelationType: arabic.revelationType,
    verses: arabic.ayahs.map((ayah: any, i: number) => ({
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      arabic: ayah.text,
      english: english.ayahs[i]?.text ?? '',
    })),
  };
}

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { toggleBookmark, isBookmarked, settings } = useQuran();

  const soundRef = useRef<Audio.Sound | null>(null);
  const verseIndexRef = useRef(-1);
  const versesRef = useRef<Verse[]>([]);
  const audioPhaseRef = useRef<AudioPhase>('idle');
  const isStoppingRef = useRef(false);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(-1);
  const [audioPhase, setAudioPhase] = useState<AudioPhase>('idle');

  const flatListRef = useRef<FlatList>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['surah', id],
    queryFn: () => fetchSurahWithEditions(id!),
    staleTime: Infinity,
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.verses) versesRef.current = data.verses;
  }, [data?.verses]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});
    return () => {
      stopAndClean();
    };
  }, []);

  const updatePhase = (phase: AudioPhase) => {
    audioPhaseRef.current = phase;
    setAudioPhase(phase);
  };

  const updateVerseIndex = (idx: number) => {
    verseIndexRef.current = idx;
    setCurrentVerseIndex(idx);
  };

  async function stopAndClean() {
    isStoppingRef.current = true;
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (_) {}
    updatePhase('idle');
    updateVerseIndex(-1);
    isStoppingRef.current = false;
  }

  async function loadAndPlay(uri: string, onFinish: () => void): Promise<Audio.Sound | null> {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(status => {
        if (!status.isLoaded) return;
        if (status.didJustFinish && !isStoppingRef.current) {
          onFinish();
        }
      });
      return sound;
    } catch (_) {
      return null;
    }
  }

  const playEnglishForVerse = useCallback((verse: Verse) => {
    if (isStoppingRef.current) return;
    updatePhase('english');

    const englishUrl = getEnglishAudioUrl(verse.number);
    loadAndPlay(englishUrl, () => {
      if (isStoppingRef.current) return;
      const nextIdx = verseIndexRef.current + 1;
      const verses = versesRef.current;
      if (nextIdx < verses.length) {
        updateVerseIndex(nextIdx);
        scrollToVerse(nextIdx);
        playArabicForVerse(verses[nextIdx]);
      } else {
        updatePhase('idle');
        updateVerseIndex(-1);
      }
    }).then(s => {
      if (!s && !isStoppingRef.current) {
        const nextIdx = verseIndexRef.current + 1;
        const verses = versesRef.current;
        if (nextIdx < verses.length) {
          updateVerseIndex(nextIdx);
          scrollToVerse(nextIdx);
          playArabicForVerse(verses[nextIdx]);
        } else {
          updatePhase('idle');
          updateVerseIndex(-1);
        }
      }
    });
  }, []);

  const playArabicForVerse = useCallback((verse: Verse) => {
    if (isStoppingRef.current) return;
    updatePhase('arabic');

    const arabicUrl = getArabicAudioUrl(verse.number, settings.reciter);
    loadAndPlay(arabicUrl, () => {
      if (isStoppingRef.current) return;
      playEnglishForVerse(verse);
    }).then(s => {
      if (!s && !isStoppingRef.current) {
        playEnglishForVerse(verse);
      }
    });
  }, [settings.reciter]);

  function scrollToVerse(index: number) {
    try {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
    } catch (_) {}
  }

  const playFromVerse = useCallback((index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    isStoppingRef.current = false;
    const verses = versesRef.current;
    if (!verses[index]) return;

    updatePhase('loading');
    updateVerseIndex(index);
    scrollToVerse(index);
    playArabicForVerse(verses[index]);
  }, [playArabicForVerse]);

  const handlePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        updatePhase('paused');
      } else {
        await soundRef.current.playAsync();
        updatePhase(audioPhaseRef.current === 'paused'
          ? (verseIndexRef.current >= 0 ? 'arabic' : 'idle')
          : audioPhaseRef.current);
      }
    } catch (_) {}
  }, []);

  const handleStop = useCallback(() => {
    stopAndClean();
  }, []);

  const handlePrev = useCallback(() => {
    const idx = verseIndexRef.current;
    if (idx > 0) playFromVerse(idx - 1);
  }, [playFromVerse]);

  const handleNext = useCallback(() => {
    const verses = versesRef.current;
    const idx = verseIndexRef.current;
    if (idx < verses.length - 1) playFromVerse(idx + 1);
  }, [playFromVerse]);

  const handleScrollFailed = useCallback((info: { index: number }) => {
    const wait = new Promise(r => setTimeout(r, 300));
    wait.then(() => {
      try {
        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
      } catch (_) {}
    });
  }, []);

  const surahNum = Number(id);
  const showBismillah = data && surahNum !== 1 && surahNum !== 9;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const renderVerse = useCallback(
    ({ item }: { item: Verse }) => {
      const idx = data!.verses.indexOf(item);
      return (
        <VerseCard
          verse={item}
          surahNumber={surahNum}
          surahName={data!.englishName}
          surahArabicName={data!.name}
          isBookmarked={isBookmarked(surahNum, item.numberInSurah)}
          isCurrentVerse={currentVerseIndex === idx}
          audioPhase={currentVerseIndex === idx ? audioPhase : 'idle'}
          arabicFontSize={settings.arabicFontSize}
          translationFontSize={settings.translationFontSize}
          onPlay={() => {
            if (currentVerseIndex === idx && (audioPhase === 'arabic' || audioPhase === 'english')) {
              handlePlayPause();
            } else {
              playFromVerse(idx);
            }
          }}
          onBookmark={() =>
            toggleBookmark({
              surahNumber: surahNum,
              surahName: data!.englishName,
              surahArabicName: data!.name,
              verseNumber: item.numberInSurah,
              arabicText: item.arabic,
              englishText: item.english,
              timestamp: Date.now(),
            })
          }
        />
      );
    },
    [currentVerseIndex, audioPhase, settings, data, isBookmarked, playFromVerse, handlePlayPause, toggleBookmark]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.headerBar, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        {data && (
          <View style={styles.headerTitle}>
            <Text style={[styles.headerEnglish, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
              {data.englishName}
            </Text>
            <Text style={[styles.headerArabic, { color: colors.accent, fontFamily: 'Amiri_700Bold' }]}>
              {data.name}
            </Text>
          </View>
        )}
        <View style={styles.headerRight}>
          {data && (
            <View style={[styles.metaBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.metaText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                {data.revelationType} · {data.numberOfAyahs}v
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Loading Surah…
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
          ref={flatListRef}
          data={data!.verses}
          keyExtractor={item => String(item.number)}
          renderItem={renderVerse}
          onScrollToIndexFailed={handleScrollFailed}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: audioPhase !== 'idle' ? 130 : (Platform.OS === 'web' ? 34 : 20) },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* Surah info card */}
              <View style={[styles.surahInfoCard, { backgroundColor: colors.primary }]}>
                <Text style={[styles.surahInfoArabic, { fontFamily: 'Amiri_700Bold' }]}>
                  {data?.name}
                </Text>
                <Text style={[styles.surahInfoEnglish, { fontFamily: 'Inter_600SemiBold' }]}>
                  {data?.englishName} · {data?.englishNameTranslation}
                </Text>
                <Text style={[styles.surahInfoMeta, { fontFamily: 'Inter_400Regular' }]}>
                  {data?.revelationType} · {data?.numberOfAyahs} verses
                </Text>
                <TouchableOpacity
                  style={[styles.playAllBtn, { backgroundColor: colors.accent }]}
                  onPress={() => playFromVerse(0)}
                  activeOpacity={0.8}
                >
                  <Feather name="play" size={16} color={colors.primary} />
                  <Text style={[styles.playAllText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                    Play All
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bismillah banner */}
              {showBismillah && (
                <View style={[styles.bismillahBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <Text style={[styles.bismillahText, { color: colors.accent, fontFamily: 'Amiri_700Bold' }]}>
                    {BISMILLAH}
                  </Text>
                </View>
              )}
            </View>
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={8}
          windowSize={10}
        />
      )}

      {/* Persistent Audio Player Bar */}
      {audioPhase !== 'idle' && data && (
        <AudioPlayerBar
          surahName={data.englishName}
          surahArabicName={data.name}
          currentVerseIndex={currentVerseIndex}
          totalVerses={data.verses.length}
          audioPhase={audioPhase}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, alignItems: 'center' },
  headerEnglish: { fontSize: 16 },
  headerArabic: { fontSize: 20 },
  headerRight: { width: 80, alignItems: 'flex-end' },
  metaBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  metaText: { fontSize: 11 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15 },
  errorText: { fontSize: 17 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, marginTop: 8 },
  retryText: { color: '#fff', fontSize: 15 },
  listContent: { paddingTop: 0 },
  listHeader: { gap: 12, marginBottom: 8 },
  surahInfoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  surahInfoArabic: { fontSize: 36, color: '#FFFFFF' },
  surahInfoEnglish: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  surahInfoMeta: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  playAllText: { fontSize: 15 },
  bismillahBanner: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bismillahText: { fontSize: 26, textAlign: 'center' },
});
