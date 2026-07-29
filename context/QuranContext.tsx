import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark } from '@/types/quran';

const BOOKMARKS_KEY = '@quran_bookmarks_v1';
const SETTINGS_KEY = '@quran_settings_v1';

export interface QuranSettings {
  arabicFontSize: number;
  translationFontSize: number;
  reciter: string;
}

const DEFAULT_SETTINGS: QuranSettings = {
  arabicFontSize: 28,
  translationFontSize: 16,
  reciter: 'ar.alafasy',
};

interface QuranContextType {
  bookmarks: Bookmark[];
  toggleBookmark: (bookmark: Bookmark) => void;
  isBookmarked: (surahNumber: number, verseNumber: number) => boolean;
  settings: QuranSettings;
  updateSettings: (updates: Partial<QuranSettings>) => void;
  settingsLoaded: boolean;
}

const QuranContext = createContext<QuranContextType | null>(null);

export function QuranProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [settings, setSettings] = useState<QuranSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    loadPersistedData();
  }, []);

  async function loadPersistedData() {
    try {
      const [bookmarksRaw, settingsRaw] = await Promise.all([
        AsyncStorage.getItem(BOOKMARKS_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);
      if (bookmarksRaw) setBookmarks(JSON.parse(bookmarksRaw));
      if (settingsRaw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsRaw) });
    } catch (_) {
      // ignore storage errors
    } finally {
      setSettingsLoaded(true);
    }
  }

  const toggleBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks(prev => {
      const exists = prev.some(
        b => b.surahNumber === bookmark.surahNumber && b.verseNumber === bookmark.verseNumber
      );
      const next = exists
        ? prev.filter(
            b => !(b.surahNumber === bookmark.surahNumber && b.verseNumber === bookmark.verseNumber)
          )
        : [bookmark, ...prev];
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (surahNumber: number, verseNumber: number) =>
      bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber),
    [bookmarks]
  );

  const updateSettings = useCallback((updates: Partial<QuranSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <QuranContext.Provider
      value={{ bookmarks, toggleBookmark, isBookmarked, settings, updateSettings, settingsLoaded }}
    >
      {children}
    </QuranContext.Provider>
  );
}

export function useQuran() {
  const ctx = useContext(QuranContext);
  if (!ctx) throw new Error('useQuran must be used within QuranProvider');
  return ctx;
}
