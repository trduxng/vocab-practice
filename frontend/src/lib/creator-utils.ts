export function getCreatorErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  return typeof apiError.response?.data?.message === "string" ? apiError.response.data.message : fallback;
}

export function formatCreatorDate(value?: string | null) {
  if (!value) return "Chưa có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function contentTypeLabel(type: string) {
  return {
    Topic: "Chủ đề",
    Word: "Từ vựng",
    Question: "Câu hỏi",
    MiniTest: "Mini test",
  }[type] || type;
}
