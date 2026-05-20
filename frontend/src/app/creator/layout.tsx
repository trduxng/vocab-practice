'use client';

import React, { useEffect } from "react";
import Sidebar from "@/src/components/shared/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const CreatorLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCreator, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isCreator && !isAdmin) {
        // Admin có thể truy cập creator area để kiểm tra
        router.push('/user/dashboard');
      }
    }
  }, [loading, isAuthenticated, isCreator, isAdmin, router]);

  if (loading) {
    return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white font-mono">CREATOR ACCESS AUTHORIZING...</div>;
  }

  if (!isAuthenticated || (!isCreator && !isAdmin)) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar role="creator" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default CreatorLayout;
