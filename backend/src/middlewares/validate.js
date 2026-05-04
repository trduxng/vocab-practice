const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      errors: error.errors
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
      term: z.string().min(1),
      meaning: z.string().min(1),
      phonetic: z.string().optional(),
      partOfSpeechId: z.number(),
      topicIds: z.array(z.number()).optional(),
      examples: z.array(z.object({
        sentence: z.string().min(1),
        meaning: z.string().optional()
      })).optional()
    })
  }),

  createQuestion: z.object({
    body: z.object({
      wordId: z.number(),
      questionType: z.enum(['MCQ', 'FillBlank', 'Dictation', 'FlashcardCheck']),
      questionText: z.string().min(5),
      correctAnswer: z.string().min(1),
    })
  })
};

module.exports = { validate, schemas };
