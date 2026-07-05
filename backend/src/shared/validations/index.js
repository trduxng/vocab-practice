const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (Object.prototype.hasOwnProperty.call(parsed, "body"))
      req.body = parsed.body;
    if (Object.prototype.hasOwnProperty.call(parsed, "query"))
      req.query = parsed.query;
    if (Object.prototype.hasOwnProperty.call(parsed, "params"))
      req.params = parsed.params;
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: error.issues || error.errors || [],
    });
  }
};

const schemas = {
  register: z.object({
    body: z.object({
      fullName: z.string().min(2, "Họ tên quá ngắn"),
      email: z.string().email("Email không hợp lệ"),
      password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
      role: z.enum(["Learner", "Teacher", "ContentCreator"]).optional(),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email("Email không hợp lệ"),
      password: z.string().min(1, "Vui lòng nhập mật khẩu"),
    }),
  }),
  createTopic: z.object({
    body: z.object({
      name: z.string().trim().min(1),
      code: z.string().trim().min(1).max(50).optional(),
      description: z.string().trim().max(1000).optional(),
      topicCategoryId: z.coerce.number().int().positive().nullable().optional(),
      status: z
        .enum(["Draft", "PendingReview", "Published", "Rejected", "Archived"])
        .optional(),
    }),
  }),
  updateTopic: z.object({
    body: z.object({
      name: z.string().trim().min(1).optional(),
      code: z.string().trim().min(1).max(50).optional(),
      description: z.string().trim().max(1000).optional(),
      topicCategoryId: z.coerce.number().int().positive().nullable().optional(),
      status: z
        .enum(["Draft", "PendingReview", "Published", "Rejected", "Archived"])
        .optional(),
    }),
  }),
  topicCategory: z.object({
    body: z.object({
      name: z.string().trim().min(1),
      code: z.string().trim().min(1).max(100).optional(),
      description: z.string().trim().max(1000).optional(),
      iconUrl: z.string().trim().max(1000).optional(),
      displayOrder: z.coerce.number().int().positive().optional(),
      isActive: z.coerce.boolean().optional(),
    }),
  }),
  createWord: z.object({
    body: z.object({
      term: z.string().trim().min(1),
      meaning: z.string().trim().min(1),
      phonetic: z.string().optional(),
      partOfSpeechId: z.coerce.number().int().positive(),
      topicIds: z.array(z.coerce.number().int().positive()).optional(),
      status: z
        .enum(["Draft", "PendingReview", "Published", "Rejected", "Archived"])
        .optional(),
      examples: z
        .array(
          z.object({ sentence: z.string(), meaning: z.string().optional() }),
        )
        .optional(),
    }),
  }),
  createQuestion: z.object({
    body: z.object({
      wordId: z.coerce.number().int().positive(),
      questionType: z.enum([
        "MCQ",
        "FillBlank",
        "DragDrop",
        "Dictation",
        "FlashcardCheck",
        "AudioRecognition",
      ]),
      questionText: z.string().min(5),
      correctAnswer: z.string().min(1),
      optionsJson: z.string().optional(),
      explanation: z.string().optional(),
      status: z
        .enum(["Draft", "PendingReview", "Published", "Rejected", "Archived"])
        .optional(),
    }),
  }),
  miniTest: z.object({
    body: z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().max(1000).optional(),
      topicId: z.coerce.number().int().positive().nullable().optional(),
      questionIds: z.array(z.coerce.number().int().positive()).min(1),
    }),
  }),
  createAdminUser: z.object({
    body: z.object({
      fullName: z.string().trim().min(2).max(200),
      email: z.string().trim().email().max(255),
      password: z.string().min(6).max(200),
      role: z.enum(["Admin", "Learner", "ContentCreator"]),
      isActive: z.boolean().optional(),
    }),
  }),
  updateAdminUser: z.object({
    body: z.object({
      fullName: z.string().trim().min(2).max(200),
      email: z.string().trim().email().max(255),
      password: z.string().min(6).max(200).optional(),
      role: z.enum(["Admin", "Learner", "ContentCreator"]),
      isActive: z.boolean(),
    }),
  }),
  updateAdminUserRole: z.object({
    body: z.object({ role: z.enum(["Admin", "Learner", "ContentCreator"]) }),
  }),
  announcement: z.object({
    body: z.object({
      audience: z.enum(["All users", "Learners", "Admins"]).optional(),
      title: z.string().trim().min(3).max(200),
      message: z.string().trim().min(5).max(2000),
      deliveryChannel: z
        .enum(["InApp", "Email", "PushNotification"])
        .optional(),
      actionUrl: z.string().trim().max(1000).nullable().optional(),
    }),
  }),
  contentStatus: z.object({
    body: z.object({
      entityType: z.enum(["Topic", "Word", "Question", "MiniTest"]),
      entityId: z.coerce.number().int().positive(),
      status: z.enum([
        "Draft",
        "PendingReview",
        "Published",
        "Rejected",
        "Archived",
      ]),
      comment: z.string().trim().max(2000).optional(),
    }),
  }),
  contentReviewTarget: z.object({
    params: z.object({
      entityType: z.enum([
        "Topic",
        "Word",
        "Question",
        "MiniTest",
        "topic",
        "word",
        "question",
        "minitest",
      ]),
      entityId: z.coerce.number().int().positive(),
    }),
    body: z
      .object({
        reason: z.string().trim().max(2000).optional(),
        comment: z.string().trim().max(2000).optional(),
      })
      .optional()
      .default({}),
  }),
  createReport: z.object({
    body: z.object({
      reportType: z.enum([
        "WordIncorrect",
        "AudioIssue",
        "AnswerIncorrect",
        "Typo",
        "Other",
      ]),
      entityType: z.enum(["Word", "Question", "Audio", "General"]).optional(),
      wordId: z.coerce.number().int().positive().optional(),
      questionId: z.coerce.number().int().positive().optional(),
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().min(5).max(2000),
    }),
  }),
  updateReport: z.object({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: z.object({
      status: z.enum(["Open", "InReview", "Resolved", "Rejected"]).optional(),
      priority: z.enum(["Low", "Normal", "High", "Urgent"]).optional(),
      adminResponse: z.string().trim().max(2000).optional(),
    }),
  }),
  aiWordSuggestion: z.object({
    body: z.object({
      term: z.string().trim().min(1).max(100),
      meaning: z.string().trim().max(1000).optional(),
      partOfSpeech: z.string().trim().max(100).optional(),
      exampleCount: z.coerce.number().int().min(1).max(5).optional(),
    }),
  }),
};

module.exports = { validate, schemas };
