"use client";
import { useState } from "react";
import { Check, Zap, Crown, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Miễn phí",
    icon: Sparkles,
    price: { monthly: 0, yearly: 0 },
    desc: "Khám phá và bắt đầu hành trình học từ vựng",
    color: "border-white/10",
    badge: null,
    features: [
      "20 thẻ từ vựng mỗi ngày",
      "3 bộ từ vựng cơ bản",
      "Thuật toán SRS cơ bản",
      "Theo dõi tiến độ đơn giản",
    ],
    disabled: [],
    cta: "Bắt đầu miễn phí",
    ctaStyle: "border border-white/20 text-white hover:bg-white/5",
  },
  {
    name: "Pro",
    icon: Zap,
    price: { monthly: 199000, yearly: 149000 },
    desc: "Dành cho người học nghiêm túc muốn tiến bộ nhanh",
    color: "border-brand-500/60",
    badge: "Phổ biến nhất",
    features: [
      "Không giới hạn thẻ từ vựng",
      "Toàn bộ 50,000+ từ vựng",
      "AI cá nhân hóa lộ trình học",
      "Luyện phát âm AI không giới hạn",
      "Thi thử IELTS/TOEIC hàng tuần",
      "Thống kê tiến độ chi tiết",
      "Học offline trên mọi thiết bị",
    ],
    disabled: [],
    cta: "Dùng thử 7 ngày miễn phí",
    ctaStyle: "bg-brand-600 hover:bg-brand-700 text-white shadow-glow",
  },
  {
    name: "Premium",
    icon: Crown,
    price: { monthly: 399000, yearly: 299000 },
    desc: "Trải nghiệm đỉnh cao với AI gia sư cá nhân",
    color: "border-amber-500/40",
    badge: "Tốt nhất",
    features: [
      "Tất cả tính năng Pro",
      "AI gia sư 1-1 không giới hạn",
      "Chữa bài Writing AI chi tiết",
      "Roadmap thi IELTS/TOEIC cá nhân",
      "Hỗ trợ ưu tiên 24/7",
      "Chứng chỉ hoàn thành khóa học",
      "Báo cáo tiến độ hàng tuần",
    ],
    disabled: [],
    cta: "Nâng cấp Premium",
    ctaStyle:
      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg",
  },
];

const formatter = new Intl.NumberFormat("vi-VN");

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-[#0a0f1e] relative">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-brand-400 text-sm font-semibold tracking-wider uppercase mb-3">
            Bảng giá
          </span>
          <h2 className="section-title mb-4">
            Đầu tư vào <span className="gradient-text">tương lai của bạn</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            Bắt đầu miễn phí, nâng cấp bất cứ lúc nào. Không cần thẻ tín dụng.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${!yearly ? "bg-brand-600 text-white shadow-glow" : "text-slate-400 hover:text-white"}`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${yearly ? "bg-brand-600 text-white shadow-glow" : "text-slate-400 hover:text-white"}`}
            >
              Hàng năm
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
                -25%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative bg-white/[0.03] border-2 ${plan.color} rounded-2xl p-6 flex flex-col ${i === 1 ? "md:-translate-y-2 md:scale-105" : ""} hover:border-opacity-80 transition-all duration-300`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full border ${
                    plan.badge === "Phổ biến nhất"
                      ? "bg-brand-600 border-brand-400 text-white"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan header */}
              <div className="mb-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      i === 0
                        ? "bg-slate-700"
                        : i === 1
                          ? "bg-brand-600"
                          : "bg-amber-500/20 border border-amber-500/30"
                    }`}
                  >
                    <plan.icon
                      size={18}
                      className={i === 2 ? "text-amber-400" : "text-white"}
                    />
                  </div>
                  <h3 className="text-white font-bold text-xl">{plan.name}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {plan.desc}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price.monthly === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-white">
                      Miễn phí
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold text-white">
                        {formatter.format(
                          yearly ? plan.price.yearly : plan.price.monthly,
                        )}
                      </span>
                      <span className="text-slate-400 text-sm">đ/tháng</span>
                    </div>
                    {yearly && (
                      <p className="text-slate-500 text-xs mt-1">
                        Tính ra {formatter.format(plan.price.yearly * 12)}đ/năm
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={15}
                      className={`mt-0.5 shrink-0 ${i === 1 ? "text-brand-400" : i === 2 ? "text-amber-400" : "text-green-400"}`}
                    />
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <p className="text-center text-slate-500 text-sm mt-8">
          🔒 Đảm bảo hoàn tiền trong 30 ngày · Bảo mật thanh toán · Hủy bất cứ
          lúc nào
        </p>
      </div>
    </section>
  );
}
