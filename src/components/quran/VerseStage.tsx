import { useEffect, useMemo, useRef, useState } from "react";

import {
  pad2,
  splitArabicInto,
  splitEnglishSentences,
  toArabicNumeral,
  type Surah,
  type Verse,
} from "@/lib/quran";

type Props = {
  verse: Verse;
  surah?: Surah;
  stage: "idle" | "arabic" | "english";
  /** 0-100 progress of the currently playing track. */
  progress?: number;
};

export function VerseStage({ verse, surah, stage, progress = 0 }: Props) {
  // Crossfade between verses instead of swapping the content instantly.
  const [shown, setShown] = useState({ verse, surah });
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (verse.globalNumber === shown.verse.globalNumber) {
      setShown({ verse, surah });
      return;
    }
    setVisible(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown({ verse, surah });
      setVisible(true);
    }, 320);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [verse, surah, shown.verse.globalNumber]);

  const v = shown.verse;
  const s = shown.surah;
  const arabicSize = "text-[1.75rem] sm:text-[2.1rem]";
  const englishSize = "text-xl sm:text-2xl";

  // Sentence-by-sentence reveal while the English audio plays.
  const sentences = useMemo(() => splitEnglishSentences(v.translation), [v.translation]);
  const arabicChunks = useMemo(
    () =>
      splitArabicInto(
        v.arabic,
        sentences.map((x: string) => x.length),
      ),
    [v.arabic, sentences],
  );
  const n = Math.min(sentences.length, arabicChunks.length);
  const englishActive = stage === "english" && n > 1;
  const activeIndex = englishActive
    ? Math.min(n - 1, Math.floor((Math.max(0, Math.min(100, progress)) / 100) * n))
    : n - 1;

  const arabicShown = englishActive ? arabicChunks[activeIndex] : v.arabic;
  const englishShown = englishActive
    ? sentences.slice(0, activeIndex + 1).join(" ")
    : v.translation;
  const showMedallion = !englishActive || activeIndex === n - 1;

  return (
    <>
    <section className="plate no-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain rounded-[2rem] px-6 py-9">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-gilt)" }}
      />
      <div
        className={`transition-all duration-300 ease-out ${
          visible ? "translate-y-0 opacity-100 blur-0" : "translate-y-2 opacity-0 blur-[2px]"
        }`}
      >
      <p
        key={`ar-${activeIndex}-${englishActive}`}
        className={`arabic-verse relative animate-in fade-in text-foreground opacity-100 duration-500 ${arabicSize}`}
      >
        {arabicShown}{" "}
        {showMedallion ? (
          <span className="whitespace-nowrap text-foreground">
            &#x06DD;{toArabicNumeral(v.numberInSurah)}
          </span>
        ) : null}
      </p>

      <div className="my-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </div>

      <p
        className={`font-display relative leading-relaxed text-foreground/90 transition-opacity duration-500 ${englishSize} ${
          stage === "arabic" ? "opacity-55" : "opacity-100"
        }`}
      >
        {englishShown}
      </p>
      </div>
    </section>

    <div
      className={`mt-5 px-2 transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <p className="text-xs tracking-[0.32em] text-muted-foreground uppercase">
        Chapter: {pad2(v.surahNumber)} &nbsp;·&nbsp; Verse: {pad2(v.numberInSurah)}
      </p>
      <p className="font-display text-gilt-gradient mt-2 text-2xl leading-tight font-semibold">
        {s ? `Surah ${s.englishName}` : "—"}
      </p>
      {s ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {s.englishNameTranslation} · {s.revelationType}
        </p>
      ) : null}
    </div>
    </>
  );
}