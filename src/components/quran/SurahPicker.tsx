import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { pad2, type Surah } from "@/lib/quran";

type Props = {
  surahs: Surah[];
  currentSurah: number;
  currentAyah: number;
  onSelect: (surahNumber: number, ayahNumber: number) => void;
};

export function SurahPicker({ surahs, currentSurah, currentAyah, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pickedSurah, setPickedSurah] = useState<Surah | null>(null);

  const filtered = surahs.filter((s) =>
    `${s.number} ${s.englishName} ${s.englishNameTranslation}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setPickedSurah(null);
          setQ("");
        }
      }}
    >
      <DrawerTrigger asChild>
        <button className="rounded-full border border-border/70 bg-secondary/60 px-4 py-2 text-xs tracking-[0.22em] text-foreground/80 uppercase transition-colors hover:border-gilt/60">
          Surahs
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[82vh] border-border bg-popover">
        {pickedSurah ? (
          <>
            <DrawerHeader className="pb-2">
              <DrawerTitle className="flex items-center gap-3">
                <button
                  onClick={() => setPickedSurah(null)}
                  aria-label="Back to surah list"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/70 text-foreground/80 transition-colors hover:border-gilt/60"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-display text-gilt-gradient truncate text-2xl">
                  {pickedSurah.englishName}
                </span>
              </DrawerTitle>
            </DrawerHeader>
            <p className="px-4 pb-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">
              {pickedSurah.numberOfAyahs} verses — pick where to start
            </p>
            <div className="grid grid-cols-5 gap-2 overflow-y-auto px-4 pb-8 sm:grid-cols-6">
              {Array.from({ length: pickedSurah.numberOfAyahs }, (_, i) => i + 1).map((n) => {
                const active = pickedSurah.number === currentSurah && n === currentAyah;
                return (
                  <button
                    key={n}
                    onClick={() => {
                      onSelect(pickedSurah.number, n);
                      setOpen(false);
                      setPickedSurah(null);
                    }}
                    className={`grid aspect-square place-items-center rounded-xl border text-sm transition-colors ${
                      active
                        ? "border-gilt/60 bg-secondary text-gilt"
                        : "border-border/60 text-foreground/80 hover:border-gilt/50 hover:bg-secondary/50"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DrawerHeader className="pb-2">
              <DrawerTitle className="font-display text-gilt-gradient text-2xl">Choose a Surah</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-3">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search surah…"
                className="rounded-full border-border bg-secondary/50"
              />
            </div>
            <div className="overflow-y-auto px-3 pb-8">
              {filtered.map((s) => (
                <button
                  key={s.number}
                  onClick={() => setPickedSurah(s)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                    s.number === currentSurah ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-gilt w-8 shrink-0 text-xs tracking-widest">{pad2(s.number)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.englishName}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {s.englishNameTranslation} · {s.numberOfAyahs} verses
                    </span>
                  </span>
                  <span className="arabic-verse shrink-0 text-base text-foreground/80">{s.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}