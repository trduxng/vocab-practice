const requestCounts = new Map();
const CLEANUP_INTERVAL = 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, windowStart] of requestCounts) {
    if (now - windowStart > WINDOW_MS) {
      requestCounts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

function rateLimiter({ maxRequests = 20, windowMs = WINDOW_MS, message = 'Quá nhiều yêu cầu, vui lòng thử lại sau' } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, windowStart: now });
      return next();
    }

    const record = requestCounts.get(key);
    if (now - record.windowStart > windowMs) {
      requestCounts.set(key, { count: 1, windowStart: now });
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      return res.status(429).json({ message });
    }

    next();
  };
}

module.exports = rateLimiter;
