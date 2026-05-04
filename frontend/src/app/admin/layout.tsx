// vocab-practice/frontend/src/app/admin/layout.tsx
import React from "react";
import Sidebar from "@/src/components/shared/Sidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-[#080d1a]">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default AdminLayout;
