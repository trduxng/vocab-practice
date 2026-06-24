export function getCreatorErrorMessage(error: unknown, fallback: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  return err?.response?.data?.message || err?.message || fallback;
}

export function formatCreatorDate(value?: string | null): string {
  if (!value) return "Chưa có dữ liệu";
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Chưa có dữ liệu";
  }
}

export function contentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    Topic: "Chủ đề",
    Word: "Từ vựng",
    Question: "Câu hỏi",
    MiniTest: "Bài test",
  };
  return labels[type] || type;
}
