'use client';

import React, { useEffect, useState } from "react";
import Sidebar from "@/src/components/shared/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import DailyLoginCelebration from "@/src/components/user/gamification/DailyLoginCelebration";

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router, mounted]);

  if (!mounted) return null;

  if (loading) {
    return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white font-mono">Đang xác thực...</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <DailyLoginCelebration />
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default StudentLayout;
