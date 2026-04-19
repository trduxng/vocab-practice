"use client";
import {
  Brain,
  Zap,
  BarChart3,
  Repeat,
  Mic,
  Globe,
  BookOpen,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Cá nhân hóa",
    desc: "Hệ thống AI phân tích điểm yếu và tạo lộ trình học cá nhân hóa riêng cho bạn.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Repeat,
    title: "Spaced Repetition",
    desc: "Thuật toán SRS giúp bạn ôn tập đúng thời điểm, nhớ từ suốt đời không lo quên.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Mic,
    title: "Luyện phát âm AI",
    desc: "Nhận phản hồi phát âm tức thì từ AI, cải thiện accent chuẩn bản ngữ.",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    icon: BarChart3,
    title: "Theo dõi tiến độ",
    desc: "Dashboard chi tiết giúp bạn nắm rõ từng bước tiến bộ theo ngày, tuần, tháng.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: BookOpen,
    title: "50,000+ từ vựng",
    desc: "Kho từ vựng khổng lồ theo chủ đề: IELTS, TOEIC, giao tiếp, học thuật…",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    icon: Target,
    title: "Học qua ngữ cảnh",
    desc: "Từ vựng được học trong câu chuyện, bài nghe thực tế, giúp nhớ tự nhiên hơn.",
    color: "from-teal-500 to-cyan-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-[#0a0f1e] relative">
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-brand-400 text-sm font-semibold tracking-wider uppercase mb-3">
            Tính năng nổi bật
          </span>
          <h2 className="section-title mb-4">
            Công nghệ học tập <span className="gradient-text">thế hệ mới</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Kết hợp khoa học nhận thức và AI tiên tiến để mang lại trải nghiệm
            học hiệu quả nhất
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group relative ${f.bg} border ${f.border} rounded-2xl p-6 hover:border-opacity-60 transition-all duration-300 cursor-default overflow-hidden`}
            >
              {/* Background glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
              />

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <f.icon size={22} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-brand-300 transition-colors">
                {f.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>

              {/* Shine effect */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
