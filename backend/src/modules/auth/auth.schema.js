const { z } = require('zod');

const authSchemas = {
  register: z.object({
    body: z.object({
      fullName: z.string().min(2, 'Họ tên quá ngắn'),
      email: z.string().email('Email không hợp lệ'),
      password: z.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
      role: z.enum(['Learner', 'Teacher', 'ContentCreator']).optional(),
    })
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Email không hợp lệ'),
      password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
    })
  }),
};

module.exports = authSchemas;
