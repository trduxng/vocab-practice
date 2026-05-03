"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth.service";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight, BookOpen } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Vui lòng nhập email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email không đúng định dạng");
      return false;
    }
    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = await authService.login(formData);
      router.push(
        data.user.role === "Admin" ? "/admin/dashboard" : "/user/dashboard",
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Email hoặc mật khẩu không chính xác",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

        <div className="relative flex flex-col justify-center px-12 text-white">
          <div className="absolute top-12 left-12">
            <div className="flex items-center gap-3">
              <BookOpen className="w-10 h-10" />
              <span className="text-2xl font-bold">VocaBoost</span>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold leading-tight">
              Chào mừng
              <br />
              trở lại!
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Tiếp tục hành trình chinh phục TOEIC của bạn với lộ trình học tập
              thông minh và hiệu quả.
            </p>

            <div className="flex gap-6 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold">📚</span>
                </div>
                <div>
                  <p className="font-semibold">5000+</p>
                  <p className="text-sm text-blue-200">Từ vựng</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold">🎯</span>
                </div>
                <div>
                  <p className="font-semibold">95%</p>
                  <p className="text-sm text-blue-200">Đỗ đạt</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold">⚡</span>
                </div>
                <div>
                  <p className="font-semibold">24/7</p>
                  <p className="text-sm text-blue-200">Học mọi lúc</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              TOEIC Master
            </span>
          </div>

          <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900/50 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Đăng nhập
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Nhập thông tin để truy cập tài khoản của bạn
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl animate-shake">
                    <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                      <span className="text-lg">⚠️</span> {error}
                    </p>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Mật khẩu
                    </Label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      Đăng nhập
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">
                      hoặc
                    </span>
                  </div>
                </div>

                {/* Register Link */}
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Chưa có tài khoản?
                  <a
                    href="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Đăng ký miễn phí
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-8">
            Bằng việc đăng nhập, bạn đồng ý với
            <a href="/terms" className="underline hover:text-slate-700">
              Điều khoản
            </a>
            và
            <a href="/privacy" className="underline hover:text-slate-700">
              Chính sách bảo mật
            </a>
            của chúng tôi.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
