"use client";

import { Fragment } from "react";
import Topbar from "@/src/components/shared/Topbar";
import ChartFrame from "@/src/components/admin/ChartFrame";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton, chartColors } from "@/src/components/admin/AdminPrimitives";
import { BarChart3, Clock, Flame, Gauge, HelpCircle, Target, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const popularQuizzes = [
  { name: "IELTS Academic Word List", attempts: 18420, completion: 86 },
  { name: "TOEIC Part 5 Grammar Drill", attempts: 14110, completion: 73 },
  { name: "Business Idioms Mastery", attempts: 9820, completion: 64 },
  { name: "Daily Conversation Starter", attempts: 8540, completion: 91 },
  { name: "Phrasal Verb Sprint", attempts: 7710, completion: 77 },
];

const questionAccuracy = [
  { question: "Q1", accuracy: 91 },
  { question: "Q2", accuracy: 84 },
  { question: "Q3", accuracy: 76 },
  { question: "Q4", accuracy: 69 },
  { question: "Q5", accuracy: 58 },
  { question: "Q6", accuracy: 63 },
  { question: "Q7", accuracy: 47 },
  { question: "Q8", accuracy: 72 },
];

const studyTime = [
  { day: "Mon", minutes: 17.2 },
  { day: "Tue", minutes: 19.4 },
  { day: "Wed", minutes: 21.1 },
  { day: "Thu", minutes: 18.6 },
  { day: "Fri", minutes: 22.8 },
  { day: "Sat", minutes: 27.4 },
  { day: "Sun", minutes: 24.9 },
];

const difficultQuestions = [
  [42, 58, 61, 77, 84, 49, 53],
  [67, 71, 44, 56, 82, 63, 38],
  [91, 86, 74, 45, 59, 68, 72],
  [55, 47, 39, 62, 70, 88, 76],
  [83, 79, 66, 52, 41, 57, 69],
];

const difficultLabels = ["IELTS", "TOEIC", "Grammar", "Business", "Starter"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const tooltipStyle = { background: "rgb(15 23 42)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "white" };

function difficultyClass(value: number) {
  if (value < 50) return "bg-rose-500/80 text-white";
  if (value < 65) return "bg-amber-500/75 text-white";
  if (value < 78) return "bg-blue-500/70 text-white";
  return "bg-emerald-500/70 text-white";
}

export default function AdminAnalytics() {
  return (
    <>
      <Topbar title="Learning analytics" subtitle="Track quiz popularity, question-level accuracy, difficulty patterns, and study time." role="admin" userName="Admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Average study time" value="21.6 min" change="+3.4 min" icon={Clock} tone="blue" />
          <KpiCard label="Average accuracy" value="76.8%" change="+2.1%" icon={Target} tone="emerald" />
          <KpiCard label="Difficult questions" value="428" change="+31 flagged" trend="down" icon={HelpCircle} tone="amber" />
          <KpiCard label="Mastery streaks" value="18,930" change="+9.7%" icon={Flame} tone="rose" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <AdminPanel title="Most popular quizzes" description="Top learning sets by attempts over the selected period." action={<ToolbarButton active>Last 30 days</ToolbarButton>}>
            <ChartFrame className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularQuizzes} layout="vertical" margin={{ left: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={145} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="attempts" fill={chartColors.blue} radius={[0, 6, 6, 0]} name="Attempts" />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </AdminPanel>

          <AdminPanel title="Accuracy rate per question" description="Question-level accuracy for TOEIC Part 5 Grammar Drill." action={<StatusBadge tone="amber">Needs review below 60%</StatusBadge>}>
            <ChartFrame className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionAccuracy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                  <XAxis dataKey="question" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} name="Accuracy">
                    {questionAccuracy.map((item) => (
                      <Cell key={item.question} fill={item.accuracy < 60 ? chartColors.rose : item.accuracy < 75 ? chartColors.amber : chartColors.emerald} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </AdminPanel>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <AdminPanel title="Difficult question heatmap" description="Cell values show answer accuracy. Lower accuracy needs editorial review." action={<Gauge className="h-4 w-4 text-slate-400" />}>
            <div className="overflow-x-auto">
              <div className="min-w-[620px]">
                <div className="grid grid-cols-[110px_repeat(7,minmax(58px,1fr))] gap-2">
                  <div />
                  {days.map((day) => <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">{day}</div>)}
                  {difficultQuestions.map((row, rowIndex) => (
                    <Fragment key={difficultLabels[rowIndex]}>
                      <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200">{difficultLabels[rowIndex]}</div>
                      {row.map((value, colIndex) => <div key={`${rowIndex}-${colIndex}`} className={`flex h-12 items-center justify-center rounded-md text-xs font-semibold ${difficultyClass(value)}`}>{value}%</div>)}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Average study time" description="Mean minutes per active learner by day." action={<BarChart3 className="h-4 w-4 text-slate-400" />}>
            <ChartFrame className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studyTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="minutes" stroke={chartColors.emerald} strokeWidth={2} dot={{ r: 4 }} name="Minutes" />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </AdminPanel>
        </div>

        <TableShell>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <tr><th className="px-4 py-3 font-medium">Quiz</th><th className="px-4 py-3 font-medium">Attempts</th><th className="px-4 py-3 font-medium">Completion</th><th className="px-4 py-3 font-medium">Signal</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {popularQuizzes.map((quiz, index) => (
                <tr key={quiz.name} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><Trophy className="h-4 w-4 text-amber-500" /><span className="font-medium text-slate-950 dark:text-white">{quiz.name}</span></div></td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{quiz.attempts.toLocaleString()}</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{quiz.completion}%</td>
                  <td className="px-4 py-4"><StatusBadge tone={index < 2 ? "emerald" : "blue"}>{index < 2 ? "Top demand" : "Stable"}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </AdminPage>
    </>
  );
}
