"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { creatorService, type ContentStatus } from "@/src/services/creator.service";
import {
  CreatorErrorState,
  CreatorHeader,
  CreatorLoadingState,
  CreatorPage,
  CreatorPanel,
  CreatorStatusBadge,
  ToolbarButton,
} from "./CreatorPrimitives";
import { contentTypeLabel, formatCreatorDate, getCreatorErrorMessage } from "@/src/lib/creator-utils";

type ContentType = "Topic" | "Word" | "Question" | "MiniTest";

type WorkflowItem = {
  id: number;
  name: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: string;
  rejectionReason?: string | null;
};

const routes: Record<ContentType, string> = {
  Topic: "/creator/topics",
  Word: "/creator/words",
  Question: "/creator/questions",
  MiniTest: "/creator/mini-tests",
};

export default function CreatorWorkflowList({
  status,
  title,
  description,
  allowSubmit = false,
}: {
  status: "Draft" | "PendingReview" | "Rejected";
  title: string;
  description: string;
  allowSubmit?: boolean;
}) {
  const [items, setItems] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [topics, words, questions, tests] = await Promise.all([
        creatorService.getTopics({ status, pageSize: 100 }),
        creatorService.getWords({ status, pageSize: 100 }),
        creatorService.getQuestions({ status, pageSize: 100 }),
        creatorService.getMiniTests({ status, pageSize: 100 }),
      ]);
      const all: WorkflowItem[] = [
        ...topics.map((item) => ({
          id: item.id,
          name: item.name,
          type: "Topic" as const,
          status: (item.contentStatus as ContentStatus) || status,
          createdAt: item.createdAt,
        })),
        ...words.map((item) => ({
          id: item.id,
          name: item.term,
          type: "Word" as const,
          status: (item.contentStatus as ContentStatus) || status,
          createdAt: item.createdAt,
        })),
        ...questions.map((item) => ({
          id: item.id,
          name: item.questionText,
          type: "Question" as const,
          status: (item.contentStatus as ContentStatus) || status,
          createdAt: item.createdAt,
        })),
        ...tests.map((item) => ({
          id: item.id,
          name: item.title,
          type: "MiniTest" as const,
          status: (item.contentStatus as ContentStatus) || status,
          createdAt: item.createdAt,
        })),
      ];
      all.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
      setItems(all);
    } catch (loadError) {
      setError(getCreatorErrorMessage(loadError, "Không thể tải danh sách nội dung"));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function submit(item: WorkflowItem) {
    const key = `${item.type}-${item.id}`;
    setBusyKey(key);
    try {
      if (item.type === "Topic") await creatorService.submitTopicForReview(item.id);
      if (item.type === "Word") await creatorService.submitWordForReview(item.id);
      if (item.type === "Question") await creatorService.submitQuestionForReview(item.id);
      if (item.type === "MiniTest") await creatorService.submitMiniTestForReview(item.id);
      toast.success(status === "Rejected" ? "Đã gửi lại nội dung để duyệt" : "Đã gửi nội dung để duyệt");
      await load();
    } catch (submitError) {
      toast.error(getCreatorErrorMessage(submitError, "Không thể gửi duyệt"));
    } finally {
      setBusyKey("");
    }
  }

  return (
    <CreatorPage>
      <CreatorHeader
        title={title}
        description={description}
        action={
          <ToolbarButton onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </ToolbarButton>
        }
      />

      {loading ? (
        <CreatorLoadingState label="Đang tải nội dung..." />
      ) : error ? (
        <CreatorErrorState description={error} onRetry={() => void load()} />
      ) : (
        <CreatorPanel>
          {!items.length ? (
            <p className="py-14 text-center text-sm text-slate-500">Không có nội dung ở trạng thái này.</p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {items.map((item) => {
                const key = `${item.type}-${item.id}`;
                return (
                  <div
                    key={key}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CreatorStatusBadge status={item.status} />
                        <span className="text-xs font-medium text-slate-500">
                          {contentTypeLabel(item.type)}
                        </span>
                      </div>
                      <Link
                        href={routes[item.type]}
                        className="mt-2 block truncate font-medium text-slate-950 hover:text-blue-600 dark:text-white"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{formatCreatorDate(item.createdAt)}</p>
                      {item.rejectionReason && (
                        <p className="mt-2 text-sm text-rose-500">Lý do từ chối: {item.rejectionReason}</p>
                      )}
                    </div>
                    {allowSubmit && (
                      <button
                        type="button"
                        disabled={busyKey === key}
                        onClick={() => void submit(item)}
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                        {status === "Rejected" ? "Gửi lại" : "Gửi duyệt"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CreatorPanel>
      )}
    </CreatorPage>
  );
}
