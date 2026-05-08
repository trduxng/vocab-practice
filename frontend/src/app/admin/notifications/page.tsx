"use client";

import { useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
import { BellRing, CalendarClock, MailCheck, Megaphone, Send, UsersRound } from "lucide-react";

export default function NotificationsPage() {
  const [channel, setChannel] = useState("InApp");
  const [audience, setAudience] = useState("All users");
  const [subject, setSubject] = useState("New quiz recommendations are ready");
  const [message, setMessage] = useState("Fresh quizzes, streak goals, and review words are ready.");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await adminService.getNotifications(50);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sendAnnouncement = async () => {
    setSending(true);
    try {
      await adminService.sendAnnouncement({
        audience,
        title: subject,
        message,
        deliveryChannel: channel,
        actionUrl: "/user/dashboard",
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to send announcement", error);
      alert("Failed to send announcement. Check permissions and migration status.");
    } finally {
      setSending(false);
    }
  };

  const createDailyReminders = async () => {
    setSending(true);
    try {
      await adminService.createDailyReminders();
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to create daily reminders", error);
      alert("Failed to create reminders. Run migration_alignment_improvements.sql first.");
    } finally {
      setSending(false);
    }
  };

  const sentToday = notifications.filter((item) => {
    const date = new Date(item.createdAt);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

  const unread = notifications.filter((item) => !item.isRead).length;
  const inApp = notifications.filter((item) => item.deliveryChannel === "InApp").length;
  const daily = notifications.filter((item) => item.type === "DailyReminder").length;

  return (
    <>
      <Topbar title="Notifications" subtitle="Send announcements and queue daily study reminders." role="admin" userName="Admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Sent today" value={String(sentToday)} change="live" icon={Send} tone="blue" />
          <KpiCard label="Unread" value={String(unread)} change="in app" icon={BellRing} tone="emerald" />
          <KpiCard label="In-app messages" value={String(inApp)} change="total" icon={MailCheck} tone="violet" />
          <KpiCard label="Daily reminders" value={String(daily)} change="queued" icon={CalendarClock} tone="amber" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <AdminPanel title="Send announcement" description="Compose an in-app, email, or push notification record." action={<BellRing className="h-4 w-4 text-slate-400" />}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Channel</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { label: "In-app", value: "InApp" },
                    { label: "Email", value: "Email" },
                    { label: "Push", value: "PushNotification" },
                  ].map((item) => (
                    <ToolbarButton key={item.value} active={channel === item.value} onClick={() => setChannel(item.value)}>
                      {item.label}
                    </ToolbarButton>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Audience</label>
                <select value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                  {["All users", "Learners", "Admins"].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Subject</label>
                <input value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Message</label>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200" />
              </div>

              <div className="flex flex-wrap gap-2">
                <ToolbarButton active onClick={sendAnnouncement}>
                  <Send className="h-4 w-4" />{sending ? "Sending..." : "Send announcement"}
                </ToolbarButton>
                <ToolbarButton onClick={createDailyReminders}>
                  <CalendarClock className="h-4 w-4" />Queue reminders
                </ToolbarButton>
              </div>
            </div>
          </AdminPanel>

          <div className="space-y-5">
            <TableShell>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Message</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Channel</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {loading ? (
                    <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>Loading notifications...</td></tr>
                  ) : notifications.length === 0 ? (
                    <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>No notifications yet.</td></tr>
                  ) : notifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <Megaphone className="mt-0.5 h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-950 dark:text-white">{item.title}</p>
                            <p className="mt-1 max-w-xl truncate text-xs text-slate-500">{item.message}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.fullName || item.email || item.userId}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.deliveryChannel}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4"><StatusBadge tone={item.isRead ? "slate" : "blue"}>{item.isRead ? "Read" : item.type}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>

            <AdminPanel title="Reminder rules" description="Daily reminders are generated only once per learner per day when review words are due." action={<UsersRound className="h-4 w-4 text-slate-400" />}>
              <div className="rounded-md border border-slate-200 p-3 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
                The backend stores notification records now. Email and push delivery can be connected to an SMTP or push provider using the same DeliveryChannel field.
              </div>
            </AdminPanel>
          </div>
        </div>
      </AdminPage>
    </>
  );
}
