from pathlib import Path
from math import atan2, cos, sin, pi

from PIL import Image, ImageDraw, ImageFont


OUT_DIR = Path("artifacts/design-doc/function-diagrams")
OUT_DIR.mkdir(parents=True, exist_ok=True)


W, H = 1920, 1080
BG = "#F7FAFC"
TEXT = "#1F2937"
MUTED = "#64748B"
BLUE = "#2563EB"
CYAN = "#0891B2"
GREEN = "#059669"
ORANGE = "#EA580C"
PURPLE = "#7C3AED"
RED = "#DC2626"
YELLOW = "#CA8A04"
GRAY = "#E2E8F0"
LIGHT_BLUE = "#DBEAFE"
LIGHT_GREEN = "#DCFCE7"
LIGHT_ORANGE = "#FFEDD5"
LIGHT_PURPLE = "#EDE9FE"
LIGHT_RED = "#FEE2E2"
LIGHT_YELLOW = "#FEF3C7"
WHITE = "#FFFFFF"


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


F_TITLE = font(42, True)
F_SUB = font(24)
F_H1 = font(28, True)
F_H2 = font(22, True)
F_BODY = font(19)
F_SMALL = font(16)
F_TINY = font(14)


def canvas():
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(draw, text, fnt, max_width):
    lines = []
    for raw in text.split("\n"):
        words = raw.split()
        if not words:
            lines.append("")
            continue
        line = words[0]
        for word in words[1:]:
            candidate = f"{line} {word}"
            if text_size(draw, candidate, fnt)[0] <= max_width:
                line = candidate
            else:
                lines.append(line)
                line = word
        lines.append(line)
    return lines


def draw_wrapped(draw, xy, text, fnt, fill=TEXT, max_width=300, line_gap=8, align="left"):
    x, y = xy
    lines = wrap_text(draw, text, fnt, max_width)
    total_h = sum(text_size(draw, line, fnt)[1] for line in lines) + line_gap * (len(lines) - 1)
    cy = y
    for line in lines:
        tw, th = text_size(draw, line, fnt)
        if align == "center":
            tx = x + (max_width - tw) / 2
        elif align == "right":
            tx = x + max_width - tw
        else:
            tx = x
        draw.text((tx, cy), line, font=fnt, fill=fill)
        cy += th + line_gap
    return total_h


def center_text(draw, box, text, fnt, fill=TEXT, line_gap=8):
    x1, y1, x2, y2 = box
    max_width = x2 - x1 - 36
    lines = wrap_text(draw, text, fnt, max_width)
    heights = [text_size(draw, line, fnt)[1] for line in lines]
    total_h = sum(heights) + line_gap * (len(lines) - 1)
    y = y1 + (y2 - y1 - total_h) / 2
    for line, th in zip(lines, heights):
        tw = text_size(draw, line, fnt)[0]
        draw.text((x1 + (x2 - x1 - tw) / 2, y), line, font=fnt, fill=fill)
        y += th + line_gap


def box(draw, xy, title, body="", fill=WHITE, outline=BLUE, title_color=TEXT, radius=22, shadow=True):
    x1, y1, x2, y2 = xy
    if shadow:
        draw.rounded_rectangle((x1 + 8, y1 + 8, x2 + 8, y2 + 8), radius=radius, fill="#D1D5DB")
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=3)
    draw_wrapped(draw, (x1 + 24, y1 + 20), title, F_H2, fill=title_color, max_width=x2 - x1 - 48, align="center")
    if body:
        draw_wrapped(draw, (x1 + 26, y1 + 68), body, F_SMALL, fill=TEXT, max_width=x2 - x1 - 52, line_gap=7)


def pill(draw, xy, text, fill, outline=None, fnt=F_SMALL):
    outline = outline or fill
    draw.rounded_rectangle(xy, radius=18, fill=fill, outline=outline, width=2)
    center_text(draw, xy, text, fnt, TEXT, line_gap=4)


def arrow(draw, start, end, color="#334155", width=4, head=18):
    x1, y1 = start
    x2, y2 = end
    draw.line((x1, y1, x2, y2), fill=color, width=width)
    ang = atan2(y2 - y1, x2 - x1)
    pts = [
        (x2, y2),
        (x2 - head * cos(ang - pi / 6), y2 - head * sin(ang - pi / 6)),
        (x2 - head * cos(ang + pi / 6), y2 - head * sin(ang + pi / 6)),
    ]
    draw.polygon(pts, fill=color)


def elbow_arrow(draw, points, color="#334155", width=4, head=18):
    if len(points) < 2:
        return
    for p1, p2 in zip(points[:-2], points[1:-1]):
        draw.line((p1[0], p1[1], p2[0], p2[1]), fill=color, width=width)
    arrow(draw, points[-2], points[-1], color=color, width=width, head=head)


def title(draw, main, sub):
    draw.text((80, 48), main, font=F_TITLE, fill=TEXT)
    draw.text((82, 104), sub, font=F_SUB, fill=MUTED)
    draw.line((80, 145, 1840, 145), fill="#CBD5E1", width=2)


def save(img, name):
    path = OUT_DIR / name
    img.save(path, quality=95)
    print(path)


def diagram_overview():
    img, d = canvas()
    title(d, "Sơ đồ chức năng tổng quan hệ thống", "TOEIC Vocabulary Learning Platform - VocaBoost")

    # actors
    box(d, (80, 215, 390, 385), "Người học", "Học flashcard\nLàm bài tập\nMini-test\nTheo dõi tiến độ", LIGHT_BLUE, BLUE)
    box(d, (80, 440, 390, 610), "Content Creator", "Soạn topic/từ vựng\nTạo câu hỏi\nGửi kiểm duyệt\nQuản lý media", LIGHT_PURPLE, PURPLE)
    box(d, (80, 665, 390, 835), "Admin", "Quản trị nội dung\nQuản lý user\nDuyệt nội dung\nThông báo, báo cáo", LIGHT_ORANGE, ORANGE)

    box(d, (520, 230, 910, 790), "Frontend Web", "React + Role-based UI\n\n• Learner pages\n• Admin dashboard\n• Creator workspace\n• Flashcard / Quiz / Mini-test\n• Notebook / Notification", WHITE, CYAN)
    box(d, (1040, 205, 1450, 820), "Backend API", "Express.js + JWT + Controller/Service\n\n• Auth\n• User Learning + SRS\n• Admin Management\n• Creator Content\n• Review Workflow\n• Gamification\n• AI Suggestion\n• Report / Notification", WHITE, BLUE)
    box(d, (1580, 250, 1840, 410), "SQL Server", "Users, Roles\nTopics, Words\nQuestions, Tests\nProgress, Logs", LIGHT_GREEN, GREEN)
    box(d, (1580, 520, 1840, 680), "AI / External", "OpenAI / Dictionary\nGợi ý nội dung\nVí dụ TOEIC\nDịch nghĩa", LIGHT_PURPLE, PURPLE)

    for y in [300, 525, 750]:
        arrow(d, (390, y), (520, y), BLUE)
    arrow(d, (910, 510), (1040, 510), BLUE)
    arrow(d, (1450, 410), (1580, 330), GREEN)
    arrow(d, (1450, 620), (1580, 600), PURPLE)
    arrow(d, (1580, 370), (1450, 455), GREEN)

    pill(d, (560, 860, 880, 920), "UI gọi REST API", LIGHT_BLUE, BLUE)
    pill(d, (1085, 860, 1395, 920), "Middleware bảo vệ quyền", LIGHT_YELLOW, YELLOW)
    pill(d, (1510, 860, 1820, 920), "Lưu dữ liệu học tập", LIGHT_GREEN, GREEN)
    arrow(d, (880, 890), (1085, 890), BLUE)
    arrow(d, (1395, 890), (1510, 890), GREEN)
    save(img, "01_so_do_chuc_nang_tong_quan.png")


def diagram_learner_flow():
    img, d = canvas()
    title(d, "Luồng chức năng học tập của người học", "Từ đăng nhập đến học từ, làm bài, SRS và dashboard")

    steps = [
        ("Đăng nhập", "Nhập email/mật khẩu\nNhận JWT", LIGHT_BLUE, BLUE),
        ("Chọn chủ đề", "Topic / Part TOEIC\nDanh sách từ", LIGHT_GREEN, GREEN),
        ("Học Flashcard", "Lật thẻ\nNghe audio\nXem nghĩa/ví dụ", LIGHT_PURPLE, PURPLE),
        ("Làm bài tập", "Trắc nghiệm\nĐiền từ\nDictation", LIGHT_YELLOW, YELLOW),
        ("Submit Answer", "Gửi đáp án\nTính đúng/sai\nLưu attempt", LIGHT_ORANGE, ORANGE),
        ("Cập nhật SRS", "Mastery level\nNext review date\nPriority queue", LIGHT_RED, RED),
    ]
    x = 80
    y = 230
    w = 270
    h = 170
    gap = 42
    centers = []
    for i, (t, b, fill, outline) in enumerate(steps):
        bx = x + i * (w + gap)
        box(d, (bx, y, bx + w, y + h), t, b, fill, outline)
        centers.append((bx + w, y + h / 2))
        if i:
            arrow(d, (bx - gap + 10, y + h / 2), (bx - 12, y + h / 2), BLUE)

    box(d, (245, 565, 560, 735), "Mini-test", "Kiểm tra theo chủ đề\nLưu điểm, lịch sử làm bài", WHITE, CYAN)
    box(d, (650, 565, 965, 735), "Notebook", "Lưu từ cần nhớ riêng\nGhi chú cá nhân", WHITE, PURPLE)
    box(d, (1055, 565, 1370, 735), "Gamification", "Cộng XP\nLevel, streak, achievement", WHITE, GREEN)
    box(d, (1460, 565, 1775, 735), "Dashboard", "Số từ đã học\nTừ đến hạn ôn\nBiểu đồ tiến độ", WHITE, BLUE)

    arrow(d, (350, 400), (400, 565), CYAN)
    arrow(d, (770, 400), (805, 565), PURPLE)
    arrow(d, (1285, 400), (1212, 565), GREEN)
    arrow(d, (1680, 400), (1615, 565), BLUE)
    arrow(d, (1620, 735), (1620, 845), BLUE)
    box(d, (1270, 845, 1775, 990), "Smart Review Queue", "Hệ thống ưu tiên các từ sắp quên hoặc hay trả lời sai để nhắc người học ôn đúng thời điểm.", LIGHT_BLUE, BLUE)
    arrow(d, (1270, 915), (1040, 915), RED)
    pill(d, (730, 870, 1040, 960), "Học lại từ yếu / từ đến hạn", LIGHT_RED, RED, F_H2)
    save(img, "02_luong_hoc_tap_nguoi_hoc.png")


def diagram_srs():
    img, d = canvas()
    title(d, "Sơ đồ thuật toán Spaced Repetition", "Cách dự án thể hiện kỹ thuật lặp lại ngắt quãng trong luồng học")

    box(d, (90, 220, 420, 390), "Người học trả lời", "questionId / wordId\nsubmittedAnswer\nreviewRating", LIGHT_BLUE, BLUE)
    box(d, (535, 220, 865, 390), "submitAnswer()", "Lưu attempt\nXác định đúng/sai\nLấy canonical word", WHITE, CYAN)
    box(d, (980, 205, 1350, 405), "Tính lịch ôn", "Dựa trên rating và kết quả trả lời\nđể tính NextReviewDate mới.", LIGHT_YELLOW, YELLOW)
    box(d, (1480, 220, 1825, 390), "UserWordProgress", "MasteryLevel\nCorrectStreak\nNextReviewDate\nLastReviewedAt", LIGHT_GREEN, GREEN)

    arrow(d, (420, 305), (535, 305), BLUE)
    arrow(d, (865, 305), (980, 305), CYAN)
    arrow(d, (1350, 305), (1480, 305), GREEN)

    ratings = [
        ("Again", "Sai / quên\nôn lại rất sớm", LIGHT_RED, RED, 500),
        ("Hard", "Nhớ yếu\nkhoảng ôn ngắn", LIGHT_ORANGE, ORANGE, 740),
        ("Good", "Nhớ ổn\nkhoảng ôn chuẩn", LIGHT_GREEN, GREEN, 980),
        ("Easy", "Nhớ chắc\nkhoảng ôn dài", LIGHT_BLUE, BLUE, 1220),
    ]
    for name, body, fill, outline, x in ratings:
        box(d, (x, 545, x + 220, 675), name, body, fill, outline, radius=18)
        arrow(d, (1165, 405), (x + 110, 545), outline, width=3, head=13)
    pill(d, (695, 705, 1265, 765), "Rating quyết định khoảng thời gian ôn tiếp theo", LIGHT_YELLOW, YELLOW, F_H2)

    box(d, (1480, 515, 1825, 690), "Smart Review Queue", "SELECT từ có NextReviewDate <= hôm nay\nƯu tiên mastery thấp / lỗi nhiều", WHITE, BLUE)
    arrow(d, (1650, 390), (1650, 500), GREEN)
    box(d, (90, 735, 420, 910), "getDueFlashcards()", "Lấy các từ đến hạn ôn\nTrả về flashcard review", WHITE, PURPLE)
    elbow_arrow(d, [(1480, 610), (1450, 610), (1450, 965), (420, 965), (420, 825)], PURPLE, width=4)
    box(d, (535, 835, 865, 980), "Dashboard tiến độ", "Đã thuộc / đang học\nDự báo hoàn thành\nHeatmap hoạt động", LIGHT_BLUE, BLUE)
    arrow(d, (255, 910), (535, 905), BLUE)
    arrow(d, (1650, 690), (865, 905), BLUE)
    save(img, "03_so_do_spaced_repetition_srs.png")


def diagram_content_workflow():
    img, d = canvas()
    title(d, "Luồng quản lý và kiểm duyệt nội dung", "Creator soạn nội dung, Admin/Reviewer kiểm duyệt, Learner sử dụng nội dung đã xuất bản")

    box(d, (90, 220, 430, 390), "Creator tạo nội dung", "Topic\nWord\nQuestion\nMini-test\nMedia", LIGHT_PURPLE, PURPLE)
    box(d, (560, 220, 900, 390), "Draft", "Nội dung đang soạn\nCreator có quyền sửa/xóa", WHITE, CYAN)
    box(d, (1030, 220, 1370, 390), "Submit For Review", "Chuyển trạng thái\nPending Review", LIGHT_YELLOW, YELLOW)
    box(d, (1500, 220, 1840, 390), "Reviewer/Admin", "Xem hàng đợi\nKiểm tra chất lượng\nGhi nhận quyết định", LIGHT_ORANGE, ORANGE)

    arrow(d, (430, 305), (560, 305), PURPLE)
    arrow(d, (900, 305), (1030, 305), CYAN)
    arrow(d, (1370, 305), (1500, 305), ORANGE)

    box(d, (1030, 555, 1370, 720), "Approve", "ContentStatus = Published\nNội dung được mở cho người học", LIGHT_GREEN, GREEN)
    box(d, (560, 555, 900, 720), "Reject", "ContentStatus = Rejected\nTrả lý do cho Creator sửa", LIGHT_RED, RED)
    box(d, (1500, 555, 1840, 720), "Archive", "Ẩn nội dung khỏi hệ thống học\nGiữ lịch sử/audit", WHITE, GRAY)
    arrow(d, (1670, 390), (1200, 555), GREEN)
    arrow(d, (1600, 390), (730, 555), RED)
    arrow(d, (1740, 390), (1670, 555), MUTED)

    box(d, (1030, 835, 1370, 980), "Learner sử dụng", "Topic/Word/Question/Mini-test\nxuất hiện trong trang học", LIGHT_BLUE, BLUE)
    box(d, (90, 805, 430, 1005), "ContentReviewLogs", "Lưu người duyệt\nHành động\nGhi chú\nThời gian", WHITE, GREEN)
    arrow(d, (1200, 720), (1200, 835), GREEN)
    arrow(d, (730, 720), (430, 875), RED)
    arrow(d, (1670, 720), (430, 900), MUTED)
    arrow(d, (1200, 720), (430, 930), GREEN)
    save(img, "04_luong_quan_ly_kiem_duyet_noi_dung.png")


def diagram_admin_functions():
    img, d = canvas()
    title(d, "Sơ đồ chức năng phân hệ Admin", "Các nhóm chức năng quản trị trong backend và dashboard")

    box(d, (690, 175, 1230, 315), "Admin Dashboard", "JWT + RBAC\nVIEW_DASHBOARD / MANAGE_* permissions", LIGHT_ORANGE, ORANGE)

    groups = [
        ("Quản lý nội dung học", 80, 400, BLUE, [
            ("Topic Categories", "Nhóm danh mục chủ đề"),
            ("Topics", "Chủ đề học TOEIC"),
            ("Words", "Ngân hàng từ vựng\nimport CSV"),
            ("Questions", "Câu hỏi luyện tập\nbulk import"),
            ("Mini Tests", "Bài kiểm tra ngắn\npublish/archive"),
        ]),
        ("Quản lý người dùng & vận hành", 690, 400, PURPLE, [
            ("Students / Roles", "Tài khoản, trạng thái,\nvai trò"),
            ("Notifications", "Announcement\nDaily reminders"),
            ("Audit Logs", "Theo dõi thao tác\nquản trị"),
        ]),
        ("Giám sát & kiểm duyệt", 1300, 400, GREEN, [
            ("Analytics", "Thống kê học tập\nnội dung"),
            ("Content Review", "Pending / Approve\nReject / Archive"),
            ("Reports", "Phản hồi, báo lỗi\ntrạng thái xử lý"),
        ]),
    ]

    for heading, x, y, color, items in groups:
        pill(d, (x, y - 62, x + 520, y - 12), heading, "#E0F2FE" if color == BLUE else "#EDE9FE" if color == PURPLE else "#DCFCE7", color, F_H2)
        for idx, (name, body) in enumerate(items):
            row = idx % 3
            col = idx // 3
            bx = x + col * 270
            by = y + row * 165
            fill = [LIGHT_BLUE, LIGHT_GREEN, LIGHT_PURPLE, LIGHT_YELLOW, WHITE][idx % 5]
            outline = [BLUE, GREEN, PURPLE, YELLOW, CYAN][idx % 5]
            box(d, (bx, by, bx + 245, by + 125), name, body, fill, outline, radius=18)

    pill(d, (530, 930, 1390, 1005), "Quy tắc chung: kiểm tra permission trước khi xử lý và ghi AuditLogs cho thao tác quan trọng", LIGHT_YELLOW, YELLOW, F_H2)
    save(img, "05_so_do_chuc_nang_admin.png")


def diagram_backend_api():
    img, d = canvas()
    title(d, "Luồng xử lý API backend", "Request đi qua Route -> Middleware -> Controller -> Service -> Database")

    layers = [
        ("Client / Frontend", "React UI\nAxios/API client", 80, LIGHT_BLUE, BLUE),
        ("Express Routes", "auth.routes\nuser.routes\nadmin.routes\ncreator.routes", 375, WHITE, CYAN),
        ("Middleware", "verifyToken\ncheckPermission\nvalidate(schema)", 670, LIGHT_YELLOW, YELLOW),
        ("Controller", "Đọc params/body/query\nGọi service\nTrả response", 965, WHITE, PURPLE),
        ("Service", "Business logic\nSQL query/transaction\nGọi service liên quan", 1260, LIGHT_GREEN, GREEN),
        ("SQL Server", "Data tables\nStored procedures\nAudit logs", 1555, WHITE, GREEN),
    ]

    for title_text, body, x, fill, outline in layers:
        box(d, (x, 275, x + 245, 535), title_text, body, fill, outline)
    for i in range(len(layers) - 1):
        x = layers[i][2] + 245
        nx = layers[i + 1][2]
        arrow(d, (x, 405), (nx, 405), BLUE, width=4)

    box(d, (965, 685, 1210, 850), "errorHandler", "Bắt lỗi từ next(error)\nChuẩn hóa status/message\nTrả JSON lỗi", LIGHT_RED, RED)
    arrow(d, (1087, 535), (1087, 685), RED)
    arrow(d, (1087, 850), (245, 850), RED)
    pill(d, (90, 805, 330, 895), "HTTP Error Response", LIGHT_RED, RED)

    box(d, (1260, 685, 1505, 850), "External Services", "OpenAI / Dictionary\nAI suggestion\nTOEIC examples", LIGHT_PURPLE, PURPLE)
    arrow(d, (1382, 535), (1382, 685), PURPLE)

    pill(d, (580, 130, 1390, 205), "Mẫu chung trong code: Controller chỉ điều phối, Service mới xử lý nghiệp vụ và truy vấn CSDL", LIGHT_BLUE, BLUE, F_H2)
    save(img, "06_luong_xu_ly_api_backend.png")


def main():
    diagram_overview()
    diagram_learner_flow()
    diagram_srs()
    diagram_content_workflow()
    diagram_admin_functions()
    diagram_backend_api()


if __name__ == "__main__":
    main()
