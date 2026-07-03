const errorHandler = (err, req, res, next) => {
  const msg = err.message || "Loi server noi bo";
  let status = err.status || err.statusCode || 500;

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" || err.name === "NotBeforeError") {
    status = 401;
  } else if (msg.includes("khong ton tai") || msg.includes("not found") || msg.includes("Not found")) {
    status = 404;
  } else if (msg.includes("khong hop le") || msg.includes("khong duoc") || msg.includes("khong the") || msg.includes("Missing")) {
    status = 400;
  } else if (msg.includes("quyen") || msg.includes("permission") || msg.includes("Permission")) {
    status = 403;
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

export default errorHandler;
