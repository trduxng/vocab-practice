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
  if (isDev) {
    console.error("[ERROR]", err.stack);
  } else {
    console.error("[ERROR]", err.message);
  }

  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    message: sanitizeMessage(err.message || "Lỗi server nội bộ"),
    ...(isDev ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
