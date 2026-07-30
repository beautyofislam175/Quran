import { createFileRoute } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Pause, Play, Square } from "lucide-react";

import { VerseStage } from "@/components/quran/VerseStage";
import { SurahPicker } from "@/components/quran/SurahPicker";
import { useVersePlayer } from "@/hooks/useVersePlayer";
import { fetchSurahs, fetchVerse, surahOffsets, TOTAL_AYAHS } from "@/lib/quran";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noor — Quran Verse Player with Saheeh International" },
      {
        name: "description",
        content:
          "A premium mobile Quran dashboard: Arabic verse by Mishary Alafasy followed by the Saheeh International English translation and audio.",
      },
      { property: "og:title", content: "Noor — Quran Verse Player" },
      {
        property: "og:description",
        content:
          "Listen to each ayah in Arabic, then its Saheeh International English translation, one verse at a time.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [globalNumber, setGlobalNumber] = useState(1);
  // Continuous playback within the current surah is always on.
  const autoAdvance = true;
  const [pendingAutoPlay, setPendingAutoPlay] = useState(false);
  // True while a continuous listening session is running (survives verse gaps).
  const [sessionActive, setSessionActive] = useState(false);

  const surahsQuery = useQuery({
    queryKey: ["surahs"],
    queryFn: fetchSurahs,
    staleTime: Infinity,
  });

  const verseQuery = useQuery({
    queryKey: ["verse", globalNumber],
    queryFn: () => fetchVerse(globalNumber),
    // Keep the current verse on screen while the next one loads so the
    // crossfade never flashes a loading plate.
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });

  const queryClient = useQueryClient();
  // Warm the next verse ahead of time for a seamless hand-off.
  useEffect(() => {
    const next = globalNumber + 1;
    if (next > TOTAL_AYAHS) return;
    queryClient.prefetchQuery({
      queryKey: ["verse", next],
      queryFn: () => fetchVerse(next),
      staleTime: Infinity,
    });
  }, [globalNumber, queryClient]);

  const surahs = surahsQuery.data ?? [];
  const offsets = useMemo(() => surahOffsets(surahs), [surahs]);
  const verse = verseQuery.data;
  const surah = verse ? surahs.find((s) => s.number === verse.surahNumber) : undefined;

  const goNext = useCallback(
    () => setGlobalNumber((n) => Math.min(TOTAL_AYAHS, n + 1)),
    [],
  );
  const goPrev = useCallback(() => setGlobalNumber((n) => Math.max(1, n - 1)), []);

  // Last global ayah number of the surah currently on screen.
  const surahLastAyah =
    verse && surah ? offsets[verse.surahNumber - 1] + surah.numberOfAyahs : undefined;

  const onFinished = useCallback(() => {
    if (!autoAdvance) return;
    // Continuous playback stays within the current surah.
    if (surahLastAyah !== undefined && globalNumber >= surahLastAyah) {
      setSessionActive(false);
      return;
    }
    setPendingAutoPlay(true);
    goNext();
  }, [autoAdvance, goNext, globalNumber, surahLastAyah]);

  const player = useVersePlayer(globalNumber, onFinished);
  const isPlaying = player.stage !== "idle" && !player.paused;

  // After auto-advancing, start the next verse as soon as its text is loaded.
  useEffect(() => {
    if (!pendingAutoPlay) return;
    if (!verse || verse.globalNumber !== globalNumber) return;
    setPendingAutoPlay(false);
    player.start();
  }, [pendingAutoPlay, verse, globalNumber, player]);

  // While a verse is playing the control bar hides for a distraction-free read.
  // Tapping anywhere on the screen brings it back.
  const [revealControls, setRevealControls] = useState(false);
  useEffect(() => {
    if (isPlaying) setRevealControls(false);
  }, [isPlaying]);
  // A continuous session keeps the controls hidden across the short gaps
  // between verses, so the play/pause button never flashes back in.
  const controlsHidden = (isPlaying || sessionActive) && !revealControls;

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      setSessionActive(false);
      setRevealControls(true);
    } else {
      setSessionActive(true);
    }
    player.toggle();
  }, [isPlaying, player]);

  const handleStop = useCallback(() => {
    setSessionActive(false);
    setRevealControls(true);
    setPendingAutoPlay(false);
    player.stop();
  }, [player]);

  return (
    <main
      onClick={() => setRevealControls(true)}
      className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden px-5 pt-8 pb-28"
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-gilt-gradient truncate text-3xl leading-tight font-semibold">
            Quran
          </h1>
        </div>
        {surahs.length > 0 && verse ? (
          <SurahPicker
            surahs={surahs}
            currentSurah={verse.surahNumber}
            currentAyah={verse.numberInSurah}
            onSelect={(s, a) => setGlobalNumber(offsets[s - 1] + a)}
          />
        ) : null}
      </header>

      <div className="mt-7 flex min-h-0 flex-1 flex-col">
        {verse ? (
          <VerseStage
            verse={verse}
            surah={surah}
            stage={player.stage}
            progress={player.progress}
          />
        ) : (
          <div className="plate flex flex-1 items-center justify-center rounded-[2rem]">
            <Loader2 className="text-gilt h-6 w-6 animate-spin" />
          </div>
        )}

      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-20 transition-all duration-300 ${
          controlsHidden
            ? "pointer-events-none translate-y-6 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mx-auto max-w-md px-5 pb-6">
          <div className="plate rounded-[1.75rem] px-5 py-4 backdrop-blur-xl">
            {player.stage === "idle" ? (
              <>
                <div className="flex items-center justify-between text-[0.65rem] tracking-[0.28em] uppercase">
                  <span className="text-muted-foreground">Arabic</span>
                  <span className="text-muted-foreground">Ready</span>
                  <span className="text-muted-foreground">English</span>
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary" />
              </>
            ) : null}

            {player.error ? (
              <p className="mt-3 text-center text-[0.7rem] tracking-wide text-destructive">
                {player.error}
              </p>
            ) : null}

            <div className="flex items-center justify-between not-first:mt-4">
              <button
                onClick={goPrev}
                aria-label="Previous verse"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border/70 text-foreground/80 transition-colors hover:border-gilt/60"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStop}
                  aria-label="Stop"
                  disabled={player.stage === "idle"}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors disabled:opacity-35"
                >
                  <Square className="h-4 w-4" />
                </button>

                <button
                  onClick={handleToggle}
                  aria-label={isPlaying ? "Pause" : "Play verse"}
                  className={`grid h-16 w-16 place-items-center rounded-full text-primary-foreground ${
                    isPlaying ? "playing-ring" : ""
                  }`}
                  style={{
                    background: "var(--gradient-gilt)",
                    boxShadow: "var(--shadow-lantern)",
                  }}
                >
                  {player.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="ml-0.5 h-6 w-6" />
                  )}
                </button>
              </div>

              <button
                onClick={goNext}
                aria-label="Next verse"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border/70 text-foreground/80 transition-colors hover:border-gilt/60"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
