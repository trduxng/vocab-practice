"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/src/services/user.service";
import { Button } from "@/src/components/ui/button";

type ReportType = "WordIncorrect" | "AudioIssue" | "AnswerIncorrect" | "Typo" | "Other";
type EntityType = "Word" | "Question" | "Audio" | "General";

const reportTypes: Array<{ value: ReportType; label: string }> = [
  { value: "WordIncorrect", label: "Nghĩa từ sai" },
  { value: "AudioIssue", label: "Lỗi âm thanh / phát âm" },
  { value: "AnswerIncorrect", label: "Đáp án sai" },
  { value: "Typo", label: "Lỗi chính tả" },
  { value: "Other", label: "Vấn đề khác" },
];

export default function ReportDialog({
  wordId,
  questionId,
  defaultType = "Other",
  entityType,
  title,
  context,
  buttonClassName = "",
}: {
  wordId?: number;
  questionId?: number;
  defaultType?: ReportType;
  entityType?: EntityType;
  title: string;
  context?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>(defaultType);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReport() {
    if (description.trim().length < 5) {
      toast.error("Hãy mô tả rõ hơn vấn đề bạn gặp nhé");
      return;
    }

    setSubmitting(true);
    try {
      await userService.submitReport({
        reportType,
        entityType,
        wordId,
        questionId,
        title,
        description: description.trim(),
      });
      toast.success("Đã gửi báo cáo cho quản trị viên");
      setOpen(false);
      setDescription("");
    } catch (error) {
      console.error("Failed to submit report", error);
      toast.error("Gửi báo cáo thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-white ${buttonClassName}`}
      >
        <Flag className="h-3.5 w-3.5" />
        Báo cáo
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f172a] p-5 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Báo cáo</p>
                <h2 className="mt-1 text-lg font-bold">{title}</h2>
                {context && <p className="mt-1 text-sm text-slate-400">{context}</p>}
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Vấn đề gặp phải</label>
                <select
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value as ReportType)}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
                >
                  {reportTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Mô tả chi tiết</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="mt-2 w-full resize-none rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                  placeholder="Ví dụ: Đáp án đúng phải là 'invoice', không phải 'receipt'."
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-md">Hủy</Button>
                <Button type="button" disabled={submitting} onClick={submitReport} className="rounded-md bg-blue-600 hover:bg-blue-700">
                  {submitting ? "Đang gửi..." : "Gửi báo cáo"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
