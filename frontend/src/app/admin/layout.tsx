'use client';

import React, { useEffect } from "react";
import Sidebar from "@/src/components/shared/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/user/dashboard');
      }
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) {
    return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white font-mono">ADMIN ACCESS AUTHORIZING...</div>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-[#080d1a]">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default AdminLayout;
