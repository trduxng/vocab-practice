'use client';

import React, { useEffect } from "react";
import Sidebar from "@/src/components/shared/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white font-mono">SECURE BOOT...</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#080d1a]">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default StudentLayout;
