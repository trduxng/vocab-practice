"use client";
import {
  Users,
  Clock,
  BarChart2,
  ArrowRight,
  Trophy,
  Star,
} from "lucide-react";

const courses = [
  {
    tag: "Phổ biến nhất",
    tagColor: "bg-brand-500/20 text-brand-300 border-brand-500/30",
    badge: "🏆",
    title: "IELTS Vocabulary Master",
    desc: "Chinh phục 5000 từ vựng học thuật theo Academic Word List, tăng band điểm hiệu quả.",
    level: "Trung cấp – Cao cấp",
    levelColor: "text-amber-400",
    words: "5,000 từ",
    students: "120,000",
    duration: "3 tháng",
    rating: 4.9,
    image: "from-blue-600/40 to-indigo-800/40",
    accent: "border-blue-500/30",
  },
  {
    tag: "Mới ra mắt",
    tagColor: "bg-green-500/20 text-green-300 border-green-500/30",
    badge: "⚡",
    title: "TOEIC 800+ Vocabulary",
    desc: "Từ vựng kinh doanh thực tế, luyện nghe đọc TOEIC từ 0 đến 800+ điểm dễ dàng.",
    level: "Cơ bản – Trung cấp",
    levelColor: "text-green-400",
    words: "3,500 từ",
    students: "85,000",
    duration: "2 tháng",
    rating: 4.8,
    image: "from-green-600/40 to-teal-800/40",
    accent: "border-green-500/30",
  },
  {
    tag: "Cho người mới",
    tagColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    badge: "💬",
    title: "Giao Tiếp Hàng Ngày",
    desc: "Từ vựng và cụm từ thực dụng cho giao tiếp hàng ngày, công việc và du lịch quốc tế.",
    level: "Sơ cấp – Cơ bản",
    levelColor: "text-pink-400",
    words: "2,000 từ",
    students: "200,000",
    duration: "6 tuần",
    rating: 4.9,
    image: "from-pink-600/40 to-rose-800/40",
    accent: "border-pink-500/30",
  },
];

export default function Courses() {
  return (
    <section id="courses" className="py-24 bg-[#080d1a] relative">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <span className="inline-block text-brand-400 text-sm font-semibold tracking-wider uppercase mb-3">
              Khóa học
            </span>
            <h2 className="section-title">
              Khóa học phù hợp{" "}
              <span className="gradient-text">mọi mục tiêu</span>
            </h2>
          </div>
          <a
            href="#"
            className="text-brand-400 hover:text-brand-300 font-medium text-sm flex items-center gap-1.5 group shrink-0"
          >
            Xem tất cả khóa học
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </div>

        {/* Course cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div
              key={i}
              className={`group relative bg-white/[0.03] border ${course.accent} rounded-2xl overflow-hidden hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
            >
              {/* Course hero image / gradient */}
              <div
                className={`h-40 bg-gradient-to-br ${course.image} relative flex items-center justify-center`}
              >
                <span className="text-6xl opacity-60">{course.badge}</span>
                {/* Tag */}
                <div
                  className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full border ${course.tagColor}`}
                >
                  {course.tag}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${course.levelColor}`}>
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-white text-xs font-semibold">
                      {course.rating}
                    </span>
                  </div>
                </div>

                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-brand-300 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {course.desc}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-5 pt-4 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-slate-400" />
                    {course.words}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-slate-400" />
                    {course.students}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    {course.duration}
                  </span>
                </div>

                <button className="w-full py-2.5 rounded-xl border border-white/10 hover:border-brand-500/50 hover:bg-brand-500/10 text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 group/btn">
                  Xem chi tiết
                  <ArrowRight
                    size={15}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Fix missing import
function BookOpen({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
