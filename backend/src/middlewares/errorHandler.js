// vocab-practice/backend/src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const msg = err.message || "Lỗi server nội bộ";
  let status = err.status || err.statusCode || 500;

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

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${status}] ${msg}`, err.stack);
  } else {
    console.error(`[${status}] ${msg}`);
  }

  res.status(status).json({
    message: msg,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
