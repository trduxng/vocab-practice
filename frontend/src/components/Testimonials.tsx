// frontend/src/components/Testimonials.tsx
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Nguyễn Minh Anh",
    role: "IELTS 7.5 – Đại học RMIT",
    avatar: "MA",
    avatarBg: "bg-blue-500",
    rating: 5,
    text: "Sau 3 tháng dùng VocaBoost, vốn từ IELTS của mình tăng vọt. Phương pháp SRS thực sự hiệu quả, giờ mình nhớ từ lâu hơn nhiều so với học truyền thống.",
    course: "IELTS Vocabulary Master",
    highlight: "Tăng từ 6.0 → 7.5",
  },
  {
    name: "Trần Thị Bảo Châu",
    role: "TOEIC 850 – Nhân viên Marketing",
    avatar: "BC",
    avatarBg: "bg-pink-500",
    rating: 5,
    text: "App thiết kế rất đẹp, dễ dùng. Tôi học 15 phút mỗi ngày trên đường đi làm và đạt 850 TOEIC sau 2 tháng. Nội dung sát với đề thi thật!",
    course: "TOEIC 800+ Vocabulary",
    highlight: "TOEIC 850 điểm",
  },
  {
    name: "Phạm Quốc Hùng",
    role: "Kỹ sư phần mềm tại Singapore",
    avatar: "QH",
    avatarBg: "bg-green-500",
    rating: 5,
    text: "Tính năng luyện phát âm AI rất ấn tượng. Giờ tôi có thể nói chuyện tự tin hơn nhiều với đồng nghiệp nước ngoài. Đáng đồng tiền bát gạo!",
    course: "Giao Tiếp Hàng Ngày",
    highlight: "Giao tiếp tự tin hơn",
  },
  {
    name: "Lê Thu Hà",
    role: "Sinh viên Y khoa – ĐH Hà Nội",
    avatar: "TH",
    avatarBg: "bg-amber-500",
    rating: 5,
    text: "Nhớ mãi không quên nhờ học theo ngữ cảnh. AI nhắc ôn tập đúng lúc, không bao giờ bị quá tải. Điểm nghe IELTS của mình từ 6.5 lên 8.0!",
    course: "IELTS Vocabulary Master",
    highlight: "Listening 8.0",
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="py-24 bg-[#080d1a] relative">
      <div className="absolute inset-0 bg-dots opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-brand-400 text-sm font-semibold tracking-wider uppercase mb-3">
            Học viên nói gì
          </span>
          <h2 className="section-title mb-4">
            Hàng trăm nghìn học viên{" "}
            <span className="gradient-text">đã thành công</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Câu chuyện thật từ những học viên đã đạt được mục tiêu với VocaBoost
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-brand-500/30 hover:bg-white/[0.05] transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote size={28} className="text-brand-600/50 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[...Array(r.rating)].map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                {r.text}
              </p>

              {/* Highlight badge */}
              <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                🎯 {r.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${r.avatarBg} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{r.name}</p>
                    <p className="text-slate-500 text-xs">{r.role}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-600 bg-white/5 px-2.5 py-1 rounded-lg">
                  {r.course}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
