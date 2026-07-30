export type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

export type Verse = {
  globalNumber: number;
  arabic: string;
  translation: string;
  surahNumber: number;
  numberInSurah: number;
};

const API = "https://api.alquran.cloud/v1";

export async function fetchSurahs(): Promise<Surah[]> {
  const res = await fetch(`${API}/surah`);
  if (!res.ok) throw new Error("Failed to load surah index");
  const json = await res.json();
  return json.data as Surah[];
}

export async function fetchVerse(globalNumber: number): Promise<Verse> {
  const res = await fetch(`${API}/ayah/${globalNumber}/editions/quran-uthmani,en.sahih`);
  if (!res.ok) throw new Error("Failed to load verse");
  const json = await res.json();
  const [ar, en] = json.data;
  return {
    globalNumber,
    arabic: ar.text,
    translation: en.text,
    surahNumber: ar.surah.number,
    numberInSurah: ar.numberInSurah,
  };
}

export const TOTAL_AYAHS = 6236;

export function surahOffsets(surahs: Surah[]): number[] {
  const offsets: number[] = [];
  let running = 0;
  for (const s of surahs) {
    offsets.push(running);
    running += s.numberOfAyahs;
  }
  return offsets;
}

export const arabicAudioUrl = (n: number) =>
  `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${n}.mp3`;

export const englishAudioUrl = (n: number) =>
  `https://cdn.islamic.network/quran/audio/192/en.walk/${n}.mp3`;

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** 12 -> "١٢" — Arabic-Indic digits used inside the end-of-ayah marker. */
export const toArabicNumeral = (n: number) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** Split an English translation into sentences (keeps trailing punctuation). */
export function splitEnglishSentences(text: string): string[] {
  const parts = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?;:])\s+(?=[A-Z"'\[(])/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [text];
}

/**
 * Split the Arabic text into `count` chunks on word boundaries, weighted so each
 * chunk roughly matches the share of the corresponding English sentence.
 */
export function splitArabicInto(arabic: string, weights: number[]): string[] {
  const words = arabic.replace(/\s+/g, " ").trim().split(" ");
  const count = Math.max(1, weights.length);
  if (count === 1 || words.length <= count) return [arabic];
  const total = weights.reduce((a, b) => a + b, 0) || count;
  const chunks: string[] = [];
  let start = 0;
  let acc = 0;
  for (let i = 0; i < count; i++) {
    acc += weights[i] ?? 1;
    const end =
      i === count - 1 ? words.length : Math.max(start + 1, Math.round((acc / total) * words.length));
    chunks.push(words.slice(start, end).join(" "));
    start = end;
  }
  return chunks.filter(Boolean);
}