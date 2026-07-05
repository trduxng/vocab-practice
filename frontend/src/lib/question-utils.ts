export function gradeQuestion(
  questionType: string | undefined,
  submittedAnswer: string,
  correctAnswer: string,
): boolean {
  const answer = (submittedAnswer || "").trim().toLowerCase().replace(/\s+/g, " ");
  const expected = (correctAnswer || "").trim().toLowerCase().replace(/\s+/g, " ");

  switch ((questionType || "").toLowerCase()) {
    case "fillblank":
    case "fill_in_blank":
      return answer === expected;
    case "mcq":
    case "multiplechoice":
    case "dragdrop":
    case "dictation":
    case "flashcardcheck":
    case "audiorecognition":
    case "truefalse":
    case "matching":
    case "listening":
    default:
      return answer === expected;
  }
}

export function parseOptions(optionsJson?: string): string[] {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getQuestionTypeLabel(type?: string): string {
  const labels: Record<string, string> = {
    MCQ: "Trắc nghiệm",
    MultipleChoice: "Trắc nghiệm",
    FillBlank: "Điền vào chỗ trống",
    FillInBlank: "Điền vào chỗ trống",
    DragDrop: "Kéo và thả",
    Dictation: "Nghe và chép",
    FlashcardCheck: "Kiểm tra flashcard",
    AudioRecognition: "Nhận diện âm thanh",
    TrueFalse: "Đúng / Sai",
    Matching: "Ghép cặp",
    Listening: "Nghe hiểu",
  };
  return labels[type || ""] || type || "Câu hỏi";
}
