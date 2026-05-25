"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/src/lib/validations";
import { useAuth } from "@/src/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast.success("Đăng nhập thành công!");
      // Navigation is handled in AuthContext or use local storage logic as fallback
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (savedUser.role === "Admin") {
        router.push("/admin/dashboard");
      } else if (savedUser.role === "ContentCreator") {
        router.push("/creator/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Email hoặc mật khẩu không chính xác",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080d1a] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md bg-white/5 border-white/10 shadow-2xl rounded-[40px] overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <CardHeader className="pt-12 pb-8 text-center bg-linear-to-b from-white/[0.03] to-transparent">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <LogIn className="text-blue-400" size={32} />
          </div>
          <CardTitle className="text-3xl font-black text-white tracking-tighter uppercase">
            Chào mừng trở lại
          </CardTitle>
          <p className="text-slate-500 text-sm mt-2">
            Học tiếp lộ trình của bạn ngay hôm nay
          </p>
        </CardHeader>

        <CardContent className="px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Email của bạn
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
                <Input
                  {...register("email")}
                  className={`bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white transition-all focus:border-blue-500 focus:bg-white/[0.07] ${errors.email ? "border-red-500/50 bg-red-500/5" : ""}`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-[10px] font-bold uppercase ml-1">
                  {errors.email?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Mật khẩu
                </label>
                <Link
                  href="#"
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
                <Input
                  {...register("password")}
                  type="password"
                  className={`bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white transition-all focus:border-blue-500 focus:bg-white/[0.07] ${errors.password ? "border-red-500/50 bg-red-500/5" : ""}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-[10px] font-bold uppercase ml-1">
                  {errors.password?.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/40 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                "Đăng nhập ngay"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pb-12 pt-8 flex justify-center border-t border-white/5 bg-white/[0.01] mt-8">
          <p className="text-slate-500 text-sm">
            Bạn chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-blue-500 font-bold hover:underline"
            >
              Đăng ký miễn phí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
