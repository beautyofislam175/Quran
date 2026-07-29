export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Verse {
  number: number; // global verse number (1–6236) — used for audio CDN
  numberInSurah: number;
  arabic: string;
  english: string;
}

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  surahArabicName: string;
  verseNumber: number;
  arabicText: string;
  englishText: string;
  timestamp: number;
}

export type AudioPhase = 'idle' | 'loading' | 'arabic' | 'english' | 'paused';

export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Al-Afasy', arabicName: 'مشاري العفاسي' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', arabicName: 'محمود خليل الحصري' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', arabicName: 'محمد صديق المنشاوي' },
  { id: 'ar.abdurrahmanas', name: 'AbdurRahman As-Sudais', arabicName: 'عبد الرحمن السديس' },
];

export function getArabicAudioUrl(verseNumber: number, reciter: string): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${verseNumber}.mp3`;
}

export function getEnglishAudioUrl(verseNumber: number): string {
  return `https://cdn.islamic.network/quran/audio/128/en.walk/${verseNumber}.mp3`;
}
