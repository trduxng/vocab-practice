"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import ChartFrame from "@/src/components/admin/ChartFrame";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton, chartColors } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
import { formatAdminNumber } from "@/src/lib/admin-i18n";
import { BarChart3, Clock, Flame, Gauge, HelpCircle, Target, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type AnalyticsData = {
  summary?: {
    averageAccuracy?: number | null;
    totalAttempts?: number;
    activeLearners?: number;
    wrongAttempts?: number;
  };
  popularQuizzes?: Array<{ name: string; attempts: number; completion: number | null }>;
  questionAccuracy?: Array<{ question: string; questionText: string; term: string; attempts: number; accuracy: number | null }>;
  studyActivity?: Array<{ day: string; attempts: number; accuracy: number | null }>;
  difficultTopics?: Array<{ label: string; accuracy: number | null }>;
};

const tooltipStyle = { background: "rgb(15 23 42)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "white" };

function difficultyClass(value: number) {
  if (value < 50) return "bg-rose-500/80 text-white";
  if (value < 65) return "bg-amber-500/75 text-white";
  if (value < 78) return "bg-blue-500/70 text-white";
  return "bg-emerald-500/70 text-white";
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        const response = await adminService.getAnalytics();
        if (!cancelled) setData(response);
      } catch (error) {
        console.error("Không thể tải dữ liệu phân tích", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  const popularQuizzes = useMemo(() => data?.popularQuizzes || [], [data]);
  const questionAccuracy = useMemo(() => data?.questionAccuracy || [], [data]);
  const studyActivity = useMemo(() => data?.studyActivity || [], [data]);
  const difficultTopics = useMemo(() => {
    const source = data?.difficultTopics?.length ? data.difficultTopics : [{ label: "Chưa có lượt làm", accuracy: 0 }];
    return source.map((item) => ({
      label: item.label,
      values: studyActivity.length ? studyActivity.map((day) => Math.round(Number(day.accuracy || item.accuracy || 0))) : [Math.round(Number(item.accuracy || 0))],
    }));
  }, [data, studyActivity]);

  const dayLabels = studyActivity.length ? studyActivity.map((item) => item.day) : ["Hiện tại"];
  const avgAccuracy = Math.round(Number(data?.summary?.averageAccuracy || 0));
  const wrongAttempts = Number(data?.summary?.wrongAttempts || 0);

  return (
    <>
      <Topbar title="Phân tích học tập" subtitle="Số liệu thực tế từ lượt làm bài, câu hỏi, chủ đề và tiến độ học." role="admin" />
      <AdminPage>
        {loading ? (
          <AdminPanel>
            <div className="py-12 text-center text-sm text-slate-600 dark:text-slate-400">Đang tải dữ liệu phân tích...</div>
          </AdminPanel>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Lượt làm bài" value={formatAdminNumber(data?.summary?.totalAttempts)} change={`${formatAdminNumber(data?.summary?.activeLearners)} học viên hoạt động`} icon={Clock} tone="blue" />
              <KpiCard label="Độ chính xác trung bình" value={`${avgAccuracy}%`} change="Tất cả lượt làm bài" icon={Target} tone="emerald" />
              <KpiCard label="Lượt trả lời sai" value={formatAdminNumber(wrongAttempts)} change="Cần xem lại" trend="down" icon={HelpCircle} tone="amber" />
              <KpiCard label="Chủ đề được theo dõi" value={formatAdminNumber(popularQuizzes.length)} change="Có lịch sử làm bài" icon={Flame} tone="rose" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <AdminPanel title="Chủ đề được luyện tập nhiều nhất" description="Mức độ quan tâm dựa trên số lượt làm bài." action={<ToolbarButton active>Trực tiếp</ToolbarButton>}>
                <ChartFrame className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularQuizzes} layout="vertical" margin={{ left: 32 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={145} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="attempts" fill={chartColors.blue} radius={[0, 6, 6, 0]} name="Lượt làm" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </AdminPanel>

              <AdminPanel title="Độ chính xác theo câu hỏi" description="Câu hỏi có độ chính xác thấp nhất được hiển thị trước." action={<StatusBadge tone="amber">Dưới 60% cần xem lại</StatusBadge>}>
                <ChartFrame className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionAccuracy}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                      <XAxis dataKey="question" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} name="Độ chính xác">
                        {questionAccuracy.map((item) => {
                          const accuracy = Number(item.accuracy || 0);
                          return <Cell key={item.question} fill={accuracy < 60 ? chartColors.rose : accuracy < 75 ? chartColors.amber : chartColors.emerald} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </AdminPanel>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
              <AdminPanel title="Bản đồ nhiệt chủ đề khó" description="Giá trị trong ô là tỷ lệ chính xác từ các lượt làm thực tế." action={<Gauge className="h-4 w-4 text-slate-500" />}>
                <div className="overflow-x-auto">
                  <div className="min-w-[620px]">
                    <div className="grid gap-2" style={{ gridTemplateColumns: `110px repeat(${dayLabels.length}, minmax(58px, 1fr))` }}>
                      <div />
                      {dayLabels.map((day) => <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">{day}</div>)}
                      {difficultTopics.map((row) => (
                        <Fragment key={row.label}>
                          <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200">{row.label}</div>
                          {row.values.map((value, colIndex) => <div key={`${row.label}-${colIndex}`} className={`flex h-12 items-center justify-center rounded-md text-xs font-semibold ${difficultyClass(value)}`}>{value}%</div>)}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </AdminPanel>

              <AdminPanel title="Hoạt động học tập" description="Số lượt làm bài theo ngày hoạt động." action={<BarChart3 className="h-4 w-4 text-slate-500" />}>
                <ChartFrame className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="attempts" stroke={chartColors.emerald} strokeWidth={2} dot={{ r: 4 }} name="Lượt làm" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </AdminPanel>
            </div>

            <TableShell>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr><th className="px-4 py-3 font-medium">Chủ đề</th><th className="px-4 py-3 font-medium">Lượt làm</th><th className="px-4 py-3 font-medium">Độ chính xác</th><th className="px-4 py-3 font-medium">Đánh giá</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {popularQuizzes.map((quiz, index) => (
                    <tr key={quiz.name} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4"><div className="flex items-center gap-3"><Trophy className="h-4 w-4 text-amber-500" /><span className="font-medium text-slate-950 dark:text-white">{quiz.name}</span></div></td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{Number(quiz.attempts || 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{Math.round(Number(quiz.completion || 0))}%</td>
                      <td className="px-4 py-4"><StatusBadge tone={index < 2 ? "emerald" : "blue"}>{index < 2 ? "Quan tâm cao" : "Ổn định"}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </>
        )}
      </AdminPage>
    </>
  );
}
