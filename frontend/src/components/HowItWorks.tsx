"use client";
import { useState } from "react";
import { Volume2, RotateCcw, Check, X, ChevronRight } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Làm bài kiểm tra đầu vào",
    desc: "AI đánh giá trình độ hiện tại và xác định từ vựng bạn cần học ưu tiên.",
    color: "bg-brand-500",
  },
  {
    num: "02",
    title: "Học theo lộ trình cá nhân",
    desc: "Mỗi buổi học 10-15 phút, được thiết kế phù hợp với tốc độ và mục tiêu của bạn.",
    color: "bg-violet-500",
  },
  {
    num: "03",
    title: "Ôn tập thông minh",
    desc: "Hệ thống SRS nhắc ôn tập đúng lúc bạn sắp quên để nhớ từ vĩnh cửu.",
    color: "bg-cyan-500",
  },
  {
    num: "04",
    title: "Đạt mục tiêu nhanh hơn",
    desc: "Thi thử IELTS/TOEIC ngay trong app, theo dõi điểm số tiến bộ theo thời gian.",
    color: "bg-green-500",
  },
];

export default function HowItWorks() {
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState<boolean | null>(null);

  return (
    <section
      id="roadmap"
      className="py-24 bg-[#0a0f1e] relative overflow-hidden"
    >
      <div className="blob blob-2" style={{ opacity: 0.08 }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Steps */}
          <div>
            <span className="inline-block text-brand-400 text-sm font-semibold tracking-wider uppercase mb-3">
              Cách hoạt động
            </span>
            <h2 className="section-title mb-12">
              Chỉ <span className="linear-text">4 bước</span> để thành thạo từ
              vựng
            </h2>

            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 ${step.color} rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      {step.num}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 bg-white/10 mt-2 ml-0" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="text-white font-semibold text-base mb-1 group-hover:text-brand-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive flashcard demo */}
          <div className="relative">
            {/* Phone mockup background */}
            <div className="absolute inset-0 bg-linear-to-br from-brand-900/20 to-violet-900/20 rounded-3xl blur-xl" />

            <div className="relative card-glass rounded-3xl p-6 max-w-sm mx-auto">
              {/* App header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-xs">Phiên học hôm nay</p>
                  <p className="text-white font-semibold text-sm">
                    IELTS Academic – Bộ 3/12
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-brand-400 font-bold text-sm">12/20</p>
                  <p className="text-slate-500 text-xs">thẻ</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-brand-500 to-cyan-500 rounded-full"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>

              {/* Flashcard */}
              <div
                className={`flip-card h-44 mb-4 cursor-pointer`}
                onClick={() => {
                  setFlipped(!flipped);
                  setAnswered(null);
                }}
              >
                <div
                  className={`flip-card-inner relative w-full h-full ${flipped ? "transform-[rotateY(180deg)]" : ""}`}
                  style={{
                    transition: "transform 0.6s",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Front */}
                  <div
                    className="flip-card-front absolute inset-0 bg-linear-to-br from-brand-800/60 to-brand-900/80 border border-brand-500/30 rounded-2xl flex flex-col items-center justify-center p-6"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <p className="text-slate-400 text-xs mb-3">
                      🇬🇧 Từ tiếng Anh
                    </p>
                    <p className="text-white font-display font-bold text-3xl mb-2">
                      Ambiguous
                    </p>
                    <button className="mt-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-brand-400 transition-colors">
                      <Volume2 size={18} />
                    </button>
                    <p className="text-slate-500 text-xs mt-4">
                      Nhấn để xem nghĩa
                    </p>
                  </div>

                  {/* Back */}
                  <div
                    className="flip-card-back absolute inset-0 bg-linear-to-br from-violet-800/60 to-violet-900/80 border border-violet-500/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-slate-400 text-xs mb-2">
                      🇻🇳 Nghĩa tiếng Việt
                    </p>
                    <p className="text-white font-bold text-2xl mb-1">
                      Mơ hồ, không rõ ràng
                    </p>
                    <p className="text-slate-400 text-xs mb-1">/æmˈbɪɡjuəs/</p>
                    <p className="text-violet-300 text-xs italic mt-2">
                      `&quot`The instructions were ambiguous.`&quot`
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {flipped && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => setAnswered(false)}
                    className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${answered === false ? "bg-red-500/30 border-red-500/50 text-red-300 border" : "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"}`}
                  >
                    <X size={14} /> Quên rồi
                  </button>
                  <button
                    onClick={() => {
                      setFlipped(false);
                      setAnswered(null);
                    }}
                    className="py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Xem lại
                  </button>
                  <button
                    onClick={() => setAnswered(true)}
                    className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${answered === true ? "bg-green-500/30 border-green-500/50 text-green-300 border" : "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"}`}
                  >
                    <Check size={14} /> Nhớ rồi!
                  </button>
                </div>
              )}

              {/* Next card hint */}
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                <ChevronRight size={13} />
                Từ tiếp theo:{" "}
                <span className="text-slate-400 font-medium">Eloquent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
