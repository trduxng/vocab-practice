'use client';

import React, { useEffect, useState } from 'react';
import { creatorService } from '@/src/services/creator.service';
import { BarChart3, BookOpen, FileQuestion, FileText, ListChecks, Loader2, PieChart as PieChartIcon, Award, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import { toast } from 'sonner';
import Topbar from '@/src/components/shared/Topbar';
import ChartFrame from '@/src/components/admin/ChartFrame';
import { chartColors } from '@/src/components/admin/AdminPrimitives';

interface DashboardStats {
  TotalTopics?: number;
  TotalWords?: number;
  TotalQuestions?: number;
  TotalMiniTests?: number;
  PublishedTopics?: number;
  PublishedWords?: number;
  DraftTopics?: number;
  PendingReviewTopics?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ContentSummaryItem {
  EntityType: string;
  ContentStatus: string;
  Total: number;
}

interface TopicAnalyticsItem {
  TopicID: number;
  TopicName: string;
  TopicCode: string;
  TotalEnrolledLearners: number;
  TotalWords: number;
  LearnersWithProgress: number;
  AvgMasteryLevel: number;
  AvgLastScore: number;
  TotalMasteredRecords: number;
  TotalLapsedRecords: number;
}

interface MiniTestAnalyticsItem {
  MiniTestID: number;
  TestTitle: string;
  TopicID: number;
  TopicName: string;
  TotalAttempts: number;
  TotalLearners: number;
  AvgScore: number;
}

export default function CreatorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [summary, setSummary] = useState<ContentSummaryItem[]>([]);
  const [topicAnalytics, setTopicAnalytics] = useState<TopicAnalyticsItem[]>([]);
  const [miniTestAnalytics, setMiniTestAnalytics] = useState<MiniTestAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([
        creatorService.getDashboard(),
        creatorService.getContentSummary(),
      ]);
      
      if (s && s.stats) {
        setStats(s.stats);
        setTopicAnalytics(s.topicAnalytics || []);
        setMiniTestAnalytics(s.miniTestAnalytics || []);
      } else {
        // Fallback for old API structure
        setStats(s || {});
        setTopicAnalytics([]);
        setMiniTestAnalytics([]);
      }
      setSummary(c);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  const cards = [
    { label: 'Chủ đề', value: stats.TotalTopics ?? 0, icon: BookOpen, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Từ vựng', value: stats.TotalWords ?? 0, icon: FileText, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Câu hỏi', value: stats.TotalQuestions ?? 0, icon: FileQuestion, color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Bài test', value: stats.TotalMiniTests ?? 0, icon: ListChecks, color: 'bg-purple-500/10 text-purple-500' },
  ];

  const typeLabels: Record<string, string> = {
    Topic: 'Chủ đề',
    Word: 'Từ vựng',
    Question: 'Câu hỏi',
    MiniTest: 'Bài test',
  };

  // Transform summary for BarChart (Status by Entity Type)
  const barChartData = Object.entries(
    summary.reduce((acc, curr) => {
      const type = typeLabels[curr.EntityType] || curr.EntityType;
      if (!acc[type]) acc[type] = { name: type, Draft: 0, PendingReview: 0, Published: 0, Rejected: 0, Archived: 0 };
      acc[type][curr.ContentStatus] = curr.Total;
      return acc;
    }, {} as Record<string, any>)
  ).map(([, value]) => value);

  // Transform summary for PieChart (Total by Entity Type)
  const pieChartData = Object.entries(
    summary.reduce((acc, curr) => {
      const type = typeLabels[curr.EntityType] || curr.EntityType;
      acc[type] = (acc[type] || 0) + curr.Total;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];


  // Group summary by EntityType
  const grouped: Record<string, ContentSummaryItem[]> = {};
  summary.forEach((item) => {
    if (!grouped[item.EntityType]) grouped[item.EntityType] = [];
    grouped[item.EntityType].push(item);
  });

  const statusColors: Record<string, string> = {
    Draft: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    PendingReview: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    Published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  const statusLabels: Record<string, string> = {
    Draft: 'Bản nháp',
    PendingReview: 'Chờ duyệt',
    Published: 'Đã xuất bản',
    Rejected: 'Bị từ chối',
    Archived: 'Đã lưu trữ',
  };


  // 1. Data for Content Overview Chart
  const overviewData = [
    { name: 'Chủ đề', value: stats.TotalTopics ?? 0, color: '#3b82f6' }, // blue-500
    { name: 'Từ vựng', value: stats.TotalWords ?? 0, color: '#10b981' }, // emerald-500
    { name: 'Câu hỏi', value: stats.TotalQuestions ?? 0, color: '#f59e0b' }, // amber-500
    { name: 'Bài test', value: stats.TotalMiniTests ?? 0, color: '#8b5cf6' }, // purple-500
  ];

  // 2. Data for Status Distribution Chart
  const statusData = Object.entries(typeLabels).map(([type, label]) => {
    const items = grouped[type] || [];
    const getCount = (status: string) => items.find((i) => i.ContentStatus === status)?.Total || 0;
    return {
      name: label,
      'Bản nháp': getCount('Draft'),
      'Chờ duyệt': getCount('PendingReview'),
      'Từ chối': getCount('Rejected'),
      'Đã duyệt': getCount('Published'),
    };
  });

  const tooltipStyle = {
    background: 'rgb(15 23 42)',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 8,
    color: 'white',
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#020617]">
      <Topbar title="Bảng điều khiển Người tạo" subtitle="Tổng quan nội dung của bạn" role="creator" />
      <div className="flex-1 p-6 md:p-8 space-y-8">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Bar Chart: Content Status */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-slate-400" /> Trạng thái nội dung
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "rgb(15 23 42)", border: "none", borderRadius: 8, color: "white" }}
                />
                <Legend />
                <Bar dataKey="Published" name="Đã xuất bản" stackId="a" fill="#10b981" />
                <Bar dataKey="PendingReview" name="Chờ duyệt" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Draft" name="Bản nháp" stackId="a" fill="#94a3b8" />
                <Bar dataKey="Rejected" name="Từ chối" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Content Types */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <PieChartIcon className="h-5 w-5 text-slate-400" /> Tỷ trọng nội dung
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgb(15 23 42)", border: "none", borderRadius: 8, color: "white" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Engagement Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-slate-400" /> Học tập & Tiến trình theo Chủ đề
          </h2>
          <div className="h-72">
            {topicAnalytics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <BookOpen className="h-8 w-8 mb-2 stroke-1" />
                <p className="text-sm">Chưa có học viên nào tham gia học chủ đề của bạn.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicAnalytics.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                  <XAxis dataKey="TopicName" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "rgb(15 23 42)", border: "none", borderRadius: 8, color: "white" }}
                    formatter={(value: any, name: any) => {
                      if (name === 'TotalEnrolledLearners') return [value, 'Học viên đăng ký'];
                      if (name === 'LearnersWithProgress') return [value, 'Học viên đã học'];
                      return [value, name];
                    }}
                  />
                  <Legend formatter={(value) => {
                    if (value === 'TotalEnrolledLearners') return 'Đăng ký';
                    if (value === 'LearnersWithProgress') return 'Đã bắt đầu học';
                    return value;
                  }} />
                  <Bar dataKey="TotalEnrolledLearners" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="LearnersWithProgress" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Mini-Test Performance Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-slate-400" /> Hiệu suất và Lượt làm bài Test
          </h2>
          <div className="h-72">
            {miniTestAnalytics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ListChecks className="h-8 w-8 mb-2 stroke-1" />
                <p className="text-sm">Chưa có lượt làm bài nào cho các đề thi thử của bạn.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={miniTestAnalytics.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                  <XAxis dataKey="TestTitle" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 12 }} label={{ value: 'Lượt làm', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} label={{ value: 'Điểm trung bình (%)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ background: "rgb(15 23 42)", border: "none", borderRadius: 8, color: "white" }}
                    formatter={(value: any, name: any) => {
                      if (name === 'TotalAttempts') return [value, 'Số lượt làm'];
                      if (name === 'AvgScore') return [`${parseFloat(value).toFixed(1)}%`, 'Điểm trung bình'];
                      return [value, name];
                    }}
                  />
                  <Legend formatter={(value) => {
                    if (value === 'TotalAttempts') return 'Số lượt làm bài';
                    if (value === 'AvgScore') return 'Điểm số trung bình';
                    return value;
                  }} />
                  <Bar yAxisId="left" dataKey="TotalAttempts" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="AvgScore" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
