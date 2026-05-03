"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth.service";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  BookOpen,
  CheckCircle,
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      setError("Họ tên phải có ít nhất 2 ký tự");
      return false;
    }
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
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    const strengthMap = {
      0: { label: "", color: "bg-slate-200" },
      1: { label: "Yếu", color: "bg-red-500" },
      2: { label: "Trung bình", color: "bg-orange-500" },
      3: { label: "Khá", color: "bg-yellow-500" },
      4: { label: "Mạnh", color: "bg-green-500" },
      5: { label: "Rất mạnh", color: "bg-green-600" },
    };

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 relative overflow-hidden">
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
              Bắt đầu
              <br />
              hành trình mới!
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Tham gia cùng 10,000+ học viên đã chinh phục TOEIC thành công với
              phương pháp học tập thông minh.
            </p>

            <div className="space-y-4 pt-8">
              {[
                "Lộ trình học cá nhân hóa",
                "5,000+ từ vựng TOEIC",
                "Bài tập tương tác & kiểm tra",
                "Theo dõi tiến độ chi tiết",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-300 flex-shrink-0" />
                  <span className="text-lg text-purple-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              TOEIC Master
            </span>
          </div>

          <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900/50 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Đăng ký
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Tạo tài khoản để bắt đầu học tập miễn phí
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                {/* Success Message */}
                {success && (
                  <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                    <p className="text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> {success}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl animate-shake">
                    <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                      <span className="text-lg">⚠️</span> {error}
                    </p>
                  </div>
                )}

                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Họ và tên
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

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
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tối thiểu 6 ký tự"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
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

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              level <= passwordStrength.strength
                                ? passwordStrength.color
                                : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Độ mạnh mật khẩu:{" "}
                        <span className="font-semibold">
                          {passwordStrength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className={`pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border transition-all ${
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : formData.confirmPassword &&
                              formData.password === formData.confirmPassword
                            ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                            : "border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      }`}
                      required
                    />
                    {formData.confirmPassword &&
                      formData.password === formData.confirmPassword && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading || !!success}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang tạo tài khoản...</span>
                    </div>
                  ) : success ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Đăng ký thành công!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Tạo tài khoản miễn phí
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <a href="/terms" className="underline hover:text-slate-700">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a href="/privacy" className="underline hover:text-slate-700">
                    Chính sách bảo mật
                  </a>{" "}
                  của chúng tôi.
                </p>

                {/* Login Link */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">
                      Đã có tài khoản?
                    </span>
                  </div>
                </div>

                <p className="text-center">
                  <a
                    href="/login"
                    className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                  >
                    Đăng nhập ngay
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
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
