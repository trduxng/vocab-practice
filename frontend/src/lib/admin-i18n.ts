const labels: Record<string, string> = {
  Admin: "Quản trị viên",
  Learner: "Học viên",
  ContentCreator: "Biên tập viên",
  active: "Đang hoạt động",
  banned: "Đã khóa",
  Draft: "Bản nháp",
  PendingReview: "Chờ duyệt",
  Published: "Đã xuất bản",
  Rejected: "Đã từ chối",
  Archived: "Đã lưu trữ",
  Open: "Mới",
  InReview: "Đang xem xét",
  Resolved: "Đã xử lý",
  Low: "Thấp",
  Normal: "Bình thường",
  High: "Cao",
  Urgent: "Khẩn cấp",
  Topic: "Chủ đề",
  Word: "Từ vựng",
  Question: "Câu hỏi",
  MiniTest: "Bài kiểm tra ngắn",
  ContentReport: "Báo cáo nội dung",
  Audio: "Âm thanh",
  General: "Chung",
  WordIncorrect: "Từ vựng không chính xác",
  AudioIssue: "Lỗi âm thanh",
  AnswerIncorrect: "Đáp án không chính xác",
  Typo: "Lỗi chính tả",
  Other: "Khác",
  MCQ: "Trắc nghiệm",
  FillBlank: "Điền vào chỗ trống",
  DragDrop: "Kéo và thả",
  Dictation: "Nghe và chép",
  FlashcardCheck: "Kiểm tra flashcard",
  AudioRecognition: "Nhận diện âm thanh",
  MultipleChoice: "Trắc nghiệm",
  FillInBlank: "Điền vào chỗ trống",
  TrueFalse: "Đúng / Sai",
  Matching: "Ghép cặp",
  Listening: "Nghe hiểu",
  Noun: "Danh từ",
  Verb: "Động từ",
  Adjective: "Tính từ",
  Adverb: "Trạng từ",
  Pronoun: "Đại từ",
  Preposition: "Giới từ",
  Conjunction: "Liên từ",
  Determiner: "Từ hạn định",
  Interjection: "Thán từ",
  Phrase: "Cụm từ",
  InApp: "Trong ứng dụng",
  Email: "Email",
  Push: "Thông báo đẩy",
  PushNotification: "Thông báo đẩy",
  Both: "Trong ứng dụng và email",
  Announcement: "Thông báo chung",
  DailyReminder: "Nhắc học hằng ngày",
  OK: "Hoạt động",
  Connected: "Đã kết nối",
  Disconnected: "Mất kết nối",
  development: "Phát triển",
  production: "Vận hành",
  Monday: "Thứ Hai",
  Tuesday: "Thứ Ba",
  Wednesday: "Thứ Tư",
  Thursday: "Thứ Năm",
  Friday: "Thứ Sáu",
  Saturday: "Thứ Bảy",
  Sunday: "Chủ Nhật",
  Mon: "T2",
  Tue: "T3",
  Wed: "T4",
  Thu: "T5",
  Fri: "T6",
  Sat: "T7",
  Sun: "CN",
  DELETE_TOPIC: "Xóa chủ đề",
  UPDATE_CONTENT_STATUS: "Cập nhật trạng thái nội dung",
  UPDATE_CONTENT_REPORT: "Cập nhật báo cáo nội dung",
  CREATE_USER: "Tạo người dùng",
  UPDATE_USER: "Cập nhật người dùng",
  DELETE_USER: "Xóa người dùng",
  CREATE_WORD: "Tạo từ vựng",
  UPDATE_WORD: "Cập nhật từ vựng",
  DELETE_WORD: "Xóa từ vựng",
  CREATE_QUESTION: "Tạo câu hỏi",
  UPDATE_QUESTION: "Cập nhật câu hỏi",
  DELETE_QUESTION: "Xóa câu hỏi",
  CREATE_MINITEST: "Tạo bài kiểm tra ngắn",
  UPDATE_MINITEST: "Cập nhật bài kiểm tra ngắn",
  DELETE_MINITEST: "Xóa bài kiểm tra ngắn",
};

export function adminLabel(value?: string | null, fallback = "Chưa xác định") {
  if (!value) return fallback;
  return labels[value] || value;
}

export function formatAdminNumber(value?: number | null) {
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function formatAdminDate(value?: string | null) {
  if (!value) return "Chưa có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function translateAdminText(value?: string | null) {
  if (!value) return "Chưa có dữ liệu";
  return value
    .replace(/\bCorrect answer\b/gi, "Trả lời đúng")
    .replace(/\bWrong answer\b/gi, "Trả lời sai")
    .replace(/\bReview content\b/gi, "Duyệt nội dung")
    .replace(/\banswered\b/gi, "đã trả lời");
}
