from pathlib import Path
import json
import sys

sys.path.insert(0, str(Path(__file__).parent))

from docx import Document
from docx.shared import Pt

import update_module_controller_service_tables as base


SRC = Path("artifacts/design-doc/phuc-report-edit/Detail Design_Phuc_module_flow_updated.docx")
OUT = Path("artifacts/design-doc/phuc-report-edit/Detail Design_Phuc_module_controller_service_90p.docx")
PSEUDO_JSON = Path("artifacts/design-doc/backend_pseudocode.json")


def load_function_map():
    data = json.loads(PSEUDO_JSON.read_text(encoding="utf-8"))
    mapping = {}
    for file_entry in data:
        for fn in file_entry.get("functions", []):
            cls = fn.get("className")
            key = f"{cls}.{fn['name']}" if cls else fn["name"]
            mapping[key] = fn
    return mapping


FUNCTIONS = load_function_map()


PURPOSE_BY_VERB = {
    "get": "Lấy dữ liệu, áp dụng điều kiện lọc/phân quyền và trả về cho màn hình sử dụng.",
    "create": "Tạo mới dữ liệu nghiệp vụ sau khi kiểm tra đầu vào và quyền thực hiện.",
    "update": "Cập nhật dữ liệu hiện có, bảo toàn ràng buộc và ghi nhận trạng thái mới.",
    "delete": "Xóa hoặc lưu trữ mềm dữ liệu theo đúng quyền và quy tắc nghiệp vụ.",
    "submit": "Gửi dữ liệu thao tác của người dùng, xử lý nghiệp vụ và lưu kết quả.",
    "bulk": "Xử lý nhập hàng loạt, kiểm tra dữ liệu và tổng hợp kết quả nhập.",
    "preview": "Đọc dữ liệu nhập thử, kiểm tra lỗi và trả về bản xem trước.",
    "publish": "Chuyển nội dung sang trạng thái công bố để người học có thể sử dụng.",
    "archive": "Chuyển nội dung sang trạng thái lưu trữ, không xóa vật lý dữ liệu.",
    "approve": "Duyệt nội dung đang chờ kiểm tra và cập nhật trạng thái xuất bản.",
    "reject": "Từ chối nội dung, lưu lý do và trả về trạng thái cần chỉnh sửa.",
    "mark": "Đánh dấu trạng thái đã xử lý/đã đọc cho dữ liệu của người dùng.",
    "award": "Cộng thưởng XP hoặc thành tích sau khi người học hoàn thành hành động.",
    "check": "Kiểm tra điều kiện hoặc trạng thái hiện tại trước khi trả kết quả.",
    "ensure": "Đảm bảo cấu trúc dữ liệu/hạ tầng cần thiết đã tồn tại trước khi chạy.",
    "sync": "Đồng bộ dữ liệu nguồn với cấu trúc hiển thị hoặc lộ trình học.",
    "build": "Tổng hợp dữ liệu nguồn thành cấu trúc kết quả phục vụ giao diện.",
    "send": "Tạo và gửi thông báo đến nhóm người dùng phù hợp.",
    "run": "Thực hiện tác vụ vận hành/kiểm tra hệ thống.",
}


SPECIAL_PURPOSES = {
    "AuthController.register": "Nhận yêu cầu đăng ký tài khoản người học và trả kết quả tạo tài khoản.",
    "AuthController.login": "Nhận thông tin đăng nhập, trả JWT và thông tin người dùng.",
    "AuthService.register": "Kiểm tra email trùng, mã hóa mật khẩu và tạo bản ghi người dùng.",
    "AuthService.login": "Xác thực mật khẩu, kiểm tra trạng thái tài khoản và phát hành JWT.",
    "verifyToken": "Xác thực JWT, nạp thông tin user và gắn vào req.user cho các API bảo vệ.",
    "checkPermission": "Kiểm tra người dùng có đúng quyền bắt buộc để gọi API quản trị.",
    "checkAnyPermission": "Cho phép request đi tiếp nếu user có một trong các quyền được yêu cầu.",
    "validate": "Validate body theo schema trước khi controller xử lý.",
    "UserService.submitAnswer": "Ghi nhận câu trả lời, cập nhật SRS, cộng XP và trả phản hồi học tập.",
    "UserService.getDueFlashcards": "Tính danh sách flashcard đến hạn ôn theo Spaced Repetition.",
    "UserService.submitWordReview": "Cập nhật lịch ôn tiếp theo theo đánh giá Again/Hard/Good/Easy.",
    "UserService.getSmartReviewQueue": "Tạo hàng đợi ôn thông minh, ưu tiên từ đến hạn và từ yếu.",
    "UserService.getMistakeReviewQueue": "Lấy danh sách từ/câu hỏi người học hay sai để luyện lại.",
    "GamificationService.awardXP": "Cộng XP, cập nhật level và tránh cộng trùng theo sourceKey.",
    "GamificationService.awardDailyLogin": "Cộng thưởng đăng nhập hằng ngày và duy trì streak học tập.",
    "GamificationService.checkAchievements": "Kiểm tra điều kiện đạt huy hiệu sau các hoạt động học.",
    "LearningPathService.getRoadmap": "Trả lộ trình học theo chủ đề đã xuất bản và tiến độ người dùng.",
    "ProgressService.getProgress": "Tính tiến độ học tập theo topic và trạng thái ghi nhớ từng từ.",
    "AdminService.logAdminAction": "Ghi audit log cho thao tác quản trị quan trọng.",
    "AdminService.logContentReview": "Ghi log kiểm duyệt khi nội dung được duyệt/từ chối/lưu trữ.",
    "AdminService.parseDelimitedImport": "Phân tích file CSV/plain text nhập liệu thành các dòng dữ liệu chuẩn.",
    "AdminService.bulkInsertWords": "Nhập nhiều từ vựng vào CSDL bằng transaction và trả thống kê kết quả.",
    "AdminService.bulkInsertQuestions": "Nhập nhiều câu hỏi liên kết từ vựng bằng transaction.",
    "CreatorService.submitForReview": "Chuyển nội dung của creator sang hàng đợi kiểm duyệt.",
    "ReviewService.approve": "Duyệt nội dung và ghi nhật ký kiểm duyệt.",
    "ReviewService.reject": "Từ chối nội dung kèm ghi chú phản hồi cho người tạo.",
    "AiService.suggestWordContent": "Gọi AI để gợi ý nghĩa, ví dụ, phát âm và nội dung TOEIC cho từ mới.",
    "ReportService.createReport": "Tạo báo cáo từ người dùng cho nội dung hoặc sự cố trong hệ thống.",
    "errorHandler": "Chuẩn hóa lỗi backend thành HTTP status và JSON response.",
    "runHealthCheck": "Kiểm tra biến môi trường, kết nối CSDL và tình trạng schema.",
    "runIntegrationTest": "Chạy kiểm tra tích hợp nhanh cho cấu hình và truy vấn CSDL.",
    "gracefulShutdown": "Đóng server an toàn khi nhận tín hiệu dừng ứng dụng.",
}


def split_words(name):
    out = []
    current = ""
    for ch in name:
        if ch.isupper() and current:
            out.append(current)
            current = ch.lower()
        else:
            current += ch
    if current:
        out.append(current.lower())
    return out


def purpose_for(key, module_name):
    if key in SPECIAL_PURPOSES:
        return SPECIAL_PURPOSES[key]
    fn = FUNCTIONS.get(key)
    name = fn["name"] if fn else key.split(".")[-1]
    lower = name.lower()
    for verb, purpose in PURPOSE_BY_VERB.items():
        if lower.startswith(verb):
            return purpose
    words = " ".join(split_words(name))
    return f"Xử lý nghiệp vụ {words} trong {module_name.lower()}."


def trim_pseudocode(pseudocode, max_lines=9):
    lines = [line.rstrip() for line in pseudocode.strip().splitlines() if line.strip()]
    if len(lines) <= max_lines:
        return "\n".join(lines)

    first = lines[: max_lines - 2]
    return "\n".join(first + ["    ...", "END FUNCTION"])


def flow_for(key, layer, module_flow):
    fn = FUNCTIONS.get(key)
    method = fn["name"] if fn else key.split(".")[-1]
    if layer == "controller":
        return (
            f"Router gọi {key}\n"
            "-> middleware auth/validate kiểm tra request\n"
            "-> controller đọc params/query/body/user\n"
            "-> gọi service xử lý nghiệp vụ\n"
            "-> trả HTTP response hoặc next(error)"
        )
    if layer == "middleware":
        return (
            f"Express chạy middleware {method}\n"
            "-> đọc header/body/quyền user\n"
            "-> hợp lệ thì next()\n"
            "-> không hợp lệ trả lỗi 400/401/403"
        )
    if layer == "config":
        return (
            f"Chạy tác vụ {method}\n"
            "-> đọc cấu hình môi trường\n"
            "-> kiểm tra kết nối/trạng thái hệ thống\n"
            "-> log kết quả và kết thúc an toàn"
        )
    return (
        f"Controller hoặc module gọi {key}\n"
        "-> chuẩn hóa tham số đầu vào\n"
        "-> lấy kết nối SQL Server/pool\n"
        "-> thực hiện truy vấn, transaction hoặc gọi service liên quan\n"
        "-> trả dữ liệu đã tổng hợp về controller"
    )


def row(key, layer, module_name, module_flow):
    fn = FUNCTIONS.get(key)
    if fn is None:
        raise KeyError(f"Không tìm thấy hàm trong backend_pseudocode.json: {key}")
    signature = fn.get("signature") or fn["name"]
    display_name = f"{key}\n{signature}"
    return {
        "name": display_name,
        "file": fn.get("file", ""),
        "purpose": purpose_for(key, module_name),
        "flow": flow_for(key, layer, module_flow),
        "pseudo": trim_pseudocode(fn.get("pseudocode", ""), max_lines=12),
    }


MODULE_SPECS = [
    {
        "name": "Module Auth - Xác thực và phân quyền",
        "purpose": "Xử lý đăng ký, đăng nhập, phát hành JWT và kiểm soát quyền truy cập API.",
        "components": "auth.routes.js; AuthController; AuthService; validate middleware; auth middleware; bảng Users, Roles, Permissions.",
        "module_flow": "Client -> auth.routes -> validate(schema) -> AuthController -> AuthService -> SQL Server -> response. Với API nội bộ: Client -> verifyToken -> checkPermission/checkAnyPermission -> Controller.",
        "controllers": ["AuthController.register", "AuthController.login"],
        "services": ["AuthService.register", "AuthService.login", "verifyToken", "checkPermission", "checkAnyPermission", "getUserPermissions"],
        "service_layer": {"verifyToken": "middleware", "checkPermission": "middleware", "checkAnyPermission": "middleware", "getUserPermissions": "middleware"},
    },
    {
        "name": "Module Categories - Danh mục và chủ đề học",
        "purpose": "Cung cấp danh mục chủ đề và thống kê topic hiển thị cho người học.",
        "components": "categories.routes.js; CategoriesController; CategoriesService; bảng TopicCategories, Topics, Words.",
        "module_flow": "Client -> categories.routes -> CategoriesController -> CategoriesService -> SQL Server -> danh sách category/topic kèm số lượng.",
        "controllers": ["CategoriesController.getPartOfSpeeches", "CategoriesController.getTopics"],
        "services": ["CategoriesService.getPartOfSpeeches", "CategoriesService.getTopics"],
    },
    {
        "name": "Module User Learning - Học từ vựng, SRS, mini-test, notebook",
        "purpose": "Phục vụ trải nghiệm học chính: flashcard, bài tập, SRS, mini-test, notebook, dashboard tiến độ.",
        "components": "user.routes.js; UserController; UserService; GamificationService; ReportService; bảng Words, Questions, UserWordProgress, TestAttempts, Notebook, Notifications.",
        "module_flow": "Learner -> user.routes -> verifyToken -> UserController -> UserService -> SQL Server. Khi trả lời đúng/sai, UserService cập nhật UserWordProgress, lịch ôn SRS và gọi GamificationService cộng XP.",
        "controllers": [
            "UserController.submitAnswer",
            "UserController.getFlashcards",
            "UserController.getTopicWords",
            "UserController.getStats",
            "UserController.getMasteryTimeline",
            "UserController.getMiniTests",
            "UserController.getMiniTestDetails",
            "UserController.updateProfile",
            "UserController.getTestHistory",
            "UserController.getTestSessionDetails",
            "UserController.getDailyGoal",
            "UserController.updateDailyGoal",
            "UserController.updateSRSConfig",
            "UserController.submitMiniTest",
            "UserController.getActivityHeatmap",
            "UserController.getProgressAnalytics",
            "UserController.getDailyProgress",
            "UserController.getSmartReviewQueue",
            "UserController.getNotebook",
            "UserController.addNotebookEntry",
            "UserController.updateNotebookEntry",
            "UserController.deleteNotebookEntry",
            "UserController.checkNotebookEntry",
            "UserController.getNotifications",
            "UserController.markNotificationRead",
            "UserController.markAllNotificationsRead",
            "UserController.getSessionSummary",
            "UserController.getMistakeReviewQueue",
        ],
        "services": [
            "UserService.getFlashcards",
            "UserService.getDueFlashcards",
            "UserService.getTopicWords",
            "UserService.submitAnswer",
            "UserService.submitWordReview",
            "UserService.getUserStats",
            "UserService.getMasteryTimeline",
            "UserService.getMiniTests",
            "UserService.getMiniTestDetails",
            "UserService.updateProfile",
            "UserService.getTestHistory",
            "UserService.getTestSessionDetails",
            "UserService.getActivityHeatmap",
            "UserService.getProgressAnalytics",
            "UserService.getDailyProgress",
            "UserService.getSmartReviewQueue",
            "UserService.submitMiniTestBatch",
            "UserService.getDailyGoal",
            "UserService.updateDailyGoal",
            "UserService.updateSRSReviewLimit",
            "UserService.getUserNotifications",
            "UserService.markNotificationRead",
            "UserService.markAllNotificationsRead",
            "UserService.addNotebookEntry",
            "UserService.updateNotebookEntry",
            "UserService.deleteNotebookEntry",
            "UserService.getSessionSummary",
            "UserService.getMistakeReviewQueue",
            "UserService.checkNotebookEntry",
        ],
    },
    {
        "name": "Module Learning Path & Progress",
        "purpose": "Xây dựng lộ trình học theo topic và tính tiến độ tổng quát của người học.",
        "components": "learning-path.routes.js; progress.routes.js; LearningPathController; ProgressController; LearningPathService; ProgressService.",
        "module_flow": "Learner -> learning/progress routes -> Controller -> Service -> đồng bộ topic đã publish -> tính roadmap/progress từ UserWordProgress.",
        "controllers": ["LearningPathController.getRoadmap", "ProgressController.getProgress", "ProgressController.getStats"],
        "services": ["LearningPathService.syncPublishedTopics", "LearningPathService.getRoadmap", "LearningPathService.buildRoadmap", "ProgressService.getProgress"],
    },
    {
        "name": "Module Gamification - XP, Level, Achievement",
        "purpose": "Tạo động lực học bằng XP, level, streak và achievement.",
        "components": "gamification.routes.js; GamificationController; GamificationService; bảng UserGamification, UserAchievements.",
        "module_flow": "Learner action -> UserService/GamificationController -> GamificationService -> tính XP/level/achievement -> lưu DB -> trả profile/thành tích.",
        "controllers": ["GamificationController.getProfile", "GamificationController.completePractice"],
        "services": ["GamificationService.awardXP", "GamificationService.awardDailyLogin", "GamificationService.checkAchievements", "GamificationService.getProfile"],
    },
    {
        "name": "Module Admin - Quản trị hệ thống và nội dung",
        "purpose": "Quản trị toàn bộ nội dung học, người dùng, câu hỏi, mini-test, kiểm duyệt, analytics và thông báo.",
        "components": "admin.routes.js; AdminController; AdminService; auth permissions; bảng Topics, Words, Questions, MiniTests, Users, AuditLogs, Notifications.",
        "module_flow": "Admin -> admin.routes -> verifyToken -> checkPermission/checkAnyPermission -> AdminController -> AdminService -> SQL Server/transaction -> audit log -> response.",
        "controllers": [
            "AdminController.getTopics",
            "AdminController.getTopicCategories",
            "AdminController.createTopic",
            "AdminController.updateTopic",
            "AdminController.deleteTopic",
            "AdminController.createTopicCategory",
            "AdminController.updateTopicCategory",
            "AdminController.deleteTopicCategory",
            "AdminController.getWords",
            "AdminController.createWord",
            "AdminController.getWordDetail",
            "AdminController.bulkImportWords",
            "AdminController.previewWordImport",
            "AdminController.updateWord",
            "AdminController.deleteWord",
            "AdminController.hardDeleteWord",
            "AdminController.getQuestionsByWord",
            "AdminController.createQuestion",
            "AdminController.updateQuestion",
            "AdminController.deleteQuestion",
            "AdminController.bulkImportQuestions",
            "AdminController.getMiniTests",
            "AdminController.createMiniTest",
            "AdminController.updateMiniTest",
            "AdminController.publishMiniTest",
            "AdminController.archiveMiniTest",
            "AdminController.getStats",
            "AdminController.getStudents",
            "AdminController.createUser",
            "AdminController.updateUser",
            "AdminController.toggleStudentStatus",
            "AdminController.updateUserRole",
            "AdminController.getAnalytics",
            "AdminController.getContentManagement",
            "AdminController.updateContentStatus",
            "AdminController.getPendingContent",
            "AdminController.getContentReviewLogs",
            "AdminController.getNotifications",
            "AdminController.getAuditLogs",
        ],
        "services": [
            "AdminService.normalizePagination",
            "AdminService.logAdminAction",
            "AdminService.logContentReview",
            "AdminService.parseDelimitedImport",
            "AdminService.getTopics",
            "AdminService.getTopicCategories",
            "AdminService.createTopic",
            "AdminService.updateTopic",
            "AdminService.deleteTopic",
            "AdminService.createTopicCategory",
            "AdminService.updateTopicCategory",
            "AdminService.deleteTopicCategory",
            "AdminService.getWords",
            "AdminService.attachWordRelations",
            "AdminService.getWordDetail",
            "AdminService.createWord",
            "AdminService.updateWord",
            "AdminService.deleteWord",
            "AdminService.bulkInsertWords",
            "AdminService.previewWordImport",
            "AdminService.getQuestionsByWord",
            "AdminService.createQuestion",
            "AdminService.updateQuestion",
            "AdminService.deleteQuestion",
            "AdminService.bulkInsertQuestions",
            "AdminService.getMiniTests",
            "AdminService.createMiniTest",
            "AdminService.updateMiniTest",
            "AdminService.deleteMiniTest",
            "AdminService.setMiniTestStatus",
            "AdminService.getDashboardStats",
            "AdminService.getStudents",
            "AdminService.createUser",
            "AdminService.updateUser",
            "AdminService.toggleUserStatus",
            "AdminService.updateUserRole",
            "AdminService.updateContentStatus",
            "AdminService.getPendingContent",
            "AdminService.getContentReviewLogs",
            "AdminService.getAnalyticsData",
            "AdminService.getContentManagementData",
            "AdminService.getNotifications",
            "AdminService.getAuditLogs",
        ],
    },
    {
        "name": "Module Creator - Biên tập nội dung học",
        "purpose": "Cho phép content creator tạo topic, từ vựng, câu hỏi, mini-test, media và gửi kiểm duyệt.",
        "components": "creator.routes.js; CreatorController; CreatorService; ReviewService; bảng Topics, Words, Questions, MiniTests, Media.",
        "module_flow": "Creator -> creator.routes -> verifyToken/permission -> CreatorController -> CreatorService -> kiểm tra quyền sở hữu -> SQL Server -> submitForReview nếu gửi duyệt.",
        "controllers": [
            "CreatorController.getDashboard",
            "CreatorController.getTopics",
            "CreatorController.createTopic",
            "CreatorController.submitTopicForReview",
            "CreatorController.getWords",
            "CreatorController.createWord",
            "CreatorController.submitWordForReview",
            "CreatorController.getQuestions",
            "CreatorController.createMiniTest",
            "CreatorController.submitMiniTestForReview",
        ],
        "services": [
            "CreatorService.getDashboardStats",
            "CreatorService.getMyTopics",
            "CreatorService.createTopic",
            "CreatorService.updateTopic",
            "CreatorService.submitForReview",
            "CreatorService.getMyWords",
            "CreatorService.createWord",
            "CreatorService.updateWord",
            "CreatorService.createQuestion",
            "CreatorService.getMyMiniTests",
            "CreatorService.createMiniTest",
            "CreatorService.addMiniTestItem",
        ],
    },
    {
        "name": "Module Review - Kiểm duyệt nội dung",
        "purpose": "Quản lý hàng đợi duyệt nội dung và nhật ký duyệt/từ chối/lưu trữ.",
        "components": "review.routes.js; ReviewController; ReviewService; AdminService review endpoints; bảng ContentReviewLogs.",
        "module_flow": "Reviewer/Admin -> review routes hoặc admin content-review routes -> Controller -> ReviewService/AdminService -> cập nhật ContentStatus -> ghi ContentReviewLogs.",
        "controllers": ["ReviewController.getPending", "ReviewController.approve", "ReviewController.reject"],
        "services": ["ReviewService.getPendingContent", "ReviewService._resolveEntity", "ReviewService.approve", "ReviewService.reject"],
    },
    {
        "name": "Module AI - Hỗ trợ soạn nội dung TOEIC",
        "purpose": "Gợi ý nội dung từ vựng, ví dụ TOEIC, dịch nghĩa và tra cứu từ điển để hỗ trợ biên tập.",
        "components": "ai.routes.js; AiController; AiService; OpenAI client/dictionary fallback.",
        "module_flow": "Creator/Admin -> ai.routes -> AiController -> AiService -> OpenAI/dictionary -> chuẩn hóa JSON/text -> response.",
        "controllers": ["AiController.suggestWordContent"],
        "services": ["withTimeout", "extractResponseText", "parseJsonText", "AiService.suggestWordContent", "AiService.generateToeicExamples"],
        "service_layer": {"withTimeout": "service", "extractResponseText": "service", "parseJsonText": "service"},
    },
    {
        "name": "Module Report & Notification - Báo cáo và thông báo",
        "purpose": "Tiếp nhận báo cáo từ người dùng và gửi/đọc thông báo hệ thống.",
        "components": "ReportService; UserController notification endpoints; AdminController notification/report endpoints; bảng Reports, Notifications.",
        "module_flow": "User tạo report/thông báo -> UserController/ReportService. Admin xem/xử lý report hoặc gửi announcement -> AdminController/AdminService -> Notifications/Reports.",
        "controllers": ["UserController.createReport", "AdminController.getReports", "AdminController.sendAnnouncement"],
        "services": ["ReportService.createReport", "ReportService.getReports", "ReportService.updateReport", "AdminService.sendAnnouncement", "AdminService.createDailyReminders"],
    },
    {
        "name": "Module System/Common - Hạ tầng backend",
        "purpose": "Kết nối CSDL, validate request, xử lý lỗi, health-check, integration-test và shutdown an toàn.",
        "components": "config/db.js; validate.js; errorHandler.js; health-check.js; integration-test.js; index.js.",
        "module_flow": "Express app -> middleware JSON/CORS -> routes -> middleware auth/validate -> controller -> service -> DB. Lỗi đi qua next(error) về errorHandler.",
        "controllers": ["errorHandler"],
        "controller_layer": {"errorHandler": "middleware"},
        "services": ["validate", "runHealthCheck", "runIntegrationTest", "gracefulShutdown"],
        "service_layer": {"validate": "middleware", "runHealthCheck": "config", "runIntegrationTest": "config", "gracefulShutdown": "config"},
    },
]


def build_modules():
    modules = []
    for spec in MODULE_SPECS:
        module_name = spec["name"]
        module_flow = spec["module_flow"]
        controller_layers = spec.get("controller_layer", {})
        service_layers = spec.get("service_layer", {})
        modules.append(
            {
                "name": module_name,
                "purpose": spec["purpose"],
                "components": spec["components"],
                "module_flow": module_flow,
                "controllers": [
                    row(key, controller_layers.get(key, "controller"), module_name, module_flow)
                    for key in spec["controllers"]
                ],
                "services": [
                    row(key, service_layers.get(key, "service"), module_name, module_flow)
                    for key in spec["services"]
                ],
            }
        )
    return modules


def remove_empty_heading_paragraphs(doc):
    """Remove dangling numbered heading paragraphs left by the source template."""
    for paragraph in list(doc.paragraphs):
        if paragraph.text.strip():
            continue
        style_name = paragraph.style.name if paragraph.style is not None else ""
        if not style_name.startswith("Heading"):
            continue
        element = paragraph._element
        parent = element.getparent()
        if parent is not None:
            parent.remove(element)


def main():
    modules = build_modules()
    doc = Document(SRC)
    ref = base.remove_old_module_section(doc)

    intro = base.move_paragraph_before(
        doc,
        ref,
        (
            "Các module backend được mô tả theo cấu trúc tách lớp: Controller nhận request và điều phối, "
            "Service xử lý nghiệp vụ/truy vấn CSDL, Middleware/Config hỗ trợ xác thực, validate và vận hành. "
            "Phiên bản này mở rộng số lượng hàm trọng tâm để báo cáo đủ chi tiết hơn: mỗi hàm đều có mục đích, "
            "luồng xử lý và giả mã rút gọn theo đúng logic trong mã nguồn."
        ),
    )
    intro.paragraph_format.space_after = Pt(8)

    for idx, module in enumerate(modules, 1):
        base.move_paragraph_before(doc, ref, f"{idx}. {module['name']}", style="Heading 3")
        summary = base.build_summary_table(doc, module)
        base.move_table_before(doc, ref, summary)

        base.move_paragraph_before(doc, ref, "Controller", bold=True)
        controller_table = base.build_function_table(doc, "Hàm Controller", module["controllers"])
        base.move_table_before(doc, ref, controller_table)

        base.move_paragraph_before(doc, ref, "Service / Middleware / Config", bold=True)
        service_table = base.build_function_table(doc, "Hàm Service", module["services"])
        base.move_table_before(doc, ref, service_table)

        spacer = base.move_paragraph_before(doc, ref, "")
        spacer.paragraph_format.space_after = Pt(8)

    remove_empty_heading_paragraphs(doc)
    doc.save(OUT)
    controller_rows = sum(len(m["controllers"]) for m in modules)
    service_rows = sum(len(m["services"]) for m in modules)
    print(f"{OUT} | modules={len(modules)} controller_rows={controller_rows} service_rows={service_rows}")


if __name__ == "__main__":
    main()
