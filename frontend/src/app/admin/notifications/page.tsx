"use client";

import { useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { BellRing, CalendarClock, MailCheck, Megaphone, MousePointerClick, Send, UsersRound } from "lucide-react";

const campaigns = [
  { name: "Premium trial reminder", audience: "Trial users", status: "Scheduled", openRate: "41.2%", sendDate: "Apr 30, 2026" },
  { name: "Weekly study streak", audience: "Active learners", status: "Sent", openRate: "58.9%", sendDate: "Apr 28, 2026" },
  { name: "Teacher classroom launch", audience: "Teachers", status: "Draft", openRate: "-", sendDate: "Not scheduled" },
  { name: "Dormant learner winback", audience: "Inactive 30 days", status: "Sent", openRate: "22.4%", sendDate: "Apr 20, 2026" },
];

const announcementHistory = [
  "New speaking practice beta announced to Premium users",
  "Maintenance window notice sent to all users",
  "School admin onboarding email launched",
  "Reported-content policy update sent to teachers",
];

export default function NotificationsPage() {
  const [channel, setChannel] = useState("In-app");
  const [audience, setAudience] = useState("All users");
  const [subject, setSubject] = useState("New quiz recommendations are ready");
  const [message, setMessage] = useState("Tell learners about fresh quizzes, streak goals, and content updates.");

  return (
    <>
      <Topbar title="Notifications" subtitle="Send announcements, target user segments, and manage email campaigns." role="admin" userName="Admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Messages sent" value="1.8M" change="+14.2%" icon={Send} tone="blue" />
          <KpiCard label="Email open rate" value="46.8%" change="+3.6%" icon={MailCheck} tone="emerald" />
          <KpiCard label="Click rate" value="11.4%" change="+1.1%" icon={MousePointerClick} tone="violet" />
          <KpiCard label="Scheduled sends" value="12" change="4 today" icon={CalendarClock} tone="amber" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <AdminPanel title="Send announcement" description="Compose an in-app or email announcement for a selected audience." action={<BellRing className="h-4 w-4 text-slate-400" />}>
            <div className="space-y-4">
              <div><label className="text-xs font-medium text-slate-500 dark:text-slate-400">Channel</label><div className="mt-2 flex flex-wrap gap-2">{["In-app", "Email", "Both"].map((item) => <ToolbarButton key={item} active={channel === item} onClick={() => setChannel(item)}>{item}</ToolbarButton>)}</div></div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Audience</label>
                <select value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                  {["All users", "Premium users", "Teachers", "Inactive learners", "School admins"].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-slate-500 dark:text-slate-400">Subject</label><input value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200" /></div>
              <div><label className="text-xs font-medium text-slate-500 dark:text-slate-400">Message</label><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200" /></div>
              <ToolbarButton active><Send className="h-4 w-4" />Send announcement</ToolbarButton>
            </div>
          </AdminPanel>

          <div className="space-y-5">
            <TableShell>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr><th className="px-4 py-3 font-medium">Campaign</th><th className="px-4 py-3 font-medium">Audience</th><th className="px-4 py-3 font-medium">Open rate</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.name} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4"><div className="flex items-center gap-3"><Megaphone className="h-4 w-4 text-slate-400" /><span className="font-medium text-slate-950 dark:text-white">{campaign.name}</span></div></td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{campaign.audience}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{campaign.openRate}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{campaign.sendDate}</td>
                      <td className="px-4 py-4"><StatusBadge tone={campaign.status === "Sent" ? "emerald" : campaign.status === "Scheduled" ? "blue" : "amber"}>{campaign.status}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>

            <AdminPanel title="Announcement history" description="Recent broadcasts sent by administrators." action={<UsersRound className="h-4 w-4 text-slate-400" />}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {announcementHistory.map((item) => <div key={item} className="rounded-md border border-slate-200 p-3 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">{item}</div>)}
              </div>
            </AdminPanel>
          </div>
        </div>
      </AdminPage>
    </>
  );
}
