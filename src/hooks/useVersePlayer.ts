import { useCallback, useEffect, useRef, useState } from "react";
import { arabicAudioUrl, englishAudioUrl } from "@/lib/quran";

export type Stage = "idle" | "arabic" | "english";

/** Browsers cap volume at 1.0, so the English track sits 10% above the Arabic one. */
const ENGLISH_VOLUME = 1;
const ARABIC_VOLUME = 0.9;

export function useVersePlayer(globalNumber: number, onFinished?: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stageRef = useRef<Stage>("idle");
  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;
  const breathRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(true);

  const setStageBoth = useCallback((s: Stage) => {
    stageRef.current = s;
    setStage(s);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 1;
    audio.muted = false;
    audio.setAttribute("playsinline", "");
    audioRef.current = audio;

    const onTime = () =>
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => {
      setLoading(false);
      setPaused(false);
      setError(null);
    };
    const onPause = () => setPaused(true);
    const onPlay = () => setPaused(false);
    const onError = () => {
      setLoading(false);
      setError("Audio unavailable — check your connection");
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const playSrc = useCallback((src: string, volume = 1) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = src;
    audio.volume = volume;
    audio.load();
    setLoading(true);
    setError(null);
    void audio.play().catch((e: DOMException) => {
      setLoading(false);
      setPaused(true);
      setError(
        e?.name === "NotAllowedError"
          ? "Tap play again to allow sound"
          : "Couldn't start audio — tap play to retry",
      );
    });
  }, []);

  // stop + reset when the verse changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    if (breathRef.current) {
      clearTimeout(breathRef.current);
      breathRef.current = null;
    }
    setStageBoth("idle");
    setProgress(0);
    setLoading(false);
    setError(null);
    setPaused(true);
  }, [globalNumber, setStageBoth]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      if (stageRef.current === "arabic") {
        setStageBoth("english");
        setProgress(0);
        playSrc(englishAudioUrl(globalNumber), ENGLISH_VOLUME);
      } else if (stageRef.current === "english") {
        setStageBoth("idle");
        setProgress(0);
        // small breath before moving to the next verse
        if (breathRef.current) clearTimeout(breathRef.current);
        breathRef.current = setTimeout(() => {
          breathRef.current = null;
          finishedRef.current?.();
        }, 1800);
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
    };
  }, [globalNumber, playSrc, setStageBoth]);

  const start = useCallback(() => {
    setStageBoth("arabic");
    setProgress(0);
    playSrc(arabicAudioUrl(globalNumber), ARABIC_VOLUME);
  }, [globalNumber, playSrc, setStageBoth]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setStageBoth("idle");
    setProgress(0);
    setLoading(false);
  }, [setStageBoth]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (stageRef.current === "idle" || !audio.currentSrc) {
      start();
    } else if (audio.paused) {
      void audio.play().catch(() => setError("Tap play again to allow sound"));
    } else {
      audio.pause();
    }
  }, [start]);

  return { stage, progress, loading, paused, error, start, stop, toggle };
}