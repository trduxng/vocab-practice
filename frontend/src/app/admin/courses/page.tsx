"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Topbar from "@/src/components/shared/Topbar";
import { AdminErrorState, AdminPage, AdminPanel, IconButton, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
import { adminLabel, formatAdminDate, formatAdminNumber, translateAdminText } from "@/src/lib/admin-i18n";
import { Archive, BookOpenCheck, CheckCircle2, Edit3, FileQuestion, Flag, FolderKanban, Layers3, Plus, Search, Tags } from "lucide-react";

type ContentStatus = "Published" | "Draft" | "PendingReview" | "Rejected" | "Archived";
type Tone = "slate" | "blue" | "emerald" | "amber" | "rose" | "violet";

interface LearningContent {
  id: string;
  entityId: number;
  title: string;
  type: "Topic" | "Word" | "Question" | "MiniTest";
  category: string;
  code?: string;
  itemCount: number;
  attempts: number;
  accuracy: number | null;
  status: ContentStatus;
  updatedAt: string;
}

interface ContentManagementData {
  summary?: {
    publishedItems?: number;
    totalWords?: number;
    totalQuestions?: number;
    activeCategories?: number;
    reviewItems?: number;
  };
  content?: LearningContent[];
  categories?: Array<{ name: string; code: string; isActive: boolean }>;
  reviewLogs?: Array<{ type: string; entityId: number; status: ContentStatus; reason?: string; createdAt: string }>;
}

const statusTone: Record<ContentStatus, Tone> = {
  Published: "emerald",
  Draft: "amber",
  PendingReview: "blue",
  Rejected: "rose",
  Archived: "slate",
};

function formatDate(value?: string) {
  return formatAdminDate(value);
}

function targetRoute(type: LearningContent["type"]) {
  if (type === "Word") return "/admin/words";
  if (type === "Question") return "/admin/questions";
  if (type === "MiniTest") return "/admin/minitests";
  return "/admin/courses";
}

export default function AdminCourses() {
  const router = useRouter();
  const [data, setData] = useState<ContentManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      setLoading(true);
      setError("");
      try {
        const response = await adminService.getContentManagement();
        if (!cancelled) setData(response);
      } catch (error) {
        console.error("Không thể tải dữ liệu quản lý nội dung", error);
        if (!cancelled) setError("Không thể tải dữ liệu quản lý nội dung.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchContent();
    return () => {
      cancelled = true;
    };
  }, [refreshIndex]);

  async function updateStatus(item: LearningContent, status: ContentStatus) {
    try {
      await adminService.updateContentStatus({
        entityType: item.type,
        entityId: item.entityId,
        status,
        comment: `Cập nhật từ trang quản lý nội dung sang trạng thái ${adminLabel(status)}`
      });
      toast.success(`Đã cập nhật trạng thái ${adminLabel(item.type).toLowerCase()}`);
      setRefreshIndex((value) => value + 1);
    } catch (error) {
      console.error("Không thể cập nhật trạng thái nội dung", error);
      toast.error("Cập nhật trạng thái thất bại");
    }
  }

  const content = useMemo(() => data?.content || [], [data]);
  const categories = ["All", ...Array.from(new Set(content.map((item) => item.category).filter(Boolean)))];

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesQuery = `${item.title} ${item.type} ${item.category} ${item.code || ""}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [content, query, selectedCategory]);

  return (
    <>
      <Topbar title="Quản lý nội dung" subtitle="Quản lý chủ đề, từ vựng, câu hỏi, bài kiểm tra, danh mục và trạng thái duyệt." role="admin" />
      <AdminPage>
        {loading ? (
          <AdminPanel>
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Đang tải nội dung...</div>
          </AdminPanel>
        ) : error ? (
          <AdminErrorState description={error} onRetry={() => setRefreshIndex((value) => value + 1)} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Nội dung đã xuất bản" value={formatAdminNumber(data?.summary?.publishedItems)} change="Chủ đề, từ vựng, câu hỏi, bài kiểm tra" icon={BookOpenCheck} tone="blue" />
              <KpiCard label="Từ vựng" value={formatAdminNumber(data?.summary?.totalWords)} change={`${formatAdminNumber(data?.summary?.totalQuestions)} câu hỏi`} icon={Layers3} tone="emerald" />
              <KpiCard label="Danh mục" value={formatAdminNumber(data?.summary?.activeCategories)} change="Danh mục chủ đề đang hoạt động" icon={FolderKanban} tone="violet" />
              <KpiCard label="Hàng đợi duyệt" value={formatAdminNumber(data?.summary?.reviewItems)} change="Bản nháp / chờ duyệt / từ chối" trend="down" icon={Flag} tone="rose" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <AdminPanel>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
                      <Search className="h-4 w-4 text-slate-500" />
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm nội dung" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500 dark:text-slate-200" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => <ToolbarButton key={category} active={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category === "All" ? "Tất cả" : adminLabel(category)}</ToolbarButton>)}
                      <ToolbarButton active onClick={() => router.push("/admin/words")}><Plus className="h-4 w-4" />Tạo mới</ToolbarButton>
                    </div>
                  </div>
                </AdminPanel>

                <TableShell>
                  <table className="w-full min-w-[920px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      <tr><th className="px-4 py-3 font-medium">Nội dung</th><th className="px-4 py-3 font-medium">Danh mục</th><th className="px-4 py-3 font-medium">Thông tin</th><th className="px-4 py-3 font-medium">Hoạt động</th><th className="px-4 py-3 font-medium">Trạng thái</th><th className="px-4 py-3 font-medium">Thao tác</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                      {filteredContent.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">Không tìm thấy nội dung.</td></tr>
                      ) : filteredContent.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-100 dark:hover:bg-white/5">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"><FileQuestion className="h-4 w-4 text-slate-500 dark:text-slate-300" /></div>
                              <div><p className="font-medium text-slate-950 dark:text-white">{item.title}</p><p className="text-xs text-slate-500 dark:text-slate-400">{adminLabel(item.type)} · {item.itemCount} mục · {formatDate(item.updatedAt)}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{adminLabel(item.category)}</td>
                          <td className="px-4 py-4"><StatusBadge tone="blue">{item.code || adminLabel(item.type)}</StatusBadge></td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300"><p>{Number(item.attempts || 0).toLocaleString("vi-VN")} lượt làm</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.accuracy == null ? "Chưa có dữ liệu chính xác" : `${Math.round(Number(item.accuracy))}% chính xác`}</p></td>
                          <td className="px-4 py-4"><StatusBadge tone={statusTone[item.status] || "slate"}>{adminLabel(item.status)}</StatusBadge></td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <IconButton label="Mở trang quản lý" onClick={() => router.push(targetRoute(item.type))}><Edit3 className="h-4 w-4" /></IconButton>
                              <IconButton label="Xuất bản nội dung" tone="emerald" onClick={() => updateStatus(item, "Published")}><CheckCircle2 className="h-4 w-4" /></IconButton>
                              <IconButton label="Lưu trữ nội dung" tone="rose" onClick={() => updateStatus(item, "Archived")}><Archive className="h-4 w-4" /></IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableShell>
              </div>

              <div className="space-y-5">
                <AdminPanel title="Danh mục chủ đề" description="Các danh mục chủ đề hiện có trong hệ thống." action={<Tags className="h-4 w-4 text-slate-400" />}>
                  <div className="flex flex-wrap gap-2">
                    {(data?.categories || []).map((category) => <StatusBadge key={category.code} tone={category.isActive ? "blue" : "slate"}>{category.name}</StatusBadge>)}
                  </div>
                </AdminPanel>
                <AdminPanel title="Hàng đợi kiểm duyệt" description="Nhật ký duyệt nội dung mới nhất từ cơ sở dữ liệu.">
                  <div className="space-y-3">
                    {(data?.reviewLogs || []).length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có nhật ký duyệt.</p>
                    ) : data?.reviewLogs?.map((log) => (
                      <div key={`${log.type}-${log.entityId}-${log.createdAt}`} className="rounded-md border border-slate-200 p-3 dark:border-white/10">
                        <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-950 dark:text-white">{adminLabel(log.type)} #{log.entityId}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(log.createdAt)}</p></div><StatusBadge tone={statusTone[log.status] || "slate"}>{adminLabel(log.status)}</StatusBadge></div>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{log.reason ? translateAdminText(log.reason) : "Không có ghi chú"}</p>
                        <div className="mt-3 flex gap-2">
                          <ToolbarButton onClick={() => router.push(targetRoute(log.type as LearningContent["type"]))}><CheckCircle2 className="h-4 w-4" />Xem duyệt</ToolbarButton>
                          <ToolbarButton onClick={() => updateStatus({ type: log.type as LearningContent["type"], entityId: log.entityId, id: `${log.type}-${log.entityId}`, title: log.type, category: "", itemCount: 0, attempts: 0, accuracy: null, status: log.status, updatedAt: log.createdAt }, "Archived")}><Archive className="h-4 w-4" />Lưu trữ</ToolbarButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </AdminPanel>
              </div>
            </div>
          </>
        )}
      </AdminPage>
    </>
  );
}
