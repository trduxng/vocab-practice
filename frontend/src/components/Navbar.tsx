"use client";
import { useState, useEffect } from "react";
import { BookOpen, Menu, X, Zap } from "lucide-react";

const navLinks = [
  { label: "Tính năng", href: "#features" },
  { label: "Khóa học", href: "#courses" },
  { label: "Lộ trình", href: "#roadmap" },
  { label: "Đánh giá", href: "#reviews" },
  { label: "Bảng giá", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Voca<span className="text-brand-400">Boost</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="nav-link px-4 py-2">
              Đăng nhập
            </a>
            <a href="/register" className="btn-primary text-sm py-2.5 px-5">
              <Zap size={15} />
              Bắt đầu miễn phí
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link px-4 py-3 rounded-lg hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
              <a href="/login" className="nav-link px-4 py-2.5 text-center">
                Đăng nhập
              </a>
              <a href="/register" className="btn-primary text-sm justify-center">
                <Zap size={15} /> Bắt đầu miễn phí
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
