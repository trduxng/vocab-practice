const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;
    next();
  } catch (error) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: error.issues || error.errors || []
    });
  }
};

const schemas = {
  // Auth
  register: z.object({
    body: z.object({
      fullName: z.string().min(2, 'Họ tên quá ngắn'),
      email: z.string().email('Email không hợp lệ'),
      password: z.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
    })
  }),
  
  login: z.object({
    body: z.object({
      email: z.string().email('Email không hợp lệ'),
      password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
    })
  }),

  // Admin
  createWord: z.object({
    body: z.object({
      term: z.string().trim().min(1),
      meaning: z.string().trim().min(1),
      phonetic: z.string().optional(),
      partOfSpeechId: z.coerce.number().int().positive(),
      topicIds: z.array(z.coerce.number().int().positive()).optional(),
      examples: z.array(z.object({
        sentence: z.string(),
        meaning: z.string().optional()
      })).optional()
    })
  }),

  createQuestion: z.object({
    body: z.object({
      wordId: z.number(),
      questionType: z.enum(['MCQ', 'DienKhuyet', 'DragDrop', 'Dictation', 'FlashcardCheck', 'AudioRecognition']),
      questionText: z.string().min(5),
      correctAnswer: z.string().min(1),
      optionsJson: z.string().optional(),
      explanation: z.string().optional(),
    })
  })
};

module.exports = { validate, schemas };
