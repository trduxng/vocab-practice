/**
 * Simple validation middleware
 * Có thể thay bằng Joi/Zod sau này
 */

const validateRegister = (req, res, next) => {
  const { fullName, email, password } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length < 2) {
    errors.push("Họ tên phải có ít nhất 2 ký tự");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email không đúng định dạng");
  }

  if (!password || password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push("Vui lòng nhập email");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email không đúng định dạng");
  }

  if (!password) {
    errors.push("Vui lòng nhập mật khẩu");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

const validateSubmitAnswer = (req, res, next) => {
  const { questionId, submittedAnswer } = req.body;
  const errors = [];

  if (!questionId) {
    errors.push("Thiếu questionId");
  }

  if (submittedAnswer === undefined || submittedAnswer === null) {
    errors.push("Thiếu submittedAnswer");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

const validateCreateWord = (req, res, next) => {
  const { term, meaning, partOfSpeechId } = req.body;
  const errors = [];

  if (!term || term.trim().length < 1) {
    errors.push("Thiếu term");
  }

  if (!meaning || meaning.trim().length < 1) {
    errors.push("Thiếu meaning");
  }

  if (!partOfSpeechId || typeof partOfSpeechId !== "number") {
    errors.push("partOfSpeechId không hợp lệ");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateSubmitAnswer,
  validateCreateWord,
};
