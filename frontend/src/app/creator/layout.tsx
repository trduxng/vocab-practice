'use client';

import React, { useEffect, useState } from "react";
import Sidebar from "@/src/components/shared/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const CreatorLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCreator, loading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isCreator) {
        router.push('/user/dashboard');
      }
    }
  }, [loading, isAuthenticated, isCreator, router, mounted]);

  if (!mounted) return null;

  if (loading) {
    return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white font-mono">ĐANG XÁC THỰC QUYỀN TRUY CẬP CREATOR...</div>;
  }

  if (!isAuthenticated || !isCreator) return null;

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar role="creator" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default CreatorLayout;
