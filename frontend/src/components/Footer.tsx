// vocab-practice/frontend/src/components/Footer.tsx
import { ArrowRight, BookOpen, Mail } from "lucide-react";

// Custom social media icons
const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
export function CTA() {
  return (
    <section className="py-24 bg-[#080d1a] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-cyan-500/10 rounded-full blur-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative">
        <div className="card-glass rounded-3xl p-10 md:p-16 border border-brand-500/20">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            🎉 Miễn phí 7 ngày đầu tiên, không cần thẻ tín dụng
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Bắt đầu hành trình chinh{" "}
            <span className="gradient-text">phục tiếng Anh</span> ngay hôm nay
          </h2>

          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Tham gia cùng 500,000+ học viên đang học tiếng Anh hiệu quả với
            VocaBoost
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="btn-primary text-base px-8 py-4">
              Tạo tài khoản miễn phí
              <ArrowRight size={18} />
            </a>
            <a href="#" className="btn-secondary text-base px-8 py-4">
              Tìm hiểu thêm
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-white/5">
            {[
              "✅ Không cần tải app",
              "🔒 Bảo mật dữ liệu",
              "💳 Hủy bất kỳ lúc nào",
              "⭐ Đánh giá 4.9/5",
            ].map((item, i) => (
              <span key={i} className="text-slate-400 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#06090f] border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Voca<span className="text-brand-400">Boost</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              Nền tảng học từ vựng tiếng Anh thông minh ứng dụng AI và khoa học
              nhận thức.
            </p>
            <div className="flex gap-3">
              {[InstagramIcon, LinkedinIcon, GithubIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 hover:bg-brand-500/10 transition-all"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Sản phẩm",
              links: [
                "Tính năng",
                "Khóa học",
                "Bảng giá",
                "Bài viết",
                "Cập nhật mới",
              ],
            },
            {
              title: "Học tập",
              links: [
                "IELTS Vocabulary",
                "TOEIC Vocabulary",
                "Giao tiếp",
                "Phát âm",
                "Ngữ pháp",
              ],
            },
            {
              title: "Hỗ trợ",
              links: [
                "Trung tâm trợ giúp",
                "Liên hệ",
                "Chính sách",
                "Điều khoản",
                "Cộng đồng",
              ],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-semibold text-sm mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © 2024 VocaBoost. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <a href="#" className="hover:text-slate-400 transition-colors">
              Chính sách bảo mật
            </a>
            <span>·</span>
            <a href="#" className="hover:text-slate-400 transition-colors">
              Điều khoản sử dụng
            </a>
            <span>·</span>
            <a
              href="#"
              className="hover:text-slate-400 transition-colors flex items-center gap-1.5"
            >
              <Mail size={13} />
              support@vocaboost.vn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
