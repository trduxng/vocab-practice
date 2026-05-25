"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, IconButton, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
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

function compactNumber(value?: number | null) {
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

function formatDate(value?: string) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
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

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      try {
        const response = await adminService.getContentManagement();
        if (!cancelled) setData(response);
      } catch (error) {
        console.error("Failed to fetch content management data", error);
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
        comment: `Updated from content management to ${status}`
      });
      toast.success(`Updated ${item.type} status`);
      setRefreshIndex((value) => value + 1);
    } catch (error) {
      console.error("Failed to update content status", error);
      toast.error("Cap nhat trang thai that bai");
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
      <Topbar title="Content management" subtitle="Manage real topics, words, questions, tests, categories, and review signals." role="admin" userName="Admin" />
      <AdminPage>
        {loading ? (
          <AdminPanel>
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Loading content...</div>
          </AdminPanel>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Published items" value={compactNumber(data?.summary?.publishedItems)} change="Topics, words, questions, tests" icon={BookOpenCheck} tone="blue" />
              <KpiCard label="Words" value={compactNumber(data?.summary?.totalWords)} change={`${compactNumber(data?.summary?.totalQuestions)} questions`} icon={Layers3} tone="emerald" />
              <KpiCard label="Categories" value={compactNumber(data?.summary?.activeCategories)} change="Active topic categories" icon={FolderKanban} tone="violet" />
              <KpiCard label="Review queue" value={compactNumber(data?.summary?.reviewItems)} change="Draft / pending / rejected" trend="down" icon={Flag} tone="rose" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <AdminPanel>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
                      <Search className="h-4 w-4 text-slate-500" />
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search real content" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500 dark:text-slate-200" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => <ToolbarButton key={category} active={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category}</ToolbarButton>)}
                      <ToolbarButton active onClick={() => router.push("/admin/words")}><Plus className="h-4 w-4" />Create</ToolbarButton>
                    </div>
                  </div>
                </AdminPanel>

                <TableShell>
                  <table className="w-full min-w-[920px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      <tr><th className="px-4 py-3 font-medium">Content</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Meta</th><th className="px-4 py-3 font-medium">Activity</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                      {filteredContent.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No content found.</td></tr>
                      ) : filteredContent.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-100 dark:hover:bg-white/5">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"><FileQuestion className="h-4 w-4 text-slate-500 dark:text-slate-300" /></div>
                              <div><p className="font-medium text-slate-950 dark:text-white">{item.title}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.type} · {item.itemCount} items · {formatDate(item.updatedAt)}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.category}</td>
                          <td className="px-4 py-4"><StatusBadge tone="blue">{item.code || item.type}</StatusBadge></td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300"><p>{Number(item.attempts || 0).toLocaleString()} attempts</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.accuracy == null ? "No accuracy yet" : `${Math.round(Number(item.accuracy))}% accuracy`}</p></td>
                          <td className="px-4 py-4"><StatusBadge tone={statusTone[item.status] || "slate"}>{item.status}</StatusBadge></td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <IconButton label="Open management page" onClick={() => router.push(targetRoute(item.type))}><Edit3 className="h-4 w-4" /></IconButton>
                              <IconButton label="Publish content" tone="emerald" onClick={() => updateStatus(item, "Published")}><CheckCircle2 className="h-4 w-4" /></IconButton>
                              <IconButton label="Archive content" tone="rose" onClick={() => updateStatus(item, "Archived")}><Archive className="h-4 w-4" /></IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableShell>
              </div>

              <div className="space-y-5">
                <AdminPanel title="Topic categories" description="Categories currently stored in TopicCategories." action={<Tags className="h-4 w-4 text-slate-400" />}>
                  <div className="flex flex-wrap gap-2">
                    {(data?.categories || []).map((category) => <StatusBadge key={category.code} tone={category.isActive ? "blue" : "slate"}>{category.name}</StatusBadge>)}
                  </div>
                </AdminPanel>
                <AdminPanel title="Moderation queue" description="Latest content review logs from the database.">
                  <div className="space-y-3">
                    {(data?.reviewLogs || []).length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No review logs yet.</p>
                    ) : data?.reviewLogs?.map((log) => (
                      <div key={`${log.type}-${log.entityId}-${log.createdAt}`} className="rounded-md border border-slate-200 p-3 dark:border-white/10">
                        <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-950 dark:text-white">{log.type} #{log.entityId}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(log.createdAt)}</p></div><StatusBadge tone={statusTone[log.status] || "slate"}>{log.status}</StatusBadge></div>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{log.reason || "No comment"}</p>
                        <div className="mt-3 flex gap-2">
                          <ToolbarButton onClick={() => router.push(targetRoute(log.type as LearningContent["type"]))}><CheckCircle2 className="h-4 w-4" />Review</ToolbarButton>
                          <ToolbarButton onClick={() => updateStatus({ type: log.type as LearningContent["type"], entityId: log.entityId, id: `${log.type}-${log.entityId}`, title: log.type, category: "", itemCount: 0, attempts: 0, accuracy: null, status: log.status, updatedAt: log.createdAt }, "Archived")}><Archive className="h-4 w-4" />Archive</ToolbarButton>
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
