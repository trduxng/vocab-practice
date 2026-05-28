"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/src/lib/validations";
import { authService } from "@/src/services/auth.service";
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
import { UserPlus, User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.register(data);
      toast.success("Đăng ký thành công! Hãy đăng nhập để bắt đầu.");
      router.push("/login?registered=true");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Email đã tồn tại hoặc dữ liệu không hợp lệ",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080d1a] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md bg-white/5 border-white/10 shadow-2xl rounded-[40px] overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="pt-12 pb-8 text-center bg-linear-to-b from-white/[0.03] to-transparent">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <UserPlus className="text-blue-400" size={32} />
          </div>
          <CardTitle className="text-3xl font-black text-white tracking-tighter uppercase">
            Tạo tài khoản
          </CardTitle>
          <p className="text-slate-500 text-sm mt-2">
            Bắt đầu hành trình chinh phục TOEIC ngay
          </p>
        </CardHeader>

        <CardContent className="px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Họ và tên
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
                <Input
                  {...register("fullName")}
                  className={`bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white transition-all focus:border-blue-500 focus:bg-white/[0.07] ${errors.fullName ? "border-red-500/50 bg-red-500/5" : ""}`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-[10px] font-bold uppercase ml-1">
                  {errors.fullName?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Email
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Mật khẩu
              </label>
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
              className="w-full h-14 bg-white text-slate-950 hover:bg-blue-600 hover:text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Đăng ký ngay{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pb-12 pt-8 flex justify-center border-t border-white/5 bg-white/[0.01] mt-8">
          <p className="text-slate-500 text-sm">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-blue-500 font-bold hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
