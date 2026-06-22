"use client";

import { useCallback, useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { adminService, type PaginationMeta } from "@/src/services/admin.service";
import { adminLabel } from "@/src/lib/admin-i18n";
import { BellRing, CalendarClock, MailCheck, Megaphone, Send, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { AdminErrorState } from "@/src/components/admin/AdminPrimitives";

type NotificationItem = {
  id: number | string;
  userId?: number | string;
  fullName?: string;
  email?: string;
  title: string;
  message: string;
  type: string;
  deliveryChannel: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [channel, setChannel] = useState("InApp");
  const [audience, setAudience] = useState("All users");
  const [subject, setSubject] = useState("Đề xuất bài kiểm tra mới đã sẵn sàng");
  const [message, setMessage] = useState("Bài kiểm tra mới, mục tiêu chuỗi học và từ cần ôn đã sẵn sàng.");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState("");
  const pageSize = 20;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getNotificationsPage<NotificationItem>({
        page,
        limit: pageSize,
        search: search.trim(),
      });
      setNotifications(data.items);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Không thể tải thông báo", error);
      setError("Không thể tải lịch sử thông báo.");
      toast.error("Không thể tải lịch sử thông báo");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void Promise.resolve().then(fetchNotifications);
  }, [fetchNotifications]);

  const sendAnnouncement = async () => {
    if (subject.trim().length < 3) {
      toast.error("Tiêu đề cần ít nhất 3 ký tự");
      return;
    }
    if (message.trim().length < 5) {
      toast.error("Nội dung cần ít nhất 5 ký tự");
      return;
    }
    if (subject.length > 200 || message.length > 2000) {
      toast.error("Tiêu đề hoặc nội dung vượt quá độ dài cho phép");
      return;
    }
    setSending(true);
    try {
      await adminService.sendAnnouncement({
        audience,
        title: subject,
        message,
        deliveryChannel: channel,
        actionUrl: "/user/dashboard",
      });
      toast.success("Gửi thông báo thành công");
      await fetchNotifications();
    } catch (error) {
      console.error("Không thể gửi thông báo", error);
      toast.error("Gửi thông báo thất bại. Vui lòng kiểm tra quyền truy cập.");
    } finally {
      setSending(false);
    }
  };

  const createDailyReminders = async () => {
    setSending(true);
    try {
      await adminService.createDailyReminders();
      toast.success("Đã tạo lời nhắc học hằng ngày");
      await fetchNotifications();
    } catch (error) {
      console.error("Không thể tạo lời nhắc hằng ngày", error);
      toast.error("Tạo lời nhắc thất bại. Vui lòng kiểm tra cấu hình cơ sở dữ liệu.");
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
      <Topbar title="Thông báo" subtitle="Gửi thông báo và tạo lời nhắc học hằng ngày." role="admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Đã gửi hôm nay" value={String(sentToday)} change="trực tiếp" icon={Send} tone="blue" />
          <KpiCard label="Chưa đọc" value={String(unread)} change="trong ứng dụng" icon={BellRing} tone="emerald" />
          <KpiCard label="Thông báo trong ứng dụng" value={String(inApp)} change="tổng cộng" icon={MailCheck} tone="violet" />
          <KpiCard label="Lời nhắc hằng ngày" value={String(daily)} change="đã tạo" icon={CalendarClock} tone="amber" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <AdminPanel title="Gửi thông báo" description="Soạn thông báo trong ứng dụng, email hoặc thông báo đẩy." action={<BellRing className="h-4 w-4 text-slate-400" />}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Kênh gửi</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { label: "Trong ứng dụng", value: "InApp" },
                    { label: "Email", value: "Email" },
                    { label: "Thông báo đẩy", value: "PushNotification" },
                  ].map((item) => (
                    <ToolbarButton key={item.value} active={channel === item.value} onClick={() => setChannel(item.value)}>
                      {item.label}
                    </ToolbarButton>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Đối tượng nhận</label>
                <select value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                  {[
                    { value: "All users", label: "Tất cả người dùng" },
                    { value: "Learners", label: "Học viên" },
                    { value: "Admins", label: "Quản trị viên" },
                  ].map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tiêu đề</label>
                <input value={subject} maxLength={200} onChange={(event) => setSubject(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Nội dung</label>
                <textarea value={message} maxLength={2000} onChange={(event) => setMessage(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200" />
                <p className="mt-1 text-right text-xs text-slate-400">{message.length}/2000</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <ToolbarButton active onClick={() => void sendAnnouncement()}>
                  <Send className="h-4 w-4" />{sending ? "Đang gửi..." : "Gửi thông báo"}
                </ToolbarButton>
                <ToolbarButton onClick={() => void createDailyReminders()}>
                  <CalendarClock className="h-4 w-4" />Tạo lời nhắc
                </ToolbarButton>
              </div>
            </div>
          </AdminPanel>

          <div className="space-y-5">
            <AdminPanel>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm thông báo, người dùng hoặc email"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>
            </AdminPanel>
            {error ? (
              <AdminErrorState description={error} onRetry={() => void fetchNotifications()} />
            ) : (
            <TableShell>
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nội dung</th>
                    <th className="px-4 py-3 font-medium">Người dùng</th>
                    <th className="px-4 py-3 font-medium">Kênh gửi</th>
                    <th className="px-4 py-3 font-medium">Ngày gửi</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {loading ? (
                    <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>Đang tải thông báo...</td></tr>
                  ) : notifications.length === 0 ? (
                    <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>Chưa có thông báo.</td></tr>
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
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{adminLabel(item.deliveryChannel)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-4"><StatusBadge tone={item.isRead ? "slate" : "blue"}>{item.isRead ? "Đã đọc" : adminLabel(item.type)}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pagination && (
                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                  <span>Hiển thị {notifications.length} / {pagination.total} thông báo</span>
                  <div className="flex items-center gap-2">
                    <ToolbarButton onClick={() => setPage((current) => Math.max(1, current - 1))}>
                      Trước
                    </ToolbarButton>
                    <span>Trang {pagination.page} / {pagination.totalPages}</span>
                    <ToolbarButton onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}>
                      Sau
                    </ToolbarButton>
                  </div>
                </div>
              )}
            </TableShell>
            )}

            <AdminPanel title="Quy tắc nhắc học" description="Mỗi học viên chỉ nhận một lời nhắc mỗi ngày khi có từ vựng đến hạn ôn." action={<UsersRound className="h-4 w-4 text-slate-400" />}>
              <div className="rounded-md border border-slate-200 p-3 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
                Hệ thống hiện đã lưu bản ghi thông báo. Có thể kết nối dịch vụ SMTP hoặc nhà cung cấp thông báo đẩy qua cùng trường DeliveryChannel.
              </div>
            </AdminPanel>
          </div>
        </div>
      </AdminPage>
    </>
  );
}
