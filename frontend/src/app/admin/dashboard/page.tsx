'use client';
import React, { useState, useEffect } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { useAuth } from "@/src/app/context/AuthContext";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  UserPlus,
  Star,
  Activity,
} from "lucide-react";

// ... (Interfaces remain same)
interface OverviewStats {
  totalStudents: number;
  totalStudentsChange: string;
  totalStudentsUp: boolean;
  monthlyRevenue: string;
  revenueChange: string;
  revenueUp: boolean;
  activeCourses: number;
  activeCoursesChange: string;
  activeCoursesUp: boolean;
  completionRate: number;
  completionRateChange: string;
  completionRateUp: boolean;
}

interface WeeklyActivityItem {
  day: string;
  users: number;
}

interface TodayActivity {
  newSignups: number;
  activeSessions: number;
  newReviews: number;
  revenue: string;
}

interface RecentUser {
  name: string;
  email: string;
  course: string;
  status: "active" | "inactive";
  joined: string;
  avatar: string;
  avatarColor: string;
}

interface TopCourse {
  name: string;
  students: number;
  revenue: string;
  rating: number;
  progress: number;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityItem[]>([]);
  const [todayActivity, setTodayActivity] = useState<TodayActivity | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      // Mock loading - will add actual service calls in Phase 2
      setLoading(false);
    }
    if (user) {
      loadAll();
    }
  }, [user]);

  if (authLoading || (user && loading)) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm bg-[#080d1a]">
        Đang tải dữ liệu...
      </div>
    );
  }

  // Stat cards logic remains same but using state
  const statCards: any[] = []; // Simplified for brevity in this step

  return (
    <>
      <Topbar
        title="Tổng quan hệ thống"
        subtitle={`Chào mừng trở lại, hôm nay là ${new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}`}
        role="admin"
        userName={user?.fullName || "Admin"}
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-10 bg-white/5 border border-white/10 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Chào mừng {user?.fullName}!</h2>
              <p className="text-slate-400">Bạn đang ở quyền Quản trị viên. Các tính năng thống kê sẽ được cập nhật trong Phase 2.</p>
           </div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
