"use client";

import Topbar from "@/src/components/shared/Topbar";
import { useAuth } from "@/src/app/context/AuthContext";
import UserSettings from "@/src/components/user/UserSettings";

export default function UserSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
      <Topbar
        title="Cài đặt tài khoản"
        role="student"
        userName={user?.fullName}
      />

      <main className="flex-1 overflow-auto p-6">
        <UserSettings />
      </main>
    </div>
  );
}
