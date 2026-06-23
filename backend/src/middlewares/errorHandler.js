// vocab-practice/backend/src/middlewares/errorHandler.js

// Các mẫu lỗi SQL cần che giấu khỏi client
const SQL_ERROR_PATTERNS = [
  /Incorrect syntax near/i,
  /Cannot (insert|update|delete|select)/i,
  /Invalid object name/i,
  /The data types.*incompatible/i,
  /Violation of (PRIMARY KEY|FOREIGN KEY|UNIQUE)/i,
  /Arithmetic overflow/i,
  /String or binary data would be truncated/i,
  /Procedure or function.*expects parameter/i,
  /Subquery returned more than 1 value/i,
  /Column name.*not valid/i,
  /Invalid column name/i,
  /Cannot find data type/i,
];

const isDev = process.env.NODE_ENV === "development";

function sanitizeMessage(message) {
  if (isDev) return message;

  const isSqlError = SQL_ERROR_PATTERNS.some((pattern) => pattern.test(message || ""));
  if (isSqlError) {
    return "Lỗi xử lý dữ liệu. Vui lòng thử lại sau.";
  }

  // Che giấu đường dẫn file hệ thống
  return message.replace(/(\/[\w./-]+)+/g, "[path]").replace(/\\\\[\\w\\./-]+/g, "[path]");
}

const errorHandler = (err, req, res, next) => {
  const msg = err.message || "Lỗi server nội bộ";
  let status = err.status || err.statusCode || 500;

  // Auto-detect status code based on error type/content
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" || err.name === "NotBeforeError") {
    status = 401;
  } else if (msg.includes("không tồn tại") || msg.includes("not found") || msg.includes("Not found")) {
    status = 404;
  } else if (msg.includes("không hợp lệ") || msg.includes("không được") || msg.includes("không thể") || msg.includes("Missing")) {
    status = 400;
  } else if (msg.includes("quyền") || msg.includes("permission") || msg.includes("Permission")) {
    status = 403;
  } else if (msg.includes("Bạn đã hoàn thành") || msg.includes("chưa được xuất bản")) {
    status = 400;
  }

  if (isDev) {
    console.error(`[${status}] ${msg}`, err.stack);
  } else {
    console.error(`[${status}] ${msg}`);
  }

  res.status(status).json({
    message: sanitizeMessage(msg),
    ...(isDev ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
