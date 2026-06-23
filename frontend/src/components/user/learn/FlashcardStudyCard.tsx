import { useRef } from "react";
import { BookOpen, BrainCircuit, Languages, Lightbulb, RotateCw, Volume2 } from "lucide-react";
import type { Flashcard } from "@/src/modules/user/types";

type FlashcardStudyCardProps = {
  card: Flashcard;
  flipped: boolean;
  memoryTip: string;
  flipLocked?: boolean;
  onFlip: () => void;
  onPlayAudio: () => void;
  onSwipe: (direction: "left" | "right") => void;
};

export default function FlashcardStudyCard({
  card,
  flipped,
  memoryTip,
  flipLocked = false,
  onFlip,
  onPlayAudio,
  onSwipe,
}: FlashcardStudyCardProps) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  return (
    <div className="relative" style={{ perspective: "1800px" }}>
      <button
        type="button"
        onPointerDown={(event) => {
          pointerStart.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          const start = pointerStart.current;
          pointerStart.current = null;
          if (!start) return;

          const deltaX = event.clientX - start.x;
          const deltaY = event.clientY - start.y;
          if (Math.abs(deltaX) < 56 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

          suppressClick.current = true;
          onSwipe(deltaX > 0 ? "right" : "left");
          window.setTimeout(() => {
            suppressClick.current = false;
          }, 0);
        }}
        onClick={() => {
          if (!suppressClick.current && !flipLocked) onFlip();
        }}
        className="relative block h-[440px] w-full cursor-pointer touch-pan-y text-left sm:h-[470px]"
        aria-label={flipped ? "Ẩn đáp án" : "Hiện đáp án"}
      >
        <div
          className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.65,0.3,1)]"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <CardFace className="bg-linear-to-br from-white via-sky-50 to-emerald-50 dark:from-[#172033] dark:via-[#101a2b] dark:to-[#10251f]">
            <div className="flex h-full flex-col items-center justify-center px-6 text-center sm:px-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                <BookOpen className="h-3.5 w-3.5" />
                Từ vựng
              </div>
              <h1 className="mt-8 max-w-full break-words text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-7xl">
                {card.term}
              </h1>
              <p className="mt-4 text-base font-bold tracking-wide text-slate-500 dark:text-slate-300 sm:text-lg">
                {card.phonetic || "Chưa có phiên âm"}
              </p>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onPlayAudio();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.stopPropagation();
                    onPlayAudio();
                  }
                }}
                className="mt-10 inline-flex min-h-14 items-center gap-3 rounded-2xl border border-sky-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-sky-700 shadow-sm transition-transform hover:-translate-y-0.5 dark:border-sky-500/20 dark:bg-white/10 dark:text-sky-200"
              >
                <Volume2 className="h-5 w-5" />
                Nghe phát âm
              </span>
              <p className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                <RotateCw className="h-3.5 w-3.5" />
                Chạm hoặc nhấn Space để lật thẻ
              </p>
            </div>
          </CardFace>

          <CardFace back className="bg-linear-to-br from-slate-900 via-indigo-950 to-sky-950 text-white">
            <div className="flex h-full flex-col overflow-y-auto p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">Ý nghĩa</p>
                  <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{card.meaning}</h2>
                </div>
                <BrainCircuit className="h-7 w-7 shrink-0 text-sky-300/70" />
              </div>

              <div className="mt-6 space-y-3">
                <InfoBlock icon={BookOpen} label="Ví dụ" value={card.exampleSentence || card.questionText || "Chưa có câu ví dụ cho từ này."} />
                <InfoBlock icon={Languages} label="Dịch nghĩa" value={card.exampleMeaning || "Bản dịch đang được cập nhật."} />
                <InfoBlock icon={Lightbulb} label="Mẹo ghi nhớ" value={memoryTip} highlight />
              </div>

              <p className="mt-auto pt-5 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200/60">
                Vuốt trái: Lại · Vuốt phải: Tốt
              </p>
            </div>
          </CardFace>
        </div>
      </button>
    </div>
  );
}

function CardFace({
  children,
  className,
  back = false,
}: {
  children: React.ReactNode;
  className: string;
  back?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-300/30 dark:border-white/10 dark:shadow-black/20 ${className}`}
      style={{
        backfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-3.5 ${highlight ? "border-amber-300/20 bg-amber-300/10" : "border-white/10 bg-white/[0.06]"}`}>
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-amber-300" : "text-sky-300"}`} />
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${highlight ? "text-amber-200" : "text-sky-200/75"}`}>{label}</p>
          <p className="mt-1 text-sm font-medium leading-5 text-white/90 sm:text-base sm:leading-6">{value}</p>
        </div>
      </div>
    </div>
  );
}
