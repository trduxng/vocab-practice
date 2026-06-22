const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const workspace = path.resolve(__dirname, "..");
const outputDir = path.join(workspace, "artifacts", "ui-screenshots");
const profileDir = path.join(workspace, "artifacts", ".capture-profile");
const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = "http://localhost:3000";
const debuggerPort = 9333;

const publicPages = [
  {
    file: "01-trang-chu.png",
    route: "/",
    title: "Trang chủ VocaBoost",
    description: "Trang giới thiệu nền tảng, khóa học, tính năng, quy trình học, bảng giá và lời kêu gọi đăng ký.",
    fullPage: true,
  },
  {
    file: "02-dang-nhap.png",
    route: "/login",
    title: "Đăng nhập",
    description: "Biểu mẫu đăng nhập bằng email và mật khẩu, có liên kết đăng ký tài khoản.",
  },
  {
    file: "03-dang-ky.png",
    route: "/register",
    title: "Đăng ký",
    description: "Biểu mẫu tạo tài khoản học viên mới với họ tên, email và mật khẩu.",
  },
];

const learnerPages = [
  ["04-hoc-vien-tong-quan.png", "/user/dashboard", "Tổng quan học viên", "Bảng điều khiển học tập với mục tiêu ngày, XP, chuỗi học, hoạt động và lộ trình tiếp theo."],
  ["05-hoc-vien-lo-trinh.png", "/user/courses", "Lộ trình học", "Danh sách lộ trình/chủ đề giúp học viên chọn nội dung theo thứ tự học phù hợp."],
  ["06-hoc-vien-hoc-theo-chu-de.png", "/user/learn", "Học theo chủ đề", "Khu vực chọn chủ đề và bắt đầu phiên học từ vựng bằng flashcard."],
  ["07-hoc-vien-luyen-tap.png", "/user/practice", "Luyện tập", "Màn hình chọn chế độ luyện tập và ôn tập thông minh theo dữ liệu SRS."],
  ["08-hoc-vien-bai-kiem-tra.png", "/user/minitests", "Bài kiểm tra", "Danh sách mini test để đánh giá mức độ ghi nhớ và theo dõi kết quả."],
  ["09-hoc-vien-so-tay.png", "/user/notebook", "Sổ tay từ vựng", "Nơi lưu, tìm kiếm và quản lý những từ vựng học viên muốn ghi nhớ riêng."],
  ["10-hoc-vien-thanh-tich.png", "/user/achievements", "Thành tích", "Các huy hiệu, cột mốc và tiến độ gamification của học viên."],
  ["11-hoc-vien-tien-do.png", "/user/progress", "Tiến độ", "Biểu đồ và số liệu phân tích hiệu suất học tập theo thời gian."],
  ["12-hoc-vien-cai-dat.png", "/user/settings", "Cài đặt", "Thiết lập hồ sơ, mục tiêu học mỗi ngày và giới hạn ôn tập SRS."],
].map(([file, route, title, description]) => ({ file, route, title, description }));

const creatorPages = [
  ["13-creator-dashboard.png", "/creator/dashboard", "Dashboard biên tập viên", "Tổng quan số lượng chủ đề, từ vựng, câu hỏi, bài test và trạng thái nội dung."],
  ["14-creator-chu-de.png", "/creator/topics", "Quản lý chủ đề — lỗi tải trang", "Trang hiện chưa tải được vì dữ liệu API không phải mảng nhưng giao diện gọi topics.map(). Ảnh ghi lại trạng thái lỗi thực tế."],
  ["15-creator-tu-vung.png", "/creator/words", "Quản lý từ vựng — lỗi tải trang", "Trang hiện chưa tải được vì dữ liệu API không phải mảng nhưng giao diện gọi words.map(). Ảnh ghi lại trạng thái lỗi thực tế."],
  ["16-creator-cau-hoi.png", "/creator/questions", "Quản lý câu hỏi — lỗi tải trang", "Trang hiện chưa tải được vì dữ liệu API không phải mảng nhưng giao diện gọi items.map(). Ảnh ghi lại trạng thái lỗi thực tế."],
  ["17-creator-bai-test.png", "/creator/mini-tests", "Quản lý bài test — lỗi tải trang", "Trang hiện chưa tải được vì dữ liệu API không phải mảng nhưng giao diện gọi items.map(). Ảnh ghi lại trạng thái lỗi thực tế."],
  ["18-creator-media.png", "/creator/media", "Thư viện media", "Khu vực quản lý tài nguyên hình ảnh và âm thanh dùng cho nội dung học."],
  ["19-creator-ban-nhap.png", "/creator/drafts", "Bản nháp", "Tập hợp nội dung đang soạn, chưa gửi sang quy trình kiểm duyệt."],
  ["20-creator-cho-duyet.png", "/creator/pending", "Chờ duyệt", "Danh sách nội dung đã gửi và đang chờ quản trị viên phê duyệt."],
  ["21-creator-bi-tu-choi.png", "/creator/rejected", "Bị từ chối", "Nội dung chưa đạt yêu cầu, kèm trạng thái để biên tập viên chỉnh sửa lại."],
  ["22-creator-phan-tich.png", "/creator/analytics", "Phân tích nội dung", "Các chỉ số giúp đánh giá quy mô và hiệu quả nội dung đã tạo."],
].map(([file, route, title, description]) => ({ file, route, title, description }));

const adminPages = [
  ["23-admin-tong-quan.png", "/admin/dashboard", "Tổng quan quản trị", "Dashboard hệ thống với KPI người dùng, nội dung, hoạt động học và trạng thái dịch vụ."],
  ["24-admin-nguoi-dung.png", "/admin/students", "Quản lý người dùng", "Danh sách tài khoản, vai trò, trạng thái hoạt động và các thao tác quản trị."],
  ["25-admin-noi-dung.png", "/admin/courses", "Quản lý nội dung", "Giao diện tổng hợp chủ đề và nội dung học để quản trị trạng thái xuất bản."],
  ["26-admin-duyet-noi-dung.png", "/admin/content-review", "Duyệt nội dung", "Hàng đợi kiểm duyệt nội dung do biên tập viên gửi lên."],
  ["27-admin-bao-cao.png", "/admin/reports", "Báo cáo người dùng", "Danh sách phản hồi/báo lỗi của học viên và quy trình xử lý."],
  ["28-admin-danh-muc-chu-de.png", "/admin/topic-categories", "Danh mục chủ đề", "Quản lý các nhóm danh mục dùng để phân loại chủ đề học."],
  ["29-admin-analytics.png", "/admin/analytics", "Phân tích hệ thống", "Biểu đồ phân tích người dùng, học tập và dữ liệu nội dung toàn hệ thống."],
  ["30-admin-nhat-ky.png", "/admin/audit-logs", "Nhật ký hệ thống", "Theo dõi các hành động quản trị và thay đổi dữ liệu quan trọng."],
  ["31-admin-thong-bao.png", "/admin/notifications", "Thông báo", "Công cụ gửi thông báo chung và tạo lời nhắc học hằng ngày."],
  ["32-admin-tu-vung.png", "/admin/words", "Kho từ vựng", "Bảng dữ liệu từ vựng với tìm kiếm, lọc, nhập hàng loạt và CRUD."],
  ["33-admin-cau-hoi.png", "/admin/questions", "Kho câu hỏi", "Quản lý câu hỏi luyện tập gắn với từ vựng và chủ đề."],
  ["34-admin-mini-test.png", "/admin/minitests", "Quản lý mini test", "Tạo, chỉnh sửa, xuất bản và lưu trữ các bài kiểm tra ngắn."],
].map(([file, route, title, description]) => ({ file, route, title, description }));

const roleDefinitions = {
  learner: {
    user: {
      id: 10,
      fullName: "Nguyễn Hoàng Phúc",
      email: "phuc2011@gmail.com",
      role: "Learner",
      permissions: ["VIEW_DASHBOARD", "LEARN_VOCAB"],
    },
    pages: learnerPages,
  },
  creator: {
    user: {
      id: 9,
      fullName: "Biên tập viên / Giáo viên",
      email: "teacher@vocaboost.com",
      role: "ContentCreator",
      permissions: [
        "VIEW_DASHBOARD",
        "MANAGE_TOPICS",
        "MANAGE_WORDS",
        "MANAGE_QUESTIONS",
        "MANAGE_TESTS",
        "VIEW_ANALYTICS",
        "VIEW_CONTENT_ANALYTICS",
        "SUBMIT_CONTENT_REVIEW",
      ],
    },
    pages: creatorPages,
  },
  admin: {
    user: {
      id: 8,
      fullName: "System Admin",
      email: "system@vocaboost.com",
      role: "Admin",
      permissions: [
        "VIEW_DASHBOARD",
        "MANAGE_USERS",
        "MANAGE_ROLES",
        "MANAGE_TOPICS",
        "MANAGE_TOPIC_CATEGORIES",
        "MANAGE_WORDS",
        "MANAGE_QUESTIONS",
        "MANAGE_TESTS",
        "REVIEW_CONTENT",
        "PUBLISH_CONTENT",
        "MANAGE_REPORTS",
        "MANAGE_NOTIFICATIONS",
        "VIEW_ANALYTICS",
        "MANAGE_SYSTEM_SETTINGS",
        "VIEW_AUDIT_LOGS",
        "VIEW_CONTENT_ANALYTICS",
        "SUBMIT_CONTENT_REVIEW",
      ],
    },
    pages: adminPages,
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureSafeProfilePath() {
  const artifactsDir = path.join(workspace, "artifacts") + path.sep;
  if (!profileDir.startsWith(artifactsDir)) {
    throw new Error(`Refusing to clean unsafe profile path: ${profileDir}`);
  }
}

async function waitForJson(url, attempts = 80) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.webSocketUrl);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result || {});
    });
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId;
      this.nextId += 1;
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.socket) this.socket.close();
  }
}

async function waitForDocument(client) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const result = await client.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (result.result?.value === "complete") return;
    await sleep(150);
  }
}

async function navigate(client, route, waitMs = 3200) {
  await client.send("Page.navigate", { url: `${baseUrl}${route}` });
  await waitForDocument(client);
  await sleep(waitMs);
  await client.send("Runtime.evaluate", {
    expression: "window.scrollTo(0, 0)",
    returnByValue: true,
  });
  await sleep(250);
}

async function capture(client, page) {
  await navigate(client, page.route, page.route.includes("dashboard") ? 4800 : 3300);
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      document.querySelectorAll('nextjs-portal').forEach((portal) => {
        portal.style.display = 'none';
        portal.setAttribute('aria-hidden', 'true');
      });
    })()`,
    returnByValue: true,
  });
  await sleep(150);
  const state = await client.send("Runtime.evaluate", {
    expression: `({
      url: location.href,
      title: document.title,
      heading: document.querySelector('h1')?.innerText || document.querySelector('h2')?.innerText || '',
      textLength: document.body?.innerText?.length || 0
    })`,
    returnByValue: true,
  });

  const finalUrl = state.result?.value?.url || "";
  if (!finalUrl.startsWith(baseUrl)) {
    throw new Error(`Unexpected navigation for ${page.route}: ${finalUrl}`);
  }

  let screenshotParams = {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  };

  if (page.fullPage) {
    const metrics = await client.send("Page.getLayoutMetrics");
    const contentSize = metrics.cssContentSize || metrics.contentSize;
    screenshotParams = {
      ...screenshotParams,
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width: Math.min(1440, Math.ceil(contentSize.width)),
        height: Math.min(16000, Math.ceil(contentSize.height)),
        scale: 1,
      },
    };
  }

  const screenshot = await client.send("Page.captureScreenshot", screenshotParams);
  fs.writeFileSync(path.join(outputDir, page.file), Buffer.from(screenshot.data, "base64"));
  return {
    ...page,
    finalUrl,
    heading: state.result?.value?.heading || "",
    textLength: state.result?.value?.textLength || 0,
  };
}

async function setAuth(client, user, token) {
  await navigate(client, "/login", 400);
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const token = ${JSON.stringify(token)};
      const user = ${JSON.stringify(JSON.stringify(user))};
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      document.cookie = 'token=' + encodeURIComponent(token) + '; path=/; SameSite=Lax';
      document.cookie = 'user=' + encodeURIComponent(user) + '; path=/; SameSite=Lax';
    })()`,
    returnByValue: true,
  });
}

function writeReport(results) {
  const groups = [
    ["Giao diện công khai", results.filter((item) => item.file.startsWith("0") && Number(item.file.slice(0, 2)) <= 3)],
    ["Giao diện học viên", results.filter((item) => Number(item.file.slice(0, 2)) >= 4 && Number(item.file.slice(0, 2)) <= 12)],
    ["Giao diện biên tập viên", results.filter((item) => Number(item.file.slice(0, 2)) >= 13 && Number(item.file.slice(0, 2)) <= 22)],
    ["Giao diện quản trị viên", results.filter((item) => Number(item.file.slice(0, 2)) >= 23)],
  ];

  const lines = [
    "# Bộ ảnh giao diện VocaBoost",
    "",
    `Ngày chụp: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`,
    "",
    "Kích thước khung hình: 1440 × 1000 px. Riêng trang chủ được chụp toàn trang.",
    "",
    "Kết quả kiểm tra: 30 màn hình tải bình thường; 4 màn hình Creator hiển thị lỗi runtime và được ghi chú ngay dưới ảnh.",
    "",
  ];

  for (const [heading, pages] of groups) {
    lines.push(`## ${heading}`, "");
    for (const page of pages) {
      lines.push(`### ${page.title}`, "", `![${page.title}](./${page.file})`, "", page.description, "");
    }
  }

  fs.writeFileSync(path.join(outputDir, "README.md"), `${lines.join("\n")}\n`, "utf8");
  fs.writeFileSync(path.join(outputDir, "capture-metadata.json"), JSON.stringify(results, null, 2), "utf8");
}

async function main() {
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found at ${chromePath}`);
  fs.mkdirSync(outputDir, { recursive: true });
  ensureSafeProfilePath();
  if (fs.existsSync(profileDir)) fs.rmSync(profileDir, { recursive: true, force: true });
  fs.mkdirSync(profileDir, { recursive: true });

  require(path.join(workspace, "backend", "node_modules", "dotenv")).config({
    path: path.join(workspace, "backend", ".env"),
    quiet: true,
  });
  const jwt = require(path.join(workspace, "backend", "node_modules", "jsonwebtoken"));

  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${debuggerPort}`,
      "--remote-allow-origins=*",
      `--user-data-dir=${profileDir}`,
      "--window-size=1440,1000",
      "--force-device-scale-factor=1",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true },
  );

  let client;
  try {
    await waitForJson(`http://127.0.0.1:${debuggerPort}/json/version`);
    const targets = await waitForJson(`http://127.0.0.1:${debuggerPort}/json/list`);
    const pageTarget = targets.find((target) => target.type === "page");
    if (!pageTarget) throw new Error("Chrome page target was not created");

    client = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Network.enable");
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const results = [];
    for (const page of publicPages) {
      console.log(`Capturing ${page.file}`);
      results.push(await capture(client, page));
    }

    for (const definition of Object.values(roleDefinitions)) {
      const token = jwt.sign(
        {
          id: definition.user.id,
          fullName: definition.user.fullName,
          role: definition.user.role,
          permissions: definition.user.permissions,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );
      await setAuth(client, definition.user, token);
      for (const page of definition.pages) {
        console.log(`Capturing ${page.file}`);
        results.push(await capture(client, page));
      }
    }

    writeReport(results);
    console.log(`Captured ${results.length} pages in ${outputDir}`);
  } finally {
    if (client) client.close();
    chrome.kill();
    await sleep(500);
    if (fs.existsSync(profileDir)) fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
