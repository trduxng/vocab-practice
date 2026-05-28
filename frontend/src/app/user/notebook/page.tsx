"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Download,
  Pencil,
  Search,
  Star,
  Trash2,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

type NotebookEntry = {
  notebookId: number;
  wordId: number;
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechName?: string;
  personalNote?: string;
  isFavorite: boolean;
  masteryLevel: number;
  addedAt: string;
  updatedAt: string;
};

export default function VocabularyNotebook() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingEntry, setEditingEntry] = useState<NotebookEntry | null>(null);
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    userService
      .getNotebook(page, 20)
      .then((result) => {
        if (cancelled) return;
        setEntries(result.data || []);
        setTotalPages(result.totalPages || 1);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to fetch notebook", error);
        toast.error("Không thể tải sổ tay từ vựng");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, page]);

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleFavorite = async (entry: NotebookEntry) => {
    try {
      await userService.updateNotebookEntry(entry.notebookId, {
        isFavorite: !entry.isFavorite,
      });
      setEntries((prev) =>
        prev.map((e) =>
          e.notebookId === entry.notebookId
            ? { ...e, isFavorite: !e.isFavorite }
            : e,
        ),
      );
      toast.success(
        entry.isFavorite ? "Đã bỏ yêu thích" : "Đã đánh dấu yêu thích",
      );
    } catch (error) {
      toast.error("Không thể cập nhật");
    }
  };

  const handleDelete = async (entry: NotebookEntry) => {
    try {
      await userService.deleteNotebookEntry(entry.notebookId);
      setEntries((prev) =>
        prev.filter((e) => e.notebookId !== entry.notebookId),
      );
      toast.success("Đã xóa khỏi sổ tay");
    } catch (error) {
      toast.error("Không thể xóa");
    }
  };

  const exportCSV = useCallback(() => {
    const headers = ["Từ", "Nghĩa", "Phiên âm", "Từ loại", "Thành thạo", "Yêu thích", "Ghi chú", "Ngày thêm"];
    const rows = entries.map((e) => [
      `"${e.term.replace(/"/g, '""')}"`,
      `"${e.meaning.replace(/"/g, '""')}"`,
      `"${(e.phonetic || "").replace(/"/g, '""')}"`,
      `"${(e.partOfSpeechName || "").replace(/"/g, '""')}"`,
      e.masteryLevel,
      e.isFavorite ? "Có" : "Không",
      `"${(e.personalNote || "").replace(/"/g, '""')}"`,
      new Date(e.addedAt).toLocaleDateString("vi-VN"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `so_tay_tu_vung_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success("Đã xuất file CSV");
  }, [entries]);

  const handleSaveNote = async () => {
    if (!editingEntry) return;
    setSaving(true);
    try {
      await userService.updateNotebookEntry(editingEntry.notebookId, {
        personalNote: editNote,
      });
      setEntries((prev) =>
        prev.map((e) =>
          e.notebookId === editingEntry.notebookId
            ? { ...e, personalNote: editNote }
            : e,
        ),
      );
      setEditingEntry(null);
      toast.success("Đã lưu ghi chú");
    } catch (error) {
      toast.error("Không thể lưu ghi chú");
    } finally {
      setSaving(false);
    }
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.term.toLowerCase().includes(search.toLowerCase()) ||
      e.meaning.toLowerCase().includes(search.toLowerCase()),
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-mono">
        Đang xác thực...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
      <Topbar
        title="Sổ tay từ vựng"
        subtitle="Ghi chú và từ yêu thích của bạn"
        role="student"
        userName={user?.fullName}
      />

      <main className="p-6 space-y-6 overflow-auto">
        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              size={16}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm từ trong sổ tay..."
              className="dark:bg-white/5 bg-white border-slate-200 dark:border-white/10 h-10 pl-10 rounded-xl text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">
              <span className="font-black text-slate-900 dark:text-white">
                {entries.length}
              </span>{" "}
              từ
            </span>
            <span className="font-medium">
              <span className="font-black text-amber-500">
                {entries.filter((e) => e.isFavorite).length}
              </span>{" "}
              yêu thích
            </span>
            {entries.length > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all font-medium"
                title="Xuất CSV"
              >
                <Download size={14} />
                Xuất CSV
              </button>
            )}
          </div>
        </div>

        {/* Notebook entries */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5"
              >
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen
              size={64}
              className="mx-auto mb-6 text-slate-300 dark:text-white/10"
            />
            <h3 className="text-slate-900 dark:text-white font-black text-lg mb-2">
              {search ? "Không tìm thấy từ nào" : "Sổ tay trống"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
              {search
                ? "Thử tìm kiếm với từ khóa khác."
                : "Thêm từ vựng vào sổ tay khi học để ghi nhớ lâu hơn."}
            </p>
            <Button
              onClick={() => router.push("/user/learn")}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11 px-6 text-xs font-black uppercase tracking-widest"
            >
              <BookOpen size={14} className="mr-2" /> Học từ ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.notebookId}
                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 transition-all hover:shadow-sm group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <button
                        onClick={() => speak(entry.term)}
                        className="shrink-0 p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={14} />
                      </button>
                      <h4 className="text-slate-900 dark:text-white font-black text-lg truncate">
                        {entry.term}
                      </h4>
                      {entry.phonetic && (
                        <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                          {entry.phonetic}
                        </span>
                      )}
                      {entry.partOfSpeechName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wider">
                          {entry.partOfSpeechName}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-3">
                      {entry.meaning}
                    </p>

                    {entry.personalNote && (
                      <div className="inline-block rounded-xl bg-blue-500/5 border border-blue-500/10 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 italic max-w-lg">
                        &ldquo;{entry.personalNote}&rdquo;
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                        Thành thạo:{" "}
                        <span className="font-black text-slate-900 dark:text-white">
                          {entry.masteryLevel}/10
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                        Thêm vào:{" "}
                        {new Date(entry.addedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingEntry(entry);
                        setEditNote(entry.personalNote || "");
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 transition-all"
                      title="Sửa ghi chú"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(entry)}
                      className={`p-2 rounded-xl transition-all ${
                        entry.isFavorite
                          ? "text-amber-500 bg-amber-500/10"
                          : "text-slate-500 hover:text-amber-500 hover:bg-amber-500/10"
                      }`}
                      title={entry.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                      <Star
                        size={16}
                        fill={entry.isFavorite ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Xóa khỏi sổ tay"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs h-10"
            >
              Trước
            </Button>
            <span className="flex items-center text-xs text-slate-600 dark:text-slate-400 font-medium px-4">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs h-10"
            >
              Sau
            </Button>
          </div>
        )}
      </main>

      {/* Edit Note Dialog */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-[24px] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white font-black text-lg flex items-center gap-2">
              <Pencil size={18} className="text-blue-600 dark:text-blue-400" />
              Ghi chú cho &ldquo;{editingEntry?.term}&rdquo;
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm">
              Viết ghi chú, câu ví dụ hoặc bất cứ điều gì giúp bạn nhớ từ này.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="Nhập ghi chú của bạn..."
            rows={5}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 bg-slate-50 p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 resize-none outline-none focus:border-blue-500 transition-colors"
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingEntry(null)}
              className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {saving ? "Đang lưu..." : "Lưu ghi chú"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
