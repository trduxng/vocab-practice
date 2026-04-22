"use client";

import React, { useMemo, useState } from "react";
import { Volume2, Check, X, RotateCcw } from "lucide-react";

type Flashcard = {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  note: string;
};

const baseFlashcards: Flashcard[] = [
  {
    word: "Ambiguous",
    phonetic: "/æmˈbɪɡjuəs/",
    meaning: "Mơ hồ, không rõ ràng",
    example: "The instructions were ambiguous and confusing.",
    note: "Thường dùng khi thông tin có nhiều cách hiểu khác nhau, gây nhầm lẫn.",
  },
  {
    word: "Eloquent",
    phonetic: "/ˈeləkwənt/",
    meaning: "Hùng hồn, diễn đạt tốt",
    example: "She gave an eloquent speech at the conference.",
    note: "Dùng để mô tả khả năng nói hoặc viết rất thuyết phục và trôi chảy.",
  },
  {
    word: "Diligent",
    phonetic: "/ˈdɪlɪdʒənt/",
    meaning: "Chăm chỉ, cần cù",
    example: "He is a diligent student who studies every day.",
    note: "Nhấn mạnh sự chăm chỉ liên tục, có kỷ luật.",
  },
  {
    word: "Innovate",
    phonetic: "/ˈɪnəveɪt/",
    meaning: "Đổi mới, sáng tạo",
    example: "Companies must innovate to stay competitive.",
    note: "Thường dùng trong công nghệ, kinh doanh, nghiên cứu.",
  },
  {
    word: "Versatile",
    phonetic: "/ˈvɜːsətaɪl/",
    meaning: "Linh hoạt, đa năng",
    example: "She is a versatile athlete.",
    note: "Dùng khi một người hoặc vật có nhiều kỹ năng / công dụng.",
  },
  {
    word: "Proficient",
    phonetic: "/prəˈfɪʃənt/",
    meaning: "Thành thạo",
    example: "He is proficient in English and Japanese.",
    note: "Dùng trong kỹ năng, ngôn ngữ hoặc nghề nghiệp.",
  },
  {
    word: "Analyze",
    phonetic: "/ˈænəlaɪz/",
    meaning: "Phân tích",
    example: "We need to analyze the data carefully.",
    note: "Dùng trong học tập, nghiên cứu, dữ liệu.",
  },
  {
    word: "Enhance",
    phonetic: "/ɪnˈhɑːns/",
    meaning: "Nâng cao, cải thiện",
    example: "This feature enhances user experience.",
    note: "Thường dùng trong UX, kỹ thuật, chất lượng.",
  },
  {
    word: "Persist",
    phonetic: "/pəˈsɪst/",
    meaning: "Kiên trì",
    example: "You must persist if you want success.",
    note: "Nhấn mạnh việc không bỏ cuộc dù khó khăn.",
  },
  {
    word: "Comprehend",
    phonetic: "/ˌkɒmprɪˈhend/",
    meaning: "Hiểu rõ",
    example: "She couldn’t comprehend the situation.",
    note: "Mức độ hiểu sâu hơn 'understand'.",
  },
  {
    word: "Accelerate",
    phonetic: "/əkˈseləreɪt/",
    meaning: "Tăng tốc",
    example: "The car began to accelerate quickly.",
    note: "Dùng cho tốc độ vật lý hoặc quá trình.",
  },
  {
    word: "Collaborate",
    phonetic: "/kəˈlæbəreɪt/",
    meaning: "Hợp tác",
    example: "They collaborate on the project.",
    note: "Làm việc chung để đạt mục tiêu chung.",
  },
];

const shuffle = (arr: Flashcard[]) => [...arr].sort(() => Math.random() - 0.5);

const StudentFlashcard = () => {
  const [isRandom] = useState(true);

  const flashcards = useMemo(() => {
    return isRandom ? shuffle(baseFlashcards) : baseFlashcards;
  }, [isRandom]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState<"know" | "dontknow" | null>(null);

  const card = flashcards[index];
  const progress = ((index + 1) / flashcards.length) * 100;

  const nextCard = () => {
    setFlipped(false);
    setStatus(null);
    setIndex((prev) => (prev + 1) % flashcards.length);
  };

  const resetCard = () => {
    setFlipped(false);
    setStatus(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-center text-white text-4xl font-bold mb-10">
          Flashcard học từ vựng
        </h1>

        {/* PROGRESS */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Tiến độ</span>
            <span>
              {index + 1} / {flashcards.length}
            </span>
          </div>

          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-linear-to-r from-brand-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* FLASHCARD */}
        <div className="relative" style={{ perspective: "1400px" }}>
          <div
            onClick={() => setFlipped((p) => !p)}
            className="relative w-full h-130 cursor-pointer transition-transform duration-700"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT */}
            <div
              className="absolute inset-0 rounded-3xl bg-linear-to-br from-brand-900/70 to-slate-900 border border-white/10 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-slate-400 text-sm mb-4">Từ vựng</p>

              <h2 className="text-white text-6xl font-bold mb-3">
                {card.word}
              </h2>

              <p className="text-brand-400 text-base mb-8">{card.phonetic}</p>

              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                <Volume2 size={20} className="text-brand-400" />
                <span className="text-slate-300 text-sm">Nghe phát âm</span>
              </div>
            </div>

            {/* BACK */}
            <div
              className="absolute inset-0 rounded-3xl bg-linear-to-br from-violet-900/70 to-slate-900 border border-white/10 flex flex-col items-center justify-center text-center px-14"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <h2 className="text-white text-4xl font-bold mb-4">
                {card.meaning}
              </h2>

              <p className="text-slate-300 text-base max-w-lg mb-4">
                <span className="text-slate-500">Ví dụ: </span>
                {card.example}
              </p>

              <p className="text-slate-400 text-sm max-w-lg">
                <span className="text-slate-500">Ghi chú: </span>
                {card.note}
              </p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-3 gap-4 mt-10">
          <button
            onClick={() => {
              setStatus("dontknow");
              nextCard();
            }}
            className="bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 px-5 py-3 rounded-xl flex justify-center gap-2"
          >
            <X size={18} /> Quên
          </button>

          <button
            onClick={resetCard}
            className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 px-5 py-3 rounded-xl flex justify-center gap-2"
          >
            <RotateCcw size={18} /> Xem lại
          </button>

          <button
            onClick={() => {
              setStatus("know");
              nextCard();
            }}
            className="bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 px-5 py-3 rounded-xl flex justify-center gap-2"
          >
            <Check size={18} /> Nhớ
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFlashcard;
