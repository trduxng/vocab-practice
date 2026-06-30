/**
 * Gamification Client — proxies gamification requests to the Go service
 * when GAMIFICATION_SERVICE_URL is set, otherwise falls back to JS implementation.
 *
 * This module has the exact same interface as GamificationService so it can
 * be used as a drop-in replacement.
 */
const http = require("http");
const https = require("https");

const SERVICE_URL = process.env.GAMIFICATION_SERVICE_URL || "";
const USE_GO_CLIENT = SERVICE_URL.length > 0;

// Cache the JS service so we only require it on first use (lazy)
let _jsService = null;
function getJSService() {
  if (!_jsService) {
    _jsService = require("./gamification.service");
  }
  return _jsService;
}

// ---------------------------------------------------------------------------
// HTTP helpers — no extra dependencies needed (no axios)
// ---------------------------------------------------------------------------

function httpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SERVICE_URL.replace(/\/+$/, ""));
    const isHTTPS = url.protocol === "https:";
    const transport = isHTTPS ? https : http;

    const bodyStr = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    };

    if (bodyStr) {
      options.headers["Content-Length"] = Buffer.byteLength(bodyStr);
    }

    const req = transport.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const err = new Error(parsed.message || `HTTP ${res.statusCode}`);
            err.statusCode = res.statusCode;
            err.response = parsed;
            reject(err);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function apiPath(subpath) {
  return `/api/gamification${subpath}`;
}

// ---------------------------------------------------------------------------
// Clean number helper
// ---------------------------------------------------------------------------
function toInt(val) {
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

// ---------------------------------------------------------------------------
// Public API — matches GamificationService interface
// ---------------------------------------------------------------------------

async function getProfile(userId) {
  if (USE_GO_CLIENT) {
    try {
      return await httpRequest("GET", apiPath(`/profile/${userId}`));
    } catch (err) {
      console.warn("[GamificationClient] Go service unavailable, falling back to JS:", err.message);
    }
  }
  return getJSService().getProfile(userId);
}

async function getMetrics(userId) {
  if (USE_GO_CLIENT) {
    try {
      return await httpRequest("GET", apiPath(`/metrics/${userId}`));
    } catch (err) {
      console.warn("[GamificationClient] Go service unavailable:", err.message);
    }
  }
  return getJSService().getMetrics(userId);
}

async function getAchievements(userId) {
  if (USE_GO_CLIENT) {
    try {
      return await httpRequest("GET", apiPath(`/achievements/${userId}`));
    } catch (err) {
      console.warn("[GamificationClient] Go service unavailable:", err.message);
    }
  }
  return getJSService().getAchievements(userId);
}

async function awardXP(userId, { eventType, amount, sourceKey = null, metadata = null, xpAmount = null } = {}) {
  if (USE_GO_CLIENT) {
    try {
      return await httpRequest("POST", apiPath("/award-xp"), {
        userId: Number(userId),
        eventType,
        amount: amount != null ? toInt(amount) : undefined,
        xpAmount: xpAmount != null ? toInt(xpAmount) : undefined,
        sourceKey: sourceKey || undefined,
        metadata: metadata || undefined,
      });
    } catch (err) {
      console.warn("[GamificationClient] Go service unavailable:", err.message);
    }
  }
  return getJSService().awardXP(userId, { eventType, amount, sourceKey, metadata, xpAmount });
}

async function awardDailyLogin(userId) {
  if (USE_GO_CLIENT) {
    try {
      return await httpRequest("POST", apiPath(`/daily-login/${userId}`));
    } catch (err) {
      console.warn("[GamificationClient] Go service unavailable:", err.message);
    }
  }
  return getJSService().awardDailyLogin(userId);
}

async function markAchievementsSeen(userId, achievementIds = []) {
  if (USE_GO_CLIENT) {
    try {
      return await httpRequest("POST", apiPath("/achievements/seen"), {
        userId: Number(userId),
        achievementIds: achievementIds.map(toInt),
      });
    } catch (err) {
      console.warn("[GamificationClient] Go service unavailable:", err.message);
    }
  }
  return getJSService().markAchievementsSeen(userId, achievementIds);
}

async function ensureSchema() {
  if (USE_GO_CLIENT) {
    try {
      await httpRequest("GET", apiPath("/health"));
      return;
    } catch (err) {
      console.warn("[GamificationClient] Go health check failed:", err.message);
    }
  }
  return getJSService().ensureSchema();
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getLevelState(totalXP = 0) {
  return getJSService().getLevelState(totalXP);
}

module.exports = {
  getProfile,
  getMetrics,
  getAchievements,
  awardXP,
  awardDailyLogin,
  markAchievementsSeen,
  ensureSchema,
  getDateKey,
  getLevelState,
  // Allow checking if Go mode is active
  isGoMode: () => USE_GO_CLIENT,
  getServiceURL: () => SERVICE_URL,
};
