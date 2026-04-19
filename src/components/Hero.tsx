"use client";
import { ArrowRight, Play, Star, Zap, TrendingUp, Brain } from "lucide-react";
import { useEffect, useRef } from "react";

const floatingWords = [
  {
    word: "Ambiguous",
    meaning: "mơ hồ",
    pos: "top-[18%] left-[8%]",
    delay: "0s",
  },
  {
    word: "Eloquent",
    meaning: "hùng hồn",
    pos: "top-[12%] right-[10%]",
    delay: "1.5s",
  },
  {
    word: "Diligent",
    meaning: "chăm chỉ",
    pos: "bottom-[30%] left-[5%]",
    delay: "0.8s",
  },
  {
    word: "Innovate",
    meaning: "đổi mới",
    pos: "bottom-[20%] right-[8%]",
    delay: "2s",
  },
  {
    word: "Versatile",
    meaning: "linh hoạt",
    pos: "top-[50%] left-[2%]",
    delay: "1.2s",
  },
  {
    word: "Proficient",
    meaning: "thành thạo",
    pos: "top-[55%] right-[3%]",
    delay: "0.5s",
  },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          e.target.classList.toggle("visible", e.isIntersecting),
        ),
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0f1e]"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Radial glow center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating word cards */}
      {floatingWords.map((item, i) => (
        <div
          key={i}
          className={`absolute ${item.pos} hidden lg:block`}
          style={{ animation: `float 6s ease-in-out ${item.delay} infinite` }}
        >
          <div className="card-glass px-4 py-2.5 rounded-xl group hover:border-brand-500/40 transition-all cursor-default">
            <p className="text-white font-semibold text-sm">{item.word}</p>
            <p className="text-brand-400 text-xs mt-0.5">{item.meaning}</p>
          </div>
        </div>
      ))}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center relative z-10 w-full">
        {/* Badge */}
        <div
          className="reveal inline-flex items-center gap-2 bg-brand-950/80 border border-brand-700/50 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
          style={{ animationDelay: "0s" }}
        >
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          🏆 Nền tảng học tiếng Anh #1 Việt Nam
        </div>

        {/* Headline */}
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 reveal"
          style={{ animationDelay: "0.1s" }}
        >
          Học từ vựng{" "}
          <span className="gradient-text block">thông minh hơn,</span>
          <span className="text-slate-200">nhớ lâu hơn</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed reveal text-balance"
          style={{ animationDelay: "0.2s" }}
        >
          VocaBoost ứng dụng AI & khoa học nhận thức giúp bạn học 3x nhanh hơn,
          nhớ từ vựng lâu hơn và chinh phục IELTS, TOEIC dễ dàng.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 reveal"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="#"
            className="btn-primary text-base px-8 py-4 w-full sm:w-auto justify-center"
          >
            Bắt đầu học miễn phí
            <ArrowRight size={18} />
          </a>
          <a
            href="#"
            className="btn-secondary text-base px-8 py-4 w-full sm:w-auto justify-center"
          >
            <Play size={16} className="fill-white" />
            Xem demo
          </a>
        </div>

        {/* Social proof */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 mb-16 reveal"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex -space-x-3">
            {[
              "bg-pink-500",
              "bg-blue-500",
              "bg-green-500",
              "bg-amber-500",
              "bg-purple-500",
            ].map((c, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-full ${c} border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}
              >
                {["A", "B", "C", "D", "E"][i]}
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="text-amber-400 fill-amber-400"
                />
              ))}
              <span className="text-white font-bold text-sm ml-1">4.9</span>
            </div>
            <p className="text-slate-400 text-xs">
              Từ <span className="text-white font-medium">500,000+</span> học
              viên
            </p>
          </div>
          <div className="w-px h-10 bg-white/10 hidden sm:block" />
          <div className="text-left">
            <p className="text-white font-bold text-sm">
              Không cần thẻ tín dụng
            </p>
            <p className="text-slate-400 text-xs">Miễn phí 7 ngày đầu tiên</p>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto reveal"
          style={{ animationDelay: "0.5s" }}
        >
          {[
            { icon: TrendingUp, value: "500K+", label: "Học viên" },
            { icon: Brain, value: "50K+", label: "Từ vựng" },
            { icon: Star, value: "4.9/5", label: "Đánh giá" },
            { icon: Zap, value: "3x", label: "Nhanh hơn" },
          ].map((stat, i) => (
            <div
              key={i}
              className="card-glass rounded-2xl p-4 text-center group hover:border-brand-500/30 transition-all"
            >
              <stat.icon
                size={20}
                className="text-brand-400 mx-auto mb-2 group-hover:scale-110 transition-transform"
              />
              <p className="text-white font-display font-bold text-xl">
                {stat.value}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
